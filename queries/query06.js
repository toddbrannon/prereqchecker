class Query {
    name = "6";
    getSql = previous => {
        return "SELECT email FROM enrollmentrefresh;"
    }
    fakeResults = {registrationID: 1, coursename: 2, EMAIL: 3}
}
module.exports = Query;
