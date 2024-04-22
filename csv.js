const papa = require('papaparse');
const fs = require('fs');
const nodeOutlook = require('nodejs-nodemailer-outlook');
const tmp = require('tmp');
const date = require('./date.js');

const parseJSON =  (filepath = './passwords.json') => {
    try {
        const data = fs.readFileSync(filepath, 'utf8');
        const jsonData = JSON.parse(data);
        return jsonData;
    } catch (error) {
        console.log(error)
    }
}

const downloadCsv = (data, prefix) => {
    // headers i want in csv
    const selectedHeaders = ['order_id', 'vendor_name', 'internal_po_number', 'order_date', 'upload_date', 'warehouse', 'acu_order_num'];
    
    // filters for those headers
    const filteredData = data.map(item => {
        const newItem = {};
        selectedHeaders.forEach(header => {
            newItem[header] = item[header];
        })
        return newItem;
    })

    // convert json to csv
    const csv = papa.unparse(filteredData, {
        delimiter: ",", // Use comma as delimiter
        quoteChar: '"', // Use double quotes for text fields
        header: true // Include headers
    })

    //create temp file
    const today = date.formatDate(new Date());
    const jsonData = parseJSON();

    tmp.file({ prefix: prefix + ' ' + today, postfix: '.csv'}, (err, path, fd, cleanupCallback) => {
        if (err) throw err;
        
        // log path
        console.log('temp file is located at: ' + path);
        // write csv to temp file
        fs.writeFileSync(path, csv);

        console.log('csv file has been created');

        // email config
        nodeOutlook.sendEmail({
            auth: {
                user: jsonData[2].username,
                pass: jsonData[2].password
            },
            to: 'lea.albaugh@petwisebrands.com',
            from: 'lea.albaugh@petwisebrands.com',
            subject: prefix + ' ' + today,
            text: 'Attached is the ' + prefix + '. \nThis is an automated message.',
            attachments: [
                {
                    filename: prefix + ' ' + today + '.csv',
                    path: path
                }
            ],
            onError: (e) => {
                console.log(e);
                cleanupCallback();
            },
            onSuccess: (i) => {
                console.log(i)
                cleanupCallback();
            }
        })
    })
}

module.exports = {
    downloadCsv: downloadCsv
}