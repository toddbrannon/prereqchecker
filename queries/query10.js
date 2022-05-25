
    class Query {
        name = "update_tb_prereqs_columns";
        step = "10"
        getSql = (previous) =>{
            //return `select id, name, year, "${previous[0].id}" as test from project limit 5`
            return `UPDATE tb_prereqs SET ArchCert = 'NO';
            UPDATE tb_prereqs pre
            RIGHT JOIN tb_credlybadgeresult cr on pre.email = cr.recipientemail
            SET pre.ArchCert = IF(badge_name = "Splunk Enterprise Certified Architect", 'YES', 'NO');
            UPDATE tb_prereqs pre
            SET pre.F3 = 'NO';
            UPDATE tb_prereqs pre
            RIGHT JOIN tb_elr_results elr on pre.email = elr.email
            SET pre.F3 = IF(elr.coursename LIKE "%Fundamentals%" AND elr.coursename LIKE "%Part 3%", 'YES', 'NO');
            UPDATE tb_prereqs pre
            INNER JOIN tb_enrollments_learndot ld on pre.email = ld.email
            SET pre.F3 = 'YES'
            WHERE ld.coursename LIKE "%Fundamentals%" AND ld.coursename LIKE "%Part 3%";
            UPDATE tb_prereqs pre
            SET pre.ASnR = 'NO';
            UPDATE tb_prereqs pre
            INNER JOIN tb_elr_results elr on pre.email = elr.email
            SET pre.ASnR = 'YES'
            WHERE elr.coursename LIKE "%Advanced Searching%";
            UPDATE tb_prereqs pre
            INNER JOIN tb_enrollments_learndot ld on pre.email = ld.email
            SET pre.ASnR = 'YES'
            WHERE ld.coursename LIKE "%Advanced Searching%";
            UPDATE tb_prereqs pre
            SET pre.CD = 'NO';
            UPDATE tb_prereqs pre
            INNER JOIN tb_elr_results elr on pre.email = elr.email
            SET pre.CD = 'YES'
            WHERE elr.coursename LIKE "%Creating Dashboards%";
            UPDATE tb_prereqs pre
            INNER JOIN tb_enrollments_learndot ld on pre.email = ld.email
            SET pre.CD = 'YES'
            WHERE ld.coursename LIKE "%Creating Dashboards%";
            UPDATE tb_prereqs pre
            SET pre.CCLabs = 'NO';
            UPDATE tb_prereqs pre
            INNER JOIN tb_elr_results elr on pre.email = elr.email
            SET pre.CCLabs = 'YES'
            WHERE elr.coursename LIKE "%Core Consultant Labs%";
            UPDATE tb_prereqs pre
            INNER JOIN tb_enrollments_learndot ld on pre.email = ld.email
            SET pre.CCLabs = 'YES'
            WHERE ld.coursename LIKE "%Core Consultant Labs%";`
        }
    
    }
    module.exports = Query;