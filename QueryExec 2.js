class QueryExec {
    async exec(conn, query, previous) {
        try {
            const sql = query.getSql(previous)
            const values = query.getValues && query.getValues(previous)
            console.log(query.name, sql, values)

            const response = await new Promise((resolve, reject) => {
                if (process.env.DB_DISABLED === '1') {
                    resolve(query.fakeResults)
                } else {
                    conn.query(sql, values, (err, results) => {
                        if (err) {
                            console.log(query.name + ' query error ' + err.message);
                            reject(err)
                        } else {
                            console.log(query.name + ' query success')
                            resolve(results);
                        }
                    })
                }
            });
            return response
        } catch (error) {
            console.log(query.name + ' catch ' + error);
        }
    }
}

module.exports = QueryExec;