const express = require('express');
var axios = require('axios');
//var data = JSON.stringify({"first_name":"Todd","last_name":"Brannon","username":"tbrannon","email_address":"todd@nowhere.com","password":"password1234"});
const prettyjson = require('prettyjson');
const router = express.Router();

var request = require('request');

const database = require("../../config/database");
// const pool = require("../../config/database");
const sql2 = require('../../config/database');
const database2 = require("../../config/database2");
const res = require('express/lib/response');

const dbService = require('../../dbService');



router.get('/getAll', (request, response) => {
    const db = dbService.getDbServiceInstance();
    const result = db.getAllData();
    result
    .then(data => response.json({ data : data }))
    .catch(err => console.log(err));
});



router.get('/getArray', (request, response) => {
    const db = dbService.getDbServiceInstance();
    const result = db.getArray();
    result
    .then(data => response.json({ data : data }))
    .catch(err => console.log(err));
});

router.get('/getEmails', (request, response) => {
    const db = dbService.getDbServiceInstance();
    const result = db.pushEmails();
    result
    .then(data => response.json({ data : data }))
    .catch(err => console.log(err));
})



module.exports = router;