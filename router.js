


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



exports.route = function( routes, apiRef ) {

  for ( var i = 0; i < routes.length; i++ ) {
    var route = routes[ i ];
    apiRef = apiRef.hasOwnProperty( route ) ? apiRef[ route ] : null
    if ( ! apiRef ) break
  }
  if ( apiRef ) return apiRef
    else return null
}