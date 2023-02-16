const dialogflow = require('dialogflow');
const express = require('express');
const mysql2 = require('mysql2');
const uuid = require('uuid');

const app = express();
app.use(express.json());

const projectId = process.env.PROJECT_ID;
const credentials = require('./credentials.json');

const connection = mysql2.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'teensage'
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

const sessionClient = new dialogflow.SessionsClient({
    projectId,
    credentials
});

app.get('/newSession', (req, res) => {

    const sessionId = uuid.v4();

    connection.query('INSERT INTO `anonymous_user_data` (`user_id`, `data`) VALUES (?, ?)', [sessionId, '{}'], function (error, results, fields) {
        if (error) throw error;
    });

    res.send({
        sessionId: sessionId,
        avatar: 'https://api.dicebear.com/5.x/micah/svg?seed=' + sessionId
    });

});

app.post('/updateSession', (req, res) => {

    const sessionId = req.body.sessionId;
    const data = req.body.data;

    connection.query('UPDATE anonymous_user_data SET data = ? WHERE user_id = ?', [data, sessionId], function (error, results, fields) {
        if (error) throw error;
    });

    res.send('OK');

});

app.get('/getSession/:sessionId', (req, res) => {

    const sessionId = req.params.sessionId;

    connection.query('SELECT data FROM anonymous_user_data WHERE user_id = ?', [sessionId], function (error, results, fields) {
        if (error) throw error;
        res.send(results[0].data);
    });

});

app.post('/webhook', async (req, res) => {
    const {
        queryInput,
        session
    } = req.body;

    const sessionPath = sessionClient.projectAgentSessionPath(projectId, session);

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: queryInput.text,
                languageCode: 'en-US',
            },
        },
    };

    try {
        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;
        res.json(result);
    } catch (err) {
        console.error('Error processing request', err);
        res.status(500).send(err);
    }
});

// app.post('/chat', (req, res) => {

//     const sessionId = req.body.sessionId;
//     const message = req.body.message;

//     // generate a response based on the message
//     const response = replyToMsgBasedOnContext(message, sessionId);

//     connection.query('INSERT INTO `chat` (`user_id`, `message`, `response`) VALUES (?, ?, ?)', [sessionId, message, response], function (error, results, fields) {
//         if (error) throw error;
//     });

//     res.send({response: response});

// });

app.listen(process.env.PORT || 3000, () => {
    console.log('Server listening on port 3000');
});