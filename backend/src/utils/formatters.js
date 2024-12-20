function formatNumber(value) {
    if (!value) return '0';
    return Math.round(Number(value)).toString();
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

module.exports = {
    formatNumber,
    formatDate
};