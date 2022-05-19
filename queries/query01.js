class Query {
    name = "Delete queries: ";
    step = "01";
    getSql = (previous) =>{
        return `DELETE FROM enrollmentrefresh; 
                DELETE FROM tb_enrollments_learndot;
                DELETE FROM tb_elr_results; 
                DELETE FROM tb_credlybadgeresult;
                DELETE FROM tb_prereqs;`
    }
}
module.exports = Query;