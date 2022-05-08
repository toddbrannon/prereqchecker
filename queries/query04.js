class Query {
    name = "4";
    getSql = previous => {
        return `SELECT
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
    }
        getValues = previous => {
        return [previous.registrationID, previous.coursename, previous.EMAIL]
    }
}
module.exports = Query;