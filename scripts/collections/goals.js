/**
 * Performs loading and declaration of goals that should be part of the game
 *
 * @author Noah Laux (noahlaux@gmail.com)
 *
 * @return {Object} object with goal public functions
 */
define([
    'order!jquery',
    'order!underscore',
    'order!backbone'
    ],
    function( $, _, Backbone ) {
    
        var collection = Backbone.Collection.extend({
            /**
             * Intialize
             *
             * @param {Object} options
             */
            initialize: function( options ) {

            },
            /**
             * Get goal
             *
             * @function
             * @public
             *
             * @param {String} id
             * @return {Object} goal object
             */
            getGoal: function ( id ) {
                // Check if goal exists
                if ( this._byId[id] ) {

                    // Return requested goal
                    var reqGoal = this._byId[id];

                    // Return cloned goal
                    return reqGoal.clone();
                } else {
                    throw new Error("Unsupported goal: " + id);
                }
            },
            /**
             * Check if an items goals is reached and react on them
             *
             * @param  {Backbone model} item
             * @param  {Backbone collection} items Collection of currrent game items
             * @param  {Backbone model} scene
             * @return {Boolean}
             */
            evaluate: function( item, items, scene ){
            
                var self        = this,
                    goalResults = [],
                    gameItem    = _.find( items.models, function( it ) {
                        return it.get('name') === item.get('name');
                    });

                if ( gameItem ) {
                    _.each( gameItem.get('goals'), function( goal ) {

                        // Only validate if goal not reached
                        if ( !goal.get('isGoalReached') ) {
                            // evaluate current goal and react upon it
                            goalResults.push( goal.evaluate( gameItem, items, scene ) );
                        } else {
                            goalResults.push( true );
                        }

                    });

                    // Check if all item goals has been reached
                    if ( this.hasItemAllGoalsReached( goalResults ) ) {

                        // Flag item
                        gameItem.set('hasReachedGoals', true);

                        // Send to game engine
                        gameItem.trigger('itemAllGoalsReached', item, items );
                    }

                    // Check if all items goals have been met
                    if ( this.hasAllItemsAllGoalsReached( items ) ) {

                        // Local handling
                        // TODO

                        // Send to game engine
                        //scene.allItemsAllGoalReached( item, items );
                    }

                    return true;
                } else {
                    return false;
                }
            
            },
            /**
             * Check if all item goals have been reached
             *
             * @param  {Array[Boolean]}  goalResults Array of gold results
             * @return {Boolean}
             */
            hasItemAllGoalsReached: function( goalResults ) {
                return ( _.filter( goalResults, function( goalResult ) {
                    return goalResult === false;
                }).length === 0 );
            },
            /**
             * Check if all items have met their goals
             *
             * @param {Backbone collection} items Current game items
             * @return {Boolean}
             */
            hasAllItemsAllGoalsReached: function( items ) {
                return ( _.filter( items.models , function( item ) {
                    return item.get('hasReachedGoals') === false;
                }).length === 0 );
            }
        });
                
        return collection;
    
    });