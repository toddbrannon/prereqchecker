const express = require('express');
var axios = require('axios');
const prettyjson = require('prettyjson');
const router = express.Router();

var request = require('request');

const database = require("../../config/database");
// const pool = require("../../config/database");
const sql2 = require('../../config/database');
const database2 = require("../../config/database2");
const res = require('express/lib/response');
const { set } = require('express/lib/response');
const { callbackify } = require('util');

// Main landing page GET route ............................................................................................
// ........................................................................................................................
router.get("/", (req, res) => {
  res.render("landing", {
      title: "Splunk Core Implementation Prerequisite Checker",
  });
});

// Render json_test.ejs ...................................................................................................
// ........................................................................................................................
router.get('/json_test', (req, res) => {
	res.render("json_test",{
		title: 'JSON test'
	});

})




// All learndot enrollments GET route .......................................................................................................
// .................................................................................................................................
router.get("/asyncawait", (req, res) => {
	console.log('Start')

	function loginUser(email, password) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				console.log("now we have the data");
				resolve({ userEmail: email });
			}, 3000);
		})
	}

	function getUserVideos(email) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				resolve(["video 1", "video 2", "video 3"]);
			}, 2000)
		})
	}

	function videoDetails(video) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				resolve("title of video");
			}, 2000);
		})
	}


	//Promise.then
	// loginUser('ed', 'bumba')
	// .then(user => getUserVideos(user.email))
	// .then(videos => videoDetails(videos[0]))
	// .then(detail => console.log(detail))

	// ASYNC/AWAIT

	async function displayUser() {
		const loggedUser = await loginUser('ed', 'bumba');
		const videos = await getUserVideos(loggedUser.userEmail);
		const detail = await videoDetails(videos[0]);
		console.log(detail);
	}


	displayUser();

	console.log("Finish");

	res.send("Success!!")
});

clearEnrollments = () => {
	return new Promise((resolve, reject) => {
		database.pool.query(database.sql1, (error, elements) => {
			if(error){
				return reject(error);
			}
			console.log('cleared');
			return resolve()
		})
	})
}

insertToEnrollments = () => {
    return new Promise((resolve, reject)=>{
		setTimeout(() => {
			database.pool.query(database.sql3,  (error, elements)=>{
				if(error){
					return reject(error);
				}
				console.log('inserted');
				return resolve(elements);
			});
		},3000);  
    });
};

selectFromEnrollments = () => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			database.pool.query('SELECT * FROM enrollmentrefresh', (error, elements) => {
				if(error){
					return reject(error);
				}
				return resolve(elements);
			});
		}, 2000);
	});
};

// insertIntoEnrollments = () => {
// 	return new Promise((resolve, reject) => {
// 		setTimeout(() => {
// 			database.pool.query(database.sql3, (error, elements) => {
// 				if(error){
// 					return reject(error);
// 				}
// 				return resolve(elements);
// 			});
// 		}, 2000);
// 	});
// }

function deleteFromELRResults() {
	return new Promise((resolve, reject) => {
	// create the DELETE query and set to variable
	let sql_delete_tb_elr_results = database.sql8;

	// execute the DELETE query
	database.pool.query(sql_delete_tb_elr_results, (err, results, fields) => {
		if (err) {
			console.log("Failed to delete records from tb_elr_prereqs!!!")
			console.log(err)
			res.sendStatus(500)
			return
		}
		console.log("Deleted the existing data from the tb_elr_results table");
		// res.end()
	})
	const error = false;
		if(!error){
			resolve();
		}
		else {
			reject('Error:Something went wrong in deleteFromELRResults!')
		}
	})	
}

function get_elearningrecords(){
	return new Promise((resolve, reject) => {
	setTimeout(() => {
		var sql_getemails = `SELECT email FROM enrollmentrefresh;`;
		// execute the query
		database.pool.query(sql_getemails, (err, result)=>{
			// console.log("getting the emails from enrollmentrefresh table")
			// console.log("sql_getemails" + Object.keys(rows).length)
			// console.log(rows[0].email)
			let res = JSON.parse(JSON.stringify(result))
			console.log(Object.keys(result).length)
			// console.log(res)
			console.log(res.length)
			// var emails = []
			// for(i=1;i <= res.length - 1; i++){
			// 	var a = res[i].email
			// 	emails.push(a)
			// }
			// console.log(emails);
			
			const sql_getelr = `SELECT
								registrationID,
								courseName,
								email
								FROM
								eLearningRecords
								WHERE
								email = ?
								AND
								(
								SCORMLESSONSTATUS LIKE 'passed'
								OR 
								registrationstatus LIKE 'PASSED'
								)
								AND
								(
								(courseName LIKE '%Fundamentals%' AND courseName LIKE '%Part 3%')
								OR 
								courseName LIKE '%Creating Dashboards%'
								OR 
								courseName LIKE '%Advanced Searching%'
								OR 
								courseName LIKE '%Core Consultant Labs%'
								);`;
	
			// database2.pool.query(sql_getelr, [emails], (err, result)=>{
			// 	if(err) throw err;
			// 	let res2 = JSON.parse(JSON.stringify(result))
			// 	console.log(res2)
			// 	console.log(res2.length)
				
			// })
			// 				var rowcount = Object.keys(rows).length
			// 				//console.log(rowcount)
			// 				if(rowcount > 0){
			// 					for(j=1; j<=rowcount; j++){
			// 						if(rows[j] != undefined){
			// 							for(var j in rows){
			// 								var el_email = JSON.stringify(rows[j].email)
			// 								var el_email = el_email.replace('"\\"', '')
			// 								var el_email = el_email.replace('\\""', '')
			// 								var el_coursename = JSON.stringify(rows[j].courseName)
			// 								var el_regid = JSON.stringify(rows[j].registrationID)
			// 								// console.log("j - " + j + " - email:" + el_email + " - coursename: " + el_coursename + " - reg_id: " + el_regid + ";")
			// 								// console.log(el_email, el_coursename)
			// 								var records3 = [el_email, el_coursename, el_regid]
			// 								// Query to insert results from sql_get_events_and_enrollments into the enrollmentsrefresh table
			// 								var sql_insert_elr_results = 
			// 									database.sql7;
												
			// 								// console.log("sql_insert_elr_prereqs: " + sql_insert_elr_prereqs)
	
			// 								database.pool.query(sql_insert_elr_results, [records3], (err, rows, results) => {
			// 									if(err){
			// 										console.log(err)
													
			// 										return
			// 									} else {
			// 										console.log("inserted records into tb_elr_results")
			// 										// res.end()
			// 									}									
			// 								})
			// 								}
			// 							}									
			// 						}								
			// 					}							
			// 			})					
			// 		}				
			// 	}			
			// }	
		})	
		const error = false;
			if(!error){
				resolve();
			}
			else {
				reject('Error:Something went wrong in get_elearningrecords!')
			}
	},3000)   
	})
}

router.get('/prereqcheck', async (req, res, next)=>{
	try{
		// clearEnrollments();   
		// insertIntoEnrollments();

		deleteFromELRResults();
		get_elearningrecords();
		// const resultElements = await selectFromEnrollments();
		// res.status(200).json({elements:resultElements});
		
		res.sendStatus(200);
	} catch(e) {
		console.log(e),
		res.sendStatus(500);
	}
});

module.exports = router;