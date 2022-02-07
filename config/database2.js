const { createPool } = require('mysql');

const pool = createPool({
    port: process.env.DB_PORT,
    host: process.env.DB2_HOST,
    user: process.env.DB_USER,
    password: process.env.DB2_PASS,
    database: process.env.DB2_NAME,
    multipleStatements: true,
    ssl: true,
    connectionLimit: 10
})

const sql4 = `DELETE FROM tb_elr_prereqs;`

const sql6 = `SELECT
                registrationID,
                courseName,
                email
                FROM
                eLearningRecords
                WHERE
                email = ?
                AND
                (
                SCORMLESSONSTATUS LIKE 'passed'
                OR 
                registrationstatus LIKE 'PASSED'
                )
                AND
                (
                (courseName LIKE '%Fundamentals%' AND courseName LIKE '%Part 3%')
                OR 
                courseName LIKE '%Creating Dashboards%'
                OR 
                courseName LIKE '%Advanced Searching%'
                OR 
                courseName LIKE '%Core Consultant Labs%'
                );`

module.exports.pool = pool;
module.exports.sql4 = sql4;
module.exports.sql6 = sql6;