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

// listen for requests
app.listen(process.env.PORT, () => {
  console.log(`The server is running on port ${port}...`);
  });