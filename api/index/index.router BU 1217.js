const express = require('express');
var axios = require('axios');
//var data = JSON.stringify({"first_name":"Todd","last_name":"Brannon","username":"tbrannon","email_address":"todd@nowhere.com","password":"password1234"});
const prettyjson = require('prettyjson');
const router = express.Router();

var request = require('request');

const pool = require("../../config/database")
const pool2 = require("../../config/database2")

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

// ROUND I: GETTING CREDLY API DATA AND INSERTING INTO tb_credlybadgeresult TABLE (splunk.training database: learndot)
// Get badge data from the Credly api .....................................................................................
// ........................................................................................................................
router.get('/fetch_badges', async (req, res) => {
	var sql_delete_credly = `DELETE FROM tb_credlybadgeresult;`
	// DELETE EXISTING DATA FROM THE tb_credlybadgeresult table ===========================================================
	pool.query(sql_delete_credly, (err, results, fields) => {
		if (err) {
			console.log("Failed to delete credly data!!!")
			console.log(err)
			res.sendStatus(500)
			return
		}
		console.log("Deleted the existing data from the tb_credlybadgeresult table");
		// res.end()
	})

	// GET DATA FROM THE CREDLY API =====================================================================================
		var options = {
		'method': 'GET',
		'url': 'https://api.credly.com/v1/organizations/4b74de99-bfb3-4f61-a50e-a7a336f322e7/badges',
		'headers': {
			'Content-Type': 'application/json',
			'Authorization': 'Basic TlI2SkxCS0F2dTMyZHVVT2cxN1VDbGhXVGdZUENmbzc0SjEtXzFoMDo='
		},
		body: JSON.stringify({"first_name":"Todd","last_name":"Brannon","username":"tbrannon","email_address":"todd@nowhere.com","password":"password1234"})

		};
		request(options, function (error, response) {
		if (error) throw new Error(error);
		var body = response.body
		body = JSON.parse(body)


		// ADDED 11/01/2021 - TESTED and workded at 5:26pm ===============================================================
		const data = body.data
		const badge_results = []
		
		for(var i in data)
			if(data[i].recipient_email != undefined)
				// console.log(data[i].user.email)
				// ADDED 11/07/2021 to get badge template id and recipient email (worked)
				badge_results.push([i, data[i].recipient_email, data[i].badge_template.id])
				function logArray(badge_results){
					badge_results.forEach(x => console.log("results: " + x));
				  }
				  logArray(badge_results)

		// Assign recipient email and badge id to variables (ADDED 11/08/2021 - works as intended)
		// INSERT CREDLY DATA INTO MySQL (learndot.tb_credlybadgeresult) ================================================================
		badge_results.forEach(badge_result => {
			var recipient_email = badge_result[1]
			var badge_id = badge_result[2]
			console.log(recipient_email)
			console.log(badge_id)
			
			var sql = `INSERT INTO tb_credlybadgeresult (recipientemail, badge_id) VALUES ('${recipient_email}', '${badge_id}');`
			console.log(sql)
			
			// RUN THE QUERY
			pool.query(sql, (err, results, fields) => {
				if (err) {
					console.log("Failed to insert credly data!!!")
					console.log(err)
					res.sendStatus(500)
					return
				}
				console.log("Inserted a new Credly record with id: " + results.insertId);
				// res.end()
			})			
		})		
		console.log('/fetch_badges json returned')
		res.send(body)
		})
		// SET VARIABLE WITH SQL STATEMENT TO DELETE ALL RECORDS FROM enrollmentrefresh TABLE ==============================================================
		var sql_delete_enrollments = `DELETE FROM enrollmentrefresh;`
		// DELETE EXISTING DATA FROM THE enrollmentrefresh table ===========================================================
		pool.query(sql_delete_enrollments, (err, results, fields) => {
			if (err) {
				console.log("Failed to delete credly data!!!")
				console.log(err)
				res.sendStatus(500)
				return
			}
			console.log("Deleted the existing data from the enrollmentrefresh table");
		})
})

