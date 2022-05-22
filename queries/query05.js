class Query {
    name = "insert_into_tb_enrollments_learndot: ";
    step = "05"
    getSql = (values) => {
        const insertVals = [];
        values.forEach(element => {
            const vals = [element.registrationID, `'${element.courseName}'`, `'${element.email}'`]
            insertVals.push(`(${vals.join(',')})`);
        });
        if (insertVals.length === 0) return '';
        
        const sql = `INSERT INTO tb_enrollments_learndot (registrationID, coursename, email) VALUES ${insertVals.join(',')}`;
        // console.log(sql);
        return sql;
    }
}
module.exports = Query;
