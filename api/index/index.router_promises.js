const express = require('express');
var axios = require('axios');
//var data = JSON.stringify({"first_name":"Todd","last_name":"Brannon","username":"tbrannon","email_address":"todd@nowhere.com","password":"password1234"});
const prettyjson = require('prettyjson');
const router = express.Router();

var request = require('request');

const database = require("../../config/database");
const database2 = require("../../config/database2");
const res = require('express/lib/response');
const mysql = require('mysql');
const util = require('util');

function makeDb( database ){
	const connection = mysql.createConnection( database );
	return {
		query( sql, args ) {
			return util.promisify( connection.query )
			.call( connection, sql, args )
		},
		close() {
			return util.promisify( connection.end ).call( connection );
		}
	};
}

const db = makeDb( database );
try {
	const someRows = await db.query(database.sql2)
	// do something with someRows
} catch(err) {
	// handle error
} finally {
	await db.close();
}

// Main landing page GET route ............................................................................................
// ........................................................................................................................
router.get("/", (req, res) => {
  res.render("landing", {
      title: "Splunk Core Implementation Prerequisite Checker",
  });
});

// Syntax for using promises and async await
router.get("/promises", (req, res) => {
	console.log('Start');
	function loginUser(email, password){
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				console.log('Now we have the data')
				resolve({ userEmail: email });
			}, 3000)
		})
	}
	function getUserVideos(email) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				resolve(['video1', 'video2', 'video3'])
			}, 3000)
		})
	}
	function videoDetails(video) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				resolve("Title of video")
			}, 2000)
		})
	}
	async function displayUser(){
		const loggedUser = await loginUser('todd', 'password');
		const videos = await getUserVideos(loggedUser.userEmail);
		const detail = await videoDetails(videos[0]);
		console.log(detail);
	}
	displayUser();
	res.render("landing", {
		title: "Promises",
	})
})

module.exports = router;