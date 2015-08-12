var http = require( 'http' )
var url = require( 'url' )
var fs = require( 'fs' );
var path = require( 'path' )

var contentType = require( './contentType.js' )
var router = require( './router.js' )






// optionally define api methods
var api = {}
// default Api content type is txt
var apiContentType = contentType( 'txt' )


/**
 * Request responder function
 */
var onRequest = function ( request, response ) {

  var method = request.method
  var reqUrl = url.parse( request.url, true )

  var pathname = reqUrl.pathname
  console.log('pathname', pathname)

  // validate path
  if ( ! validatePath( pathname ) ) {
    respond404( response )
    return
  }

  var routeParts = router.getRoutes( pathname, method )
  console.log( 'routes', routeParts )

  var apiRoute = router.route( routeParts, api )
  if ( apiRoute ) {
    response.writeHead( 200, { 'Content-Type': apiContentType } );
    response.end( apiRoute() )
    return
  }

  // static server only allows GET requests
  if ( method != 'GET' ) {
    respond405( response )
    return  
  }

  // for "/" path, serve index.html
  var fileToServe = pathname == '/' ? 'index.html' : '.' + pathname


  // serve file
  console.log( 'serving ' + fileToServe )

  var readStream = fs.createReadStream( fileToServe )

  readStream.on( 'error', function() {
    respond404( response )
  })

  // set content type header
  var ext = path.extname( fileToServe )
  response.writeHead( 200, { 'Content-Type': contentType( ext ) } );

  readStream.pipe( response )
  readStream.on( 'end', function() {
    response.end()
  })
}




exports.server = function() {
  http.createServer( onRequest ).listen( 55555, '127.0.0.1' );
  console.log( 'Server running at http://127.0.0.1:55555/' );
}

// run server if not being required from external file
if ( ! module.parent ) server()






// The path for files to serve, must match this regex
var PATH_REGEX = /^[\./_\-\d\w]*$/

// The path isn't allowed to contain ".." or "/."
var DISALLOWED_REGEX = /(\.\.)|(\/\.)/

/**
 * Validate the path
 */
var validatePath = function( path ) {
  if ( DISALLOWED_REGEX.test( path ) ) return false
  return PATH_REGEX.test( path )
}



/**
 * Emit a 404 response
 */
var respond404 = function( response ) {
  response.writeHead( 404 )
  response.end( '404 Not found.' )
}



/**
 * Emit a 405 response: method not allowed
 * 
 * The static server only allows GET requests
 */
var respond405 = function( response ) {
  response.writeHead( 405 )
  response.end( '405 Method not allowed.' )
}



/**
 * Set the api default content type
 */
exports.setApiContentType = function( ext ) {
  apiContentType = contentType( ext )
}



/**
 * Set the api object
 */
exports.setApi = function( apiOb ) {
  api = apiOb
}