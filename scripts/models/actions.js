/**
 * Performs loading and declaration of actions that should be part of the game
 *
 * @version 1.0
 * @author Noah Laux (noahlaux@gmail.com)
 *
 * @return {Object} object with action functions
 */
define(
    // Load action models here
    [
    'models/actions/move'
    ],
    function( Move ) {
    
        // Actions available to scene and game items
        var actions = {
            'move': Move
        };
    
        // Public methods
        var methods = {
            /**
             * Perform actions
             *
             * @public
             *
             * @param {String} action
             * @param {Backbone model} item current item to evaluate
             * @param {Backbone model} scene link to scene
             */
            perform: function( action, item, scene ) {

                // Check if action exists
                if ( actions[ action.type ] ) {
                    // Perform action
                    actions[ action.type ]( action, item, scene );
                } else {
                    throw new Error( 'Unsupported action: ' + action.type );
                }
            }
        };
  
        // Return public methods
        return methods;
    
    });