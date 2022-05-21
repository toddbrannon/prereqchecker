const mysql = require('mysql');
const dotenv = require('dotenv');
const { CLIENT_FOUND_ROWS } = require('mysql/lib/protocol/constants/client');
const request = require('request');
// const { isRedirect } = require('node-fetch');
let instance = null;
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

const connection2 = mysql.createConnection({
    host: process.env.DB2_HOST,
    user: process.env.DB_USER,
    password: process.env.DB2_PASS,
    database: process.env.DB2_NAME,
    port: process.env.DB_PORT
});

connection.connect((err) => {
    if (err) {
        console.log(err.message)
    }
    console.log('db ' + connection.state);
})

class DbService {
    static getDbServiceInstance() {
        return instance ? instance : new DbService();
    }

    // pass the emails from enrollmentsrefresh to a JS array
    async getArray(){
        try {
            const response = await new Promise((resolve, reject) => {
                const query1 = "SELECT * FROM enrollmentrefresh;"
                var emailArray = []
                connection.query(query1, (err, rows, results) => {
                    if (err) console.log(err.message);
                    for(i=0; i < results.length; i++){
                        if(rows[i] != undefined){
                            for(var i in rows){
                                emailArray.push(rows[i].email)
                            }
                            console.log(emailArray);
                        }
                    }
                    // if (err) reject(new Error(err.message));
                    console.log("SELECT query run successfully (query1)");
                    resolve(results);
                })
            });
            // console.log(response);
            return response;      
        } catch(error){
            console.log(error);
        }
    }

    

