
var axios = require('axios');
const logger = require('./utils/logger');

const triggerCredlyAPI = async (emailId) => {

    const requestURL = process.env.CREDLY_URL + emailId
  
    var config = {
        method: 'GET',
        url: requestURL,
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': process.env.CREDLY_AUTH
        }
    };

    try {
        const result = await axios(config);
        if (!result) {
            logger.error(`Invalid result fetched from Credly. Email: ${emailId}`)
            return null
        }
        logger.info(`Successfully fetched data from Credly. Email: ${emailId}`);
        return result.data;
    } catch(error) {
        logger.error(`An error occured while fetching from Credly. Email: ${emailId}`)
    }

}

const getBadges = async (emailId) => {
    const badges = await triggerCredlyAPI(emailId);
    if (badges) {
        const badgeResults = []
        badges.forEach(badge => {
            const { recipient_email, badge_template, user } = badge;
            badgeResults.push({
                recipientEmail: recipient_email,
                badgeId: badge_template ? badge_template.id : null,
                badgeName: badge_template ? badge_template.name : null,
                badgeState: badge_template ? badge_template.state : null,
                userId: user ? user.id : null,
            })
        });
        return badgeResults;
    }
    return [];
}

module.exports = {
    getBadges
}