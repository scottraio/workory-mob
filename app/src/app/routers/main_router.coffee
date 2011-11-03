Home = require('views/home').Home

class exports.MainRouter extends Backbone.Router
  
	routes:
    "home": "index"

  index: ->
		home = new Home({ el: $("content") })
		home.render()
