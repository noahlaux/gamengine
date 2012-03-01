/**
 * Action that makes item move on scene
 *
 * @version 1.0
 * @author Noah Laux (noahlaux@gmail.com)
 *
 * @return {Function} action
 */
define( function() {
    /**
     * Declare action
     *
     * @function
     * @public
     *
     * @param {Object} action current requested item action
     * @param {Backbone model} item current item
     * @param {Backbone model} scene current scene
     * @return N/A
     */
    var action = function( action, item, scene ) {

        // Check if direction exists in scene directions
        if ( scene.directions[ action.direction ]) {

            // Calculate where to move the item in scene space
            var to = scene.calculatePosition( item, action.direction );

            // Move item to new position
            item.set( {
                'position': to
            });

            // Only change direction if it is deferent than the current
            if ( action.direction !== item.get('direction') ) {
                // Set new item direction in model, and this fire the view to render as well
                item.set('direction', action.direction );
            }
        }

    };
    
    return action;

});