
    class Query {
        name = "remove_dupes_from_tb_credlybadgeresult";
        step = "08"
        getSql = (previous) =>{
            //return `select id, name, year, "${previous[0].id}" as test from project limit 5`
            return `DELETE t1 FROM tb_credlybadgeresult t1
            INNER JOIN tb_credlybadgeresult t2 
            WHERE 
                t1.id < t2.id
            AND
                t1.recipientemail = t2.recipientemail;`
        }
    
    }
    module.exports = Query;