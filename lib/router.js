//
// Router module for microbi.js
//
//


/**
 *
 *
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

  return {
    fn: apiFunction,
    stream: streamFlag,
    params: pathNode.params,
    mime: mimeAlt
  }
}

/**
 * Splits a path and discards empty elements
 *
 * For example for the path:
 *     stuff/items
 * creates the array:
 *     [ 'stuff', 'items' ]
 */
var getParts = function( path ) {
  return path.split( '/' ).filter(function(el) { return el })
}


/**
 * Takes an array of path pieces, and an api object.
 * finds if there is tree of properties in the api object
 * that correspond to the path pieces.
 * For example, for the array path:
 *     [ 'stuff', 'items' ]
 * it searches the api object tree as follows:
 *     api.stuff.items
 * return the value of the last object in the tree,
 * or null if the properties.
 * Properties of the form "$x", will match any path pieces
 * and will also be returned as path parameters.
 * @todo explain better.
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

/* test exports

*/
