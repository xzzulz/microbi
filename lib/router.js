//
// Router module for microbi.js
//
// 

/**
 * Takes a path and request method name, and creates a route array.
 * 
 * For example for the path:
 *     stuff/items
 * creates the array:
 *     [ 'stuff', 'items', 'GET' ]
 * Note that the method name (GET) is placed as the last item.
 * This array format will be used to search for api definitions.
 */
exports.getRoutes = function( path, method ) {
  var routes = path.split( '/' )
  // remove the empty first element
  routes.shift()
  // if the last path is "", discard it
  if ( ! routes[ routes.length - 1 ] ) routes.pop()
  // attach the method as the last item
  routes.push( method )
  return routes
}


/**
 * Takes an array path, and searches for a function stored in
 * the api object under that path.
 * If there is a function, it means that the given path has
 * an api method defined. Then it returns the function.
 * For example, for the array path:
 *     [ 'stuff', 'items', 'GET' ]
 * it searches for a function defined on the api object at:
 *     api.stuff.items.GET
 */
exports.route = function( routes, apiRef ) {
  for ( var i = 0; i < routes.length; i++ ) {
    var route = routes[ i ];
    apiRef = apiRef.hasOwnProperty( route ) ? apiRef[ route ] : null
    if ( ! apiRef ) break
  }
  if ( apiRef && typeof apiRef == 'function' ) return apiRef
    else return null
}