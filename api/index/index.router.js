const express = require('express');
const router = express.Router();
const { getAll } = require('../../commonService');

router.get('/getAll', async (request, response) => {
    const result = await getAll();
    return response.send({ data: result });
});

module.exports = router;