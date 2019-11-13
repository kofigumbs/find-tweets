const request = require('request')
const OAuth = require('oauth-1.0a')
const crypto = require('crypto')

import sirv from 'sirv';
import express from 'express';
import compression from 'compression';
import * as sapper from '@sapper/server';

const { PORT, NODE_ENV, TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET } = process.env;
const dev = NODE_ENV === 'development';

const p = x => { console.log(x); return x; };

const oauth = OAuth({
  consumer: { key: TWITTER_CONSUMER_KEY, secret: TWITTER_CONSUMER_SECRET },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  },
});

const postWithSignature = (data, callback) => {
  data.method = "POST";
  return request(
    { url: data.url, method: data.method, form: oauth.authorize(data) },
    callback);
};

express()
  .get("/oauth", (req, res) => {
    postWithSignature({
      url: "https://api.twitter.com/oauth/access_token",
      data: req.query,
    }, (error, response, body) => res.redirect("/?" + body));
  })
  .get("/login", (req, res) => {
    postWithSignature({
      url: "https://api.twitter.com/oauth/request_token",
    }, (error, response, body) => {
      const token = body.match(/oauth_token=([\w-]+)/)[1];
      res.redirect(`https://api.twitter.com/oauth/authenticate?oauth_token=${token}`);
    });
  })
  .all(/^\/api\/.+/, (req, res) => {
    const data = {
      method: req.method,
      url: `https://api.twitter.com/1.1/${req.path.slice("/api/".length)}`,
    };
    request(
      p({
        url: data.url,
        method: data.method,
        headers: oauth.toHeader(oauth.authorize(data, { key: req.header("Authorization") })),
      }),
      (error, response, body) => {
        res.statusCode = response.statusCode;
        res.end(body);
      });
  })
	.use(
		compression({ threshold: 0 }),
		sirv('static', { dev }),
		sapper.middleware()
	)
	.listen(PORT, err => {
		if (err) console.log('error', err);
	});
