class Query {
    name = "insert_into_tb_elr_results";
    step = "06"
    getSql = previous => {
        return `INSERT INTO tb_elr_results 
                (registrationID, coursename, EMAIL)
                SELECT
                E.id AS registrationID,
                LC.name AS courseName,
                er.email
                FROM
                enrollment E
                INNER JOIN
                learningcomponent LC ON E.component_id = LC.id
                INNER JOIN
                contact C ON E.contact_id = C.id
                INNER JOIN
                enrollmentrefresh er ON er.email = C.email
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
                ) ORDER BY EMAIL ASC;`
    }
        getValues = previous => {
        return [previous.registrationID, previous.coursename, previous.EMAIL]
    }
}
module.exports = Query;
