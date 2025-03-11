const cron = require('node-cron');
const axios = require('axios');

// Schedule: Every day at 09:00 AM (Jakarta time)
cron.schedule('0 9 * * *', async() => {
    console.log('Running scheduled task to check clock-in...');

    try {
        const response = await axios.get('http://localhost:3000/api/attendances/checkClockin');
        console.log('Clock-in check result:', response.data);
    } catch (error) {
        console.error('Error calling API:', error.message);
    }
}, {
    scheduled: true,
    timezone: "Asia/Jakarta"
});

console.log('Scheduler started...');