// create a function
export function get_elearningrecords(){
    // create a SELECT query to get email addresses from enrollmentrefresh to pass into sql_elearningrecords query
    let sql_getemails = `SELECT email FROM enrollmentrefresh`

    console.log("SUCCESS: get_elearningrecords function called from learndot.js!")
    // execute the query
    pool.query(sql_getemails, (err, rows, results)=>{
        for(i=1;i <= Object.keys(rows).length; i++){
            if(rows[i] != undefined){
                for(var i in rows){
                    var email = JSON.stringify(rows[i].email)
                    var sql_getelr = 
                        `SELECT
                            registrationID,
                            courseName,
                            email
                        FROM
                            eLearningRecords
                        WHERE
                            email LIKE '${email}'
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
                    // execute the SELECT query
                    pool2.query(sql_getelr, (err, rows, results)=>{
                        for(i=1; i <= Object.keys(rows).length; i++){
                            if(rows[i] != undefined){
                                for(var i in rows){
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
                                    pool2.query(sql_insert_elr_prereqs, (err, rows, results) => {
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
            }
        }
    })
}