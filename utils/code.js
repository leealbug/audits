const axios = require("axios");
const zlib = require("zlib");
const fs = require('fs');

const parseJSON =  (filepath = './utils/passwords.json') => {
    try {
        const data = fs.readFileSync(filepath, 'utf8');
        const jsonData = JSON.parse(data);
        return jsonData;
    } catch (error) {
        console.log(error)
    }
}


const getAcumaticaCookies = async(sandbox=false) => {
    const jsonData = parseJSON();
    let credentials = {
        name: jsonData[1].username,
        password: jsonData[1].password,
        branch: "Main",
        company: sandbox ? "Sandbox" : "Furhaven"
    }
    const options = {
        method: "post",
        headers: {"Content-Type": 'application/x-www-form-urlencoded', "Accept": "application/json"},
        url: "https://Furhaven-process.acumatica.com/entity/auth/login",
        data: credentials
    }
    var res = await axios(options);
    var cookie = res.headers['set-cookie'].join(";")
    return cookie;
}
 
  const acumaticaLogout = async(cookies) => { // Always logout of Acumatica when finished
    await axios.post("https://Furhaven-process.acumatica.com/entity/auth/logout", {"headers":{"Cookie": cookies, "Accept": 'application/json', "Content-Type": "application/json"}});
    return;
  }
 
  const getIMSToken = async(sandbox=false, company_id="Furhaven") => {
    const jsonData = parseJSON();
    const user = jsonData[0].username;
    const pass = jsonData[0].password;
    let prefix = sandbox ? "mattk." : "";
    let url = `https://api.${prefix}commerce-ims.com/v1/login`
    let options = {
        'method' : 'post',
        'data' : JSON.stringify({username: user, password: pass}),
        'headers': {
        company_id: company_id
        },
        'url': url
    };
    let get = await axios(options);
    let res = get.data;
    return res.accessToken;
}

module.exports = {
    getIMSToken: getIMSToken,
    getAcumaticaCookies: getAcumaticaCookies,
    acumaticaLogout: acumaticaLogout
}

// const sampleAcumaticaRequest = async() => {
//     let cookies = await getAcumaticaCookies();
//     try {
//         let url = "https://Furhaven-process.acumatica.com/entity/Commerce/20.200.001/SalesOrderBySO?$expand=SalesOrderBySODetails";
//         let options = {
//             method: "put",
//             headers: {"Cookie": cookies, "Accept": 'application/json', "Content-Type": "application/json"},
//             url: url,
//             data: JSON.stringify({"ordernbr": {"value":"2108153"}})
//         }
//         let get = await axios(options);
//         let json = get.data
//         console.log(json);
//     }
//     catch(err) {
//         console.log(err);
//     }
//     finally {
//         await acumaticaLogout(cookies);
//     }
// }
 
//   const sampleIMSRequest = async() => {
//     let company_id = "Furhaven";
//     let token = await getIMSToken(false, company_id);
//     let date = new Date();
//     date.setDate(date.getDate() - 2);
//     let url = "https://api.commerce-ims.com/dropship/orders?unsent_tracking=true&start_date=" + date.toISOString().substring(0, 10);
//     let options = {
//         method: "get",
//         headers: {company_id: company_id, Authorization: `Bearer ${token}`},
//         url: url
//     }
//     let get = await axios(options);
//     let orders =  JSON.parse(zlib.inflateSync(Buffer.from(get.data, 'base64')));
//     console.log(orders);
// }