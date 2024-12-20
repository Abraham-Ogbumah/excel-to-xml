import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function ExcelUploader({ onUploadSuccess, onUploadStart, onUploadError, onUploadComplete }) {
    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        onUploadStart();
        const formData = new FormData();
        formData.append('excelFile', file);

        try {
            console.log('Starting file upload...'); // Debug log
            const response = await fetch('http://localhost:3000/api/convert', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            console.log('Upload response:', data); // Debug log
            onUploadSuccess(data);
        } catch (error) {
            console.error('Upload error:', error); // Debug log
            onUploadError(error.message);
        } finally {
            onUploadComplete();
        }
    }, [onUploadSuccess, onUploadStart, onUploadError, onUploadComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        },
        multiple: false
    });

    return (
        <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
        >
            <input {...getInputProps()} />
            <p className="text-gray-600">Drag & drop your completed CBCR Excel file here, or click to select</p>
            <p className="text-sm text-gray-500 mt-2">Accepted files: .xlsx, .xls</p>
        </div>
    );
}

export default ExcelUploader;