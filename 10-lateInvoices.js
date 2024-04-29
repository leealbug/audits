const zlib = require("zlib");
const axios = require("axios");
const csv = require('./utils/csv.js');
const code = require('./utils/code.js');
const date = require('./utils/date.js');

const dropship = {
    company_id: "Furhaven",
    url: 'https://api.commerce-ims.com/dropship/orders?unsent_invoices=true&order_valid=true&start_date='
  }
  
const bulk = {
    company_id: "Furhaven_bulk",
    url: 'https://api.commerce-ims.com/bulk/orders?unsent_invoices=true&order_valid=true&start_date='
}

const lateInvoices = async(type) => {
    const company_id = type.company_id;
    const token = await code.getIMSToken(false, company_id);
    const endDate = date.returnInvoiceDate(3);
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

const lateBulk = lateInvoices(bulk)
const lateDropship = lateInvoices(dropship);

Promise.all([lateBulk, lateDropship])
    .then(([lateBulk, lateDropship]) => {

        const bulkAmount = lateBulk.length;
        const dropshipAmount = lateDropship.length;

        if (bulkAmount === 0 && dropshipAmount === 0) {
            return console.log('there are no late bulk or dropship invoices.');
        
        } else if (bulkAmount === 0 && dropshipAmount >= 1) {
            csv.downloadCsv(lateDropship, 'Late Invoice Report')
            return console.log('there are no late bulk invoices and ' + dropshipAmount + ' late dropship invoices.')
        
        } else if (bulkAmount >= 1 && dropshipAmount === 0) {
            csv.downloadCsv(lateBulk, 'Late Invoice Report')
            return console.log('there are ' + bulkAmount + ' late bulk invoices and no late dropship invoices.')
        
        } else {     
            const orders = [ ...lateBulk, ...lateDropship ];
            csv.downloadCsv(orders, 'Late Invoice Report');
            console.log('there are ' + orders.length + ' total late invoices. ' + bulkAmount + ' late bulk invoices and ' + dropshipAmount + ' late dropship invoices.')
        }
    })
    .catch(error => {
        console.error("an error occurred:", error);
    })