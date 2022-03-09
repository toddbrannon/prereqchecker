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


// display books page
router.get('/enrollments', function(req, res, next) {
      
    database.pool.query('SELECT * FROM tb_prereqs;',function(err,rows)     {
 
        if(err) {
            // req.flash('error', err);
            console.log(err.message)
            // 
            res.render('enrollments',{data:''});   
        } else {
            // 
            res.render('enrollments',{data:rows});
        }
    });
});

module.exports = router;