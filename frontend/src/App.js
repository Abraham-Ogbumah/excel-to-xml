import React, { useState } from 'react';
import ExcelUploader from './components/ExcelUploader';
import XMLPreview from './components/XMLPreview';
import ProgressBar from './components/ProgressBar';
import ErrorAlert from './components/ErrorAlert';

function App() {
    const [xmlData, setXmlData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">CBCR Excel to XML Converter</h1>
            
            <ExcelUploader 
                onUploadSuccess={(data) => setXmlData(data)}
                onUploadStart={() => setLoading(true)}
                onUploadError={(err) => setError(err)}
                onUploadComplete={() => setLoading(false)}
            />

            {loading && <ProgressBar />}
            {error && <ErrorAlert message={error} />}
            {xmlData && <XMLPreview data={xmlData} />}
        </div>
    );
}

export default App;