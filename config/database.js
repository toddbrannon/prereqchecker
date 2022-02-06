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

module.exports.pool = pool;
module.exports.sql1 = sql1;
module.exports.sql2 = sql2;