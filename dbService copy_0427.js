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

// Step 1 (query 1 - enrollmentrefesh delete) - DELETE
// Step 2 (query 2 - insert into enrollmentrefresh) - INSERT(NESTED SELECT)
// Step 3 (query 3 - delete from tb_elr_refesh) - DELETE
// Step 4a (query 4a - select email from enrollmentrefresh) - SELECT
// Step 4b (query 4b - get eLearningRecords) - SELECT (DEPENDENT UPON 4a)
// Step 4c (query 4c - insert into tb_elr_results) - INSERT (DEPENDENT UPON 4b)
// Step 4d (query 4d - delete from tb_learndot_enrollments) - DELETE
// Step 4e (query 4e - get eLearningRecords) - SELECT
// Step 4f (query 4f - insert into tb_enrollments_learndot) - INSERT (DEPENDENT UPON 4e)
// Step 5 (query 5 - DELETE FROM tb_credlybadgeresult) - DELETE
// Step 6 (query 6 - INSERT INTO tb_credlybadgeresult) - INSERT (DEPENDENT UPON API CALL)
// Step 7 (query 7 - DELETE FROM tb_prereqs) - DELETE
// Step 8 (query 8 - INSERT names, emails into tb_prereqs) - INSERT (DEPENDENT UPON 2)
// Step 9 (query 9 - update ANsR column to 'NO') - UPDATE (DEPENDENT UPON 4f)
// Step 10 (query 10 - update F3 to 'YES' from tb_elr_results) - UPDATE (DEPENDENT UPON 4c)
// Step 11 (query 11 - update F3 to 'YES' from tb_enrollments_learndot) - UPDATE (DEPENDENT UPON 4e)
// Step 12 (query 12 - update ANsR column to 'YES') - UPDATE ((DEPENDENT UPON 4f)

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
                const query4a = "SELECT email FROM enrollmentrefresh;"
                const query4c = `INSERT INTO tb_elr_results (registrationID, coursename, EMAIL) VALUES  (?, ?, ?);`
                const query4d = "DELETE FROM tb_enrollments_learndot;"
                // const query4e = `SELECT
                //                     E.id AS registrationID,
                //                     LC.name AS courseName
                //                 FROM
                //                     enrollment E
                //                 INNER JOIN
                //                     learningcomponent LC ON E.component_id = LC.id
                //                 INNER JOIN
                //                       contact C ON E.contact_id = C.id
                //                 WHERE
                //                     C.email LIKE ?
                //                 AND
                //                     E.status LIKE 'PASSED'
                //                 AND
                //                     (
                //                         (LC.name LIKE '%Fundamentals%' AND LC.name LIKE '%Part 3%')
                //                     OR
                //                         LC.name LIKE '%Creating Dashboards%'
                //                     OR
                //                         LC.name LIKE '%Advanced Searching%'
                //                     OR
                //                         LC.name LIKE '%Core Consultant Labs%'
                //                     );` 
                const query4f = `INSERT INTO tb_enrollments_learndot (registrationID, coursename, email) VALUES  (?, ?, ?);`
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
                const query12 = `UPDATE 
                                    tb_prereqs pre
                                INNER JOIN
                                    tb_enrollments_learndot ld on pre.email = ld.email
                                SET
                                    pre.ASnR = "YES"
                                WHERE
                                    ld.coursename LIKE "%Advanced Searching%";`
                

                // DELETE FROM enrollmentrefresh
                connection.query(query1, (err, results) => {
                    if (err) console.log(err.message);
                    
                    // if (err) reject(new Error(err.message));
                    console.log("Step 1 (query 1 - enrollmentrefesh delete) complete!");
                    resolve(results);

                    // INSERT INTO enrollmentrefresh
                    connection.query(query2, (err, results) => {
                        if(err) console.log(err.message);
                        console.log("Step 2 (query 2 - insert into enrollmentrefresh) complete!");
                        resolve(results);

                        // DELETE FROM tb_elr_results
                        connection.query(query3, (err, results) => {
                            if(err) console.log(err.message);
                            console.log("Step 3 (query 3 - delete from tb_elr_refesh) complete!");
                            resolve(results);

                            // INSERT INTO tb_elr_results
                            var emailArray = []
                            connection.query(query4a, (err, rows, results) => {
                                if(err) console.log(err.message);
                                for(i=0; i < results.length; i++){
                                    if(rows[i] != undefined){
                                        for(var i in rows){
                                            emailArray.push(rows[i].email)
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
                                                    var rowcount = Object.keys(rows).length
                                                    if(rowcount > 0){
                                                        for(j=1; j <= rowcount; j++){
                                                            if(rows[j] != undefined){
                                                                for(var j in rows){
                                                                    const regID = rows[j].registrationID;
                                                                    const cName = rows[j].courseName;
                                                                    const elrEmail = rows[j].email;
                                                                    connection.query(query4c, [regID, cName, elrEmail], (err, rows, results) => {
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
                                   
                                console.log("Step 4a (query 4a - select email from enrollmentrefresh) complete!")
                                console.log("Step 4b (query 4b - get eLearningRecords) complete!")
                                console.log("Step 4c (query 4c - insert into tb_elr_results) complete!");
                                resolve(results);   
                                // DELETE FROM tb_elr_results
                                connection.query(query4d, (err, results) => {
                                    if(err) console.log(err.message);
                                    console.log("Step 4d (query 4d - delete from tb_learndot_enrollments) complete!");
                                    resolve(results);

                                    //  Insert into tb_learndot_enrollments
                                    var emailArray = []
                                    

                                    connection.query(query4a, (err, rows, results) => {
                                        if(err) console.log(err.message);
                                            for(i=0; i < results.length; i++){
                                                if(rows[i] != undefined){
                                                    for(var i in rows){
                                                    emailArray.push(rows[i].email)
                                                    const query4e = `SELECT
                                                                        E.id AS registrationID,
                                                                        LC.name AS courseName
                                                                    FROM
                                                                        enrollment E
                                                                    INNER JOIN
                                                                        learningcomponent LC ON E.component_id = LC.id
                                                                    INNER JOIN
                                                                        contact C ON E.contact_id = C.id
                                                                    WHERE
                                                                        C.email = ` + "'" + emailArray[i] + "'" +
                                                                    `AND
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
                                                        var regArray =[]
                                                        connection.query(query4e, emailArray[i], (err, rows, results) => {
                                                            if(err) console.log(err.message);
                                                            var rowcount = Object.keys(rows).length
                                                            if(rowcount > 0){
                                                                for(j=1; j <= rowcount; j++){
                                                                    if(rows[j] != undefined){
                                                                        for(var j in rows){
                                                                            const regID = rows[j].registrationID;
                                                                            const cName = rows[j].courseName;
                                                                            const elrEmail = rows[j].email;
                                                                            connection.query(query4f, [regID, cName, elrEmail], (err, rows, results) => {
                                                                            if(err) console.log(err.message);
                                                                                 
                                                                        })
                                                                    }
                                                                }
                                                            }
                                                        }  
                                                    })
                                                }
                                            }
                                        }
                                        console.log("Step 4d (query 4d - select email from enrollmentrefresh) complete!")
                                        console.log("Step 4e (query 4e - get eLearningRecords) complete!")
                                        console.log("Step 4f (query 4f - insert into tb_enrollments_learndot) complete!");
                                    })
                                })
                                connection.query(query5, (err, rows, results) => {
                                    if(err) console.log(err.message);
                                    console.log("Step 5 (query 5 - DELETE FROM tb_credlybadgeresult) complete!");
                                    resolve(results);

                                      function checkBadges(emailArray){
                                          emailArray.forEach(x => {
                                              var options = {
                                                'method': 'GET',
                                                'url': 'process.env.API_URL' + x,
                                                'headers': {
                                                    'Content-Type': 'application/json',
                                                    'Authorization': process.env.API_AUTH
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
                                              })                                           
                                          });
                                          console.log("Step 6 (query 6 - INSERT INTO tb_credlybadgeresult) complete!")
                                      }

                                      checkBadges(emailArray);
                              
                                })
                                connection.query(query7, (err, results) => {
                                    if(err) console.log(err.message);
                                    console.log("Step 7 (query 7 - DELETE FROM tb_prereqs) complete!");
                                    resolve(results);
                                    connection.query(query8, (err, results) => {
                                        if(err) console.log(err.message);
                                        console.log("Step 8 (query 8 - INSERT names, emails into tb_prereqs) complete!");
                                        resolve(results);
                                        connection.query(query9, (err, results) => {
                                            if(err) console.log(err.message);
                                            console.log("Step 9 (query 9) complete!");
                                            resolve(results);
                                            connection.query(query10, (err, results) => {
                                                if(err) console.log(err.message);
                                                console.log("Step 10 (query 10) complete!");
                                                resolve(results);
                                                connection.query(query11, (err, results) => {
                                                    if(err) console.log(err.message);
                                                    console.log("Step 11 (query 11) complete!");
                                                    resolve(results);
                                                    var emailArray = []
                                                    connection.query(query12, (err, rows, results) => {
                                                        if(err) console.log(err.message);
                                                        console.log("Step 12 (query 12 - update ANsR column) complete!");
                                                        resolve(results);
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

        
    

}

module.exports = DbService;