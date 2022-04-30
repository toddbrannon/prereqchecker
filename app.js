const express = require('express');
const mysql = require('mysql');
const ejs = require('ejs');
const methodOverride = require('method-override');
const morgan = require('morgan');
const dotenv = require('dotenv');

const QueryExec = require('./QueryExec')
/*Query classes can have: name, getsql, getValues
*/
const Query01 = require('./queries/query01')
const Query02 = require('./queries/query02')
const Query03 = require('./queries/query03')
//-----------
let instance = null;
dotenv.config();

//array with all queries
const queries = [
  new Query01(),
  new Query02(),
  new Query03()
]

const http = require('http')

const port = process.env.PORT;  

// Requiring Routes
// const indexRouter = require('./api/index/index.router_async_test')
const indexRouter = require('./api/index/index.router')
const enrollmentsRouter = require('./api/enrollments/enrollments.router')

const app = express();

app.use(morgan('short'));

app.use(express.json());

app.use(express.urlencoded({ extended: false }))

app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(methodOverride("_method"));

// Using Routes ==========================================
app.use('/', indexRouter)
app.use('/request', indexRouter)
app.use('/enrollments', enrollmentsRouter)



// listen for requests
app.listen(process.env.PORT, () => {
  console.log(`The server is running on port ${port}...`);
  });