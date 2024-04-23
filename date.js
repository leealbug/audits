function formatDate(date) {
    let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

function subjectDate(date) {
    let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
        year = year.toString().substring(2);

    return [month, day, year].join('.');
}
const returnDate = (option) => {
    let today = new Date();
    if (option === 'tracking') {
        if (today.getDay() == 1){
            today.setDate(today.getDate() - 4);
            return formatDate(today);
          } else if (today.getDay() == 2) {
              today.setDate(today.getDate() - 3);
              return formatDate(today);
          } else 
              today.setDate(today.getDate() - 2);
              return formatDate(today);
    }
    if (option === 'invoice') {
        if (today.getDay() == 1){
            today.setDate(today.getDate() - 5);
            return formatDate(today);
          } else if (today.getDay() == 2) {
              today.setDate(today.getDate() - 4);
              return formatDate(today);
          } else 
              today.setDate(today.getDate() - 3);
              return formatDate(today);
    }

}

module.exports = {
    formatDate: formatDate,
    returnDate: returnDate,
    subjectDate: subjectDate
}