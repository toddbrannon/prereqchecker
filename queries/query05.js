class Query {
    name = "insert_into_tb_enrollments_learndot: ";
    step = "5"
    getSql = previous => {
        const sqls = [];
        previous.forEach(element => {
            sqls.push(`INSERT INTO tb_enrollments_learndot (registrationID, coursename, email) VALUES  (${element.registrationID}, "${element.courseName}", "${element.email}")`)
        });
        console.log(sqls);
        return sqls.join(';')
    }
}
module.exports = Query;
