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



// Get badge data from the Credly api .....................................................................................
// ........................................................................................................................
router.get('/fetch_badges', async (req, res) => {
	console.log('/fetch_badges endpoint called')

	var sql1 = `DELETE FROM tb_credlybadgeresult;`
	// DELETE EXISTING DATA FROM THE tb_credlybadgeresult table ===========================================================
	pool.query(sql1, (err, results, fields) => {
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
			// res.end()
		})

	// res.render('credly_data', {
	// 	title: "Credly Data",
	// })
})

// All SplunkU prereqs
router.get("/splunku", (err, res) => {
	const prereqs = []
	if (err) console.log(err);
	let sql_splunku = `SELECT
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
						let query = pool2.query(sql_splunku, (err, rows, results) => {
							if (err) throw err;
							alert('error')
							console.log(rows[0].registrationID)
							for(var i in rows)
								if(rows[i].email != undefined)
									prereqs.push[i, rows[i].email]
									function logArray(prereqs){
										prereqs.forEach(x => console.log("prereqs: " + x));
									  }
									  logArray(prereqs)
					
							res.render('splunku', {
								title: 'Splunk Core Implementation Prerequisite Check',
								prereqresults: rows
							})
						})
})

// All enrollments GET route ..............................................................................................
// ........................................................................................................................
router.get("/learndot_enrollments", (err, res) => {
	// DELETE EXISTING DATA FROM THE tb_credlybadgeresult table ===========================================================
	var sql_delete_events_and_enrollments = `DELETE FROM enrollmentrefresh;`
	
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
	

    if (err) console.log(err);
	// This query (See Step 1a in docs/requirements) gets all enrollments (event.course_id=256)
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
      let query = pool.query(sql_get_events_and_enrollments, (err, rows, results) => {
		// Check the results in the console
		console.log("rows:" + JSON.stringify(rows))
		
		// Assign results of query to variables to insert into subsequent INSERT query (inserting into table: enrollmentrefresh)
		for(i=1; i <= Object.keys(rows).length; i++){
			
			if(rows[i] != undefined){
				// let email = JSON.stringify(rows[i].email)
				// console.log(email);
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
					// console.log("eventid: " + event_id)
					// console.log("start time3: " + start_time)
					// console.log("email: " + email)
					// console.log("enrollment id: " + enrollment_id)
					// console.log("first: " + firstname)
					// console.log("last: " + lastname)
					// console.log("status: " + status)
					// console.log("location: " + locationname)
					// console.log("contact id : " + contactid)
					// console.log("score: " + score)
					// console.log("url name: " + urlname)

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

					var sql_get_enrollments_learndot = 
						`SELECT
							E.id AS registrationID,
							LC.name AS courseName
						FROM
							enrollment E
						INNER JOIN
							learningcomponent LC ON E.component_id = LC.id
						INNER JOIN
							contact C ON E.contact_id = C.id
						WHERE
							C.email LIKE '${email}'
						AND
							E.status LIKE 'PASSED'
						AND
						(
							(LC.name LIKE '%Fundamentals%' AND LC.name LIKE '%Part 3%')
							OR 
							LC.name LIKE '%Creating Dashboards%'
							OR 
							LC.name LIKE '%Advanced Searching%'
							OR 
							LC.name LIKE '%Core Consultant Labs%'
						);`

					console.log(sql_get_enrollments_learndot)

				let qry_learndot = pool.query(sql_get_enrollments_learndot, (err, res, fields) => {
						if (err) {
							console.log("Failed to check for learndot enrollments by email!!!")
							console.log(err)
							res.sendStatus(500)
							return
						} else {
							console.log("Inserted the new data from the enrollmentrefresh table");
							// Check the results in the console
							console.log("rows:" + JSON.stringify(rows))
							// console.log("Results: " + res.length)
							// for(var i = 0; i < res.length; i ++){
							// 	console.log("results: " + res[i])
							// }
							// res.end()
						}
						
					})
					
				}
			}
			
		}
		
		// const learndot_enrollments = []
        // if (err) throw err;
		// for(var i in rows)
		// 	if(rows[i].event_id != undefined){
		// 		// console.log("event_id/email/enrollment_id: " + rows[i].event_id, rows[i].email, rows[i].enrollment_id)
		// 		learndot_enrollments.push(rows[i].email + ", " + rows[i].event_id + ", " + rows[i].enrollment_id)
		// 		// console.log("learndot_enrollments: " + learndot_enrollments[i])
			
			
		// 		learndot_enrollments.forEach(learndot_enrollments => {
		// 			var event_id = learndot_enrollments[0]
		// 			var start_time = learndot_enrollments[1]
		// 			var enrollment_id = learndot_enrollments[2]
		// 			var email = learndot_enrollments[3]
		// 			var firstname = learndot_enrollments[4]
		// 			var lastname = learndot_enrollments[5]
		// 			var status = learndot_enrollments[6]
		// 			var locationname = learndot_enrollments[7]
		// 			var contactid = learndot_enrollments[8]
		// 			var score = learndot_enrollments[9]
		// 			var urlname = learndot_enrollments[10]
		// 			console.log("event_id: " + event_id)
		// 			console.log("start_time: " + start_time)
		// 			console.log("enrollment_id:" + enrollment_id)
		// 			console.log(email)
		// 			console.log(firstname)
		// 			console.log(lastname)
		// 			console.log(status)
		// 			console.log(locationname)
		// 			console.log(contactid)
		// 			console.log(score)
		// 			console.log(urlname)
						
		// 			// var sqlinsertlearndotenrollments = 
		// 			// 			`INSERT INTO enrollmentrefresh (
		// 			// 			event_id, 
		// 			// 			start_time,
		// 			// 			enrollment_id,
		// 			// 			email,
		// 			// 			firstname,
		// 			// 			lastname,
		// 			// 			status,
		// 			// 			locationname,
		// 			// 			contactid,
		// 			// 			score,
		// 			// 			urlname
		// 			// 			) VALUES (
		// 			// 			'${event_id}', 
		// 			// 			'${start_time}',
		// 			// 			'${enrollment_id}', 
		// 			// 			'${email}',
		// 			// 			'${firstname}', 
		// 			// 			'${lastname}',
		// 			// 			'${status}', 
		// 			// 			'${locationname}',
		// 			// 			'${contactid}', 
		// 			// 			'${score}',
		// 			// 			'${urlname}');`
		// 			// console.log(sqlinsertlearndotenrollments)
		// 		})

		// 		function logArray(learndot_enrollments){
		// 			learndot_enrollments.forEach(x => console.log("learndot_enrollments: " + x));
		// 		}
		// 		logArray(learndot_enrollments)

		// 		//console.log("learndot_enrollments[0]: " + learndot_enrollments[0])
		// 	}
        res.render('enrollments', {
            title: 'Splunk Core Implementation Prerequisite Check',
            enrollmentresults: rows
        })
    })
})




module.exports = router;