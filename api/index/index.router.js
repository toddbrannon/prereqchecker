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





// Function to clear the enrollmentrefresh table before inserting refreshed data
function deleteenrollments() {
	// set variable to the query string
	var sql_delete_events_and_enrollments = database.sql1;
	// execute the query
	database.pool.query(sql_delete_events_and_enrollments, (err, results, fields) => {
		if (err) {
			console.log("Failed to delete records from enrollmentrefresh!!!")
			console.log(err)
			res.sendStatus(500)
			return
		}
		console.log("Deleted the existing data from the enrollmentrefresh table");
		// res.end()
	})
}

// function that gets the learndot events and enrollments and then inserts them into the enrollment refresh table
function get_learndot_events_enrollments() {
	// 1. create the query and set to variable
	let sql_get_ld_events_and_enrollments = database.sql2;

	// 2. execute the SELECT query
	database.pool.query(sql_get_ld_events_and_enrollments, (err, rows, results) => {
		// console.log("rows:" + JSON.stringify(rows))
		// 3. Assign results of query to variables to insert into subsequent INSERT query (inserting into table: enrollmentrefresh)
		for(i=1; i <= Object.keys(rows).length; i++){
			if(rows[i] != undefined){
				for(var i in rows) {
					var ld_event_id = JSON.stringify(rows[i].event_id)
					var ld_start_time = JSON.stringify(rows[i].startTime)
					var ld_email = JSON.stringify(rows[i].email)
					var ld_enrollment_id = JSON.stringify(rows[i].enrollment_id)
					var ld_firstname = JSON.stringify(rows[i].firstName)
					var ld_lastname = JSON.stringify(rows[i].lastName)
					var ld_lastname = ld_lastname.replace('"\\"', '')
					var ld_lastname = ld_lastname.replace('\\""', '')
					var ld_lastname = ld_lastname.replace("'", "\\'")
					var ld_status = JSON.stringify(rows[i].status)
					var ld_locationname = JSON.stringify(rows[i].name)
					var ld_contactid = JSON.stringify(rows[i].contact_id)
					var ld_score = JSON.stringify(rows[i].score)
					var ld_urlname = JSON.stringify(rows[i].urlName)

					// 4. create query to insert results from sql_get_events_and_enrollments into the enrollmentsrefresh table
					var sql_insert_ld_enrollments_and_events = 
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
					'?', 
					'?',
					'?', 
					'?',
					'?', 
					'?',
					'?', 
					'?',
					'?', 
					'?',
					'?');`

				//console.log(sql_insert_ld_enrollments_and_events)

				// 5. execute the INSERT query
				database.pool.query(sql_insert_ld_enrollments_and_events, (err, results, fields) => {
					if (err) {
						console.log("Failed to insert records into enrollmentrefresh!!!")
						console.log(err)
						// res.sendStatus(500)
						return
					}
						console.log("Inserted the new data into the enrollmentrefresh table");
						return
					//res.end()	
				})
				}	
			}
		}
		
	})
	
}

// Function to clear the tb_elr_prereqs table before inserting refreshed data
function delete_elr() {
	// set variable to the query string
	var sql_delete_elr_results = `DELETE FROM tb_elr_results;`
	// execute the query
	database.pool.query(sql_delete_elr_results, (err, results, fields) => {
		if (err) {
			console.log("Failed to delete records from tb_elr_results!!!")
			console.log(err)
			return
		}
		console.log("Deleted the existing data from the tb_elr_results table");
		// res.end()
	})
}



// Get emails from the enrollmentrefresh table and use those to get eLearning records from SplunkU database 
function get_elearningrecords(){
	var sql_getemails = `SELECT email, event_id, enrollment_id, firstname, lastname, status FROM enrollmentrefresh;`

    // execute the query
    database.pool.query(sql_getemails, (err, rows, results)=>{
		console.log("getting the emails from enrollmentrefresh table")
		console.log("sql_getemails" + Object.keys(rows).length)
        for(i=1;i <= Object.keys(rows).length; i++){
            if(rows[i] != undefined){
                for(var i in rows){
                    var email = JSON.stringify(rows[i].email)
					var email = email.replace('"\\"', '')
					var email = email.replace('\\""', '')
					var event_id = JSON.stringify(rows[i].event_id)
					var enrollment_id = JSON.stringify(rows[i].enrollment_id)
					var firstname = JSON.stringify(rows[i].firstname)
					var firstname = firstname.replace('"\\"', '')
					var firstname = firstname.replace('\\""', '') 
					var firstname = firstname.replace("'", "\\'")  
					var lastname = JSON.stringify(rows[i].lastname)
					var lastname = lastname.replace('"\\"', '')
					var lastname = lastname.replace('\\""', '')
					var lastname = lastname.replace("'", "\\'")
					var status = JSON.stringify(rows[i].status)
					var status = status.replace('"\\"', '')
					var status = status.replace('\\""', '')
					// console.log (email + "|" + event_id + "|" + enrollment_id + "|" + firstname + "|" + lastname + "|" + status)

					// console.log(email)
                    var sql_getelr = 
                        `SELECT
                            registrationID,
                            courseName,
                            email
                        FROM
                            eLearningRecords
                        WHERE
							email = '?'
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
                        );`
					// console.log("i: " + i + " - email: " + email)
					// console.log("-------------------------------")
					// console.log("sql_getelr = " + sql_getelr);
                    // execute the SELECT query
                    database2.pool.query(sql_getelr, (err, rows, results)=>{
						var rowcount = Object.keys(rows).length
						if(rowcount > 0){
							for(j=1; j<=rowcount; j++){
								if(rows[j] != undefined){
									for(var j in rows){
										var el_email = JSON.stringify(rows[j].email)
										var el_coursename = JSON.stringify(rows[j].courseName)
										var el_regid = JSON.stringify(rows[j].registrationID)
										// console.log("j - " + j + " - email:" + el_email + " - coursename: " + el_coursename + " - reg_id: " + el_regid + ";")

										

            							// Query to insert results from sql_get_events_and_enrollments into the enrollmentsrefresh table
                                    	var sql_insert_elr_results = 
                                    	    `INSERT INTO tb_elr_results (
                                    	    registrationID,
                                    	    courseName,
                                    	    email
                                    	    ) VALUES (`
                                    	    + "'" + el_regid + "', "
                                    	    + "'" + el_coursename + "', "
                                    	    + "'" + el_email + "'" + `);`
											
                                    	// console.log("sql_insert_elr_prereqs: " + sql_insert_elr_prereqs)

										database.pool.query(sql_insert_elr_results, (err, rows, results) => {
											if(err){
												console.log(err)
												
												return
											} else {
												console.log("inserted records into tb_elr_results")
												// res.end()
											}									
										})
										}
									}									
								}								
							}							
                    })					
                }				
            }			
        }	
    })	
}

function delete_learndot() {
	// set variable to the query string
	var sql_delete_enrollments_learndot = `DELETE FROM tb_enrollments_learndot;`
	// execute the query
	database.pool.query(sql_delete_enrollments_learndot, (err, results, fields) => {
		if (err) {
			console.log("Failed to delete records from tb_enrollments_learndot!!!")
			console.log(err)
			return
		}
		console.log("Deleted the existing data from the tb_enrollments_learndot table");
		// res.end()
	})
}

// Get emails from the enrollmentrefresh table and use those to get eLearning records from Learndot database 
function get_learndot(){
	var sql_getemails = `SELECT email, event_id, enrollment_id, firstname, lastname, status FROM enrollmentrefresh;`

    // execute the query
    database.pool.query(sql_getemails, (err, rows, results)=>{
		console.log("getting the emails from enrollmentrefresh table")
		console.log("sql_getemails" + Object.keys(rows).length)
        for(i=1;i <= Object.keys(rows).length; i++){
            if(rows[i] != undefined){
                for(var i in rows){
                    var email = JSON.stringify(rows[i].email)
					var email = email.replace('"\\"', '')
					var email = email.replace('\\""', '')
					var event_id = JSON.stringify(rows[i].event_id)
					var enrollment_id = JSON.stringify(rows[i].enrollment_id)
					var firstname = JSON.stringify(rows[i].firstname)
					var firstname = firstname.replace('"\\"', '')
					var firstname = firstname.replace('\\""', '') 
					var firstname = firstname.replace("'", "\\'")  
					var lastname = JSON.stringify(rows[i].lastname)
					var lastname = lastname.replace('"\\"', '')
					var lastname = lastname.replace('\\""', '')
					var lastname = lastname.replace("'", "\\'")
					var status = JSON.stringify(rows[i].status)
					var status = status.replace('"\\"', '')
					var status = status.replace('\\""', '')
					// console.log (email + "|" + event_id + "|" + enrollment_id + "|" + firstname + "|" + lastname + "|" + status)

					// console.log(email)
                    var sql_get_enrollments_learndot = 
						`SELECT
							E.id AS registrationID,
							LC.name AS courseName,
							E.contact_id,
							C.email
						FROM
							enrollment E
						INNER JOIN
							learningcomponent LC ON E.component_id = LC.id
						INNER JOIN
							contact C ON E.contact_id = C.id
						WHERE
							C.email = ` + "'" + email + "'" +
						` AND
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
					// console.log("i: " + i + " - email: " + email)
					// console.log("-------------------------------")
					// console.log("sql_getelr = " + sql_getelr);
                    // execute the SELECT query
                    database.pool.query(sql_get_enrollments_learndot, (err, rows, results)=>{
						var rowcount = Object.keys(rows).length
						if(rowcount > 0){
							for(j=1; j<=rowcount; j++){
								if(rows[j] != undefined){
									for(var j in rows){
										var el_email = JSON.stringify(rows[j].email)
										var el_coursename = JSON.stringify(rows[j].courseName)
										var el_contactid = JSON.stringify(rows[j].contactID)
										var el_regid = JSON.stringify(rows[j].registrationID)
										// console.log("j - " + j + " - email:" + el_email + " - coursename: " + el_coursename + " - reg_id: " + el_regid + ";")

										

            							// Query to insert results from sql_get_events_and_enrollments into the enrollmentsrefresh table
                                    	var sql_insert_enrollments_learndot = 
                                    	    `INSERT INTO tb_enrollments_learndot (
                                    	    registrationID,
                                    	    courseName,
											contactID,
                                    	    email
                                    	    ) VALUES (`
                                    	    + "'" + el_regid + "', "
                                    	    + "'" + el_coursename + "', "
											+ "'" + el_contactid + "', "
                                    	    + "'" + el_email + "'" + `);`
											
                                    	// console.log("sql_insert_elr_prereqs: " + sql_insert_elr_prereqs)

										database.pool.query(sql_insert_enrollments_learndot, (err, rows, results) => {
											if(err){
												console.log(err)
												
												return
											} else {
												console.log("inserted records into tb_enrollments_learndot")
												// res.end()
											}										
										})
										}
									}									
								}								
							}							
                    })					
                }				
            }			
        }	
    })	
}


