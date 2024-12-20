import React from 'react';

function XMLPreview({ data }) {
    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Generated XML</h2>
                {data.downloadUrl && (
                    <a
                        href={data.downloadUrl}
                        download
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Download XML
                    </a>
                )}
            </div>
            <pre className="bg-gray-50 p-4 rounded overflow-x-auto">
                {data.xml}
            </pre>
        </div>
    );
}

export default XMLPreview;