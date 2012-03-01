define([
    'order!jquery',
    'order!underscore',
    'order!backbone'
    ], function( $, _, Backbone, standard ) {

        var model = Backbone.Model.extend({

            // Defaults
            defaults: {
                moveSteps:          [ 5, 5 ], // [ x, y ]
                startPosition:      [ 0, 0 ], // [ x,y ]
                className:          'gameItem', // CSS Class name for game item
                style:              {}, // Additional styling
                containerCollision: true, // check for container collision on each step
                itemsCollision:     false, // Check for item collision on each step
                position:           [ 0, 0 ], // Fixed
                direction:          'nw' // Default direction (NB! should be north or south first and then east or west. Can also be just one ('n' fx) )
            },
            /**
             * Initialize
             *
             * @param {Object} options
             */
            initialize: function( options ) {

            },
            /**
             * Get current position on item
             * // TODO should be moved along with 'animation' to app||scene instead as it's generic
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
                         * Parses position from CSS 3 transform
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
                         * Gets items current position in CSS 3 transform
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
             * Model act intelligence per step
             *
             * @param {Object} surroundings intelligence
             * @return {Object} action
             */
            act: function( surroundings ) {
            
                var direction   = this.get('direction'), // must be fx 'ne' and 'sw' NOT 'en' or 'ws'. North or south first and then east or west
                    directions  = direction.split(""), // split into two (because the direction can be fx 'ns') and we want to test for both directions
                    collisions  = surroundings.container.collision(); // Hook into container collisions logic
            
                // Check for collisions if item model has asked for it
                if ( this.get('containerCollision') ) {
                
                    if ( collisions[ directions[0] ] ) {
                        direction = ( directions[0] === 'n' ) ? direction.replace('n','s') : direction.replace('s','n');
                    }

                    if ( collisions[ directions[1] ] ) {
                        direction = ( directions[1] === 'e' ) ? direction.replace('e','w') : direction.replace('w','e');
                    }
                
                }
            
                // Return our calculated action to scene item parser
                return {
                    type: "move",
                    direction: direction
                };
            }
        });
    
        return model;
    
    });