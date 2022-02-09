const { createPool } = require('mysql');

const pool = createPool({
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    multipleStatements: true,
    ssl: true,
    connectionLimit: 10
})

const sql1 = `DELETE FROM enrollmentrefresh;`
const sql2 = `SELECT 
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

const sql3 = `INSERT INTO enrollmentrefresh (
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
    ) VALUES 
    (?);`

const sql5 = `SELECT email, event_id, enrollment_id, firstname, lastname, status FROM enrollmentrefresh;`

const sql7 = `INSERT INTO tb_elr_results (email, courseName, registrationID) VALUES (?);`

const sql8 = `DELETE FROM tb_elr_results;`

const sql9 = `DELETE FROM tb_enrollments_learndot`

const sql10 = `SELECT
			   E.id AS registrationID,
			   LC.name AS courseName
			   FROM
			   enrollment E
			   INNER JOIN
			   learningcomponent LC ON E.component_id = LC.id
			   INNER JOIN
			   contact C ON E.contact_id = C.id
			   WHERE
			   C.email LIKE '?'
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



const sql11 = `INSERT INTO tb_enrollments_learndot (registrationID, courseName, email) VALUES (?);`

module.exports.pool = pool;
module.exports.sql1 = sql1;
module.exports.sql2 = sql2;
module.exports.sql3 = sql3;
module.exports.sql5 = sql5;
module.exports.sql7 = sql7;
module.exports.sql8 = sql8;

