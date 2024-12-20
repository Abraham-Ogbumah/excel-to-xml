const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename with timestamp and original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Configure file filter
const fileFilter = (req, file, cb) => {
    // Check file type
    const filetypes = /xlsx|xls/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
};

// Configure upload limits
const limits = {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 1 // Only 1 file at a time
};

// Create multer upload instance
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: limits 
});

class UploadController {
    static async handleUpload(req, res) {
        try {
            // Multer middleware will handle the file upload
            upload.single('excelFile')(req, res, async function(err) {
                if (err instanceof multer.MulterError) {
                    // Multer error occurred
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return res.status(400).json({
                            error: 'File size too large. Maximum size is 10MB'
                        });
                    }
                    return res.status(400).json({ error: err.message });
                } else if (err) {
                    // Other error occurred
                    return res.status(400).json({ error: err.message });
                }

                // Check if file exists
                if (!req.file) {
                    return res.status(400).json({
                        error: 'Please upload an Excel file'
                    });
                }

                try {
                    // Get file information
                    const fileInfo = {
                        originalName: req.file.originalname,
                        filename: req.file.filename,
                        path: req.file.path,
                        size: req.file.size,
                        mimetype: req.file.mimetype
                    };

                    // Return success response
                    res.status(200).json({
                        message: 'File uploaded successfully',
                        file: fileInfo
                    });

                } catch (error) {
                    // Clean up file if processing fails
                    if (req.file && req.file.path) {
                        fs.unlinkSync(req.file.path);
                    }
                    throw error;
                }
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({
                error: 'File upload failed',
                details: error.message
            });
        }
    }

    static async deleteUpload(req, res) {
        try {
            const { filename } = req.params;
            const filepath = path.join('uploads', filename);

            // Check if file exists
            if (fs.existsSync(filepath)) {
                // Delete file
                fs.unlinkSync(filepath);
                res.status(200).json({
                    message: 'File deleted successfully'
                });
            } else {
                res.status(404).json({
                    error: 'File not found'
                });
            }
        } catch (error) {
            console.error('Delete error:', error);
            res.status(500).json({
                error: 'File deletion failed',
                details: error.message
            });
        }
    }

    static async getUploadStatus(req, res) {
        try {
            const { filename } = req.params;
            const filepath = path.join('uploads', filename);

            if (fs.existsSync(filepath)) {
                const stats = fs.statSync(filepath);
                res.status(200).json({
                    exists: true,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime
                });
            } else {
                res.status(404).json({
                    exists: false
                });
            }
        } catch (error) {
            console.error('Status check error:', error);
            res.status(500).json({
                error: 'Failed to check file status',
                details: error.message
            });
        }
    }
}

// Export controller and multer upload middleware
module.exports = {
    UploadController,
    uploadMiddleware: upload
};