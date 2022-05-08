class Query {
    name = "7";
    getSql = previous => {
        return `SELECT
        E.id AS registrationID,
        LC.name AS courseName
      FROM
        enrollment E
      INNER JOIN
        learningcomponent LC ON E.component_id = LC.id
      INNER JOIN
        contact C ON E.contact_id = C.id
      WHERE
        C.email = ?
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
    }
        getValues = previous => {
        return [previous.registrationID, previous.coursename, previous.EMAIL]
    }
}
module.exports = Query;

