const BASE_URL = '/api';

export const sendReport = async (report) => {
    try {
        const isConnectionAvailable = await checkConnectionAvailability();
        if (!isConnectionAvailable) {
            throw new Error('Connection unavailable. Please try again later.');
        }

        const response = await fetch(`${BASE_URL}/reports`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(report),
        });

        if (!response.ok) {
            throw new Error('Failed to send report');
        }
        
        return await response.json();
    } catch (error) {
        throw error;
    }
};

const checkConnectionAvailability = async () => {
    try {
        const response = await fetch(`${BASE_URL}/check-connection`);
        return response.ok;
    } catch (error) {
        return false;
    }
};

export const getReports = async () => {
    try {
        const isConnectionAvailable = await checkConnectionAvailability();
        if (!isConnectionAvailable) {
            throw new Error('Connection unavailable. Please try again later.');
        }

        const response = await fetch(`${BASE_URL}/reports`);
        if (!response.ok) {
            throw new Error('Failed to fetch reports');
        }
        
        return await response.json();
    } catch (error) {
        throw error;
    }
};