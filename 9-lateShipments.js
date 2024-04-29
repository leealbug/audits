const zlib = require("zlib");
const axios = require("axios");
const csv = require('./utils/csv.js');
const code = require('./utils/code.js');
const date = require('./utils/date.js');

const dropship = {
    company_id: "Furhaven",
    url: 'https://api.commerce-ims.com/dropship/orders?unsent_tracking=true&order_valid=true&start_date='
  }
  
const bulk = {
    company_id: "Furhaven_bulk",
    url: 'https://api.commerce-ims.com/bulk/orders?unsent_tracking=true&order_valid=true&start_date='
}

const lateShipments = async(type) => {
    const company_id = type.company_id;
    const token = await code.getIMSToken(false, company_id);
    const endDate = date.returnShipmentDate(2);
    const startDate = date.twoWeeksAgo(endDate);
    const fullUrl = type.url + startDate + '&end_date=' + endDate;
    const options = {
        method: "get",
        headers: {company_id: company_id, Authorization: `Bearer ${token}`},
        url: fullUrl
    }
    const get = await axios(options);
    const orders =  JSON.parse(zlib.inflateSync(Buffer.from(get.data, 'base64')));
    return orders;
}

const lateBulk = lateShipments(bulk);
const lateDropship = lateShipments(dropship);

// debugging
// Promise.all([lateBulk, lateDropship])
//     .then(([lateBulk, lateDropship]) => {
//         const orders = [ ...lateBulk, ...lateDropship ]
//         console.log(orders.length)
//         console.log(lateDropship.length)
//         console.log(lateBulk.length)
// })

Promise.all([lateBulk, lateDropship])
    .then(([lateBulk, lateDropship]) => {

        const bulkAmount = lateBulk.length;
        const dropshipAmount = lateDropship.length;

        if (bulkAmount === 0 && dropshipAmount === 0) {
            return console.log('there are no late bulk or dropship shipments.');
        
        } else if (bulkAmount === 0 && dropshipAmount >= 1) {
            csv.downloadCsv(lateDropship, 'Late Shipment Report')
            return console.log('there are no late bulk shipments and ' + dropshipAmount + ' late dropship shipments.')
        
        } else if (bulkAmount >= 1 && dropshipAmount === 0) {
            csv.downloadCsv(lateBulk, 'Late Shipment Report')
            return console.log('there are ' + bulkAmount + ' late bulk shipments and no late dropship shipments.')
        
        } else {     
            const orders = [ ...lateBulk, ...lateDropship ];
            csv.downloadCsv(orders, 'Late Shipment Report');
            console.log('there are ' + orders.length + ' total late shipments. ' + bulkAmount + ' late bulk shipments and ' + dropshipAmount + ' late dropship shipments.')
        }
    })
    .catch(error => {
        console.error("an error occurred:", error);
    })

