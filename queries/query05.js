class Query {
    name = "5";
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
