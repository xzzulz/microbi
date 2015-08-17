
![microbi](http://nzonbi.github.io/microbi/img/microbi.png)

# microbi.js
v0.3.1

Minimalist API server and static http server for Node.js.

## Overview

Microbi is a minimalist http server and API server, that is easy to
modify and customize. Created it because I like tools that are as
simple as possible. Also to have some fun and to learn.

license (MIT)

## Documentation

The source code has detailed comments.

Microbi has two ways to use: 
- Installed globally, the microbi command can be used to launch a
  static server on any folder.
- Use `require('microbi')` and define an api to use as an api server
  and static server.     

### Global command: static server

Install globally

     npm install -g microbi

Go to the folder that you want to serve:

     cd some/folder/toServe

Launch the static server with the global command:

     microbi

Ready! the static server is active.

Optionally pass a port and IP to the microbi command. The defaults
are port: 8080, ip: 127.0.0.1

     microbi 50000 0.0.0.0

### Api server

To use as an api server, create a script file where you define an
api, and launch the server. Require microbi on it. An example Api
script is provided:

     apiServer_example.js

To define an api, install microbi if it is not installed:

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
     microbi.setApi( api )

     // define routes as properties
     api.stuff = {}
     api.stuff.items = {}

     // api operations are functions
     // the request method goes at the end of the route
     api.stuff.items.GET = function( reqUrl ) {
       return 'Hello World!'
     }

     // start the server
     microbi.server()
```

Run with node. Then pointing the browser on the path:

     theHost/stuff/items

For Get request methods, it will server what the function returns:

     Hello World!

Read the source code for more details. It has descriptive comments.

## Reference

After requiring microbi, the next methods are available
```javascript
     var microbi = require( 'microbi' )
```
####     microbi.server( [port], [ip] )
Starts the microbi server with the optional port and ip address.
If these are not provided, defaults to port 8080, ip 127.0.0.1

####     microbi.setApiContentType( ext )
Sets the default api content type from the provided extension.
For example, pass "txt" to set content type to "text/plain"

####     microbi.setApi( api )
Sets the api object to use. the api object is a generic object containing
routes and api functions. url paths will be mapped to functions in this
object. For example, the path:
     www.exampleHost.com/user/items
for a GET request, will be mapped to the next function on the api object:
     api.user.items.GET
If there is a function there, it will be called, and whatever it returns
will be the server response.

####     microbi.disableStaticServer()
call this method once to disable the static server, and use only the api
server functionality.

### Api functions

Defined api function:
```javascript
     api.stuff.items.POST = function( reqUrl, requestBody ) {
       return 'Hello World!'
     }
```
 get the following parameters:
 
- reqUrl: An url object returned by Node url.parse method
- requestBody: The complete request body message, if there is one.
  Note that some http methods (GET, DELETE) don't have request body.
  
#### Alternate option: Using streams in api function

There is the option to get Node stream objects as parameter on api function.
For this, set a "stream" flags directly on the api function:
```javascript
     api.stuff.items.POST.stream = true
```
Api functions that have this flag set, will get not get the reqUrl and
requestBody as parameter. Instead these api functions will get the
request and response stream objects as follows:
```javascript
     api.stuff.items.POST = function( request, response ) {
       return 'Hello World!'
     }
```
`request` and `response` are the same parameters that nodejs http server
callback functions gets on each request. Parameter `request` is an instance
of Node http.IncomingMessage, and `response` is an instance of Node
http.ServerResponse. See: https://nodejs.org/api/http.html#http_event_request


