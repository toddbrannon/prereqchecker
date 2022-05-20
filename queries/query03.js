class Query {
    name = "get_enrollmentrefresh_emails"
    step = "03";
    getSql = () => {
        return "SELECT email FROM enrollmentrefresh;"
    }
    fakeResults = {email: "todd@nowhere.com"}
}
module.exports = Query;
