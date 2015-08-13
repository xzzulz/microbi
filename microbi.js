///////////////////////////////////////////////////////////
//
//   microbi.js
//
///////////////////////////////////////////////////////////
//
// http server and Api server for Node.js
//
//

var fs = require( 'fs' );
var http = require( 'http' )
var path = require( 'path' )
var url = require( 'url' )

var contentType = require( './contentType.js' )
var router = require( './router.js' )





// The api object
//
// This object is where the api routes are stored. It is only used when the
// Api server functionality is used. The router tries to match properties
// of this object to url paths. For example, the path:
//     stuff/items
// is mapped to a tree of properites in the api object as follows:
//     api.stuff.items.GET
//
// Note that the request method (GET in this case), is added as the last
// property name. 
// If the api object if left empty, (no properties added) then the server
// will not match any api methods, and will work as a http static server only.
var api = {}

// default Api content type is txt
// This is used to set the mime type for api requests.
// There is a function to set this.
var apiContentType = contentType( 'txt' )



/**
 * Request responder function. This function is called on each
 * request to the server
 * 
 * This is the function that handles incoming requests to the server.
 * It does the next things:
 * - parses the url for incoming requests.
 * - verifies if there is an api request handler defined for that
 *   url. Executes it if there is one.
 * - If there is no api function, then it looks for a file that
 *   correspond to the requested url. 
 * - If a file is found, set the corresponding content type and serve
 *   the file.
 */
var onRequest = function( request, response ) {

  // get request method (GET, POST, PUT, etc) and url
  var method = request.method
  var reqUrl = url.parse( request.url, true )

  // request pathname (i.e: "/stuff/item")
  var pathname = reqUrl.pathname
  console.log('pathname', pathname)

  // validate path. If the path is invalid, answer with 404.
  // Allowed characters are letters, numbers, dots, minus, underscores,
  // and slashes "/"
  // Two consecutive dots are not allowed.
  if ( ! validatePath( pathname ) ) {
    respond404( response )
    return
  }

  // Split the url paths. Used to search for api methods.
  // For example, the path:
  //     stuff/items
  // is split to an array.The request method is added at the end:
  //     [ 'stuff', 'items', 'GET' ]
  var routeParts = router.getRoutes( pathname, method )
  console.log( 'routes', routeParts )

  // Determine if the api object has a function defined for the
  // given path. For example, if the route parts are as the example
  // just above, this will check the api object for the next properties
  // tree:
  //     api.stuff.items.GET
  // If there is a method defined there, it is called, and what it returns
  // is the response for the request.
  // Then the responder function ends. 
  var apiRoute = router.route( routeParts, api )
  if ( apiRoute ) {
    response.writeHead( 200, { 'Content-Type': apiContentType } );
    response.end( apiRoute() )
    return
  }

  // If the responder function reaches to here, it means that there is no
  // api method to server. What is left is to check if there is a file
  // to serve at the given path. The static file server only allows for
  // GET request. If the request method is not GET, respond 405 and exit.
  if ( method != 'GET' ) {
    respond405( response )
    return  
  }

  // If the requested path is "/", file to serve is "index.html"
  var fileToServe = pathname == '/' ? 'index.html' : '.' + pathname

  // serve file or respond 404 if there is no file
  var readStream = fs.createReadStream( fileToServe )
  readStream.on( 'error', function() {
    respond404( response )
  })

  // set content type header based on the file termination
  var ext = path.extname( fileToServe )
  response.writeHead( 200, { 'Content-Type': contentType( ext ) } );
  // connect the file read stream to the response stream, to serve the file
  readStream.pipe( response )
  readStream.on( 'end', function() {
    response.end()
  })
}




var server = function() {
  http.createServer( onRequest ).listen( 55555, '127.0.0.1' );
  console.log( 'Server running at http://127.0.0.1:55555/' );
}

exports.server = server

// run server if not being required from external file
if ( ! module.parent ) server()






// The paths requested to the server must match this regex.
// It will only allow letters, numbers underscore, minus
// sign and dots.
var VALID_PATH_REGEX = /^[\./_\-\d\w]*$/

// The path isn't allowed to contain ".." or "/."
var DISALLOWED_PATH_REGEX = /(\.\.)|(\/\.)/

/**
 * Validate the path
 * 
 * Returns true if the path is valid. False otherwise.
 */
var validatePath = function( path ) {
  if ( DISALLOWED_PATH_REGEX.test( path ) ) return false
  return VALID_PATH_REGEX.test( path )
}



/**
 * Emit a 404 response
 */
var respond404 = function( response ) {
  response.writeHead( 404 )
  fff()
  response.end( '404 Not found.' )
}



/**
 * Emit a 405 response: method not allowed
 */
var respond405 = function( response ) {
  response.writeHead( 405 )
  response.end( '405 Method not allowed.' )
}



/**
 * Set the default content type for api requests
 * The content type for static file requests is determined from the file
 * termination. This is only for Api requests
 */
exports.setApiContentType = function( ext ) {
  apiContentType = contentType( ext )
}



/**
 * Set the api object.
 * This is used to set api routes.
 */
exports.setApi = function( apiOb ) {
  api = apiOb
}