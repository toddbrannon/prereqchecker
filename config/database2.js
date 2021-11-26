const { createPool } = require('mysql');

const pool2 = createPool({
    port: process.env.DB_PORT,
    host: process.env.DB2_HOST,
    user: process.env.DB_USER,
    password: process.env.DB2_PASS,
    database: process.env.DB2_NAME,
    multipleStatements: true,
    ssl: true,
    connectionLimit: 10
})


module.exports = pool2;