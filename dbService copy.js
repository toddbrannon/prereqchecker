const mysql = require('mysql');
const dotenv = require('dotenv');
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
                                    E.id AS enrollment_id,
                                    C.email,
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
                const query4 = "SELECT email, event_id, enrollment_id, firstname, lastname, status FROM enrollmentrefresh;"
                const query5 = "INSERT into tbl_five (name, charlength) SELECT name, length(name) FROM names WHERE LENGTH(name) > 4;"
                const query6 = "DELETE FROM tbl_prev_completions"
                const query7 = "SELECT n.name, t.coursename FROM names n LEFT JOIN tbl_prev_completions t ON t.name = n.name WHERE t.coursestatus = 'passed';"


                connection.query(query1, (err, results) => {
                    if (err) console.log(err.message);
                    // if (err) reject(new Error(err.message));
                    console.log("query1");
                    resolve(results);
                    connection.query(query2, (err, results) => {
                        if(err) console.log(err.message);
                        console.log("query2");
                        resolve(results);
                        connection.query(query3, (err, results) => {
                            if(err) console.log(err.message);
                            console.log("query3");
                            resolve(results);
                            connection.query(query4, (err, rows, results) => {
                                if(err) console.log(err.message);
                                for(i=1;i <= Object.keys(rows).length; i++){
                                    if(rows[i] != undefined){
                                        for(var i in rows){
                                            var email = JSON.stringify(rows[i].email)
                                            var email = email.replace('"\\"', '')
                                            var email = email.replace('\\""', '')
                                            var query4b = 
                                                `SELECT
                                                    registrationID,
                                                    courseName,
                                                    email
                                                FROM
                                                    eLearningRecords
                                                WHERE
                                                    email = ` + "'" + email + "'" + 
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
                                                connection2.query(query4b, (err, rows, results) => {
                                                    var rowcount = Object.keys(rows).length
						                            if(rowcount > 0){
                                                        for(j=1; j<=rowcount; j++){
                                                            if(rows[j] != undefined){
                                                                for(var j in rows){
                                                                    var el_email = JSON.stringify(rows[j].email)
                                                                    var el_coursename = JSON.stringify(rows[j].courseName)
                                                                    var el_regid = JSON.stringify(rows[j].registrationID)
                                                                    var query4c = 
                                    	                                `INSERT INTO tb_elr_results (
                                    	                                registrationID,
                                    	                                courseName,
                                    	                                email
                                    	                                ) VALUES (`
                                    	                                + "'" + el_regid + "', "
                                    	                                + "'" + el_coursename + "', "
                                    	                                + "'" + el_email + "'" + `);`

                                                                        connection.query(query4c, (err, rows, results) => {
                                                                            if(err){
                                                                                console.log(err);     
                                                                                return
                                                                            } else {
                                                                                console.log("inserted records into tb_elr_results")
                                                                            }		
                                                                        })
                                                                }
                                                            }
                                                        }
                                                    }
                                                })
                                console.log("query4");
                                resolve(results);
                                connection.query(query5, (err, results) => {
                                    if(err) console.log(err.message);
                                    console.log("INSERT query run successfully (query5)");
                                    resolve(results);
                                    connection.query(query6, (err, results) => {
                                        if(err) console.log(err.message);
                                        console.log("INSERT query run successfully (query6)");
                                        resolve(results);
                                        connection.query(query7, (err, results) => {
                                            if(err) console.log(err.message);
                                            console.log("INSERT query run successfully (query7)");
                                            resolve(results);
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            });
            // console.log(response);
            return response;
            

        } catch(error){
            console.log(error);
        }
    }
}