// ........................................................................................................................
// .................................................................................................................................
// ROUND II: GETTING ALL EVENTS AND ENROLLMENTS BY FROM Learndot enrollment, event, contact, and location tables
// All learndot enrollments GET route .......................................................................................................
// .................................................................................................................................
router.get("/learndot_enrollments", (err, res) => {
	// STEP 1 - DELETE EXISTING DATA FROM THE enrollmentrefresh table ===========================================================

	// set variable to the query string
	var sql_delete_events_and_enrollments = `DELETE FROM enrollmentrefresh;`

	// execute the query
	pool.query(sql_delete_events_and_enrollments, (err, results, fields) => {
		if (err) {
			console.log("Failed to delete records from enrollmentrefresh!!!")
			console.log(err)
			res.sendStatus(500)
			return
		}
		console.log("Deleted the existing data from the enrollmentrefresh table");
		// res.end()
	})
	// END (STEP 1) DELETE QUERY SECTION ===========================================================================================

	// =============================================================================================================================

	// STEP 2 - GET EVENTS AND ENROLLMENTS FROM contact, enrollment, and location tables ===========================================

	// create function
	function get_learndot_events_enrollments() {
		// 2a. create the query and set to variable
		let sql_get_events_and_enrollments = 
				`SELECT 
	            	V.id AS event_id,
	            	V.startTime,
	            	E.id AS enrollment_id,
	            	C.email,
	            	C.firstName,
	            	C.lastName,
	            	E.status,
	            	LOC.name,
	            	E.contact_id,
					E.score,
                	urlName
	            FROM 
	            	event V
	            	LEFT JOIN 
	            	enrollment E ON V.id = E.event_id
	            	LEFT JOIN
	            	contact C ON E.contact_id = C.id
	            	INNER JOIN 
	            	location LOC ON V.location_id = LOC.id
	            WHERE 
	            	V.course_id = 256 
	            	AND 
	            	V.startTime > CURRENT_TIMESTAMP
	            	AND 
	            	V.status LIKE 'CONFIRMED'
	            	AND 
	            	E.status NOT LIKE 'CANCELLED';`

		// 2b. execute the SELECT query
		pool.query(sql_get_events_and_enrollments, (err, rows, results) => {
			// console.log("rows:" + JSON.stringify(rows))
			// 2c. Assign results of query to variables to insert into subsequent INSERT query (inserting into table: enrollmentrefresh)
			for(i=1; i <= Object.keys(rows).length; i++){
				if(rows[i] != undefined){
					for(var i in rows) {
						var event_id = JSON.stringify(rows[i].event_id)
						var start_time = JSON.stringify(rows[i].startTime)
						var email = JSON.stringify(rows[i].email)
						var enrollment_id = JSON.stringify(rows[i].enrollment_id)
						var firstname = JSON.stringify(rows[i].firstName)
						var lastname = JSON.stringify(rows[i].lastName)
						var status = JSON.stringify(rows[i].status)
						var locationname = JSON.stringify(rows[i].name)
						var contactid = JSON.stringify(rows[i].contact_id)
						var score = JSON.stringify(rows[i].score)
						var urlname = JSON.stringify(rows[i].urlName)

						// 2d. create query to insert results from sql_get_events_and_enrollments into the enrollmentsrefresh table
						var sql_insert_enrollments_and_events = 
						`INSERT INTO enrollmentrefresh (
						event_id, 
						start_time,
						enrollment_id,
						email,
						firstname,
						lastname,
						status,
						locationname,
						contactid,
						score,
						urlname
						) VALUES (
						'${event_id}', 
						'${start_time}',
						'${enrollment_id}', 
						'${email}',
						'${firstname}', 
						'${lastname}',
						'${status}', 
						'${locationname}',
						'${contactid}', 
						'${score}',
						'${urlname}');`

					console.log(sql_insert_enrollments_and_events)

					// 2e. execute the INSERT query
					pool.query(sql_insert_enrollments_and_events, (err, results, fields) => {
						if (err) {
							console.log("Failed to insert records into enrollmentrefresh!!!")
							console.log(err)
							res.sendStatus(500)
							return
						}
						console.log("Inserted the new data from the enrollmentrefresh table");
						// res.end()
					})

					}
					
				}	
				// 2f. render the 'learndot_enrollments' view once the queries have been executed
				res.render("learndot_enrollments", {
				title: "Splunk Core Implementation Prerequisite Checker",
				});
			}
		})
	}
	// 2g. call the function to run 2a through 2f
	get_learndot_events_enrollments();

	// END (STEP 2) GET EVENTS AND ENROLLMENTS SECTION ======================================================================================  
})

