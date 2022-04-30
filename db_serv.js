
var Database   = require('./class_mysql_db.js');
dotenv.config();

let config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
};

let config2 = {
    host: process.env.DB2_HOST,
    user: process.env.DB_USER,
    password: process.env.DB2_PASS,
    database: process.env.DB2_NAME,
    port: process.env.DB_PORT
}



getRows(){
    // var str_sql  = 'select * from gallery where itemid > 7';
var str_sql_2  = 'DELETE FROM enrollmentrefresh;';
var str_sql_3  = 'SELECT * FROM enrollmentrefresh';
var str_sql_4  = `INSERT INTO enrollmentrefresh (
    event_id, 
    start_time,
    email,
    enrollment_id,
    firstname,
    lastname,
    status,
    locationname,
    contactid,
    score
) SELECT 
    V.id AS event_id,
    V.startTime,
    C.email,
    E.id AS enrollment_id,
    C.firstName,
    C.lastName,
    E.status,
    LOC.name,
    E.contact_id,
    E.score
FROM 
    event V
    LEFT JOIN 
    enrollment E ON V.id = E.event_id
    LEFT JOIN
    contact C ON E.contact_id = C.id
    INNER JOIN 
    location LOC ON V.location_id = LOC.id
WHERE 
    V.course_id = 256 
    AND 
    V.startTime > CURRENT_TIMESTAMP
    AND 
    V.status LIKE 'CONFIRMED'
    AND 
    E.status NOT LIKE 'CANCELLED';`

    let mydb = new Database(config);

    let someRows, otherRows;

    mydb.query( str_sql_2 )
    .then( rows => {
        someRows = rows;
        return mydb.query( str_sql_3 );
    } )
    .then( rows => {
        otherRows = rows;
        return mydb.query( str_sql_4 );
    })
    .then( rows => {
        moreRows = rows;
        return mydb.query( str_sql_5 )
    })
    .then( rows => {
        otherRows = rows;
        return mydb.close();
    } , err => {
        return mydb.close().then( () => { throw err; } )
    })
    .then( () => {
        // do something with someRows and otherRows
        console.log("someRows: " + someRows[0]['itemid']);
        console.log(`otherRows: ${otherRows[0]['itemid']}`);
        console.log("moreRows: " + moreRows[0]['itemid']);
    }).catch( err => {
        // handle the error
        console.log(err.message);
    }
);

}
