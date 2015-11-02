require('dotenv').load();

module.exports = {
  cookieSecret: 'cookieSecret',
  sessionSecret: 'sessionSecret',
  mongoURI: process.env.MONGO_URI,
  session: {
    redis: {
        url: process.env.REDIS_URL 
    }
  },
  emailFrom: 'Email Server <email_server@mail.com>',
  mongooseDebug: false,
  slackKey: process.env.SLACK_BOT_TOKEN,
  slackTeam: process.env.SLACK_TEAM,
  slackErrorChannel: process.env.SLACK_ERROR_CHANNEL,
  facebook:{
    clientID: process.env.FB_ID,
    clientSecret: process.env.FB_SECRET,
    callbackURL: process.env.FB_CALLBACK
  }
};