// ROUND III: GETTING EVENTS AND ENROLLMENTS BY EMAIL FROM SPLUNK U eLearningRecords TABLE; Then will need to create a SELECT query joining enrollmentrefresh and tb_elr_prereqs on emial. 
// All learndot enrollments GET route .......................................................................................................
// .................................................................................................................................
router.get("/elearning_enrollments", (err, res) => {
	// STEP 3 - DELETE EXISTING DATA FROM THE tb_elr_prereqs table ===========================================================

	// create the DELETE query and set to variable
	var sql_delete_events_and_enrollments = `DELETE FROM tb_elr_prereqs;`

	// execute the DELETE query
	pool2.query(sql_delete_events_and_enrollments, (err, results, fields) => {
		if (err) {
			console.log("Failed to delete records from tb_elr_prereqs!!!")
			console.log(err)
			res.sendStatus(500)
			return
		}
		console.log("Deleted the existing data from the tb_elr_prereqs table");
		// res.end()
	})
	// END (STEP 3) DELETE QUERY SECTION ===========================================================================================

	// =============================================================================================================================

	// STEP 4 - GET EVENTS AND ENROLLMENTS FROM contact, enrollment, and location tables ===========================================

	
	// create a function
	function get_elearningrecords() {
		// create the SELECT query to get events and enrollments from splunk u elearning records table and set to variable
		let sql_elearningrecords = 
				`SELECT
					registrationID,
					courseName,
					email
				FROM
					eLearningRecords
				WHERE
					-- email LIKE 'cmaechler@splunk.com'
				-- AND
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
				);`

		// execute the SELECT query
		pool2.query(sql_elearningrecords, (err, rows, results) => {
			// console.log("rows:" + JSON.stringify(rows))
			// Assign results of query to variables to insert into subsequent INSERT query (inserting into table: tb_elr_prereqs)
			for(i=1; i <= Object.keys(rows).length; i++){
				if(rows[i] != undefined){
					for(var i in rows) {
						var reg_id = JSON.stringify(rows[i].registrationID)
						var course_name = JSON.stringify(rows[i].courseName)
						var email = JSON.stringify(rows[i].email)

						// Query to insert results from sql_get_events_and_enrollments into the enrollmentsrefresh table
						var sql_insert_elr_prereqs = 
						`INSERT INTO tb_elr_prereqs (
						registrationID,
						courseName,
						email
						) VALUES (
						'${reg_id}', 
						'${course_name}',
						'${email}');`

					console.log(sql_insert_elr_prereqs)
					
					// execute the INSERT query
					pool2.query(sql_insert_elr_prereqs, (err, results, fields) => {
						if (err) {
							console.log("Failed to insert records into tb_elr_prereqs!!!")
							console.log(err)
							res.sendStatus(500)
							return
						}
						console.log("Inserted the new data from the tb_elr_prereqs table");
						// res.end()
					})

					}
					
				}	
				res.render("splunku_enrollments", {
				title: "Splunk Core Implementation Prerequisite Checker",
				});
			}
		})
	}
	// call the function
	get_elearningrecords();

	// END (STEP 4) GET SPLUNK U EVENTS AND ENROLLMENTS SECTION ======================================================================================  
})



module.exports = router;