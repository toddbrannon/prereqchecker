const express = require('express');
const mysql = require('mysql');
const ejs = require('ejs');
const methodOverride = require('method-override');
const morgan = require('morgan');
const dotenv = require('dotenv');

require('dotenv').config();

const http = require('http')

const port = process.env.PORT;  

// Requiring Routes
// const indexRouter = require('./api/index/index.router_async_test')
const indexRouter = require('./api/index/index.router')

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


const QueryExec = require('./QueryExec')

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

// listen for requests
app.listen(process.env.PORT, () => {
  console.log(`The server is running on port ${port}...`);
  });