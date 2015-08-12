var microbi = require('./microbi.js')




// optionally define api methods
var api = {}
microbi.setApi( api )
microbi.setApiContentType( 'txt' )

api.user = {}

api.user.GET = function() {
  return 'api.user.GET'
}

api.user.POST = function() {
  return 'api.user.POST'
}

api.user.DELETE = function() {
  return 'api.user.DELETE'
}

api.user.PUT = function() {
  return 'api.user.PUT'
}

// start the server
microbi.server()