    async getAllData() {
        try {
            const response = await new Promise((resolve, reject) => {
                const query1 = "DELETE FROM enrollmentrefresh;"
                const query2 = `INSERT INTO enrollmentrefresh (
                                    event_id, 
                                    start_time,
                                    email,
                                    enrollment_id,
                                    firstname,
                                    lastname,
                                    status,
                                    locationname,
                                    contactid,
                                    score
                                ) SELECT 
                                    V.id AS event_id,
                                    V.startTime,
                                    C.email,
                                    E.id AS enrollment_id,
                                    C.firstName,
                                    C.lastName,
                                    E.status,
                                    LOC.name,
                                    E.contact_id,
                                    E.score
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
                const query3 = "DELETE FROM tb_elr_results;"
                const query4 = "SELECT email FROM enrollmentrefresh;"
                const query4c = `SELECT
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
                                );`
                

                const query5 = "DELETE FROM tb_credlybadgeresult;"
                const query6 = "INSERT INTO tb_credlybadgeresult (recipientemail, badge_id, badge_name, badge_template_state, user_id) VALUES (?, ?, ?, ?, ?)"
                const query7 = "DELETE FROM tb_prereqs;"
                const query8 = `INSERT INTO tb_prereqs (
                                    event_id, 
                                    enrollment_id, 
                                    email, 
                                    full_name, 
                                    status) 
                                SELECT 
                                    event_id, 
                                    enrollment_id, 
                                    email, 
                                    CONCAT(TRIM(firstname), " ", TRIM(lastname)), 
                                    status 
                                FROM 
                                    enrollmentrefresh;`
                const query9 = `UPDATE 
                                    tb_prereqs pre 
                                SET 
                                    pre.ASnR = 'NO';`
                const query10 = `UPDATE 
                                    tb_prereqs pre
                                INNER JOIN 
                                    tb_elr_results elr on pre.email = elr.email
                                SET 
                                    pre.F3 = 'YES'
                                WHERE 
                                    elr.coursename LIKE "%Fundamentals%" 
                                AND 
                                    elr.coursename LIKE "%Part 3%";`
                const query11 = `UPDATE 
                                    tb_prereqs pre
                                INNER JOIN 
                                    tb_enrollments_learndot ld on pre.email = ld.email
                                SET 
                                    pre.F3 = 'YES'
                                WHERE 
                                    ld.coursename LIKE "%Fundamentals%" 
                                AND 
                                    ld.coursename LIKE "%Part 3%";`
                const query12 = "SELECT email FROM enrollmentrefresh;"

                // DELETE FROM enrollmentrefresh
                connection.query(query1, (err, results) => {
                    if (err) console.log(err.message);
                    // if (err) reject(new Error(err.message));
                    console.log("Step 1 complete!");
                    resolve(results);
                    // INSERT INTO enrollmentrefresh
                    connection.query(query2, (err, results) => {
                        if(err) console.log(err.message);
                        console.log("Step 2 complete!");
                        resolve(results);
                        // DELETE FROM tb_elr_results
                        connection.query(query3, (err, results) => {
                            if(err) console.log(err.message);
                            console.log("Step 3 complete!");
                            resolve(results);

                            // INSERT INTO tb_elr_results
                            var emailArray = []
                            connection.query(query4, (err, rows, results) => {
                                if(err) console.log(err.message);
                                for(i=0; i < results.length; i++){
                                    if(rows[i] != undefined){
                                        for(var i in rows){
                                            emailArray.push(rows[i].email)
                                            // console.log(emailArray);
                                            // console.log(emailArray[0])
                                            //  Get registrationID, courseName, and email from eLearningRecords for each matching email from enrollmentrecords
                                            var query4b = 
                                                    `SELECT
                                                        registrationID,
                                                        courseName,
                                                        email
                                                    FROM
                                                        eLearningRecords
                                                    WHERE
                                                        email = ` + "'" + emailArray[i] + "'" + 
                                                    ` AND
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

                                                var regArray =[]
                                                connection2.query(query4b, (err, rows, results) => {
                                                    if(err) console.log(err.message);
                                                    // console.log("running query4b" + Object.keys(rows).length);
                                                    var rowcount = Object.keys(rows).length
                                                    if(rowcount > 0){
                                                        for(j=1; j <= rowcount; j++){
                                                            if(rows[j] != undefined){
                                                                for(var j in rows){
                                                                    // regArray.push(rows[j].registrationID)
                                                                    // console.log(rows[j].email + ', ' + rows[j].registrationID + ', ' + rows[j].courseName)
                                                                    const regID = rows[j].registrationID;
                                                                    const cName = rows[j].courseName;
                                                                    const elrEmail = rows[j].email;
                                                                    var query4c = `INSERT INTO tb_elr_results (registrationID, coursename, EMAIL) VALUES  ("` + regID + `", "` + cName + `", "` + elrEmail + `");`
                                                                    connection.query(query4c, (err, rows, results) => {
                                                                    if(err) console.log(err.message);
                                                                    // resolve(results);
                                                                })
                                                            }
                                                        }
                                                    }
                                                } 
                                            })   
                                        }
                                        // console.log(emailArray);
                                        
                                    }
                                    
                                }  
                                   
