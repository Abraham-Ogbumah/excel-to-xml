const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ExcelProcessor } = require('./services/excelProcessor');

const app = express();
const port = process.env.PORT || 3000;

// Define paths
const UPLOADS_DIR = path.join(__dirname, '../uploads');
const DOWNLOADS_DIR = path.join(__dirname, '../downloads');

// Ensure directories exist
[UPLOADS_DIR, DOWNLOADS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, UPLOADS_DIR);
    },
    filename: function(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Configure multer
const upload = multer({ 
    storage: storage,
    fileFilter: function(req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext === '.xlsx' || ext === '.xls') {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files (.xlsx or .xls) are allowed'));
        }
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/downloads', express.static(DOWNLOADS_DIR));

// File upload and conversion endpoint
app.post('/api/convert', upload.single('excelFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('Processing file:', req.file.path);

        // Process Excel file
        const xmlContent = await ExcelProcessor.processExcelFile(req.file.path);
        
        // Save XML file
        const outputFilename = `cbcr_${Date.now()}.xml`;
        const outputPath = path.join(DOWNLOADS_DIR, outputFilename);
        
        fs.writeFileSync(outputPath, xmlContent);
        
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            xml: xmlContent,
            downloadUrl: `/downloads/${outputFilename}`
        });

    } catch (error) {
        console.error('Error processing file:', error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            error: 'Error processing file',
            details: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Uploads directory: ${UPLOADS_DIR}`);
    console.log(`Downloads directory: ${DOWNLOADS_DIR}`);
});