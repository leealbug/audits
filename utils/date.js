const formatDate = (date) => {
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

const subjectDate = (date) => {
    let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
        year = year.toString().substring(2);

    return [month, day, year].join('.');
}

const twoWeeksAgo = (date) => {
    let d = new Date(date);
        if (formatDate(d) == formatDate(new Date ())) {
            d.setDate(d.getDate() - 14);
            return formatDate(d);
        } else {
            d.setDate(d.getDate() - 13);
            return formatDate(d);
        }
}

const returnDate = (offset) => {
    let today = new Date();
    if (today.getDay() === 1 || today.getDay() === 2) {
        today.setDate(today.getDate() - (offset + 2));
        return formatDate(today);
    } else
        today.setDate(today.getDate() - offset);
        return formatDate(today);
}

const yesterday = (date = new Date ()) => {
    let today = new Date(date);
    if (today.getDay() === 1) {
        today.setDate(today.getDate() - 3);
        return formatDate(today);
    } else
        today.setDate(today.getDate() - 1);
        return formatDate(today);
}

module.exports = {
    formatDate: formatDate,
    returnDate: returnDate,
    subjectDate: subjectDate,
    twoWeeksAgo: twoWeeksAgo,
    yesterday: yesterday
}