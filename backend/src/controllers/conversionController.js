const { ExcelProcessor, XmlGenerator } = require('../services/excelProcessor');
const path = require('path');
const fs = require('fs');

async function conversionController(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const processedData = ExcelProcessor.processExcelFile(req.file.path);
        const xmlContent = XmlGenerator.generateCbcXML(processedData);

        const outputFilename = `cbcr_${Date.now()}.xml`;
        const outputPath = path.join(__dirname, '../../downloads', outputFilename);

        fs.writeFileSync(outputPath, xmlContent);
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            xml: xmlContent,
            downloadUrl: `/downloads/${outputFilename}`
        });
    } catch (error) {
        console.error('Conversion error:', error);
        res.status(500).json({ error: 'Conversion failed' });
    }
}

module.exports = { conversionController };