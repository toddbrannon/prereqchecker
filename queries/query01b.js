class Query {
    name = "1b";
    getSql = previous => {
        return "DELETE FROM tb_elr_results;"
    }
}
module.exports = Query;
