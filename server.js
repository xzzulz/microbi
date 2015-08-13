//
//   microbi.js api definition example
//
//
// This is an example file for how to define api methods for
// microbi.js. This file is not used by microbi. A file like this
// is not required to run microbi as http server only, without 
// using the api functionality.
//
// How to use microbi as an api server
// -----------------------------------
//
// To use microbi as an api server, create a file based on this one.
// On it, define api routes and methods on an "api object".
// Require and set up microbi from it, and run the file with node.
//
// To define an api for microbi, add properties and methods 
// to a generic object, usually called "api", and refered as the
// "api object" by microbi documentation. Pass that object
// to the method microbi.setApi( api ).
//
// Each api operation to be defined, requires a function.
// When the api operation is called, the function will be executed,
// and what it returns, will be set as the response of the api call.
//
// Api routes consist of a tree of properties on the api object.
// For example to make a GET request on the url path:
//    /stuff/items
// The api object should have a function defined on the properties:
//    api.stuff.items.GET
// a function should be there, and it will be called on each
// request to that url path. The last property name of an
// api method is the request method (GET, POST, etc)
//
// The function will be called with two parameters:
// - The request url object, as returned by the node standard
//   function  url.parse. (With the query parameters parsed)
// - The request message body. (for request methods that have it.)
//



// The first step is to require microbi from the file
// update the path to macth the microbi file location
var microbi = require('microbi')




// Create an api object to define the api
var api = {}

// set the object as the api for microbi
microbi.setApi( api )

// set the default content type (text, json, etc)
// This defaults to text, so in this case the call is superfluous.
microbi.setApiContentType( 'txt' )

// define routes as a tree of properties 
api.stuff = {}
api.stuff.items = {} 

// this api function will be called on GET method with the url path:
//    /stuff/items
api.stuff.items.GET = function( reqUrl ) {
  return 'Hello World! - api.stuff.items.GET'
}

api.stuff.items.POST = function( reqUrl, requestBody ) {
  return 'Hello World! - api.stuff.items.POST'
}

api.stuff.items.DELETE = function( reqUrl ) {
  return 'Hello World! - api.stuff.items.DELETE'
}

api.stuff.items.PUT = function( reqUrl, requestBody ) {
  return 'Hello World! - api.stuff.items.PUT'
}

// start the server
microbi.server()