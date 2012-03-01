/**
 * configure app
 */

require.config({
  paths: {
    // Plugins
    order:      'libs/require/plugins/order',
    text:       'libs/require/plugins/text',
    // Libraries
    jquery:     'libs/jquery/jquery',
    underscore: 'libs/underscore/underscore',
    backbone:   'libs/backbone/backbone',
    mustache:   'libs/mustache',
    // Paths
    templates:  '../templates'
  },
  //urlArgs: (function() { return "bust=" + ( new Date()).getTime(); }()),
  priority: [ 'jquery', 'underscore', 'backbone']

});

    
require( ['views/scene'], function( SceneView ) {
   
   //MBP.fastButton();
   //MBP.scaleFix();

   //$('#container').hide();
   $('.loading').show();
    
   var sceneView = new SceneView({
       el: '#container'
   });

});