const mysql = require('mysql');
const dotenv = require('dotenv');
const QueryExec = require('./QueryExec')

// be more descriptive and add db name to const connection....
//var connection = mysql.createConnection({multipleStatements: true});
const connection_learndot = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    multipleStatements: true
});

const connection2_elearning = mysql.createConnection({
    host: process.env.DB2_HOST,
    user: process.env.DB_USER,
    password: process.env.DB2_PASS,
    database: process.env.DB2_NAME,
    port: process.env.DB_PORT,
    multipleStatements: true
});

connection_learndot.connect((err) => {
    if (err) {
        console.log(err.message)
    }
    console.log('db 1 (learndot) is ' + connection_learndot.state);
})

connection2_elearning.connect((err) => {
    if (err) {
        console.log(err.message)
    }
    console.log('db 2 (elearning) is ' + connection2_elearning.state);
})

const Query01 = require('./queries/query01')
const Query02 = require('./queries/query02')
const Query03 = require('./queries/query03')
const Query04 = require('./queries/query04')
// const Query05 = require('./queries/query05')
const Query09 = require('./queries/query09')
const Query10 = require('./queries/query10')
//-----------
let instance = null;
dotenv.config();

//array with all queries
const queries = [
    new Query01(),
    new Query02(),
    new Query03(),
    new Query04(),
    // new Query05(),
    new Query09(),
    new Query10()
]



class DbService {
    static getDbServiceInstance() {
        return instance ? instance : new DbService();
    }

    async getAllData() {
        const queryExec = new QueryExec(); //Create a sql executor 

        let previous; //previous query result
        for (let i = 0; i < queries.length; ++i) {
            const query = queries[i]
            if(query.name == "get_elearning") {
                previous = await queryExec.exec(connection2_elearning, query, previous)
            } else {
                if(query.name == "get_enrollmentrefresh_emails"){
                    previous = await queryExec.exec(connection_learndot, query, previous)
                    email_array = []
                } else {
                    previous = await queryExec.exec(connection_learndot, query, previous)
                }      
            }           
        }
        if (process.env.DB_DISABLED !== '1') {
            connection_learndot.end() && connection2_elearning.end();
        }
    }
}

module.exports = DbService;