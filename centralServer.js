config = require("./config/config.js").config;

//console.log(config.centralServer.ip);

var express = require('express');

var app = module.exports = express.createServer();
var jade = require('jade');
var gameServers = 0;

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});
/*
 * ROUTE: Landing page for administrators
 */
app.get('/', function(req, res) {
  res.render('centralServer/index', {
    title : 'Centralserver'
  });
});

app.get('/gameserver/connect/:id', function(req, res) {
  gameServers = [ 
    {
    "id" : 1,
    "name" : "Funky" 
    },
    {
    "id" : 2,
    "name" : "Funky2"
    }
   ];
   
   jade.renderFile('views/gameservers.jade', {locals:{gameServers : gameServers }}, function(err, html) {
    // Callback receives HTML
    console.log(err);
     everyone.now.gameServerConnect(html);
  }); 
  
  /*
  var output = jade.compile('gameservers.jade', { 
                  gameServers: gameServers 
                });
  console.log(output)
 */

});

app.listen(config.centralServer.port);
console.log("Centralserver listening on port: " + config.centralServer.port); 

  var everyone = require("now").initialize(app);

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
    this.now.uuid = ++primaryKey;
    everyone.now.createPlayer(this.now.uuid);
    this.now.createOpponents();
  });
  // Add a broadcast function to *every* client that they can call
  // when they want to sync the position of the draggable target.
  // In the context of this callback, "this" refers to the
  // specific client that is communicating with the server.
  everyone.now.syncPosition = function(position) {

    // Now that we have the new position, we want to broadcast
    // this back to every client except the one that sent it in
    // the first place! As such, we want to perform a server-side
    // filtering of the clients. To do this, we will use a filter
    // method which filters on the UUID we assigned at connection
    // time.
    everyone.now.filterUpdateBroadcast(this.now.uuid, position);
    console.log('syncPosition - u:' + this.now.uuid + ' t:' + position.top);
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
    everyone.now.updatePosition(this.now.uuid, position);
  }

  everyone.now.log_server = function(msg) {
    console.log(msg);
  }
  
