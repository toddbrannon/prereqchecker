const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const { getAll } = require('../../commonService');

router.get('/', (req, res) => {
    res.render('landing');
})

router.get('/prereqcheck', async (request, response, next) => {
    const result = await getAll();
    return response.render('prereqcheck', {page_title: "Prerequisite Checker", data: result})
})

// router.get('/getAll', async (request, response) => {
//     const result = await getAll();
//     // res.render('prereqcheck');
//     return response.send({ data: result });
// });

module.exports = router;