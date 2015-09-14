//
//
//     Microbi Spec
//
//
//
//
//



describe( "Microbi", function() {

  var http = require( "http" )
  var querystring = require( "querystring" )
  var microbi = require( "../microbi.js" )



  beforeAll( function() {
    microbi.start( 55555 )
  })



  beforeEach( function() {

  });



  describe( "Static file server", function() {
    var staticFileUrl = "http://localhost:55555/spec/support/test_data.txt"
    var notFounfFileUrl = "http://localhost:55555/spec/support/no_file.txt"

    it( "should serve static files", function( done ) {

      http.get( staticFileUrl, function( res ) {
        var body = ""
        res.on( "data" , function ( chunk ) {
          body += chunk
        });
        res.on( "end", function() {
          expect( res.statusCode ).toEqual( 200 );
          expect( res.headers["content-type"] ).toEqual( "text/plain" );
          expect( body ).toEqual("abc\n123\n" );
          done()
        })
      }).on( "error", function( e ) {
        fail( "Request Error" )
      });

    });

    it( "should answer 404 for not found files", function( done ) {

      http.get( notFounfFileUrl, function( res ) {
        var body = ""
        res.on( "data", function ( chunk ) {
          body += chunk
        });
        res.on( "end", function() {
          expect( res.statusCode ).toEqual( 404 );
          expect( res.headers["content-type"] ).toEqual( "text/plain" );
          expect( body ).toEqual( "404 Not found." );
          done()
        })
      }).on( "error", function( e ) {
        fail( "Request Error" )
      });

    });

  })



  describe( "Api server", function() {
    var helloUrl = "http://localhost:55555/test/hello"
    var staticFileUrl = "http://localhost:55555/spec/support/test_data.txt"
    var notFoundFileUrl = "http://localhost:55555/spec/support/no_file.txt"
    var getInfoUrl = "http://localhost:55555/test/info"
    var pathParamsUrl = "http://localhost:55555/test/pathParams/123/abc"
    var mimeAltUrl = "http://localhost:55555/test/mimeAlt"

    beforeAll( function() {
      var api = {}
      microbi.api = api
      microbi.setMime( "txt" )

      api.test = {}
      api.test.hello = {}

      api.test.hello.GET = function( info ) {
        return "hello"
      }
      api.test.hello.POST = function( info ) {
        return "hello"
      }
      api.test.info = {}
      api.test.info.GET = function( info ) {
        return JSON.stringify( info )
      }
      api.test.mirrorBody = {}
      api.test.mirrorBody.POST = function( info ) {
        return info.body
      }
      api.test.pathParams = {}
      api.test.pathParams.$x = {}
      api.test.pathParams.$x.$x = {}
      api.test.pathParams.$x.$x.GET = function( info ) {
        return JSON.stringify( info )
      }
      api.test.mimeAlt = {}
      api.test.mimeAlt["GET:mime"] = "html"
      api.test.mimeAlt.GET = function( info ) {
        return "<div>some html</div>"
      }
    });



    it( "should answer this http GET request with hello", function( done ) {

      http.get( helloUrl, function( res ) {
        var body = ""
        res.on( "data", function ( chunk ) {
          body += chunk
        });
        res.on( "end", function() {
          expect( res.statusCode ).toEqual( 200 );
          expect( res.headers["content-type"] ).toEqual( "text/plain" );
          expect( body ).toEqual( "hello" );
          done()
        })
      }).on( "error", function( e ) {
        fail( "Request Error" )
      });
    });



    it( "should respond 404 when a file is not found", function( done ) {

      http.get( notFoundFileUrl, function( res ) {
        var body = ""
        res.on( "data", function ( chunk ) {
          body += chunk
        })
        res.on( "end", function() {
          expect( res.statusCode ).toEqual( 404 );
          expect( res.headers["content-type"] ).toEqual( "text/plain" );
          expect( body ).toEqual( "404 Not found." );
          done()
        })
      }).on( "error", function( e ) {
        fail( "Request Error" )
      });

    });



    it( "should answer this http POST request with hello", function( done ) {

      var req = http.request({
        hostname: "localhost",
        port: 55555,
        path: "/test/hello",
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          "Content-Length": 0
        }
      }, function( res ) {
        var body = ""
        res.on( "data", function ( chunk ) {
          body += chunk
        })
        res.on( "end", function() {
          expect( res.statusCode ).toEqual( 200 );
          expect( res.headers["content-type"] ).toEqual( "text/plain" );
          expect( body ).toEqual( "hello" );
          done()
        })
        res.on( "error", function ( e ) {
          fail( "Server error" )
        })
      })
      req.on("error", function(e) {
        fail( "Request error" )
      });
      req.end()

    });



    it( "should try to serve static file, " +
      "if there is no api function defined for a path", function( done ) {

      http.get( staticFileUrl, function( res ) {
        var body = ""
        res.on( "data" , function ( chunk ) {
          body += chunk
        });
        res.on( "end", function() {
          expect( res.statusCode ).toEqual( 200 );
          expect( res.headers["content-type"] ).toEqual( "text/plain" );
          expect( body ).toEqual( "abc\n123\n" );
          done()
        })
      }).on( "error", function( e ) {
        fail( "Request Error" )
      });

    });



    it( "should try to find a defined api function first, if not," +
      "then look for a static file, and if none is found neither, " +
      "then it should respond 404 not found", function( done ) {

      http.get( notFoundFileUrl, function( res ) {
        var body = ""
        res.on( "data", function ( chunk ) {
          body += chunk
        });
        res.on( "end", function() {
          expect( res.statusCode ).toEqual( 404 );
          expect( res.headers["content-type"] ).toEqual( "text/plain" );
          expect( body ).toEqual( "404 Not found." );
          done()
        })
      }).on( "error", function( e ) {
        fail( "Request Error" )
      });

    });


    it( "should provide request info to api methods", function( done ) {

      http.get( getInfoUrl, function( res ) {
        var body = ""
        res.on( "data", function ( chunk ) {
          body += chunk
        });
        res.on( "end", function() {
          expect( res.statusCode ).toEqual( 200 );
          expect( res.headers["content-type"] ).toEqual( "text/plain" );
          var json = JSON.parse(body)
          expect( json.method ).toEqual( "GET" );
          expect( json.pathname ).toEqual( "/test/info" );
          expect( json.queryParams ).toEqual( {} );
          expect( json.pathParams ).toEqual( [] );
          expect( json.body ).toEqual( "" );
          done()
        })
      }).on( "error", function( e ) {
        fail( "Request Error" )
      });

    });



    it( "should provide the request body to api methods", function( done ) {

      var message = "This is the message\nto send"
      var req = http.request({
        hostname: "localhost",
        port: 55555,
        path: "/test/mirrorBody",
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          "Content-Length": message.length
        }
      }, function( res ) {
        var body = ""
        res.on( "data", function ( chunk ) {
          body += chunk
        })
        res.on( "end", function() {
          expect( res.statusCode ).toEqual( 200 );
          expect( res.headers["content-type"] ).toEqual( "text/plain" );
          expect( body ).toEqual( message );
          done()
        })
        res.on( "error", function ( e ) {
          fail( "Server error" )
        })
      })
      req.on("error", function(e) {
        fail( "Request error" )
      });
      req.write( message )
      req.end()

    });



    it( "should provide query parameters to api methods", function( done ) {

      http.get( getInfoUrl + "?a=1&b=2", function( res ) {
        var body = ""
        res.on( "data", function ( chunk ) {
          body += chunk
        });
        res.on( "end", function() {
          expect( res.statusCode ).toEqual( 200 );
          expect( res.headers["content-type"] ).toEqual( "text/plain" );
          var json = JSON.parse(body)
          expect( json.queryParams.a ).toEqual( "1" );
          expect( json.queryParams.b ).toEqual( "2" );
          done()
        })
      }).on( "error", function( e ) {
        fail( "Request Error" )
      });

    });



    it( "should provide path parameters to api methods", function( done ) {

      http.get( pathParamsUrl, function( res ) {
        var body = ""
        res.on( "data", function ( chunk ) {
          body += chunk
        });
        res.on( "end", function() {
          expect( res.statusCode ).toEqual( 200 );
          expect( res.headers["content-type"] ).toEqual( "text/plain" );
          var json = JSON.parse(body)
          expect( json.pathParams[0] ).toEqual( "123" );
          expect( json.pathParams[1] ).toEqual( "abc" );
          done()
        })
      }).on( "error", function( e ) {
        fail( "Request Error" )
      });

    });



    it( "should allow to specify the mime type of api ops", function( done ) {

      http.get( mimeAltUrl, function( res ) {
        var body = ""
        res.on( "data", function ( chunk ) {
          body += chunk
        });
        res.on( "end", function() {
          expect( res.statusCode ).toEqual( 200 );
          expect( res.headers["content-type"] ).toEqual( "text/html" );
          expect( body ).toEqual( "<div>some html</div>" );
          done()
        })
      }).on( "error", function( e ) {
        fail( "Request Error" )
      });

    });



  })



    describe( "Streaming api operations", function() {
      var streamPath = "/test/stream"
      var mimeAltStreamUrl = "http://localhost:55555/test/stream/mimeAlt"

      beforeAll( function() {
        var api = {}
        microbi.api = api
        microbi.setMime( "txt" )

        api.test = {}

        api.test.stream = {}
        api.test.stream["POST:stream"] = true
        api.test.stream.POST = function( request, response ) {
          request.pipe( response )
        }

        api.test.stream.mimeAlt = {}
        api.test.stream.mimeAlt["GET:stream"] = true
        api.test.stream.mimeAlt["GET:mime"] = "mpeg"
        api.test.stream.mimeAlt.GET = function( request, response ) {
          response.write('abcdefghijklmnopqrstuvwxyz')
          response.end()
        }
      });



      it( "should provide access to stream", function( done ) {

        var message = []
        message.push( "This is the streaming\n" )
        message.push( "Server in action\n" )
        message.push( "This simple test\n" )
        message.push( "requires the server to mirror\n" )
        message.push( "back this message stream\n" )

        var req = http.request({
          hostname: "localhost",
          port: 55555,
          path: streamPath,
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
          }
        }, function( res ) {
          var body = ""
          res.on( "data", function ( chunk ) {
            body += chunk
          })
          res.on( "end", function() {
            expect( res.statusCode ).toEqual( 200 );
            expect( res.headers["content-type"] ).toEqual( "text/plain" );
            expect( body ).toEqual( message.join( "" ) );
            done()
          })
          res.on( "error", function ( e ) {
            fail( "Server error" )
          })
        })
        req.on( "error", function( e ) {
          fail( "Request error" )
        });
        req.write( message[0] )
        req.write( message[1] )
        req.write( message[2] )
        req.write( message[3] )
        req.write( message[4] )
        req.end()

      })



      it( "should allow to specify the mime type of streaming api ops",
        function( done ) {

        http.get( mimeAltStreamUrl, function( res ) {
          var body = ""
          res.on( "data", function ( chunk ) {
            body += chunk
          });
          res.on( "end", function() {
            expect( res.statusCode ).toEqual( 200 );
            expect( res.headers["content-type"] ).toEqual( "video/mpeg" );
            expect( body ).toEqual( "abcdefghijklmnopqrstuvwxyz" );
            done()
          })
        }).on( "error", function( e ) {
          fail( "Request Error" )
        });

      });



    })

})
