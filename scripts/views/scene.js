/**
 * Scene view
 *
 * @version 1.0
 * @author Noah Laux (noahlaux@gmail.com)
 *
 * @return {Backbone view}
 */
define([
    //Libraries
    'order!jquery',
    'order!underscore',
    'order!backbone',
    // Utilities
    'plugins/utilities/random',
    // Logics
    'collections/gameItems',
    'views/items/gameItem',
    'views/surface/score',
    // Actions
    'models/actions',
    // Goals
    'collections/goals',
    // Goal models
    'models/goals/checkScore5',
    'models/goals/checkScore8',
    // Physics
    'plugins/physics/checkContainerCollision',
    'views/surface/debug'
    ], function( $, _, Backbone, Random, GameItemsCollection, GameItemView, ScoreView, Actions, GoalCollection, checkScore5, checkScore8, CheckContainerCollision, DebugView ) {
    
        var view = Backbone.View.extend({
            /**
             * initialize
             *
             * @return N/A
             */
            initialize: function() {
            
                console.log('app view init');
         
                var self = this;
                
                /**
                 * Scene step speed in ms
                 *
                 * @type {Number}
                 */
                this.speed = 30;
                
                /**
                 * Maximum game items at stage at once if generated automatically
                 *
                 * @type {Number}
                 */
                this.maxGameItems = 5; // Max amount of game items pr scene at once
                
                /**
                 * Maximum steps for game items to move at each step if generated automatically
                 *
                 * @type {Number}
                 */
                this.maxSteps = 6; // Max step size for random generation
                
                /**
                 * A cached copy of the container bounderies for use in calculations
                 *
                 * @type {Array}
                 */
                this.bounderies = [ this.$el.width(), this.$el.height() ]; // Cached scene bounderies for later use
                
                /**
                 * Cached directions available to move on the scene
                 *
                 * @type {Object}
                 */
                this.directions = {
                    "n":    [ 0, -1 ],
                    "ne":   [ 1, -1 ],
                    "e":    [ 1,  0 ],
                    "se":   [ 1,  1 ],
                    "s":    [ 0,  1 ],
                    "sw":   [ -1,  1 ],
                    "w":    [ -1,  0 ],
                    "nw":   [ -1, -1 ]
                };

                /**
                 * Game item collection to choose from
                 *
                 * @type {GameItemsCollection}
                 */
                this.gameItems = new GameItemsCollection({
                    'url': 'scripts/data/gameitems.json'
                });
                
                // Add game items when JSON has loaded and models put into collection
                this.gameItems.bind('reset', this.addGameItems, this);
            
                /**
                 * Make collection for currrent scene items on stage
                 *
                 * @type {GameItemsCollection}
                 */
                this.sceneItems = new GameItemsCollection();
                
                // When game model is added to the scene items initiate its view
                this.sceneItems.bind('add', this.addOne, this);
                
                // When a collection of game models is recieved add these all at once
                this.sceneItems.bind('reset', this.addAll, this);

                //this.sceneItems.bind('all', this.render, this);

                /**
                 * Declare global goals for later access
                 *
                 * @type {GoalCollection}
                 */
                this.goals = new GoalCollection([
                    checkScore5,
                    checkScore8
                ]);

                /**
                 * Debug view
                 *
                 * @type {Backbone view}
                 */
                this.debugView = new DebugView({
                    el: '#debug'
                });

                /**
                 * Puts evaluation times on goal to debugger
                 *
                 * @param  {Array} goalDurations [description]
                 *
                 * @return N/A
                 */
                this.goals.on( 'evaluateDurations', function( goalDurations ){

                    
                    self.debugView.render({
                        data: {
                            goals: goalDurations
                        },
                        element: '.goals'
                    });


                });

                // Start time on stage
                this.setupEvents();
                
                // Render app view
                this.render();

                /* Update cached scene container bounderies on window resize
                   Comment out if scene container has fixed width */
                $( window ).resize( function() {
                    self.bounderies = [ self.$el.width(), self.$el.height() ];
                });

                console.log("this", this);
    
            },
            /**
             * Render view
             *
             * @return N/A
             */
            render: function() {
            
                var self = this;
                
                // since this view is render many times, check if we need to
                // render the scene container, as this is only needed the very first
                // time
                if ( $('.element').not(':visible') ) {
                
                    $('.loading').fadeOut( function() {
                        self.$el.fadeIn();
                    });
                }
            
            },
            /**
             * Add game items from collection. It is fired after the gameitems have been loaded from JSON
             *
             * @param {Backbone collection} gameItems
             * @return N/A
             */
            addGameItems: function( gameItems ) {
                
                var scene = this,
                    goals = this.goals;

                // Set up goals on all items
                // TODO make a function for this in goals.js
                _.each( this.gameItems.models, function( item ) {
                    
                    // Retrieve a new cloned goal TODO Make solution that saves state in game item instead of cloning the whole goal model
                    var itemGoals = [
                        goals.getGoal('checkScore8'),
                        goals.getGoal('checkScore5')
                    ];

                     // Bind all goal events to scene functions
                    _.each( itemGoals, function( itemGoal ) {
                        itemGoal.on( 'itemGoalReached', scene.itemGoalReached, this );
                    });

                    item.on( 'itemAllGoalsReached', scene.itemAllGoalsReached, this );

                    item.on( 'allItemsAllGoalsReached', scene.allItemsAllGoalsReached, this );

                    // put goals into game item
                    item.set({
                        'goals': itemGoals,
                        'hasReachedGoals': false
                    });

                });

                // Add scores to items
                this.score = new ScoreView({
                    el:         '.score',
                    gameItems:  this.gameItems,
                    scene:      this
                });
            
                for ( var i = 0; i < this.maxGameItems; i++ ) {
                    // add a game item from a list of available
                    this.addSceneItem( gameItems );
                }
        
            },
            /**
             * Adds a game item to scene items
             *
             * @param {Backbone collection} gameItems Collection of available game items
             * @return N/A
             */
            addSceneItem: function( gameItems ) {
              
                var scene   = this,
                    // get random element from game item collection and clone it
                    element = Random.arrayElement( gameItems.models ).clone();

                // Assign random attributes within bounderies
                element.set({
                    'startPosition': [ Random.integer(0, this.bounderies[0]), Random.integer(0, this.bounderies[1]) ],
                    'moveSteps': [ Random.integer(1, this.maxSteps), Random.integer(1, this.maxSteps) ]
                });
                
                // if element is destroyed summerize score chart
                element.on('destroy', this.destroyItem, this);
                
                // Add item to current scene elements
                this.sceneItems.add( element );

            },
            /**
             * global function fired when a game item goal are mew
             *
             * @param {Backbone model} item game item that reached its goal
             * @param {Backbone collection} items all current game items and their scores etc
             * @param {Object} goal that is reached
             * @return N/A
             */
            itemGoalReached: function( item, items, goal ) {
                // TODO
                console.log("Hurray a item goal have been reached", item, items, goal);
            },
            /**
             * Global function fired when all item goals has been met
             *
             * @param {Backbone model} the last game item that reached its goal
             * @param {Backbone collection} items all current game items and their scores etc
             */
            itemAllGoalsReached: function( item, items ) {
                // TODO
                console.log("Hurray all item goals have been reached", item, items);
            },
            /**
             * Global function fired when all items all goals has been reached
             *
             * @param {Backbone model} the last game item that reached its goal
             * @param {Backbone collection} items all current game items and their scores etc
             * @return N/A
             */
            allItemsAllGoalsReached: function( item, items ) {
                // TODO
                console.log('HURRAY All items all goals have been reached', item, items);
            },
            /**
             * Called when an item is destroyed
             *
             * @param {Element} item
             * @param {Backbone collection} items Scene items
             */
            destroyItem: function( item, items ) {
                
                // Update score chart
                this.score.model.addScore( item, -1 );
                
                // Evaluate item goals
                this.goals.evaluate( item, this.gameItems, this );

                // Add a new game item from the list of game items
                this.addSceneItem( this.gameItems );
            
            },
            /**
             * Add one item
             *
             * @param {Backbone Model} model
             * @return N/A
             */
            addOne: function( item ) {
                
                // Create new game view with the provided model
                var view = new GameItemView( {
                    model: item
                });
                
                // Append view to scene
                this.$el.append( view.getItem() );
            },
            /**
             * Add all items
             *
             * @return N/A
             */
            addAll: function( e ) {
                // Initialize the views from all the current scene items
                this.sceneItems.each( this.addOne );
            },
            /**
             * Setup events, eg starts the scene timer
             *
             * @return N/A
             */
            setupEvents: function() {
                
                var self    = this,
                    speed   = this.speed;
                
                // Declare timer for later control
                this.movement = setInterval( function() {
                    
                    // Initiate a step on the scene
                    self.step();
                
                }, speed );
            },
            /**
             * A step in time on the scene
             *
             * @return N/A
             */
            step: function() {
            
                var self = this;
                
                this.goals.evaluated = [];
                this.goals.goalDurations = [];

                // Process the actions and goals for each item on scene
                this.sceneItems.each( function( item ) {
                    self.processItem( item );
                });

                self.debugView.render({
                    data: {
                        goals: this.goals.goalDurations
                    },
                    element: '.goals'
                });
            
            },
            /**
             * Process actions from item according to the scene environment
             *
             * @param {Backbone Model} item
             * @return N/A
             */
            processItem: function( item ) {
            
                // Push the surroundings into the item and return the items act intelligence
                var action = item.act( this.listSurroundings( item ) );
                
                // Perform the item's requested action
                Actions.perform( action, item, this );

                // Evaluate item goals
                this.goals.evaluate( item, this.gameItems, this );

            },
            /**
             * Calculates new position if item is moved in asked direction with with the items step size
             *
             * @param {HTML element} item
             * @param {String} direction @example 'ne'
             * @return {Array} position @example [0,0]
             */
            calculatePosition: function( item, direction ) {
            
                var currentPosition = item.getCurrentPosition( item.get('element') ),
                    newPosition     = [],
                    moveSteps       = item.get('moveSteps'),
                    directions      = this.directions[ direction ],
                    steps           = [ directions[0] * moveSteps[0], directions[1] * moveSteps[1] ];
                   
                newPosition = [ currentPosition[0] + steps[0], currentPosition[1] + steps[1] ];
            
                return newPosition;
            },
            /**
             * List and provide surroundings from physics engines
             *
             * @param {Object} item
             * @return {Object} lookup object with possible tests
             */
            listSurroundings: function( item ) {
            
                var self            = this,
                    element         = item.get('element'),
                    itemSize        = [ element.outerWidth( true ), element.outerHeight( true ) ],
                    testDirections  = [ 'n','s','e','w' ];
           
                var testConditions  = {
                    container: {
                        // Declaring physics engines/plugins
                        collision: function() {
                            return CheckContainerCollision({
                                item:                   item,
                                itemSize:               itemSize,
                                testDirections:         testDirections,
                                containerBounderies:    self.bounderies,
                                app:                    self
                            });
                        } // add more here
                    },
                    items: {
                        collision: function() {
                            // TODO
                        }
                    }
                };
                    
                return testConditions;
  
            }
            
        });
    
        return view;
    
    });