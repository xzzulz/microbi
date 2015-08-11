


exports.getRoutes = function( path, method ) {
  var paths = path.split( '/' )
  // replace the empty first element with the method
  paths[0] = method
  // if the last path is "", discard it
  console.log('length', paths.length)
  if ( paths[ paths.length - 1 ] == "" ) paths.pop()
  return paths
}



exports.route = function( routes, apiRef ) {

  for (var i = 0; i < routes.length; i++) {
    var route = routes[i];
    apiRef = apiRef.hasOwnProperty( route ) ? apiRef[ route ] : null
    if ( ! apiRef ) break
  }
  if ( apiRef.action ) return apiRef
    else return null
}