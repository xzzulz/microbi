var http = require('http')
var url = require('url')
var fs = require('fs');
var path = require('path')


// module.exports =



// optionally define api methods
var api = {}


var onRequest = function ( request, response ) {

  var method = request.method
  var reqUrl = url.parse( request.url, true )

  var pathname = reqUrl.pathname


  // validate path
  if ( ! validatePath( pathname ) ) {
    respond404( response )
    return
  }

  // serve file
  var fileToServe = ''
  
  if ( pathname == '/' ) {
    fileToServe = 'index.html'
  } else {
    fileToServe = '.' + pathname
  }



  // serve file
  console.log( 'serving ' + fileToServe )

  var readStream = fs.createReadStream( fileToServe )

  readStream.on( 'error', function() {
    respond404( response )
  })

  // set content type header
  setContentType( fileToServe, response )

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








// regexp to validate file paths
var PATH_REGEX = /^[\./_\-\d\w]*$/

/**
 * Validate the path
 */
function validatePath( path ) {
  return PATH_REGEX.test( path )
}

/**
 * Validate the path
 */
function respond404( response ) {
  response.writeHead( 404 )
  response.end( '404 Not found.' )
  console.log('404 not found')
}


// content types
var contentTypes = {
  html: 'text/html',
  txt: 'text/plain',
  png: 'image/png',
  js: 'application/x-javascript',
  jpg: 'image/jpeg',
  gif: 'image/gif',
  css: 'text/css'
}


/**
 * Set the extension name
 */
function setContentType( pathname, response ) {
  
  console.log('## setContentType')
  console.log('pathname', pathname)
  
  // remove the leading dot from the extension
  var ext = path.extname( pathname )
  
  console.log( 'ext', ext )
  
  if ( ! ext ) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    return
  }
  // remove leading dot
  ext = ext.substring( 1, ext )
  
  var contentType = contentTypes[ ext ]   
  if ( ! contentType ) contentType = contentTypes[ 'txt' ]
}