                                console.log("Step 4 complete!");
                                resolve(results);   
                                connection.query(query5, (err, rows, results) => {
                                    if(err) console.log(err.message);
                                    console.log("Step 5 complete!");
                                    resolve(results);
                                    function logArray(emailArray){
                                        emailArray.forEach(x => console.log("results: " + x));
                                      }
                                      logArray(emailArray);

                                      function checkBadges(emailArray){
                                          emailArray.forEach(x => {
                                              var options = {
                                                'method': 'GET',
                                                'url': process.env.CREDLY_URL + x,
                                                'headers': {
                                                    'Content-Type': 'application/json',
                                                    'Authorization': process.env.CREDLY_AUTH
                                                },
                                              };
                                              request(options, (error, response) => {
                                                  if(error) throw new Error(error);
                                                  var body = response.body
                                                  body = JSON.parse(body)
                                                  const data = body.data
                                                  const badge_results = []

                                                  for(var i in data)
                                                    if(data[i].recipient_email != undefined && i != 0)
                                                        badge_results.push([i, data[i].recipient_email, data[i].badge_template.id, data[i].badge_template.name, data[i].badge_template.state, data[i].user.id])
                                                        
                                                        badge_results.forEach(badge_result => {
                                                            var recipient_email = badge_result[1]
                                                            var badge_id = badge_result[2]
                                                            var badge_name = badge_result[3]
                                                            var badge_state = badge_result[4]
                                                            var user_id = badge_result[5]
                                                        connection.query(query6, [recipient_email, badge_id, badge_name, badge_state, user_id], (err, rows, results) => {
                                                            if(err) console.log(err.message);
                                                            resolve(results);
                                                            
                                                        })
                                                    })
                                                        // function logArray(badge_results){
                                                        //     badge_results.forEach(x => console.log("results: " + x));
                                                        //   }
                                                        //   logArray(badge_results)
                                                        //   console.log("Fetched Credly data for " + x + " (" + i + ") --> ");
                                                          
                                              })
                                          });
                                      }

                                      checkBadges(emailArray);
                                    //   console.log(emailArray.length);
                                    //   console.log("Step 5 complete!");
                                })
                                connection.query(query7, (err, results) => {
                                    if(err) console.log(err.message);
                                    console.log("Step 7 complete!");
                                    resolve(results);
                                    connection.query(query8, (err, results) => {
                                        if(err) console.log(err.message);
                                        console.log("Step 8 complete!");
                                        resolve(results);
                                        connection.query(query9, (err, results) => {
                                            if(err) console.log(err.message);
                                            console.log("Step 9 complete!");
                                            resolve(results);
                                            connection.query(query10, (err, results) => {
                                                if(err) console.log(err.message);
                                                console.log("Step 10 complete!");
                                                resolve(results);
                                                connection.query(query11, (err, results) => {
                                                    if(err) console.log(err.message);
                                                    console.log("Step 11 complete!");
                                                    resolve(results);
                                                    var emailArray = []
                                                    connection.query(query12, (err, rows, results) => {
                                                        if(err) console.log(err.message);
                                                        console.log("results.length = " + results.length);
                                                        console.log("rows.length = " + rows.length);
                                                        for(i=0; i < rows.length; i++){
                                                            if(rows[i] != undefined){
                                                                // console.log("rows[i] is not undefined!")
                                                                for(var i in rows){
                                                                    // console.log(rows[i].email);
                                                                    emailArray.push(rows[i].email);
                                                                    
                                                                    console.log(rows[i].email + " pushed to emailArray");
                                                                    // Insert into a table of emails from enrollment refresh in SplunkU db to join to 
                                                                    var queryInsert = `INSERT INTO tb_enrollment_emails (email) VALUES (?);`
                                                                    connection2.query(queryInsert, emailArray[i], (err, rows, results) => {
                                                                    
                                                                    if(err) console.log(err.message);
                                                                    
                                                                    })
                                                                }
                                                            }
                                                            
                                                        }
                                                        console.log("inserted " + i + " records into tb_enrollment_emails");
                                                    });      
                                                })
                                            })
                                        })
                                    })
                                })                    
                            })
                        })
                    })
                })
            });
    //         // console.log(response);
            return response;
        } catch(error){
            console.log(error);
        }
    }
    async pushEmails(){
        try {
            const response = await new Promise((resolve, reject) => {
            const query4 = "SELECT email FROM enrollmentrefresh;"
            var emailArray = []
            connection.query(query4, (err, rows, results) => {
                if(err) console.log(err.message);
                for(i=0; i < results.length; i++){
                    if(rows[i] != undefined){
                        for(var i in rows){
                            console.log(rows[i].email);
                            emailArray.push(rows[i].email)
                            // Insert into a table of emails from enrollment refresh in SplunkU db to join to 
                            var queryInsert = `INSERT INTO tb_enrollment_emails (email) VALUES (?);`
                            connection2.query(queryInsert, emailArray[i], (err, rows, results) => {
                            
                            if(err) console.log(err.message);
                            console.log("inserted " + i + " records into tb_enrollment_emails");
                            
                            })
                        }
                    }
                }
                
            });
            return(response); 
            
        });
        } catch(error) {
            console.log(error)
        }
        console.log("pushEmails complete!")
    }
}

module.exports = DbService;