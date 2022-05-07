const express = require('express');
const router = express.Router();

const dbService = require('../../dbService');

router.get('/getAll', (request, response) => {
    const db = dbService.getDbServiceInstance();
    const result = db.getAllData();
    const emails = db.pushEmails();
    result
    emails
    .then(data => response.json({ data : data }))
    .catch(err => console.log(err));
});

module.exports = router;