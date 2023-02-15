const express = require('express');
const mysql = require('mysql2');

const app = express();

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'teensage'
});

connection.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + connection.threadId);
});

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/health', (req, res) => {
    res.send('OK');
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});