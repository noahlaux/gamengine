var LBI = window.LBI || {};

/**
 * Create google maps
 * @param {Object} config
 */
LBI.maps = function() {

  var init = function(element) {

    this.element = element;

    var scr = document.createElement("script");
    scr.type = "text/javascript";
    scr.src = "http://maps.googleapis.com/maps/api/js?sensor=false&callback=LBI.maps.drawMap";
    document.body.appendChild(scr);
  }
  
  var drawMap = function() {
    var myLatlng = new google.maps.LatLng(-34.397, 150.644);
    var myOptions = {
      center : myLatlng,
      zoom : 17,
      mapTypeId : google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.element, myOptions);
  }

    var createMarker = function(options) {
    
      var pos = new google.maps.LatLng(options.position[0], options.position[1]);
      
      var image = new google.maps.MarkerImage(
        '/images/mapContainer.png',
        new google.maps.Size(41, 65),
        // The origin
        new google.maps.Point(0,0),
        // The anchor
        new google.maps.Point(0, 65)
      );
  
      var shadow = new google.maps.MarkerImage(
        options.userImage,
        new google.maps.Size(40, 32),
        new google.maps.Point(0,0),
        new google.maps.Point(0, 65)
      );
      
      var shape = {
        coord: [1, 1, 1, 20, 18, 20, 18 , 1],
        type: 'poly'
      };
      
      var marker = new google.maps.Marker({
        shadow    : shadow,
        icon      : image,
        position  : pos,
        map       : this.map,
        title     : 'Click to zoom'
      });
      
      this.map.panTo(marker.getPosition());
      
      return marker;
  };
  
  var removeMarker = function(marker) {
    if (marker) {
      marker.setMap(null);
    } else {
      console.info('No marker specified')
    }
  };
  
  var updateMarkerPosition = function(marker, position) {
    var pos = new google.maps.LatLng(position[0], position[1]);
    
    marker.setPosition(pos);
    this.map.panTo(pos);
  };

  
  return {
    init : init,
    drawMap : drawMap,
    createMarker : createMarker,
    removeMarker : removeMarker,
    updateMarkerPosition : updateMarkerPosition
  }

}();
