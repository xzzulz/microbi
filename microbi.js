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





// The api object
//
// This object is where the api routes are stored. It is only used when the
// Api server functionality is used. The router tries to match properties
// of this object to url paths. For example, the path:
//     stuff/items
// is mapped to a tree of properties in the api object as follows:
//     api.stuff.items.GET
//
// Note that the request method (GET in this case), is added as the last
// property name.
// If the api object if left empty, (no properties added) then the server
// will not match any api methods, and will work as a http static server only.
var api = null

// default Api content type is txt
// This is used to set the mime type for api requests.
// There is a function to set this.
var apiContentType = mime.txt

// Flag to enable or disable the static http server.
// This can be set to false to use microbi as an api server only.
// To use as an api server only, define an api from an external file,
// and use the provided method to set this flag to false.
var staticServer = true


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
 * - If a file is found, set the corresponding content type and serves
 *   the file.
 */
var onRequest = function( request, response ) {

  // get request method (GET, POST, PUT, etc) and url
  var urlObj = url.parse( request.url, true )

  // collect request data into an object
  requestInfo = {
    method: request.method,    // "GET", "POST", etc
    pathname: urlObj.pathname, // request pathname (i.e: "/stuff/item")
    queryParameters: urlObj.query, // url params as key:values in an object
    body: '', // the request body, empty for now
  }

  if ( ! validatePath( requestInfo.pathname ) ) {
    respond404( response )
    return
  }


  // this section handles api request.
  // Only used if there is an api defined.
  if ( api ) {

    var apiOp = router.getOp( requestInfo, api )

    if ( apiOp && apiOp.stream ) {
      apiOp.fn( request, response )
    // If the "stream" property is not set, call the function with the
    // request url and the complete request message body as parameters.
    } else if ( apiOp ) {
      // collect the whole body before answering
      request.setEncoding( 'utf8' )
      request.on( 'data', function( data ) {
        requestInfo.body += data
      })
      // when the incoming message body is complete, call the defined
      // api method for this request
      request.on( 'end', function() {
        response.writeHead( 200, { 'Content-Type': apiContentType } );
        // call the api method, passing as parameter the url object,
        // and the incoming message body
        response.end( apiOp.fn( requestInfo ) )
      })

      return
    }
  }

  // If the static server has been disabled, don't look for files to
  // serve. just exit now with a 404 response.
  if ( ! staticServer ) {
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

  serveFile( requestInfo, request, response )
}



/**
 *
 */
var serveFile = function( requestInfo, request, response ) {
  // If the requested path ends in "/", add "index.html"
  if ( requestInfo.pathname[ requestInfo.pathname.length - 1 ] == '/' )
    requestInfo.pathname += 'index.html'

  var fileToServe = '.' + requestInfo.pathname

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



/**
 * Starts the server.
 *
 * Parameters:
 * Port and ip are taken from the first available of these:
 * - function parameters
 * - command line parameters
 * - defaults to 127.0.0.1:8080
 */
var server = function( port, ip ) {
  port = port || process.argv[ 2 ] || 8080
  ip = ip || process.argv[ 3 ] || '127.0.0.1'
  http.createServer( onRequest ).listen( port, ip );
  console.log( 'Server running at ip: ' + ip + ':' + port );
}

// export the server function, for use in external scripts
exports.server = server

// run server if not being required from external file.
// When the microbi file is being run directly with node:
//    node microbi.js
if ( ! module.parent ) server()



/**
 * Starts https server.
 *
 * Parameters:
 * Options is an object with key and certificate, as described
 * in node api docs for https.createServer method.
 * Port and ip are taken from the first available of these:
 * - function parameters
 * - command line parameters
 * - defaults to 127.0.0.1:8080
 */
var httpsServer = function( options, port, ip ) {
  port = port || process.argv[ 2 ] || 8080
  ip = ip || process.argv[ 3 ] || '127.0.0.1'
  https.createServer( options, onRequest ).listen( port, ip );
  console.log( 'Https server running at ip: ' + ip + ':' + port );
}

// export the server function, for use in external scripts
exports.httpsServer = httpsServer



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
  apiContentType = mime[ext]
}



/**
 * Set the api object.
 * This is used to set api routes.
 */
exports.setApi = function( apiOb ) {
  api = apiOb
}



/**
 * Disable the static file server.
 * This allows to use microbi as an api server only.
 * This is for the cases when microbi is used as an api server
 * only, and the static server is not needed.
 */
exports.disableStaticServer = function() {
  staticServer = false
}
