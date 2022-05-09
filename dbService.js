const mysql = require('mysql');
const dotenv = require('dotenv');
const QueryExec = require('./QueryExec')

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
    console.log('db 1 is ' + connection.state);
})

connection2.connect((err) => {
    if (err) {
        console.log(err.message)
    }
    console.log('db 2 is ' + connection.state);
})

const Query01a = require('./queries/query01a')
const Query01b = require('./queries/query01b')
const Query01c = require('./queries/query01c')
const Query01d = require('./queries/query01d')
const Query01e = require('./queries/query01e')
const Query02 = require('./queries/query02')
const Query03 = require('./queries/query03')
const Query04 = require('./queries/query04')
const Query05 = require('./queries/query05')
const Query06 = require('./queries/query06')
const Query07 = require('./queries/query07')
const Query08 = require('./queries/query08')
const Query09 = require('./queries/query09')
//-----------
let instance = null;
dotenv.config();

//array with all queries
const queries = [
    new Query01a(),
    new Query01b(),
    new Query01c(),
    new Query01d(),
    new Query01e(),
     new Query02(),
     new Query03(),
     new Query04(),
     new Query05(),
     new Query06(),
     new Query07(),
     new Query08(),
     new Query09()
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
            
                previous = await queryExec.exec(connection, query, previous)
            
            
        }
        if (process.env.DB_DISABLED !== '1') {
            connection.end();
        }
    }
}

module.exports = DbService;