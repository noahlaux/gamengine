define([
  'order!jquery',
  'order!underscore',
  'order!backbone',
], function( $, _, Backbone ) {
    

    var model = Backbone.Model.extend({

        // Defaults
        defaults: {
            container:          '#container', // HTML element for output container
            item:               '#item', // HTML element template for game item
            moveSteps:          [ 10, 10 ], // [ x, y ]
            heading:            [ 'N', 'E' ], // 
            speed:              20, // Miliseconds
            startPosition:      [ 0,0 ], // [ x,y ]
            className:          'gameItem', // CSS Class name for game item
            style:              {}, // Additional styling
            containerCollision: true,
            itemsCollision:     true
        },

        /**
            * Initialize
            * 
            * @param {Object} options
            */
        initialize: function( options ) {

            var moveSteps   = this.get('moveSteps'),
                heading     = [ (moveSteps[0] > 0) ? 'N' : 'S', (moveSteps[1] > 0) ? 'E' : 'W' ], // Setup heading according to step values
                container   = $( this.get('container') ),
                item        = $( this.get('item') ).clone().removeAttr('id');

            // Wrap and cache core elements in jquery
            this.set({
                container:   container,
                item:        item,
                heading:     heading,
                bounderies:  [ container.height(), container.width() ]
            });

            // When item changes position
            this.on('change:currentPosition', function() {

                // Check for bounderies
                if ( this.get('containerCollision') ) {
                    this.checkContainerCollision();
                }

                if ( this.get('itemsCollision') ) {
                    this.checkItemsCollision();
                }

            });

            // Create item
            this.create( this.get('container'), this.get('item'), this.get('startPosition') );

        },
        /**
            * Create a new sauce
            * 
            * @param {HTML element} container
            * @param {HTML element} item
            * @param {Array} startPosition
            * 
            * @return N/A
            */
        create: function( container, item, startPosition ) {

            // Move to initial position
            this.moveTo( item, startPosition );

            // Append item to container
            container.append( item );

            // Set styles and show
            item
                .addClass( 'gameItem' )
                .addClass( this.get('className') )
                // Set additional styling (if any)
                .css( this.get('style') )
                // Show element
                .show();

            // Setup events
            this.setupEvents( item );

        },
        /**
            * Move to a specified position
            * 
            * @param {HTML element} item
            * @param {Array} position
            * @return N/A
            */
        moveTo: function( item, position ) {

            var css = this.animation().parsePosition( position );

            // Set item style
            item
                .css( css );
                //.html( position.join(' ') );

            this.set( {currentPosition: position} );

        },
        /**
            * Get current position on item
            * 
            * @param {HTML element}
            * @return {Array} position
            */
        getCurrentPosition: function ( item ) {         
            return this.animation().getPosition( item );
        },
        /**
            * Get current animation method used by browser
            * 
            * @return {String} transform | position
            */
        animation: function() {

            // Define methods
            var methods = {
                'transform' : {
                    method: 'transform',
                    /**
                        * Parses position
                        * 
                        * @param {Array} position
                        * @return {String} c
                        */
                    parsePosition: function( position ) {

                        return {
                            '-webkit-transform': 'translate3d({0}px,{1}px,0px)'
                                .replace('{0}', position[0])
                                .replace('{1}', position[1])
                                };

                    },
                    /**
                        * Gets position
                        * 
                        * @param {HTML element} item
                        * @return {Oject}
                        */
                    getPosition: function( item ) {

                        if ( item.length > 0 ) {
                            var position = item.css('-webkit-transform')
                                .replace(/matrix(|)/,'')
                                .split(',');

                            return [ parseFloat( position[4] ), parseFloat( position[5] ) ];
                        } else {
                            return [ 0,0 ];
                        }
                    }
                }
            };

            return methods['transform'];

        },
        /**
            * Calculates new position
            * 
            * @param {HTML element} item
            * @return {Array} position
            */
        calculateMovement: function( item ) {

            var currentPosition     = this.getCurrentPosition( item ),
                newPosition         = [],
                moveSteps           = this.get('moveSteps');

            // Set horisontal position
            newPosition[0] = ( this.get('heading')[1] === 'E' ) ? currentPosition[0] + moveSteps[0] : currentPosition[0] - moveSteps[0];

            // Set Vertical position
            newPosition[1] = ( this.get('heading')[0] === 'S' ) ? currentPosition[1] + moveSteps[1] : currentPosition[1] - moveSteps[1];

            return newPosition;

        },
        /**
            * Check if item collides with container bounderies
            * 
            * @return N/A
            */
            checkContainerCollision: function( ) {

            var heading             = this.get('heading'),
                moveSteps           = this.get('moveSteps'),
                item                = this.get('item'),
                bounderies          = this.get('bounderies'),
                // Check for bounderies
                currentPosition     = this.getCurrentPosition( this.get('item') ),
                hitN                = ( currentPosition[1] + moveSteps[1] ) <= 0,
                hitS                = ( currentPosition[1] - moveSteps[1] + item.outerHeight(true) ) >= bounderies[1],
                hitE                = ( currentPosition[0] - moveSteps[0] + item.outerWidth(true) ) >= bounderies[0],
                hitW                = ( currentPosition[0] + moveSteps[0] ) <= 0;

            // if we hit top
            if ( hitN ) {
                this.changeHeading('S');
            }

            if ( hitS ) {
                this.changeHeading('N');
            }

            if ( hitE ) {
                this.changeHeading('W');
            }

            if ( hitW ) {
                this.changeHeading('E');
            }
        },
        /**
            * Check if item collides with other items bounderies
            * 
            * @return N/A
            */
        checkItemsCollision: function() {

            var self            = this,
                currentItem     = this.get('item'),
                moveSteps       = this.get('moveSteps'),
                currentPosition = this.getCurrentPosition( currentItem ), 
                otherItems      = _.filter( this.collection.models, function ( model ) {
                                    // Filter out the current item from the list
                                    return model !== self;
                                });

            // Check if we collide on any of the other item
            _.each( otherItems, function( model, i ){
                // TODO make collision detection for other items
                //console.log(currentPosition)
                var item = model.get('item');

                //console.log(item)
                var hitN = ( currentPosition[1] + moveSteps[1] ) === self.getCurrentPosition( item )[1] + item.outerHeight(true);
                //console.log( ( currentPosition[1] + moveSteps[1] ),  self.getCurrentPosition( item )[1] + item.outerHeight(true))
                if ( hitN ) {
                    self.changeHeading('S');
                }
            });

        },
        /**
            * Changes the heading of the item
            * 
            * @param {String} heading N | E | S | W
            */
        changeHeading: function( heading ) {

            var currentHeading      = this.get('heading'),
                verticalHeading     = currentHeading[1],
                horisontalHeading   = currentHeading[0],
                newHeading          = [];

            if ( heading === 'N' ) {
                newHeading = [ 'N', verticalHeading ];
            } else if ( heading === 'S' ) {
                newHeading = [ 'S', verticalHeading ];
            } else if ( heading === 'E' ) {
                newHeading = [ horisontalHeading, 'E' ];
            } else if ( heading === 'W' ) {
                newHeading = [ horisontalHeading, 'W' ];
            }

            this.set( { 'heading': newHeading })

        },
        /**
            * Setup events
            * 
            * @param {HTML element}
            */
        setupEvents: function( item ) {
            var self        = this,
                container   = this.get('container'),
                bounderies  = [ container.height(), container.width() ],                
                speed       = this.get('speed');


            this.movement = setInterval( function() {
                self.moveTo( item, self.calculateMovement( item ) );
            }, speed );
        }
    });
    
    return model;
    
//});