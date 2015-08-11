var http = require( 'http' )
var url = require( 'url' )
var fs = require( 'fs' );
var path = require( 'path' )

var contentType = require( './contentType.js' )






// optionally define api methods
var api = {}




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

  // static server only allows GET requests
  if (method != 'GET') {
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


/*
  var paths = pathname.split('/')
  paths.shift()
  if (paths[paths.length - 1] == "") paths.pop()
  console.log('## paths', paths)
*/



/*
  if (api[pathname])
    api[pathname]()
  else
    serveFile(pathname)
*/

}

var server = function() {
  http.createServer( onRequest ).listen( 55555, '127.0.0.1' );
  console.log( 'Server running at http://127.0.0.1:55555/' );
}

module.exports = {
  server: server,
  api: api
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
function validatePath( path ) {
  if ( DISALLOWED_REGEX.test( path ) ) return false
  return PATH_REGEX.test( path )
}



/**
 * Emit a 404 response
 */
function respond404( response ) {
  response.writeHead( 404 )
  response.end( '404 Not found.' )
}



/**
 * Emit a 405 response: method not allowed
 * 
 * The static server only allows GET requests
 */
function respond405( response ) {
  response.writeHead( 405 )
  response.end( '405 Method not allowed.' )
}

