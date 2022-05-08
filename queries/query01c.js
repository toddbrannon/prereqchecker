class Query {
    name = "1c";
    getSql = previous => {
        return "DELETE FROM tb_enrollments_learndot;"
    }
}
module.exports = Query;
