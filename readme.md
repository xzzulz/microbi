
![microbi](http://lignixz.github.io/microbi/img/microbi.png)

# microbi.js
v0.4.4 (beta)

Minimalist api server and static http server for Node.js.

## Overview

Microbi is a basic minimal static http server and api server. It allows
to easily serve static files and javascript api functions from a single
tool. Which may be good for having a simple setup for locally installed apps,
or for development, prototyping, and/or production of low traffic web apps.

It can be installed with npm, as a global command.
It is a single file with no dependencies, so it can also be used easily
even without any installation. Just put the microbi.js file in the same
folder and use with the shell comand: 

     node microbi.js [optional-port-number]

It supports just the essential mime types. Edit the source to add more
if required.

license (MIT)

## Features

* Can work as an api server and/or static server.
* Api ops use a global mime type, individual ops can override it.
* Api ops support streams.
* Allows to set up multiple servers.
* All server features are supported by test cases. (revision pending)

## Documentation

Microbi has three ways to use:
- Installed globally, the microbi command can be used to launch
  static servers on any folder.
- Use `require('microbi')` and can be used as an api server and/or
  static server.
- no installation server: put microbi.js file on the folder to
  serve, and shell: `node microbi.js [port-number]`

### Global command: static server

Install globally

     npm install -g microbi

Go to the folder that you want to serve:

     cd some/folder/toServe

Launch the static server with the global command:

     microbi

Ready! the static server is active.

Optionally pass a port number. Serve the current folder on port 50000:

     microbi 50000

Optionally pass a port and IP to the microbi command. The defaults
are port: 8080, ip: 127.0.0.1

     microbi 50000 0.0.0.0

### Api server

To use as an api server, create a script file where you define an
api, and launch the server. Require microbi on it. An example Api
script is provided:

     apiServer_example.js

To define an api, install microbi if it is not installed. Either globally
or locally:

     npm install microbi

Create a script file, similar to the mentioned example file above.
The first step is to require microbi in the script. Then create an
"api object", where the routes and methods to call will be defined.
Once the api object is ready, pass it to microbi.
For example:

```javascript
     var microbi = require( 'microbi' )

     // create the api object
     var api = {}
     microbi.api = api

     // define routes as properties
     api.stuff = {}
     api.stuff.items = {}

     // api operations are functions
     // the request method goes at the end of the route
     api.stuff.items.GET = function( reqUrl ) {
       return 'Hello World!'
     }

     // start the server
     microbi.start()
```

Run with node. Then pointing the browser to the path:

     someHost/stuff/items

For Get request methods, it will serve whatever the function returns:

     Hello World!


## Reference

Microbi object: get an instance of the microbi object with require:
```javascript
     var microbi = require( 'microbi' )
```
### Microbi properties and methods

#####     microbi.start( [port], [ip] )
Starts a microbi server with the optional port and ip address.
If these are not provided, defaults to port 8080, ip 127.0.0.1

#####     microbi.startHttps( [port], [ip] )
Starts an https microbi server with the optional port and ip address.
If these are not provided, defaults to port 8080, ip 127.0.0.1

#####     microbi.setMime( extension )
Sets the default api content type from the provided extension.
For example, pass "txt" to set content type to "text/plain"

#####     microbi.api
Defaults to null. set it to the api object to use. A generic object
containing routes and api functions. Url paths will be mapped to
functions in this object. For example, the path:

     exampleHost/user/items

for a GET request, will be mapped to the next function on the api object:

     microbi.api.user.items.GET

If there is a function there, it will be called, and whatever it returns
will be the server response.

#####     microbi.staticServer
Boolean, defaults to true. If this is set to false, microbi the static server
will be disabled, and microbi will only try to function as an api server.
Requests that don't match an api op, will be answered with 404.

### Defining api ops

Api ops are defined by setting up functions on a tree of properties,
on the api object: `microbi.api` Property names on the tree, will match
paths on the url. The api ops response is what the function returns.
Useful request data is available in the info parameter.
For example:
```javascript
     microbi.api.stuff.items.POST = function( info ) {
       return 'Hello World!'
     }
```
This api op will respond with "Hello World!" to incoming requests
with the POST method, to the path: host.com/stuff/items
When there is no defined api that matches the path, microbi will
try to look for a static file to serve under that path.

Api ops get the info object as parameter. Its content is described in the
next section.

#### Properties of the info parameter

##### info.method (String)
  Name of the request method in uppercase.<br>
  Examples:<br>
  `"GET"`, `"POST"`, `"PUT"`, etc.


##### info.pathname (String)
  The request pathname. The part of the url that goes after the host,
  and before the query string.<br>
  Example:<br>
    request url: `example.com/stuff/items?a=1&b=2`<br>
    info.pathname: `"/stuff/items"`


##### info.queryParams (Object)
  An object containing name - value pairs, for each of the query parameters.<br>
  Example:<br>
    request url: `example.com/stuff/items?a=1&b=2`<br>
    info.queryParams: `{ a: 1, b: 2 }`


##### info.body (String)
  The complete content of the request body as a string.


##### info.pathParams (Array)
  pathParams are a way of matching any path parts in a path, and returning
  them as a parameters.<br>
  Example:<br>
  when an api method is defined with one of its paths as "$x", it will
  match any path piece, and return it as an element of the pathParams
  array.<br>
    request url: `example.com/stuff/items/11523`<br>
    api op defined at: `microbi.api.stuff.items.$x.GET`<br>
    The code `$x` matches `11523`, and it is returned in the array<br>
    info.pathParams: `[ "11523" ]`


### Overriding the default mime type for api ops

To specify a different mime type than the default one for an api op,
set a property with a name composed of:
  the request method, a colon, and the word mime.
Set it to the extension name of the mime type:
For example:
```javascript
     api.stuff.items.["POST:mime"] = "html"
```
The above definition, will make the api op
```javascript
     api.stuff.items.POST
```
To get a mime type of "text/html".

#### Alternate options: Using streams on api functions

There is the option to get Node stream objects as parameters on api functions.
For this, set a "stream" flag on the api op, as follows:
```javascript
     api.stuff.items.["POST:stream"] = true
```
The above will flag the `api.stuff.items.POST` api op as streaming.
Api functions that have this flag set, will not get the info
object as parameter. Instead these api functions will get the
request and response node stream objects as follows:
```javascript
     api.stuff.items.POST = function( request, response ) {
       return 'Hello World!'
     }
```
`request` and `response` are the same parameters that nodejs http server
callback functions gets on each request. Parameter `request` is an instance
of Node http.IncomingMessage, and `response` is an instance of Node
http.ServerResponse. See: https://nodejs.org/api/http.html#http_event_request
