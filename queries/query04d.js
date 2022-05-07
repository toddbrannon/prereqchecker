class Query {
    name = "4d";
    getSql = previous => {
        return "DELETE FROM tb_enrollments_learndot;"
    }
    fakeResults = [{registrationID: 1, courseName: 2, email: 3},{registrationID: 4, courseName: 5, email: 6},{registrationID: 7, courseName: 8, email: 9}]
}
module.exports = Query;
