var microbi = require('./microbi.js')




// optionally define api methods
var api = {}
microbi.setApi( api )
microbi.setApiContentType( 'txt' )

api.user = {}

api.user.GET = function( reqUrl ) {
  return 'api.user.GET'
}

api.user.POST = function( reqUrl, requestBody ) {
  return 'api.user.POST'
}

api.user.DELETE = function( reqUrl ) {
  return 'api.user.DELETE'
}

api.user.PUT = function( reqUrl, requestBody ) {
  return 'api.user.PUT'
}

// start the server
microbi.server()