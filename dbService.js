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

const Query01 = require('./queries/query01')
const Query02 = require('./queries/query02')
const Query03 = require('./queries/query03')
const Query04a = require('./queries/query04a')
const Query04c = require('./queries/query04c')
const Query04d = require('./queries/query04d')
const Query04f = require('./queries/query04f')
const Query05 = require('./queries/query05')
const Query06 = require('./queries/query06')
//-----------
let instance = null;
dotenv.config();

//array with all queries
const queries = [
    new Query01(),
     new Query02(),
     new Query03(),
     new Query04a(),
     new Query04c(),
     new Query04d(),
     new Query04f(),
     new Query05(),
     new Query06()
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