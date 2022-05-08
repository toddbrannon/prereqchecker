class Query {
    name = "6";
    getSql = previous => {
        return `INSERT INTO tb_elr_results (registrationID, coursename, EMAIL) VALUES  (?, ?, ?);`
    }
        getValues = previous => {
        return [previous.registrationID, previous.coursename, previous.EMAIL]
    }
}
module.exports = Query;
