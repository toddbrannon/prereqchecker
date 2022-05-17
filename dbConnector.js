
const mysql = require('mysql');

// be more descriptive and add db name to const connection....
//var connection = mysql.createConnection({multipleStatements: true});
const connection_learndot_pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    multipleStatements: true,
    connectionLimit : 2,
});

const connection2_elearning_pool = mysql.createPool({
    host: process.env.DB2_HOST,
    user: process.env.DB2_USER,
    password: process.env.DB2_PASS,
    database: process.env.DB2_NAME,
    port: process.env.DB_PORT,
    multipleStatements: true,
    connectionLimit : 2,
});

const getLearnDotDBConnection = () => connection_learndot_pool;

const getELearningConnector = () => connection2_elearning_pool;

module.exports = {
    getLearnDotDBConnection,
    getELearningConnector
}