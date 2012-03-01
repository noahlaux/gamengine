
window.onload = function () {
  // Init map
  LBI.maps.init(document.getElementById('map'));
  $.colorbox({href:"/register"});
};

/**
 * Called from server when a user is initialized
 * @param {Integer} id PlayerID
 */
  now.createPlayer = function(id) {
    this.id = id;    
    
    // Start watching players position
    NIKE.player.init({
      onLocationChange : now.syncPosition,
      id : id
    });
    
    console.log('create player ' + id);
    
    var player = isCurrentPlayer(id) ? 'you' : 'Player ' + id;
    
    if (!isCurrentPlayer(id)) {
      NIKE.player.opponents = NIKE.player.opponents || {}; 
      $.extend(NIKE.player.opponents, { werwer : {active : true}});
    }
    
    //$('body').append('<div id="player_' + id + '">' + player + ' connected (player ' + id + ')</div>');
    //connectPlayer(id);
  }
  
  now.deletePlayer = function (id) {
    console.log(id)
    LBI.maps.removeMarker(NIKE.player.markers[id]);
  };
  
/**
 * Called when you or any users within your range has updated their positions
 * @param {Integer} id PlayerId
 * @param {Geoposition} position
 */
now.updatePositions = function (options) {
  
  if (options.position) { 
    var pos = [options.position.coords.latitude, options.position.coords.longitude],
        id  = options.user.id;

    if (!NIKE.player.markers[id]) {
      // Make marker
      var markerOptions = {
        position  : pos,
        userName  : options.user.name,
        userImage : options.user.image
      }
      
      NIKE.player.markers[id] = LBI.maps.createMarker(markerOptions);
      // Update position
      LBI.maps.updateMarkerPosition(NIKE.player.markers[id], pos);
    } else {
      // Update marker position
      LBI.maps.updateMarkerPosition(NIKE.player.markers[id], pos);
    }
    
    var player = isCurrentPlayer(id) ? 'you' : 'Player ' + id;
  } else {
    console.log('No position data');
  }
  
  //$('body').append('<div id="player_' + id + '">' + player + ' updated position to ' + [position.coords.latitude, position.coords.longitude].join(',') + '</div>');
}

now.updateUsers = function(data) {
  $('#status').html(data);
};

function isCurrentPlayer (id) {
  return (id == now.uuid) ? true : false;
}
  