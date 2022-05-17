const { getLearnDotDBConnection, getELearningConnector } = require('./dbConnector');

const Query01 = require('./queries/query01')
const Query02 = require('./queries/query02')
const Query03 = require('./queries/query03')
const Query04 = require('./queries/query04')
const Query05 = require('./queries/query05')
const Query06 = require('./queries/query06')
const Query07 = require('./queries/query07')

const doQueryExec = async(connection, queryClass, values) => {
    const query = new queryClass();
    try {
        console.log('Execution Query : ' + query.getSql(values) + values);
        const response = await new Promise((resolve, reject) => {
            if (process.env.DB_DISABLED === '1') {
                resolve(query.fakeResults)
            } else {
                connection.query(query.getSql(values), (err, results) => {
                    if (err) {
                        console.log(query.step + query.name + ' query error ' + err.message);
                        reject(err)
                    } else {
                        console.log(query.step + query.name + ' query success')
                        resolve(JSON.parse(JSON.stringify(results)));
                    }
                })
            }
        });
        return response
    } catch (error) {
        console.log(query.step + query.name + ' catch ' + error);
    }
}

const chunkEmails = (dataToChunk, chunkSize = 50) => {
    const chunks = []
    for (let i = 0; i < dataToChunk.length; i += chunkSize) {
        const chunk = dataToChunk.slice(i, i + chunkSize);
        chunks.push(chunk);
    }
    return chunks;
}

const getAll = async () => {
    console.log('Start : getAll service method')
    
    const connectionLearnDot = getLearnDotDBConnection();
    const connectionELearning = getELearningConnector();

    try {
        const resultsQ3 = await doQueryExec(connectionLearnDot, Query03)
        const allEmails = resultsQ3.map(result => JSON.stringify(result.email));

        const emailChunks = chunkEmails(allEmails, 2);
        emailChunks.forEach(async emailChunk => {
            let resultsQ4 = await doQueryExec(connectionELearning, Query04, emailChunk)
            console.log(resultsQ4)

            let resultsQ5 = await doQueryExec(connectionLearnDot, Query05, resultsQ4)
            console.log(resultsQ5)

            // // TODO : Uncomment this
            // let resultsQ6 = await doQueryExec(connection_learndot, Query06)
            // console.log(resultsQ6)

            // TODO : Query 7
        });
        
        return {
            totalEmailsFromQ3: resultsQ3.length,
            executionChunk: emailChunks.length,
        }
    } catch (err) {
        console.log('Error : ' + err);
    }
}

module.exports = {
    getAll
}