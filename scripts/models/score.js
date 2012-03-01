/**
 * Provide scoring logic to scene
 *
 * @version 1.0
 * @author Noah Laux (noahlaux@gmail.com)
 *
 * @returns {Backbone model}
 */

define([
    'order!jquery',
    'order!underscore',
    'order!backbone'
], function( $, _, Backbone ) {

    var model = Backbone.Model.extend({
        /**
         * initialize
         *
         * @param {Object} options
         * @return N/A
         */
        initialize: function( options ) {
            
            var self    = this,
                scene   = options.scene,
                items   = this.get('gameItems'),
                score   = 10; // Default score for models

            // Put default values into all game items
            _.each( items.models, function( item ) {
                
                item.set({
                    'score' : score
                });
                
            });
        },
        /**
         * Get Scores from each game item
         *
         * @return {Object}
         */
        getScores: function() {
            
            var items = this.get('gameItems');
            
            return _.map( items.models, function( item ) {
                return {
                    name:   item.get('name'),
                    image:  item.get('image'),
                    score:  item.get('score')
                };
            });
        },
        /**
         * Add score to item and trigger a change to render the view
         *
         * @param {Backbone model} item
         * @param {Integer} score
         * @return N/A
         */
        addScore: function( item, score ) {
            
            var items = this.get('gameItems');
                        
            var reqItem = _.find( items.models, function( it ) {
                return it.get('name') === item.get('name');
            });

            if ( reqItem ) {
            
                // set the new score
                reqItem.set('score', reqItem.get('score') + score );
                                
                // Trigger change to update the views and subscribers
                this.trigger('change');
            } else {
                console.log(reqItem + ' do not exists, can not add score.');
            }
            
        }
    });
    
    return model;
    
});