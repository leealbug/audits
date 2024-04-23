const zlib = require("zlib");
const axios = require("axios");
const csv = require('./utils/csv.js');
const code = require('./utils/code.js');
const date = require('./utils/date.js');

const dropship = {
    company_id: "Furhaven",
    url: 'https://api.commerce-ims.com/dropship/orders?null_pullsheet=true&order_valid=true&end_date='
  }
  
const bulk = {
    company_id: "Furhaven_bulk",
    url: ''
}

const missingPullsheets = async(type) => {
    const company_id = type.company_id;
    const token = await code.getIMSToken(false, company_id);
    const endDate = date.yesterday();
    const fullUrl = type.url + endDate;
    const options = {
        method: "get",
        headers: {company_id: company_id, Authorization: `Bearer ${token}`},
        url: fullUrl
    }
    const get = await axios(options);
    const orders =  JSON.parse(zlib.inflateSync(Buffer.from(get.data, 'base64')));
    if (orders.length === 0) {
        return console.log('no orders are missing pullsheet ids');
    } else {
        console.log(orders);
        csv.downloadCsv(orders, 'Missing Pullsheet ID Report');
    }
}

missingPullsheets(dropship);