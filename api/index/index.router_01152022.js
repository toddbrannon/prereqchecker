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

// All learndot enrollments GET route .......................................................................................................
// .................................................................................................................................
router.get("/prereqcheck", (err, res) => {
	deleteenrollments();
	let sql_get_ld_events_and_enrollments = 
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

	pool.query(sql_get_ld_events_and_enrollments, (err, rows, results) => {
		for(i=1; i <= Object.keys(rows).length; i++){
			if(rows[i] != undefined){
				for(var i in rows) {
					var ld_event_id = JSON.stringify(rows[i].event_id)
					var ld_start_time = JSON.stringify(rows[i].startTime)
					var ld_email = JSON.stringify(rows[i].email)
					var ld_enrollment_id = JSON.stringify(rows[i].enrollment_id)
					var ld_firstname = JSON.stringify(rows[i].firstName)
					var ld_lastname = JSON.stringify(rows[i].lastName)
					var ld_status = JSON.stringify(rows[i].status)
					var ld_locationname = JSON.stringify(rows[i].name)
					var ld_contactid = JSON.stringify(rows[i].contact_id)
					var ld_score = JSON.stringify(rows[i].score)
					var ld_urlname = JSON.stringify(rows[i].urlName)
					console.log(ld_event_id + "|" + ld_email)
				}
				;
			}
		}
		if (err) {
			console.log("Failed to get learndot events and enrollments")
			console.log(err)
			res.sendStatus(500)
			return
		}
		console.log("Fetched learndot events and enrollments");
		// res.end()
		res.render("learndot_enrollments_copy", {
		title: "Splunk Core Implementation Prerequisite Checker",
		learndotresults: rows
		});  
	})
})



// Function to clear the enrollmentrefresh table before inserting refreshed data
function deleteenrollments() {
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
}



module.exports = router;