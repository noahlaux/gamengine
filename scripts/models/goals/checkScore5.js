/**
 * Goal that solves if current game item score is 5 and then destroys it
 *
 * NB! Every goal model should contain evaluate function that return boolean
 *
 * @version 1.0
 * @author Noah Laux (noahlaux@gmail.com)
 *
 * @return {Object} goal
 */
define([
    'order!jquery',
    'order!underscore',
    'order!backbone'
    ],
    function( $, _, Backbone ) {
   
        var goal = Backbone.Model.extend({
            defaults: {
                'isGoalReached' : false,
                'id': 'checkScore5'
            },
            /**
             * Evaluate goal condition
             *
             * @param {Backbone model} item current item to evaluate
             * @param {Backbone collection} items All game items
             * @param {Backbone model} scene link to application (scene)
             * @return {Boolean}
             */
            evaluate: function( item, items, scene ) {
                
                // Cache for other methods
                this.item   = item;
                this.items  = items;
                this.scene  = scene;
                
                // Evaluate conditions
                var isGoalReached = ( item.get('score') === 5 );

                // React if goal is reached
                if ( isGoalReached ) {
                    this.goalIsReached();
                }

                // return evalutation
                return isGoalReached;
            },
            /**
             * Goal condition reached
             *
             * @return N/A
             */
            goalIsReached: function() {
                
                // Destroy item
                this.item.destroy();
                
                // Local handling
                alert('you killed all the ' + this.item.get('name') + ' YOU BASTARD!!!');
                
                // Send event to game engine
                // TODO make pub/sub instead
                this.scene.itemGoalReached( this.item, this.items, this );
            
            }
    });
    
    return new goal();

});