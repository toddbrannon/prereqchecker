
    class Query {
        name = "select_tb_prereqs";
        step = "11"
        getSql = (previous) =>{
            //return `select id, name, year, "${previous[0].id}" as test from project limit 5`
            return `SELECT * FROM tb_prereqs`
        }
    
    }
    module.exports = Query;