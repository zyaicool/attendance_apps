const express = require('express');
const bodyParser = require('body-parser');
const syncDatabase = require('./config/sync_database');
const configEnv = require('./config/env_config');
const userRoutes = require('./routes/user_routes');
const parameterRoutes = require('./routes/parameter_routes');
const attendanceRoutes = require('./routes/attendance_routes');
const app = express();
const port = configEnv.port;

app.use(bodyParser.json());
app.use('/api', userRoutes);
app.use('/api', parameterRoutes);
app.use('/api', attendanceRoutes);


async function startApp() {
    await syncDatabase();

    app.get('/', (req, res) => {
        res.send('This apps has running well.');
    });

    app.listen(port, () => {
        console.log(`Node.js app listening at http://localhost:${port}`);
    });
}

startApp().catch((err) => console.error('Failed to start service: ', err));