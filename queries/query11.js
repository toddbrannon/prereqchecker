class Query {
    name = "10";
    getSql = previous => {
        return `INSERT INTO tb_credlybadgeresult (recipientemail, badge_id, badge_name, badge_template_state, user_id) VALUES (?, ?, ?, ?, ?)`
    }
    getValues = previous => {
        const from_api = { recipientemail:"any@email.com", badge_id: 0, badge_name:"doe", badge_template_state:"x", user_id: 1 };
        return from_api
    }
}
module.exports = Query;
