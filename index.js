const express = require('express');
const syncDatabase = require('./config/sync_database');
const app = express();
const port = 3000;

async function startApp() {
    await syncDatabase();

    app.get('/', (req, res) => {
        res.send('Hello from Node.js app!');
    });

    app.listen(port, () => {
        console.log(`Node.js app listening at http://localhost:${port}`);
    });
}

startApp().catch((err) => console.error('Failed to start service: ', err));