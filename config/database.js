const { createPool, createConnection } = require('mysql');
const util = require('util');

const conn = createConnection({
    host: process.env.DB_HOST, 
    port: process.env.DB_PORT,
    database: process.env.DB_NAME, 
    user: process.env.DB_USER,
    password: process.env.DB_PASS
  })

const query = util.promisify(conn.query).bind(conn);

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
	enrollment_id,
    email,
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

const sql5 = `SELECT email, event_id, enrollment_id, firstname, lastname, status FROM enrollmentrefresh;`

const sql7 = `INSERT INTO tb_elr_results (email, courseName, registrationID) VALUES (?, ?, ?);`

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

const sql12 = `UPDATE tb_prereqs pre
			   SET pre.F3 = 'NO';`

const sql13 = `UPDATE tb_prereqs pre
			   INNER JOIN tb_elr_results elr on pre.email = elr.email
			   SET pre.F3 = 'YES'
			   WHERE elr.coursename LIKE "%Fundamentals%" AND elr.coursename LIKE "%Part 3%";`

const sql14 = `UPDATE tb_prereqs pre
			   INNER JOIN tb_enrollments_learndot ld on pre.email = ld.email
			   SET pre.F3 = 'YES'
			   WHERE ld.coursename LIKE "%Fundamentals%" AND ld.coursename LIKE "%Part 3%";`

const sql15 = `UPDATE tb_prereqs pre
			   SET pre.ASnR = 'NO';`

const sql16 = `UPDATE tb_prereqs pre
			   INNER JOIN tb_elr_results elr on pre.email = elr.email
			   SET pre.ASnR = 'YES'
			   WHERE elr.coursename LIKE "%Advanced Searching%";`

const sql17 = `UPDATE tb_prereqs pre
			   INNER JOIN tb_enrollments_learndot ld on pre.email = ld.email
			   SET pre.ASnR = 'YES'
			   WHERE ld.coursename LIKE "%Advanced Searching%";`

const sql18 = `UPDATE tb_prereqs pre
			   SET pre.CD = 'NO';`

const sql19 = `UPDATE tb_prereqs pre
			   INNER JOIN tb_elr_results elr on pre.email = elr.email
			   SET pre.CD = 'YES'
			   WHERE elr.coursename LIKE "%Creating Dashboards%";`

const sql20 = `UPDATE tb_prereqs pre
			   INNER JOIN tb_enrollments_learndot ld on pre.email = ld.email
    		   SET pre.CD = 'YES'
			   WHERE ld.coursename LIKE "%Creating Dashboards%";`

const sql21 = `UPDATE tb_prereqs pre
			   SET pre.CCLabs = 'NO';`

const sql22 = `UPDATE tb_prereqs pre
			   INNER JOIN tb_elr_results elr on pre.email = elr.email
			   SET pre.CCLabs = 'YES'
			   WHERE elr.coursename LIKE "%Core Consultant Labs%";`

const sql23 = `UPDATE tb_prereqs pre
			   INNER JOIN tb_enrollments_learndot ld on pre.email = ld.email
			   SET pre.CCLabs = 'YES'
			   WHERE ld.coursename LIKE "%Core Consultant Labs%";`



module.exports.pool = pool;
module.exports.query = query;
module.exports.sql1 = sql1;
module.exports.sql2 = sql2;
module.exports.sql3 = sql3;
module.exports.sql5 = sql5;
module.exports.sql7 = sql7;
module.exports.sql8 = sql8;