async function runall() {
	let res = null;
	try {
		res = await Promise.all([
			// clear the enrollmentrefresh table
			deleteenrollments(),
			// run SELECT query to get events & enrollments and insert into enrollmentrefresh table
			get_learndot_events_enrollments(),
			// clear the tb_elr_results table
			delete_elr(),
			// SELECT emails from the records in the enrollmentrefresh table and pass them into the SELECT query 
			// to get results from eLearningRecords table in the SplunkU
			// insert the results into tb_elr_results table in Learndot
			get_elearningrecords(),
			// clear the tb_enrollments_learndot table for refresh
			delete_learndot(),
			// SELECT emails from the records in the enrollmentrefresh table and pass them into the SELECT query 
			// to get results from enrollment & learningcomponent tables in Learndot
			// insert the results into tb_enrollments_learndot table in Learndot
			get_learndot()
		]);
		// console.log('Success >>', res)
		console.log('Success')
	} catch(err) {
		// console.log('Fail >>', res, err)
		console.log('Fail >>', err)
	}
}

const runProcess = async() =>  {
	const a = deleteenrollments();
	const b = get_learndot_events_enrollments();
	const c = delete_elr();
	const d = get_elearningrecords();
	const process = await Promise.all([a, b, c, d]);

	return process
}


// All learndot enrollments GET route .......................................................................................................
// .................................................................................................................................
router.get("/prereqcheck", (req, res) => {
	//get_learndot();
	get_elearningrecords();
	//runall();

	res.send("Success!!")
});

module.exports = router;