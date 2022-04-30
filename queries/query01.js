class Query {
    name = "1";
    getSql = previous =>{
        return "select id, name from project limit 5"
    }

}
module.exports = Query;