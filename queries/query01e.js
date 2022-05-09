class Query {
    name = "1e";
    getSql = previous => {
        return "DELETE FROM tb_prereqs;"
    }
}
module.exports = Query;
