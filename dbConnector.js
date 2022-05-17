
const mysql = require('mysql');
const logger = require('./utils/logger');

// be more descriptive and add db name to const connection....
//var connection = mysql.createConnection({multipleStatements: true});
let connection_learndot_pool;
const createLearnDotConnectionPool = () => {
    try {
        if (connection_learndot_pool) {
            logger.info('Already created connection pool for learnDot DB')
            return;
        }
        connection_learndot_pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
            multipleStatements: true,
            connectionLimit : 2,
        });
        logger.info('Created learnDot DB connection pool.')
    } catch (err) {
        logger.error('An error occured while creating learnDot connection pool')
    }
}

let connection2_elearning_pool;
const createELearningConnectionPool = () => {
    try {
        if (connection2_elearning_pool) {
            logger.info('Already created connection pool for eLearning DB')
            return;
        }
        connection2_elearning_pool = mysql.createPool({
            host: process.env.DB2_HOST,
            user: process.env.DB2_USER,
            password: process.env.DB2_PASS,
            database: process.env.DB2_NAME,
            port: process.env.DB_PORT,
            multipleStatements: true,
            connectionLimit : 2,
        });
        logger.info('Created eLearning connection pool.')
    } catch (err) {
        logger.error('An error occured while creating eLearning connection pool')
    }
}

const getLearnDotDBConnection = () => connection_learndot_pool;

const getELearningConnector = () => connection2_elearning_pool;

module.exports = {
    createLearnDotConnectionPool,
    createELearningConnectionPool,
    getLearnDotDBConnection,
    getELearningConnector
}