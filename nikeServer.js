/** !
 * gamegine // gameserver
 * 
 * @author Noah Laux <noahlaux@gmail.com>
 */

/*
 * Include core dependencies.
 */
var _           = require('underscore')._, 
    Backbone    = require('backbone'),
    root        = this;


// Setup connect, express, socket, and the connect-redis session store
var express       = require('express'),
    MemoryStore   = express.session.MemoryStore, 
    sessionStore  = new MemoryStore();

var app = module.exports = express.createServer();

// Configuration
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
    store : sessionStore,
    secret : 'secret',
    key : 'express.sid'
  }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

/*
 * Configuration
 */

app.configure('development', function() {
  app.use(express.errorHandler({
    dumpExceptions : true,
    showStack : true
  }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

var mongoose    = require('mongoose'),
    db          = mongoose.connect('mongodb://localhost/test'),    
    Schema      = mongoose.Schema,
 
    /**
     *  Schemas
     */
    LogEntry = new Schema({
      ip                  : String,
      code                : Number,
      message             : String,
      sessionId           : String,
      location            : { any : {}},
      timemade            : { type: Date, default: Date.now }
    }),
    User = new Schema({
        first_name        : { type: String, match: /[a-z]/, set: uCase, default : 'John' },
        last_name         : { type: String, match: /[a-z]/, set: uCase, default : 'Doe' },
        email             : { type: String },
        password          : { type: String },
        image             : { type: String },
        address           : {
          street    : String,
          streetno  : String,
          zip       : String,
          city      : String,
          country   : String
        },
        timemade          : { type: Date, default: Date.now }
    });
    
    User.methods.getLatest = function ( callback ) {
        // returns a Query
        return this.model('User').find( {}, callback );
    };

/*
 * Vituals
 */ 

// Get full name for user 
User
  .virtual('name.full')
  .get( function () {
    return this.first_name + ' ' + this.last_name;
  });
    
/*
 * Setters
 */ 

/**
 * Capitalize the first letter in a word
 * 
 * @param {String} v String to capitilize
 * @param {String} Capitalized string   
 */
function uCase(v) {
  return capitalize(v);
}

var Users       = mongoose.model('User', User);
var LogEntries  = mongoose.model('LogEntry', LogEntry);

/* 
 * ROUTES 
 */
app.get('/', userReq, function( req, res ) {

  res.render('nike/index', {
    title : 'NIKE location promo'
  });
  
  root.clientIp = req.connection.remoteAddress; //req.headers['x-forwarded-for']

});

app.get('/send', function ( req, res ) {
  res.send( Users.getLatest() );
});


app.get('/register', userReq, function( req, res ) {

  res.partial('nike/register', {
    title     : 'UUUUUPS!!',
    subtitle  : 'Looks like it\s first time around ?!?',
    username  : 'Username',
    email     : 'Email',
    image     : 'Image',
    save      : 'Allright',
    imageTip  : 'Enter a valid image url. We\'ll download and thumb it for you...YAY!!'
  });
 
});

/**
 * Live Image Resizer
 */
app.get('/image/resize/:url/:h/:w', function( req,res ) {
  
  var originalPath  = 'public/images/users/original/',
      thumbPath     = 'public/images/users/thumb/',
      thumbSize     = [req.params.w, req.params.h];

  fetchImage( req.params.url, originalPath, root._id, function (filename) {
      // make thumbnail
      makeThumb(filename, thumbPath, thumbSize[0], thumbSize[1], function() {
        res.end('ok')
      });
  })
})

this.stripCookieSid = function ( str ) {
  return str.replace(/[^a-zA-Z 0-9]+/g,'');
};
  
/*
 * Fetch image from URL
 * 
 * @param {String} src URL to image to fetch
 * @param {String} dst Filepath to save
 * @param {String} fileName Filename for file
 */
function fetchImage( src, dst, fileName, callback ) {
  
  var sys = require("sys"),
      http = require("http"),
      url = require("url"),
      path = require("path"),
      fs = require("fs"),
      events = require("events");
  
  var downloadfile = src;
  
  var host = url.parse(downloadfile).hostname
  var ext = downloadfile.split('.').pop();
  
  var filename = dst + fileName + '.' + ext; //url.parse(downloadfile).pathname.split("/").pop()
  
  var theurl = http.createClient(80, host);
  var requestUrl = downloadfile;
  sys.puts("Downloading file: " + filename);
  sys.puts("Before download request");
  var request = theurl.request('GET', requestUrl, {"host": host});
  request.end();
  
  var dlprogress = 0;
  
  request.addListener('response', function (response) {
      response.setEncoding('binary')
      sys.puts("File size: " + response.headers['content-length'] + " bytes.")
      var body = '';
      response.addListener('data', function (chunk) {
          dlprogress += chunk.length;
          body += chunk;
      });
      response.addListener("end", function() {
          fs.writeFileSync(filename, body, 'binary');
          sys.puts("After download finished");       
         callback(filename);
      });
  
  });
}  
  
function makeThumb( filename, thumbPath, width, height, callback ) {

  var im = require('imagemagick');

  console.log( 'resizing image:' + filename );
  
  im.resize({
      srcPath : filename,
      dstPath : thumbPath + filename.split("/").pop(),
      width   : width
  }, function( err, stdout, stderr ){
    if ( err ) throw err
    callback();
  });

/*
    var Canvas = require('canvas')
    , Image = Canvas.Image
    , fs = require('fs');
  
  var img = new Image
    , start = new Date;
  
  img.onerror = function(err){
    throw err;
  };
  
  img.onload = function(){
    var width = img.width / 2
      , height = img.height / 2
      , canvas = new Canvas(width, height)
      , ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    canvas.toBuffer(function(err, buf){
      fs.writeFile(__dirname + '/resize.png', buf, function(){
        console.log('Resized and saved in %dms', new Date - start);
      });
    });
  };
  console.log(__dirname)
  img.src = __dirname + '/public/images/mapContainer.png';
  */

}

function userReq (req, res, next) {
  
  if ( req.cookies._id ) {

    Users.findById( req.cookies._id, function( err, doc ) {
      
      if ( err ) console.log( err );
      
      root._id          = doc._id;
      root.userName     = doc.name.full;
      root.userImage    = doc.image;

      // Update cookies to the latest db
      res.cookie('userName', doc.name.full);
      res.cookie('userImage', doc.image);
      
      next();
    });

  } else {
    
    // Create initial user
    var user = new Users({});
    
    // Save user in db
    user.save( function( err ) {

      if( err ) {
        console.log( err );
      } else {
        
        console.log('user created in db');
        
        // Create additional fields
        Users.findById( user._id, function( err, doc ) {
          
          doc.image = user._id;
          
          doc.save( function( err ) {
          // Create Cookies
            res.cookie('_id', user._id);
            res.cookie('userName', user.name.full);
            res.cookie('userImage', doc.image);
            
            next();
            
          });         
        });
      }
    });
  }
}

//create local state
var activeClients = [];

app.listen( 80 );

/**
 * Log entry
 * 
 * @param {Integer} code
 * @param {String} message
 * @param {Array} position
 * @return N/A
 */
function log( code, message, position ) {
 
  var logEntry = new LogEntries({
    ip : root.clientIp, //req.headers['x-forwarded-for'],
    sessionId : root.sessionId,
    code : code,
    message : message,
    position : position
  });

  logEntry.save( function(err) {
    if( err ) {
      console.log( err );
    }
  });
  
}
/*
Users.find(function(err, result) {
  result.forEach(function(user) {
    console.log(user.name.full);
  })
});
*/

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env); 

(function() {
  var nowjs     = require("now"),
      options   = {"clientWrite" : true, "autoHost" : true, "host" : undefined, "port" : undefined, "socketio" : {}, closureTimeout : 30000, client : {}, "scope" : "window"},
      everyone  = nowjs.initialize(app),
      users     = new Backbone.Collection,
      jade      = require('jade'),
      groups    = [];

  // Create primary key to keep track of all the clients that
  // connect. Each one will be assigned a unique ID.
  var primaryKey = 0;
  everyone.now.playerCount = 0;

  // When a client has connected, assign it a UUID. In the
  // context of this callback, "this" refers to the specific client
  // that is communicating with the server.
  //
  // NOTE: This "uuid" value is NOT synced to the client; however,
  // when the client connects to the server, this UUID will be
  // available in the calling context.
  /*
  everyone.connected(
  function(){
  this.now.uuid = ++primaryKey;
  everyone.now.createPlayer(this.now.uuid);
  now.createPlayer(this.now.uuid);
  }
  )
  */
  // Calls the `start` function upon a new client connection
  everyone.on('connect', function() {

    everyone.now.playerCount++;

    this.now.uuid = this.user.clientId;
    
    root.sessionId = this.user.clientId;
        
    everyone.now.createPlayer( this.user.clientId );

    console.log('User ' + this.user.clientId + ' is connected');  
    
    log(1, 'User connected');

    // Add user
    users.add({
      id : this.user.clientId,
      name : root.userName,
      'express.sid' : express.sid
      });

    var that = this;
    
    nowjs.getGroups( function ( groups ) {
      console.log( groups );
    });

    //everyone.now.users = users;
    //console.log(users)
  });
  
  everyone.on( 'disconnect', function() {
    
    // Removes player from map
    everyone.now.deletePlayer( this.user.clientId );
    log(2, 'User disconnected');
    // TODO Make logic to exlude use from all groups
    updateGroup( everyone );
  });
  
  /**
   * Updates the groups data
   * 
   * @param {Object} group
   * @return N/A
   */
  function updateGroup( group ) {
    
    var users = getGroupUsers( group );

    // Update position for all users
    for ( user in users ) {
      var options = {
        user: {
          id    : users[user].clientId,
          image : 'images/users/thumb/' + users[user].cookie.userImage + '.jpg'
        },
        position : users[user].position
      }
      // Send to clients
      everyone.now.updatePositions(options);
    }
    
    renderView('views/nike/userPanel.jade', { users : users, currentUser: root }, function ( html ) {
      // Update user panel on all the groups users
      group.now.updateUsers( html ); 
    });
  }
  
  function updateUser( id ) {
    //TODO impliment
  }
  
  /*
   * Returns the users in a group
   * 
   * @param {Object} group
   * @return {Object} users
   */
  function getGroupUsers( group ) {
    
    var groupUsers = [];
    
    // Get all the users in the group
    group.getUsers( function ( users ) {
      for ( user in users ) {
        nowjs.getClient( users[user], function() {
          groupUsers.push( this.user );
        });
       }
    });
    
    return groupUsers;
  }
  
  /**
   * Renders a jade file with an object
   * 
   * @param {String} view Path to jade file
   * @param {Object} data Object data
   * @param {Function} callback  
   */
  function renderView ( view, data, callback ) {
    jade.renderFile(view, { locals: data }, function( err, html ) {
       callback( html );
    }); 
  }
  
  // Add a broadcast function to *every* client that they can call
  // when they want to sync the position of the draggable target.
  // In the context of this callback, "this" refers to the
  // specific client that is communicating with the server.
  everyone.now.syncPosition = function( position ) {
    
    if ( position ) {
        
      // Update the current user position
      this.user.position = position;
      
      log( 3, 'Position changed', position );
      
      if ( !masterGroup ) {
        var masterGroup = nowjs.getGroup('masterGroup');
      }
  
      masterGroup.addUser( this.user.clientId );
    
      updateGroup( masterGroup );
      
    } else {
      console.log('No postion was send');
    }
    /*    
    users.each(function(user) {
      if(user.attributes.position.coords) {
        everyone.now.filterUpdateBroadcast(user.id, position);
        console.log('user: ' + user.id + ' pos:' + [user.attributes.position.coords.latitude, user.attributes.position.coords.longitude].join(','));
      }
      
    });
    */
    // Now that we have the new position, we want to broadcast
    // this back to every client except the one that sent it in
    // the first place! As such, we want to perform a server-side
    // filtering of the clients. To do this, we will use a filter
    // method which filters on the UUID we assigned at connection
    // time.
    //everyone.now.updatePositions(this.now.uuid, position);
    //console.log('syncPosition - user ' + this.now.uuid + ' lat:' + position.coords.latitude + ' long:' + position.coords.longitude);
  };
  // We want the "update" messages to go to every client except
  // the one that announced it (as it is taking care of that on
  // its own site). As such, we need a way to filter our update
  // broadcasts. By defining this filter method on the server, it
  // allows us to cut down on some server-client communication.
  everyone.now.filterUpdateBroadcast = function(masterUUID, position) {
    // Make sure this client is NOT the same client as the one
    // that sent the original position broadcast.
    if(this.now.uuid == masterUUID) {
      // Return out of guard statement - we don't want to
      // send an update message back to the sender.
      return;
    }

    // If we've made it this far, then this client is a slave
    // client, not a master client.
    everyone.now.updatePositions(masterUUID, position);
  }

  everyone.now.log_server = function(msg) {
    console.log(msg);
  }
  
})()