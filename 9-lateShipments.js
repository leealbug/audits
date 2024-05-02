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
        const orders = [ ...lateBulk, ...lateDropship ];
        console.log('there are ' + orders.length + ' total late shipments. ' + lateBulk.length + ' late bulk shipments and ' + lateDropship.length + ' late dropship shipments.');
        if (orders.length > 0) {
            csv.downloadCsv(orders, 'Late Shipment Report', 'The tracking numbers of these orders have not been sent in 2+ business days.');
        } else {
            return;
        }
    })
    .catch(error => {
        console.error("an error occurred:", error);
    })

