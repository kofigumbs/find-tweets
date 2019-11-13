const request = require('request')
const OAuth = require('oauth-1.0a')
const crypto = require('crypto')

import sirv from 'sirv';
import express from 'express';
import compression from 'compression';
import * as sapper from '@sapper/server';

const { PORT, NODE_ENV, TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET } = process.env;
const dev = NODE_ENV === 'development';

const oauth = OAuth({
  consumer: { key: TWITTER_CONSUMER_KEY, secret: TWITTER_CONSUMER_SECRET },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  },
});

express()
  .get("/oauth", (req, res) => {
    const request_data = {
      method: "POST",
      url: "https://api.twitter.com/oauth/access_token",
      data: {
        oauth_token: req.query.oauth_token,
        oauth_verifier: req.query.oauth_verifier,
      },
    };
    request(
      {
        url: request_data.url,
        method: request_data.method,
        form: oauth.authorize(request_data),
      },
      (error, response, body) => res.redirect("/?" + body));
  })
  .get("/login", (req, res) => {
    const request_data = {
      method: "POST",
      url: "https://api.twitter.com/oauth/request_token",
    };
    request(
      {
        url: request_data.url,
        method: request_data.method,
        form: oauth.authorize(request_data),
      },
      (error, response, body) => res.end(body));
  })
  .all(/^\/api\/.+/, (req, res) => {
    const p = x => { console.log(x); return x; };
    const path = req.path.slice("/api/".length);
    const request_data = {
      method: req.method,
      url: `https://api.twitter.com/1.1/${path}`,
      data: { oauth_token: req.header("Authorization") },
    };
    request(
      {
        url: request_data.url,
        method: request_data.method,
        headers: oauth.toHeader(oauth.authorize(request_data, { key: req.header("Authorization") })),
      },
      (error, response, body) => res.end(body));
  })
	.use(
		compression({ threshold: 0 }),
		sirv('static', { dev }),
		sapper.middleware()
	)
	.listen(PORT, err => {
		if (err) console.log('error', err);
	});
