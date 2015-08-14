
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

### Static server

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

To use as an api server, create a script file where you define your
api, and launch the server. Require microbi on it. An example Api
script is provided:

     apiServer_example.js

To define an api you need to create an api object with routes and functions.
For example:
```javascript
     var microbi = require('microbi')
     var api = {}
     api.stuff = {}
     api.stuff.items = {}
     
     api.stuff.items.GET = function( reqUrl ) {
       return 'Hello World!'
     }

     microbi.setApi( api )
     microbi.server()
```
Run that with node. Then on the path:

     theHost/stuff/items

For Get request methods, it will server what the function returns:

     Hello World!

Read the source code for more details. It has descriptive comments.

