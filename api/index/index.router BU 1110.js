const express = require('express');
var axios = require('axios');
var data = JSON.stringify({"first_name":"Todd","last_name":"Brannon","username":"tbrannon","email_address":"todd@nowhere.com","password":"password1234"});
const router = express.Router();

var request = require('request');



// Get badge data from the Credly api
router.get('/fetch_badges', async (req, res) => {
	console.log('/fetch_badges endpoint called')

	var sql1 = `DELETE FROM tb_credlybadgeresult;`
	// DELETE EXISTING DATA FROM THE tb_credlybadgeresult table
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

		const badge_results = []

		// ADDED 11/01/2021 - TESTED and workded at 5:26pm
		const data = body.data
		
		for(var i in data)
			if(data[i].recipient_email != undefined)
				// console.log(data[i].user.email)
				// ADDED 11/07/2021 to bget badge template id and recipient email (worked)
				badge_results.push([i, data[i].recipient_email, data[i].badge_template.id])
				function logArray(badge_results){
					badge_results.forEach(x => console.log(x));
				  }
				  logArray(badge_results)

		// iterate over the badge_result array and output the elements
		// badge_results.forEach(badge_result => {
		// 	for (let key in badge_result) {
		// 		console.log(`${key}: ${badge_result[key]}`);
		// 		var recipient_email = badge_result[1]
		// 		// var badge_id = badge_result[2]
		// 		console.log(recipient_email)
		// 	}
		// });

				  
		// Assign recipient email and badge id to variables (ADDED 11/08/2021 - works as intended)
		// Need to as SQL INSERT query here
		badge_results.forEach(badge_result => {
			var recipient_email = badge_result[1]
			var badge_id = badge_result[2]
			console.log(recipient_email)
			console.log(badge_id)
			
			var sql = `INSERT INTO tb_credlybadgeresult (recipientemail, badge_id) VALUES ('${recipient_email}', '${badge_id}');`
			console.log(sql)
			
			// INSERT NEW DATA INTO THE tb_credlybadgeresult table
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
	

		


		// var json_data = data
		// var result = [];

		// for(var i in json_data)
    	// 	result.push([i, json_data [i]]);
		// 	// console.log("********************")
		// 	// console.log(result)
		// 	// console.log("********************")

		// 	function pluck(array, key) {
		// 		return array.map(function(item) { return item[key]; });
		// 	  }

		// 	var email = pluck(result, email)
		// 	console.log("********************")
		// 	console.log(email)
		// 	console.log("********************")

		// for (var i = 0; i < result.length; i++){
		// 	// document.write("<br><br>array index: " + i);
		// 	var obj = result[i];
		// 	for (var key in obj){
		// 	  var value = obj[key];
		// 	  console.log("!!!!! KEY & VALUE !!!!!!");
		// 	  console.log(key + ": " + value);
		// 	  console.log("!!!!!!!!!!!!!!!!!!!!!!!!");
		// 	}
		//   }

		// data.forEach(obj => {
		// 	Object.entries(obj).forEach(([key, value]) => {
		// 		console.log(`${key} ${value}`)
		// 	})
		// 	console.log('---------------------')
		// })

		// data.keys(obj).forEach(function(k){
		// 	console.log("####################")
		// 	console.log(k + ' - ' + obj[k]);
		// 	console.log("####################")
		// });

		// var userId = body.data.user.id
		// var email = body.data.user.email
		// var lastname = body.data.user.last_name
		// var badgeTemplateName = body.data.badge_template.name
		// var badgeTemplateId = body.data.badge_template.id

		// function addToBadgeResults(badge_results){
		// 	badge_results.forEach(function(X){
		// 		badge_results.push(email)
		// 	})
		// }

		// addToBadgeResults(badge_results)

		// console.log("++++++++++++++++++++++++++++++")
		// function getBadgeResults(badge_results){
		// 	badge_results.forEach(function(x){
		// 	  console.log(x)
		// 	});
		//   }
		//   getBadgeResults(badge_results);
		// console.log("++++++++++++++++++++++++++++++")
		
		// console.log("user ID: " + userId);
		// console.log("user email: " + email);
		// console.log("last name: " + lastname);
		// console.log("badge template id: " + badgeTemplateId)
		// console.log("state: " + badgeTemplateState)
		// console.log("-----------------")
		// console.log(body.data[0].user)
		// console.log("-----------------")
		// console.log(body.data[0].badge_template.name)
		// console.log(body.data[0].badge_template.state)

		// console.log('---------------------')
		// console.log(JsonToQuery('Badges', 'lastname', data))
		// console.log('---------------------')

		// END OF CREATE SQL =================================================
		
		console.log('/fetch_badges json returned')
		res.send(body)
		});
	// res.render('credly_data', {
	// 	title: "Credly Data",
	// })
})

// Delete after testing users route with query included in this file (8/20/2021)
const pool = require("../../config/database")

// Main landing page GET route
router.get("/", (req, res) => {
  res.render("landing", {
      title: "Splunk Core Implementation Prerequisite Checker",
  });
});

// Render json_test.ejs
router.get('/json_test', (req, res) => {
	res.render("json_test",{
		title: 'JSON test'
	});

})

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

// Take results of the enrollments SELECT query and insert into 

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