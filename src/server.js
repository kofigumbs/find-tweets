const request = require('request')
const OAuth = require('oauth-1.0a')
const crypto = require('crypto')

import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import * as sapper from '@sapper/server';

const { PORT, NODE_ENV, TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET } = process.env;
const dev = NODE_ENV === 'development';

polka()
  .get("/login", (req, res) => {
    const oauth = OAuth({
      consumer: { key: TWITTER_CONSUMER_KEY, secret: TWITTER_CONSUMER_SECRET },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64');
      },
    });
    const request_data = {
      url: "https://api.twitter.com/oauth/request_token",
      method: "POST",
      oauth_callback: "https%3A%2F%2Flocalhost%3A5000",
    };
    request(
      {
        url: request_data.url,
        method: request_data.method,
        form: oauth.authorize(request_data),
      },
      function(error, response, body) {
        res.end(body);
      }
    )
  })
	.use(
		compression({ threshold: 0 }),
		sirv('static', { dev }),
		sapper.middleware()
	)
	.listen(PORT, err => {
		if (err) console.log('error', err);
	});
