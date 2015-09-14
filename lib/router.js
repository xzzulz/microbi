//
// Router module for microbi.js
//
//


/**
 * Search the api object for a defined api op, for a server request.
 *
 * @param requestInfo  Object  describes the incoming request.
 * @param api  Object  Where api ops are stored.
 * @return Object  An object containing the api op and data.
 */
exports.getOp = function( requestInfo, api ) {
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
var getParts = function( path ) {
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
var getPathNode = function( paths, api ) {
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
