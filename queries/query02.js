class Query {
    name = "2";
    getSql = previous =>{
        return `select id, name, year, "${previous[0].id}" as test from project limit 5`
    }

}
module.exports = Query;