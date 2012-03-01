/**
 * Standard collection to hold game items
 *
 * @version 1.0
 * @author Noah Laux (noahlaux@gmail.com)
 *
 * @return {Backbone collection}
 */
define([
    'order!jquery',
    'order!underscore',
    'order!backbone',
    'models/gameItem'
    ], function( $, _, Backbone, GameItem ) {
        
        var collection = Backbone.Collection.extend({
            model: GameItem, // Use standard model
            /**
             * [initialize description]
             *
             * @param  {Object} options [description]
             *
             * @return N/A
             */
            initialize: function( options ) {

                // If we have provided an URL, then fetch models from JSON
                if ( options && options.url ) {
                    this.url = options.url;

                    // Fetch models
                    this.fetch();
                }
                
            }
        });
    
        return collection;
    
    });