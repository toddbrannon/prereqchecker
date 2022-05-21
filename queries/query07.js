class Query {
    name = 'insert_credly';
    step = "07";
    getSql = (values) => {
        const insertVals = [];
        values.forEach(element => {
            const vals = [`'${element.recipientEmail}'`, `'${element.badgeId}'`, `'${element.badgeName}'`,  `'${element.badgeState}'`,  `'${element.userId}'`]
            insertVals.push(`(${vals.join(',')})`);
        });
        
        const sql = `INSERT INTO tb_credlybadgeresult (recipientemail, badge_id, badge_name, badge_template_state, user_id) VALUES ${insertVals.join(',')}`;
        // console.log(sql);
        return sql;
    }

    getValues = previous => {
        const from_api = { recipientemail:"any@email.com", badge_id: 0, badge_name:"doe", badge_template_state:"x", user_id: 1 };
        return from_api
    }
}
module.exports = Query;
