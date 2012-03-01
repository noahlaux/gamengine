define( function() {
   /**
    * Check if item collides with container PLUGIN
    *
    * @param {Object} options
    * @return {Object}
    */
    var logic = function checkContainerCollision ( options ) {

        var self                = this,
            itemSize            = ( options.itemSize !== undefined ) ? options.itemSize : [ options.item.get('element').outerWidth( true ), options.item.get('element').outerHeight( true ) ],
            testDirections      = options.testDirections || [ 'n','s','e','w' ],
            containerBounderies = options.containerBounderies,
            result              = {};

        _.each( testDirections, function( direction ) {
            
            // Get items position if move in the requested direction
            var testPosition = options.app.calculatePosition( options.item, direction );
            
            // Store true or false wether the current item collide with container borders if moved to test position
            result[ direction ] = containerCollision( direction, testPosition, itemSize, containerBounderies );
            
        });

        return result;

        /**
         * Check if item collides with container
         *
         * @param {String} direction
         * @param {Array} testPosition
         * @param {Array} itemSize
         * @param {Array} containerBounderies
         * @return {Boolean}
         */
        function containerCollision( direction, testPosition, itemSize, containerBounderies ) {

            var result; // Dont move this, as theres no result as the last return return false before set thus always false

            // Test top collision
            if ( direction.indexOf('n') > -1 ) {
                return result  = ( testPosition[1] ) <= 0;
            }

            // Test bottom collision
            if ( direction.indexOf('s') > -1 ) {
                return result = ( testPosition[1] + itemSize[1] ) >= containerBounderies[1];
            }

            // Test east collision
            if ( direction.indexOf('e') > -1 ) {
                return result = ( testPosition[0] + itemSize[0] ) >= containerBounderies[0];
            }

            // Test west collision
            if ( direction.indexOf('w') > -1 ) {
                return result = (  testPosition[0] ) <= 0;
            }

            // if none found
            return false;
        }
    }
    
    return logic;
});