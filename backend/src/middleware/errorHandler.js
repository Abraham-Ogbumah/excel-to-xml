function errorHandler(err, req, res, next) {
    console.error(err);

    if (err.name === 'MulterError') {
        return res.status(400).json({
            error: 'File upload error',
            details: err.message
        });
    }

    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
}

module.exports = errorHandler;