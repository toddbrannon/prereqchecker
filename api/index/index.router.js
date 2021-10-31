const express = require('express');
var axios = require('axios');
var data = JSON.stringify({"first_name":"Todd","last_name":"Brannon","username":"tbrannon","email_address":"todd@nowhere.com","password":"password1234"});
const router = express.Router();

var request = require('request');

// Get badge data from the Credly api
router.get('/fetch_badges', async (req, res) => {
	console.log('/fetch_badges endpoint called')
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
		// body = response.body
		var userId = body.data[0].user.id
		var badgeTemplateName = body.data[0].badge_template.name
		var badgeTemplateState = body.data[0].badge_template.state
		var firstName
		var lastName
		console.log("user ID: " + userId);
		console.log("first name: " + body.data[0].user.first_name);
		console.log("last name: " + body.data[0].user.last_name);
		console.log("badge template name: " + badgeTemplateName)
		console.log("state: " + badgeTemplateState)
		
		
		console.log('/fetch_badges json returned')
		res.send(body)
		});
})

// Delete after testing users route with query included in this file (8/20/2021)
const pool = require("../../config/database")

// Main landing page GET route
router.get("/", (req, res) => {
  res.render("landing", {
      title: "Splunk Core Implementation Prerequisite Checker",
  });
});

// All enrollments GET route
router.get("/enrollments", (err, res) => {
    if (err) console.log(err);
    let sql = `SELECT 
	            	V.id AS event_id,
	            	V.startTime,
	            	E.id AS enrollment_id,
	            	C.email,
	            	C.firstName,
	            	C.lastName,
	            	E.status,
	            	LOC.name,
	            	E.contact_id,
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
      let query = pool.query(sql, (err, rows, results) => {
        if (err) throw err;
        console.log(rows[0].job_id)
        res.render('enrollments', {
            title: 'Splunk Core Implementation Prerequisite Check',
            enrollmentresults: rows
        })
    })
});



// router.get("/", (err) => {
//     if (err) throw err;
//     let sql = "DROP TABLE IF EXISTS enrollments";
//     let query = pool.query(sql, (err, result) {
//       if (err) throw err;
//       console.log(result);
//     });
//   });

// // EDIT GET ROUTE - edit a sale
// router.get("/sales/:job_id", requiresAuth(), (req, res) => {
//     // the order with the provided ID
//     //render edit template with that sale
//     let id = req.params.job_id
//     let sql = 'SELECT * FROM input WHERE job_id = ' + id + ';'
//     let query = pool.query(sql, (err, rows) => {
//         if (err) throw err;
//         console.log(sql)
//         console.log(rows[0].job_name)
//         res.render('salesdetail', {
//             title: 'True Legacy Homes Sale Manager - Sales Detail',
//             saleresult: rows[0],
//             authUser: req.oidc.user
//         })
//     })
// });

module.exports = router;