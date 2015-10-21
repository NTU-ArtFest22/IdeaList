module.exports = {
  cookieSecret: 'cookieSecret',
  sessionSecret: 'sessionSecret',
  db: 'heroku_r3sw6njg',
  host: 'ds041924.mongolab.com:41924',
  dbuser: 'heroku_r3sw6njg',
  dbpass: '3t5lplldfln8jnssrvnf4ldas2',
  port: 3000,
  session: {
    redis: {
      url: process.env.REDIS_URL
    }
  },
  emailFrom: 'Email Server <email_server@mail.com>',
  mongooseDebug: false,
  slackKey: 'IMPJXUedcy3tDvlLEdRGD1v3',
  slackTeam: 'ntuaf',
  slackErrorChannel: '#error',
  facebook:{
    clientID:'1017275854991795',
    clientSecret: 'abcbff20a14c8b9e33eb3171c110265e',
    callbackURL: 'http://ntuaf-idea-pool.herokuapp.com/login/facebook/callback'
  }
};
