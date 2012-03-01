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
                this.evaluated = [];
                this.goalDurations = [];
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

                    // Go through each of gameItem's attached goals
                    _.each( gameItem.get('goals'), function( goal ) {

                        // Only validate if goal not already reached
                        if ( !goal.get('isGoalReached') ) {

                            // log start timestamp
                            var start = +new Date();

                            // evaluate current goal and react upon it
                            goalResults.push( goal.evaluate( gameItem, items, scene ) );

                            // log end timestamp
                            var end = +new Date();

                            // Calculate evaluation time
                            var diff = end - start;

                            if ( self.evaluated.indexOf( goal.get('id') ) === -1 ) {
                                
                                self.goalDurations.push( { name: goal.get('id'), time: diff } );

                                self.evaluated.push( goal.get('id') );
                                self.shouldTriggerEvaluationDurations = true;

                            } else {
                                self.shouldTriggerEvaluationDurations = false;
                            }

                        } else {
                            // Goal already reached so just do not test, just return true
                            goalResults.push( true );
                        }

                    });
                    /*
                    if ( this.shouldTriggerEvaluationDurations ) {
                        self.trigger( 'evaluateDurations', goalDurations );
                    }
                    */

                    // Check if all item goals has been reached
                    if ( this.hasItemAllGoalsReached( goalResults ) && !gameItem.get('hasReachedGoals') ) {

                        // Flag item
                        gameItem.set('hasReachedGoals', true);

                        // Trigger event
                        gameItem.trigger('itemAllGoalsReached', item, items );
                    }

                    // Check if all items in collection have all their goals reached
                    if ( this.hasAllItemsAllGoalsReached( items ) ) {

                        // Trigger event
                        gameItem.trigger('allItemsAllGoalsReached', item, items );
                    }

                    return true;
                } else {
                    // GameItem do not exits
                    return false;
                }
            
            },
            /**
             * Check if all item goals have been reached
             *
             * @param  {Array[Boolean]} goalResults Array of goal results
             * @return {Boolean}
             */
            hasItemAllGoalsReached: function( goalResults ) {
                return ( _.filter( goalResults, function( goalResult ) {
                    return goalResult === false;
                }).length === 0 );
            },
            /**
             * Check if all items have reached all their respective goals
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