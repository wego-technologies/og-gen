const express = require('express');
const app = express();
const port = process.env.PORT || 4000;
const movement = require('./api/movement');

app.get('/', async (req, res) => {
    res.end('<h1>Wego OpenGraph Generator</h1>');
});

app.use('/api/movement', movement);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})