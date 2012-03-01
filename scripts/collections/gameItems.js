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
            model: GameItem // Use standard model
        });
    
        return collection;
    
    });