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
        const orders = [ ...lateBulk, ...lateDropship ];
        console.log('there are ' + orders.length + ' total late invoices. ' + lateBulk.length + ' late bulk invoices and ' + lateDropship.length + ' late dropship invoices.');
        if (orders.length === 0) {
            csv.downloadCsv(orders, 'Late Invoice Report');
        } else {
            return;
        }
    })
    .catch(error => {
        console.error("an error occurred:", error);
    })