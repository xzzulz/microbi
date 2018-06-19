///////////////////////////////////////////////////////////
//
//   microbi.js
//
///////////////////////////////////////////////////////////
//
// Api server and http server for Node.js
//
//

var fs = require( 'fs' )
var http = require( 'http' )
var https = require( 'https' )
var path = require( 'path' )
var url = require( 'url' )



// supported mime types.
// add more if needed.
const mime = {
  'css': 'text/css',
  'gif': 'image/gif',
  'htm': 'text/html',
  'html': 'text/html',
  'ico': 'image/x-icon',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpeg',
  'js': 'application/javascript',
  'json': 'application/json',
  'mpeg': 'video/mpeg',
  'png': 'image/png',
  'pdf': 'application/pdf',
  'rar': 'application/x-rar-compressed',
  'rtf': 'application/rtf',
  'svg': 'image/svg+xml',
  'ttf': 'font/ttf',
  'txt': 'text/plain',
  'wav': 'audio/x-wav',
  'weba': 'audio/webm',
  'webm': 'video/webm',
  'webp': 'image/webp',
  'woff': 'font/woff',
  'woff2': 'font/woff2',
  'xhtml': 'application/xhtml+xml',
  'xml': 'application/xml',
  'zip': 'application/zip',
  '3gp': 'video/3gpp',
  '3g2': 'video/3gpp2'
  }



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
    this.server = http.createServer( function( request, response ) {
      onRequest( request, response, that.api, that.staticServer, that.apiContentType )
    }).listen( port, ip );
  },

  // starts https server on port and ip.
  // see node documentation for info on options object parameter.
  startHttps: function( options, port, ip ) {
    port = port || process.argv[ 2 ] || 8080
    ip = ip || process.argv[ 3 ] || '127.0.0.1'
    var that = this
    this.server = https.createServer( function( request, response ) {
      onRequest( request, response, that.api, that.staticServer, that.apiContentType )
    }).listen( port, ip );
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

  var ext = path.extname( fileToServe ).replace( '.', '' )
  let mimeExt = mime[ext]

  // if there is no mime type, check if it could be a directory
  if ( !mimeExt ) {
    let file = fs.openSync( fileToServe, 'r' )
    let is_dir = fs.fstatSync( file )
    if ( is_dir ) {
      redirect301( response, pathname + '/' )
      return
    }
  }

  // serve file or respond 404 if there is no file
  var readStream = fs.createReadStream( fileToServe )

  readStream.on( 'error', function() {  
    respond404( response )
    return
  })
  readStream.once( 'readable', function() {   
    response.writeHead( 200, {
      'Content-Type': mimeExt }
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
 * Emit a 301 response: moved permanently
 * @param response  Object  instance of node http.ServerResponse.
 * @param location  string  redirect url.
 */
var redirect301 = function( response, location ) {
  response.writeHead( 301, { 'Location': location } )
  response.end()
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

// if it is not being run from node, launch the server
if ( ! module.parent ) {
  microbi.start( 8080 )
}



//
// Router functions
//
const router = {}


/**
 * Search the api object for a defined api op, for a server request.
 *
 * @param requestInfo  Object  describes the incoming request.
 * @param api  Object  Where api ops are stored.
 * @return Object  An object containing the api op and data.
 */
router.getOp = ( requestInfo, api ) => {
  var routeParts = getParts( requestInfo.pathname )
  if ( ! routeParts.length ) return null

  var pathNode = getPathNode( routeParts, api )
  if ( ! pathNode.node ) return null

  var apiFunction = pathNode.node[ requestInfo.method ]
  if ( ! apiFunction ) return null

  var streamFlag = pathNode.node[ requestInfo.method + ':stream' ]
  var mimeAlt = pathNode.node[ requestInfo.method + ':mime' ]

  // return an object with api op data
  return {
    fn: apiFunction, // function, or null if there was no api op found
    stream: streamFlag, // boolean flag, indicating streaming ops.
    params: pathNode.params, // array, with path parameters if any
    mime: mimeAlt // alternative mime type, if the op had one defined.
  }
}



/**
 * Splits a path and discards empty elements
 *
 * For example for the path:
 *     stuff/items
 * creates the array:
 *     [ 'stuff', 'items' ]
 * @param path  String  path, example: "/some/path"
 * @return Array  path pieces (strings)
 */
router.getParts = ( path ) => {
  return path.split( '/' ).filter(function(el) { return el })
}



/**
 * Takes an array of path pieces, and an api object.
 * finds if there is a tree of properties in the api object
 * that correspond to the path pieces.
 * For example, for the array path:
 *     [ 'stuff', 'items' ]
 * it searches the api object tree as follows:
 *     api.stuff.items
 * return the value of the last object in the tree,
 * or null if the required properties are not defined.
 * Properties of the form "$x", (if any) will match any path piece,
 * and will be returned as path parameters, in an array.
 *
 * @param paths  array  the path pieces.
 * @param api  Object  were the api functions are stored.
 * @return Object  with api node and an array of path params.
 */
router.getPathNode = ( paths, api ) => {
  var apiNode = api, paramNode, urlParams = []
  for (var i in paths) {
    paramNode = apiNode.$x
    apiNode = apiNode[ paths[i] ]
    if ( ! apiNode && paramNode ) {
      apiNode = paramNode
      urlParams.push( paths[i] )
    }
    if ( ! apiNode ) return { node: null, params: null }
  }
  return { node: apiNode, params: urlParams }
}