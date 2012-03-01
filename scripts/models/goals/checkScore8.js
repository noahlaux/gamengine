/**
 * Goal that solves if current game item score is 8
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
    ], function($, _, Backbone) {

    var goal = Backbone.Model.extend({
        
        id: 'checkScore8',
        defaults: {
            'isGoalReached' : false
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

            // Evaluate conditions
            var isGoalReached = ( item.get('score') === 8 );

            // React if goal is reached
            if ( isGoalReached ) {
                this.goalIsReached( item, items, scene );
            }

            // return evalutation
            return isGoalReached;
        },
        /**
         * Goal condition reached
         *
         * @return N/A
         */
        goalIsReached: function( item, items, scene ) {

            // Local handling
            console.log('you killed 2 ' + item.get('name') + ' YOU BASTARD!!!');

            // Trigger to subscribers
            this.trigger( 'itemGoalReached', item, items, this );

            this.set('isGoalReached', true);

        }
    });

    return new goal();

});