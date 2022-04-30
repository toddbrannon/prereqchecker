const mysql = require('mysql');
const dotenv = require('dotenv');
const { CLIENT_FOUND_ROWS } = require('mysql/lib/protocol/constants/client');
const request = require('request');
// const { isRedirect } = require('node-fetch');
let instance = null;
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

const connection2 = mysql.createConnection({
    host: process.env.DB2_HOST,
    user: process.env.DB_USER,
    password: process.env.DB2_PASS,
    database: process.env.DB2_NAME,
    port: process.env.DB_PORT
});

connection.connect((err) => {
    if (err) {
        console.log(err.message)
    }
    console.log('db ' + connection.state);

    const srv = DbService.getDbServiceInstance();
    srv.getAllData()

})

class DbService {
    static getDbServiceInstance() {
        return instance ? instance : new DbService();
    }

    // Step 1 (query 1 - enrollmentrefesh delete) - DELETE
    // Step 2 (query 2 - insert into enrollmentrefresh) - INSERT(NESTED SELECT)
    // Step 3 (query 3 - delete from tb_elr_refesh) - DELETE
    // Step 4a (query 4a - select email from enrollmentrefresh) - SELECT
    // Step 4b (query 4b - get eLearningRecords) - SELECT (DEPENDENT UPON 4a)
    // Step 4c (query 4c - insert into tb_elr_results) - INSERT (DEPENDENT UPON 4b)
    // Step 4d (query 4d - delete from tb_learndot_enrollments) - DELETE
    // Step 4e (query 4e - get eLearningRecords) - SELECT
    // Step 4f (query 4f - insert into tb_enrollments_learndot) - INSERT (DEPENDENT UPON 4e)
    // Step 5 (query 5 - DELETE FROM tb_credlybadgeresult) - DELETE
    // Step 6 (query 6 - INSERT INTO tb_credlybadgeresult) - INSERT (DEPENDENT UPON API CALL)
    // Step 7 (query 7 - DELETE FROM tb_prereqs) - DELETE
    // Step 8 (query 8 - INSERT names, emails into tb_prereqs) - INSERT (DEPENDENT UPON 2)
    // Step 9 (query 9 - update ANsR column to 'NO') - UPDATE (DEPENDENT UPON 4f)
    // Step 10 (query 10 - update F3 to 'YES' from tb_elr_results) - UPDATE (DEPENDENT UPON 4c)
    // Step 11 (query 11 - update F3 to 'YES' from tb_enrollments_learndot) - UPDATE (DEPENDENT UPON 4e)
    // Step 12 (query 12 - update ANsR column to 'YES') - UPDATE ((DEPENDENT UPON 4f)


    async getAllData() {
        const queryExec = new QueryExec(); //Create a sql executor  
        let previous; //previous query result
        for (let i = 0; i < queries.length; ++i) {
            const query = queries[i]
             previous = await queryExec.exec(connection, query, previous)
        }
        connection.end();
    }
}

module.exports = DbService;