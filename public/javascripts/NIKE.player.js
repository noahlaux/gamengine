
var NIKE = window.NIKE || {}; 
/**
 * Create player
 * @param {Object} config 
 */
NIKE.player = function () {
  
    var defaults = {
        onLocationChange : function () {},
        id : 0
    };
    
    this.position = {};
    this.self = this;
    this.watchPosition;
    this.markers = [];
  
    /*
   * INIT
   */
    var init = function (options) {
        var self = this; // assign reference to current object to "self"
        var options = $.extend(defaults, options);
        watchLocation();
    }
    
    var watchLocation = function(callback) {
        if (Modernizr.geolocation) {
            this.watchPosition = navigator.geolocation.watchPosition(setLocation, locationError);
        } else {
            // no native support; maybe try Gears?
            alert('Could not get location');
        }
    }
  
    function setLocation ( location ) {
        defaults.onLocationChange(location);
        self.position = location;
    }
  
    function locationError ( code, message ) {
        console.log(code);
    }
  
    var stopWatching = function () {
        navigator.geolocation.clearWatch(this.watchPosition);
    }
  
    return {
        init : init,
        currentPosition : function () {
            return position;
        },
        stopWatching : stopWatching,
        markers : markers
    }
  
}()