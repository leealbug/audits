const zlib = require("zlib");
const axios = require("axios");
const csv = require('./csv.js');
const code = require('./code.js');
const date = require('./date.js');

const dropship = {
    company_id: "Furhaven",
    url: ''
  }
  
const bulk = {
    company_id: "Furhaven_bulk",
    url: ''
}

const shipmentInfo = async(type) => {
    const company_id = type.company_id;
    const token = await code.getIMSToken(false, company_id);
    const endDate = date.returnDate('tracking');
    const startDate = date.twoWeeksAgo(endDate);
    const url = 'https://api.commerce-ims.com/dropship/orders?unsent_tracking=true&order_valid=true&start_date=' + startDate + '&end_date=' + endDate;
    const options = {
        method: "get",
        headers: {company_id: company_id, Authorization: `Bearer ${token}`},
        url: url
    }
    const get = await axios(options);
    const orders =  JSON.parse(zlib.inflateSync(Buffer.from(get.data, 'base64')));
    csv.downloadCsv(orders, 'Late Shipment Report');
    console.log(orders);
}

shipmentInfo(dropship);
