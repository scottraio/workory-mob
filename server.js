var OAuth, app, callback_url, client, express, fs, package, provider_url, stitch;
fs = require('fs');
stitch = require('stitch');
express = require('express');
OAuth = require('oauth').OAuth;
app = module.exports = express.createServer();
package = stitch.createPackage({
  paths: [__dirname + '/app/']
});
app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.compiler({
    src: __dirname + '/public',
    enable: ['less']
  }));
  app.use(express.static(__dirname + '/public'));
  app.use(express.cookieParser());
  app.use(express.session({
    secret: "skjghskdjfhbqigohqdiouk"
  }));
  return app.use(app.router);
});
app.configure('development', function() {
  return app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});
app.configure('production', function() {
  return app.use(express.errorHandler());
});
provider_url = 'https://app.workory.com';
callback_url = 'http://local.dev:3000/oauth/callback';
client = {
  key: "120094574673767",
  secret: "b54dc82476af2814e620b86776c42c0e",
  site: provider_url,
  authorize_url: "" + provider_url + "/oauth2/authorize",
  token_url: "" + provider_url + "/oauth2/token"
};
app.get('/', function(req, res) {
  if (!req.session || !req.session.oauth_access_token) {
    return res.redirect("/auth");
  } else {
    return fs.readFile(__dirname + '/index.html', 'utf8', function(err, html) {
      return res.send(html);
    });
  }
});
app.get('/auth', function(req, res) {
  var oa;
  oa = new OAuth(client.token_url, client.authorize_url, client.key, client.secret, "2.0", callback_url, "HMAC-SHA1");
  req.session.oa = oa;
  req.session.oauth_token = client.key;
  req.session.oauth_token_secret = client.secret;
  res.writeHead(303, {
    'Location': "" + client.authorize_url + "?response_type=code&client_id=" + client.key
  });
  return res.end('');
});
app.get('/oauth/callback', function(req, res) {
  var oa;
  oa = new OAuth(req.session.oa._requestUrl, req.session.oa._accessUrl, req.session.oa._consumerKey, req.session.oa._consumerSecret, req.session.oa._version, req.session.oa._authorize_callback, req.session.oa._signatureMethod);
  req.session.oauth_access_token = req.param('code');
  req.session.oauth_access_token_secret = "";
  return res.redirect("/");
});
if (!module.parent) {
  app.listen(3000);
  app.get('/application.js', package.createServer());
  console.log("Express server listening on port %d", app.address().port);
}