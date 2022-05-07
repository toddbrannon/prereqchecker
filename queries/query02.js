class Query {
    name = "2";
    getSql = previous =>{
        //return `select id, name, year, "${previous[0].id}" as test from project limit 5`
        return `INSERT INTO enrollmentrefresh (
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
    }

}
module.exports = Query;