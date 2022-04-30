class Query {
    name = "3";
    getSql = previous => {
        return "INSERT INTO project (id, name, year) VALUES  (?, ?, ?)"
    }
    getValues = previous => {
        return [previous[0].id + new Date().getMilliseconds(), previous[0].name + '_test', previous[0].year + 50]
    }
}
module.exports = Query;
