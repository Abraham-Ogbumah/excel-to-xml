import React from 'react';

function ErrorAlert({ message }) {
    return (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{message}</span>
        </div>
    );
}

export default ErrorAlert;