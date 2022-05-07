class Query {
    name = "1";
    getSql = previous =>{
        //return "select id, name from project limit 5"
        return "DELETE FROM enrollmentrefresh"
    }
}
module.exports = Query;