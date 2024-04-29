const zlib = require("zlib");
const axios = require("axios");
const csv = require('./utils/csv.js');
const code = require('./utils/code.js');
const date = require('./utils/date.js');

const dropship = {
    company_id: "Furhaven",
    url: 'https://api.commerce-ims.com/dropship/orders?unsent_invoices=true&order_valid=true'
  }
  
const bulk = {
    company_id: "Furhaven_bulk",
    url: 'https://api.commerce-ims.com/bulk/orders?unsent_invoices=true&order_valid=true'
}

const invoiceTotalIMS = async(type) => {
    const company_id = type.company_id;
    const token = await code.getIMSToken(false, company_id);
    // const endDate = date.returnShipmentDate(2);
    // const startDate = date.twoWeeksAgo(endDate);
    // const fullUrl = type.url + startDate + '&end_date=' + endDate;
    const options = {
        method: "get",
        headers: {company_id: company_id, Authorization: `Bearer ${token}`},
        url: type.url
    }
    const get = await axios(options);
    const orders =  JSON.parse(zlib.inflateSync(Buffer.from(get.data, 'base64')));
    console.log(orders);
    return orders;
}

const invoiceTotalAcu = async() => {
    const cookies = await getAcumaticaCookies();
    try {
        const url = "https://Furhaven-process.acumatica.com/entity/Commerce/20.200.001/SalesOrderBySO?$expand=SalesOrderBySODetails";
        const options = {
            method: "put",
            headers: {"Cookie": cookies, "Accept": 'application/json', "Content-Type": "application/json"},
            url: url,
            data: JSON.stringify({"ordernbr": {"value":"2108153"}})
        }
        const get = await axios(options);
        const json = get.data
        console.log(json);
    }
    catch(err) {
        console.log(err);
    }
    finally {
        await acumaticaLogout(cookies);
    }
}

invoiceTotalIMS(dropship);
invoiceTotalIMS(bulk);