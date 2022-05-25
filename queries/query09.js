
    class Query {
        name = "insert_into_tb_prereqs";
        step = "08"
        getSql = (previous) =>{
            //return `select id, name, year, "${previous[0].id}" as test from project limit 5`
            return `INSERT INTO tb_prereqs (
                event_id, 
                enrollment_id, 
                email, 
                full_name, 
                status) 
            SELECT 
                event_id, 
                enrollment_id, 
                email, 
                CONCAT(TRIM(firstname), " ", TRIM(lastname)), 
                status 
            FROM 
                enrollmentrefresh;`
        }
    
    }
    module.exports = Query;