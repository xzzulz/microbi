///////////////////////////////////////////////////////////
//
//   microbi.js
//
///////////////////////////////////////////////////////////
//
// Api server and http server for Node.js
//
//

var fs = require( 'fs' );
var http = require( 'http' )
var https = require( 'https' )
var path = require( 'path' )
var url = require( 'url' )
var mime = require( 'mimemap' ).map

// a couple of functions to route url paths
var router = require( './lib/router.js' )



// The server object. Additional servers can be created with:
//   var another_server = Object.create( microbi )
var microbi = {

  // api routes are stored here
  api: null,

  // global mime type for api ops. Individual ops can override it.
  apiContentType: mime.txt,

  // if the static server is enabled
  staticServer: true,

  // starts the server on port and ip
  start: function( port, ip ) {
    port = port || process.argv[ 2 ] || 8080
    ip = ip || process.argv[ 3 ] || '127.0.0.1'
    var that = this
    this.server = http.createServer(function( request, response ) {
      onRequest( request, response, that.api, that.staticServer, that.apiContentType )
    }).listen( port, ip );
    console.log( 'Server running at ip: ' + ip + ':' + port );
  },

  // starts https server on port and ip.
  // see node documentation for info on options object parameter.
  startHttps: function( options, port, ip ) {
    port = port || process.argv[ 2 ] || 8080
    ip = ip || process.argv[ 3 ] || '127.0.0.1'
    var that = this
    this.server = https.createServer(function( request, response ) {
      onRequest( request, response, that.api, that.staticServer, that.apiContentType )
    }).listen( port, ip );
    console.log( 'Https server running at ip: ' + ip + ':' + port );
  },

  // Sets global mime type for api ops, from a extension name
  // Example: microbi.setMime("txt")
  setMime: function( ext ) {
    this.apiContentType = mime[ext]
  },

}



/**
 * Request responder function. This function is called on each
 * request to the server
 *
 * This is the function that handles incoming requests to the server.
 * It does the next things:
 * - parses the url.
 * - if there is an api op for the url, executes it.
 * - if there is no api op, looks to serve a static file at the given url.
 *
 * @param request  Object  instance of node http.IncomingMessage.
 * @param response  Object  instance of node http.ServerResponse.
 * @param api  Object  container of api ops.
 * @param staticEnabled  boolean  flag is the static server is enabled.
 * @param apiContentType  String  global mime type for api ops.
 */
var onRequest = function( request, response, api, staticEnabled, apiContentType ) {

  // get request method (GET, POST, PUT, etc) and url
  var urlObj = url.parse( request.url, true )

  // collect request data into an object
  requestInfo = {
    method: request.method,    // "GET", "POST", etc
    pathname: urlObj.pathname, // request pathname (i.e: "/stuff/item")
    queryParams: urlObj.query, // url params as key:values in an object
    body: '', // the request body, empty for now
    pathParams: null,
  }

  if ( ! validatePath( requestInfo.pathname ) ) {
    respond404( response )
    return
  }

  if ( api ) {

    // check if there is an api op
    var apiOp = router.getOp( requestInfo, api )

    // streaming api ops are handled here
    if ( apiOp && apiOp.stream ) {
      response.writeHead( 200, {
        'Content-Type': apiOp.mime ? mime[apiOp.mime] : apiContentType
      })
      apiOp.fn( request, response )
      return // request processing completed, exit now.

    // normal (non streaming) api ops are handled here
    } else if ( apiOp ) {

      request.setEncoding( 'utf8' )
      requestInfo.pathParams = apiOp.params
      // collect the whole body before answering
      request.on( 'error', function( e ) {
        console.log('Request Error:', e)
        respond400( response )
      })
      request.on( 'data', function( data ) {
        requestInfo.body += data
      })
      request.on( 'end', function() {
        response.writeHead( 200, {
          'Content-Type': apiOp.mime ? mime[apiOp.mime] : apiContentType
        })
        response.end( apiOp.fn( requestInfo ) )
      })

      return // request processing completed, exit now.
    }
  }

  // If the static server has been disabled, don't look for files to
  // serve. just exit now with a 404 response.
  if ( ! staticEnabled ) {
    respond404( response )
    return
  }

  // If the responder function reaches to here, it means that there is no
  // api method to server. What is left is to check if there is a file
  // to serve at the given path. The static file server only allows for
  // GET request. If the request method is not GET, respond 405 and exit.
  if ( requestInfo.method != 'GET' ) {
    respond405( response )
    return
  }

  serveFile( requestInfo.pathname, request, response )
}



/**
 * Serve a static file
 * @param pathname  String  The path for the file to serve.
 * @param request  Object  instance of node http.IncomingMessage.
 * @param response  Object  instance of node http.ServerResponse.
 */
var serveFile = function( pathname, request, response ) {
  // If the requested path ends in "/", add "index.html"
  if ( pathname[ pathname.length - 1 ] == '/' )
    pathname += 'index.html'

  var fileToServe = '.' + pathname

  // serve file or respond 404 if there is no file
  var readStream = fs.createReadStream( fileToServe )

  readStream.on( 'error', function() {
    respond404( response )
  })
  readStream.once( 'readable', function() {
    var ext = path.extname( fileToServe ).replace( '.', '' )
    response.writeHead( 200, {
      'Content-Type': mime[ext] }
    )
    // connect the file read stream to the response stream, to serve the file
    readStream.pipe( response )
    readStream.on( 'end', function() {
      response.end()
    })
  })
}



// The paths requested to the server must match this regex.
// It will only allow letters, numbers underscore, minus
// sign and dots.
var VALID_PATH_REGEX = /^[\./_\-\d\w]*$/

// The path isn't allowed to contain ".." or "/." or "//"
var DISALLOWED_PATH_REGEX = /(\.\.)|(\/\.)|(\/\/)/

/**
 * Validate the path
 *
 * Returns true if the path is valid. False otherwise.
 * @param path  String  path to test.
 * @return boolean
 */
var validatePath = function( path ) {
  if ( DISALLOWED_PATH_REGEX.test( path ) ) return false
  return VALID_PATH_REGEX.test( path )
}



/**
 * Emit a 404 response
 * @param response  Object  instance of node http.ServerResponse.
 */
var respond404 = function( response ) {
  response.writeHead( 404, { 'Content-Type': mime.txt } )
  response.end( '404 Not found.' )
}



/**
 * Emit a 405 response: method not allowed
 * @param response  Object  instance of node http.ServerResponse.
 */
var respond405 = function( response ) {
  response.writeHead( 405, { 'Content-Type': mime.txt } )
  response.end( '405 Method not allowed.' )
}



/**
 * Emit a 400 response: Bad request
 * @param response  Object  instance of node http.ServerResponse.
 */
var respond400 = function( response ) {
  response.writeHead( 400, { 'Content-Type': mime.txt } )
  response.end( '400 Bad request.' )
}



module.exports = microbi

if ( ! module.parent ) {
  microbi.start( 55555 )
}
