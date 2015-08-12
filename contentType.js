// content types
var contentTypes = {
  html: 'text/html',
  txt: 'text/plain',
  png: 'image/png',
  js: 'application/x-javascript',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  css: 'text/css',
  ico: 'image/x-icon'
}


/**
 * Get content type from the extension name
 */
module.exports = function getContentType( ext ) {
    
  // remove leading dot from extension, then search
  // for a content type. If there isn't one, use text/plain
  return contentTypes[ ext.replace( '.', '' ) ] || contentTypes[ 'txt' ]

}