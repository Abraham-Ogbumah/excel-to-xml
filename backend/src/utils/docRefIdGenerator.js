function generateDocRefId(countryCode, type) {
    const year = new Date().getFullYear();
    const timestamp = new Date().toISOString()
        .replace(/[^0-9]/g, '')
        .slice(0, 14);
    return `${countryCode}${year}${type}${timestamp}`;
}

module.exports = { generateDocRefId };