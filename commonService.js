const { getLearnDotDBConnection, getELearningConnector } = require('./dbConnector');
const { getBadges } = require('./credlyService');
const logger = require('./utils/logger');

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
        logger.info('Execution Query : ' + query.name + "|" + query.step);
        const response = await new Promise((resolve, reject) => {
            if (process.env.DB_DISABLED === '1') {
                resolve(query.fakeResults)
            } else {
                const sqlQuery = query.getSql(values);
                if (!sqlQuery) {
                    return reject('No query to execute')
                }
                connection.query(sqlQuery, (err, results) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(JSON.parse(JSON.stringify(results)));
                    }
                })
            }
        });
        return response
    } catch (error) {
        logger.error("An error occured : " + query.step + query.name, error);
        return { message: error.message }
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
    
    logger.info('Start : getAll service method')
    
    const connectionLearnDot = getLearnDotDBConnection();
    const connectionELearning = getELearningConnector();

    try {
        const resultsQ1 = await doQueryExec(connectionLearnDot, Query01);
        const resultsQ2 = await doQueryExec(connectionLearnDot, Query02);

        const resultsQ3 = await doQueryExec(connectionLearnDot, Query03);
        const allEmails = resultsQ3.map(result => JSON.stringify(result.email));
        if (!allEmails) {
            return {
                executionQ3: {
                    message: 'No emails found!'
                }
            } 
        }
        const emailChunks = chunkEmails(allEmails, 50);
        let resultQ4 = { totalResults: 0, message: [] }, resultQ5 = { totalResults: 0, message: [] };
        let resultQ6 = { totalResults: 0, message: [] }, resultQ7 = { totalResults: 0, message: [] };
        for(let emailChunk of emailChunks) {
            const responseQ4 = await doQueryExec(connectionELearning, Query04, emailChunk)
            if (responseQ4) {
                if (responseQ4.message) { resultQ4.message.push(responseQ4.message) }
                resultQ4.totalResults = resultQ4.totalResults + responseQ4.length ? responseQ4.length : 0
                
                const responseQ5 = await doQueryExec(connectionLearnDot, Query05, responseQ4)
                if (responseQ5.message) { resultQ5.message.push(responseQ5.message) }
                resultQ5.totalResults = resultQ5.totalResults + responseQ5.affectedRows ? responseQ5.affectedRows : 0
                
                const responseQ6 = await doQueryExec(connectionLearnDot, Query06)
                if (responseQ6.message) { resultQ6.message.push(responseQ6.message) }
                resultQ6.totalResults = resultQ6.totalResults + responseQ6.affectedRows ? responseQ6.affectedRows : 0
                
                let badgesForEmailChunk = []
                for(let email of emailChunk) {
                    const badgeResults = await getBadges(email);
                    // console.log(badgeResults)
                    if (badgeResults) {
                        badgesForEmailChunk = badgesForEmailChunk.concat(badgeResults);
                    } else {
                        logger.info(`No badges found for email : ${email}`);
                    }
                }
                // console.log(badgesForEmailChunk);
                const responseQ7 = await doQueryExec(connectionLearnDot, Query07, badgesForEmailChunk)
                if (responseQ7.message) { resultQ7.message.push(responseQ7.message) }
                resultQ7.totalResults = resultQ7.totalResults + responseQ7.affectedRows ? responseQ7.affectedRows : 0  
            } else {
                resultsQ4.message.push('No results found!')
            }
            
        }
        
        return {
            executionQ1: {
                affectedRows: resultsQ1 ? resultsQ1.affectedRows : 0,
                message: resultsQ1 ? resultsQ1.message : null
            },
            executionQ2: {
                affectedRows: resultsQ2 ? resultsQ2.affectedRows : 0,
                message: resultsQ2 ? resultsQ2.message : null
            },
            executionQ3: {
                totalResults: resultsQ3.length,
                executionChunk: emailChunks.length,
            },
            executionQ4: {
                totalResults: resultQ4 ? resultQ4.totalResults : 0,
                message: resultQ4 ? resultQ4.message : null
            },
            executionQ5: {
                totalResults: resultQ5 ? resultQ5.totalResults : null,
                message: resultQ5 ? resultQ5.message : null
            },
            executionQ6: {
                totalResults: resultQ6 ? resultQ6.totalResults : null,
                message: resultQ6 ? resultQ6.message : null
            },
            executionQ7: {
                totalResults: resultQ7 ? resultQ7.totalResults : null,
                message: resultQ7 ? resultQ7.message : null
            }
            
            
        }
    } catch (err) {
        logger.error('An error occured while getAll processing', err);
        return {
            error: err
        }
    } 
}

module.exports = {
    getAll
}