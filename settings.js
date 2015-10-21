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
      host: 'ec2-54-225-132-156.compute-1.amazonaws.com',
      port: 15079,
      pass: 'pett2fv8866n97df52a8g4pf4lq',
      url: 'redis://h:pett2fv8866n97df52a8g4pf4lq@ec2-54-225-132-156.compute-1.amazonaws.com:15079'
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
    callbackURL: 'http://localhost:3000/login/facebook/callback'
  }
};
