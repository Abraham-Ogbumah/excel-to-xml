import React from 'react';

function ProgressBar() {
    return (
        <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full w-full animate-pulse"></div>
            </div>
            <p className="text-center mt-2 text-gray-600">Converting...</p>
        </div>
    );
}

export default ProgressBar;