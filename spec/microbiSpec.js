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
    microbi.server( 55555 )
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
        fail( "Server error" )
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
        fail( "Server error" )
      });

    });

  })



  describe( "Api server", function() {
    var helloUrl = "http://localhost:55555/test/hello"
    var queryParamsUrl = "http://localhost:55555/stuff/items?a=1&b=2"
    var staticFileUrl = "http://localhost:55555/spec/support/test_data.txt"
    var notFounfFileUrl = "http://localhost:55555/spec/support/no_file.txt"

    beforeAll( function() {
      var api = {}
      microbi.setApi( api )
      microbi.setApiContentType( "txt" )

      api.test = {}
      api.test.hello = {}

      api.test.hello.GET = function( info ) {
        return "hello"
      }
      api.test.hello.POST = function( info ) {
        return "hello"
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
        fail( "Server error" )
      });
    });



    it( "should answer this http POST request with hello", function( done ) {

      var req = http.request({
        hostname: "localhost",
        port: 55555,
        path: "/test/hello",
        method: "POST",
        headers: {
          'Content-Type': "text/plain",
          'Content-Length': 0
        }
      }, function(res) {
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
      req.on('error', function(e) {
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
          expect( body ).toEqual("abc\n123\n" );
          done()
        })
      }).on( "error", function( e ) {
        fail( "Server error" )
      });

    });



    it( "should try to find a defined api function first, if not," +
      "then look for a static file, and if none is found neither, " +
      "then it should respond 404 not found", function( done ) {

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
        fail( "Server error" )
      });

    });



  })


})
