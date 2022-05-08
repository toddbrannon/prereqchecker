class Query {
    name = "1d";
    getSql = previous => {
        return "DELETE FROM tb_credlybadgeresult;"
    }
}
module.exports = Query;
