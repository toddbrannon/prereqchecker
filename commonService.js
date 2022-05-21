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
                connection.query(query.getSql(values), (err, results) => {
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
        let resultsQ4, resultQ5, resultQ6, resultQ7;
        for(let emailChunk of emailChunks) {
            resultsQ4 = await doQueryExec(connectionELearning, Query04, emailChunk)
            if (resultsQ4) {
                resultQ5 = await doQueryExec(connectionLearnDot, Query05, resultsQ4)

                resultQ6 = await doQueryExec(connectionLearnDot, Query06)
    
                let badgesForEmailChunk = []
                for(let email of emailChunk) {
                    const badgeResults = await getBadges(email);
                    if (badgeResults) {
                        badgesForEmailChunk = badgesForEmailChunk.concat(badgeResults);
                    } else {
                        logger.info(`No badges found for email : ${email}`);
                    }
                }
                resultQ7 = await doQueryExec(connectionLearnDot, Query07, badgesForEmailChunk)
            } else {
                resultsQ4 = {
                    message: 'No results found!'
                }
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
                totalResults: resultsQ4 ? resultsQ4.length : 0,
                message: resultsQ4 ? resultsQ4.message : null
            },
            executionQ5: {
                affectedRows: resultQ5 ? resultQ5.affectedRows : null,
                message: resultQ5 ? resultQ5.message : null
            },
            executionQ6: {
                affectedRows: resultQ6 ? resultQ6.affectedRows : null,
                message: resultQ6 ? resultQ6.message : null
            },
            executionQ7: {
                affectedRows: resultQ7 ? resultQ7.affectedRows : null,
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