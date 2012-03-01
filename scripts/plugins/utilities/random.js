/**
 * Utilities to randomize
 *
 * @version 1.0
 * @author Noah Laux (noahlaux@gmail.com)
 *
 * @return {Object}
 */
define( function() {

    var random = {
        /**
         * Get random element from an array of elements
         *
         * @param {Array} array
         * @return {Element}
         */
        arrayElement: function( array ) {
            if ( array.length === 0 ) {
                throw new Error("The array is empty.");
            }
            return array[ Math.floor( Math.random() * array.length ) ];
        },

        /**
         * Calculates a random integer between min and max value
         *
         * @param {Integer} min
         * @param {Integer} max
         * @return {Integer}
         */

        integer: function( min, max ) {
            return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
        }
    };

    return random;

});