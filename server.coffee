# Module dependencies
fs 			= require('fs')
express = require('express')
OAuth 	= require('oauth').OAuth
gzip 		= require('connect-gzip');
app 		= module.exports = express.createServer()


# Configuration
app.configure () ->
	app.use express.bodyParser()
	app.use express.methodOverride()
	app.use express.compiler({ src: __dirname + '/public', enable: ['less'] })
	app.use express.static(__dirname + '/public')
	
	app.use express.cookieParser()
	app.use express.session({secret: "skjghskdjfhbqigohqdiouk"})
	
	app.use gzip.gzip()
	
	app.use app.router
	
app.configure 'development', () ->
	app.use express.errorHandler({ dumpExceptions: true, showStack: true })

app.configure 'production', () ->
	app.use express.errorHandler()
	
# OAuth
provider_url = 'https://app.workory.com'
callback_url = 'http://10.0.1.33:3000/oauth/callback'

client = 
	key:						"746737120094567",
	secret:					"e620b86776c42c0eb54dc82476af2814",
	site: 					provider_url,
	authorize_url: 	"#{provider_url}/oauth2/authorize",
	token_url: 			"#{provider_url}/oauth2/token"

# Routes

# Basic Routing
app.get '/', (req, res) ->
	if !req.session || !req.session.oauth_access_token
		res.redirect("/auth");
	else
		fs.readFile __dirname + '/index.html', 'utf8', (err, html) ->
			res.send(html)

# OAuth Routing
app.get '/auth', (req, res) ->
	oa = new OAuth client.token_url, client.authorize_url, client.key, client.secret, "2.0", callback_url, "HMAC-SHA1"
	req.session.oa 									= oa
	req.session.oauth_token 				= client.key
	req.session.oauth_token_secret 	= client.secret
	res.writeHead 303, { 'Location': "#{client.authorize_url}?response_type=code&client_id=#{client.key}" }
	res.end('')

app.get '/oauth/callback', (req, res) ->
	oa = new OAuth(req.session.oa._requestUrl, req.session.oa._accessUrl, req.session.oa._consumerKey, req.session.oa._consumerSecret, req.session.oa._version, req.session.oa._authorize_callback, req.session.oa._signatureMethod)
	req.session.oauth_access_token 				= req.param('code')
	req.session.oauth_access_token_secret = ""
	res.redirect "/"

# Only listen on $ node app.js
if not module.parent
	app.listen 3000
	console.log "Express server listening on port %d", app.address().port
 