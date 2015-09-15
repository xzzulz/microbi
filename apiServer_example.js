//
//   microbi.js api definition example
//
//
// Example script on how to define an api for microbi.
//
// To use microbi as an api server, create a script similar to this one.
// Define api routes and methods on microbi "api" property.
//
// Each api operation to be defined is a function.
// When the api operation is called, the function will be executed,
// and whatever it returns, will be set as the response of the api call.
//
// Api routes consist of a tree of properties on the api property.
// For example to make a GET request on the url path:
//
//    /stuff/items
//
// The api property should have a function defined on the properties:
//
//    microbi.api.stuff.items.GET = function() {...}
//
// a function should be there, and it will be called on each
// request to that url path. The last property name of an
// api method is the request method (GET, POST, etc)
//
// The function will be called with a single parameter. An object
// containing request info. Consult the docs for more details.



// The first step is to require microbi from the file
// update the path to macth the microbi file location
var microbi = require('./microbi.js')



// Create an api object to define the api
var api = {}
microbi.api = {}


// set the default content type (text, json, etc)
// This defaults to text, so in this case the call is superfluous.
microbi.setMime( 'txt' )

// define routes as a tree of properties
api.stuff = {}
api.stuff.items = {}


// Example 1
// A simple hello world request
// ============================
// Whatever the api functions returns, that will be the response
// to a request.
//
//            url: http://example.com/stuff/items
// request method: GET
//       response: Hello World!
api.stuff.items.GET = function( info ) {
  return 'Hello World!'
}


// Example 2
// The request info object
// =======================
// The info object contains useful data.
//
//            url: http://example.com/stuff/items
// request method: POST
//       response: "/stuff/items"
api.stuff.items.POST = function( info ) {
  console.log( info.pathname )     // outputs: /stuff/items
  console.log( info.method )       // outputs: POST
  console.log( info.queryParams )  // outputs: {}
  console.log( info.pathParams )   // outputs: []
  console.log( info.body )         // outputs: the request body
  return info.pathname
}


// Example 3
// query parameters
// ================
// queryParams object contain the url parameters as name value pairs.
//
//            url: http://example.com/stuff/items?a=1&b=2
// request method: GET
//       response: "2"
api.stuff.items.GET = function( info ) {
  console.log( info.queryParams )  // outputs: { a:1, b:2 }
  return info.queryParams.b
}


// Example 4
// Two path parameters
// ===================
// $x paths will match any value, and store it as a path parameter,
// in the pathParams array.
//
//            url: http://example.com/stuff/sales/16545
// request method: PUT
//       response: "16545"
api.stuff.$x = {}
api.stuff.$x.$x = {}
api.stuff.$x.$x.PUT = function( info ) {
  console.log( info.pathParams )  // outputs: [ "sales", "16545" }
  return info.pathParams[1]
}


// start the server
microbi.start()
