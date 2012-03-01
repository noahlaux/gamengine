define( function() {
/**
 * Check if item collides with other items bounderies PLUGIN
 * TODO finish this!!!
 *
 * @return {Function}
 */
    var logic = function ( options ) {

        var self            = this,
            currentItem     = options.get('item'),
            moveSteps       = currentItem.get('moveSteps'),
            currentPosition = options.app.getCurrentPosition( currentItem ),
            otherItems      = _.filter( this.collection.models, function ( model ) { // NB WE DONT HAVE this.collection.models so this will break, get from options
                // Filter out the current item from the list
                return model !== self;
            });

        // Check if we collide on any of the other item
        _.each( otherItems, function( model, i ){
            // TODO make collision detection for other items
            //console.log(currentPosition)
            var item = model.get('item');

            //console.log(item)
            var hitN = ( currentPosition[1] + moveSteps[1] ) === options.app.getCurrentPosition( item )[1] + item.outerHeight(true);
            //console.log( ( currentPosition[1] + moveSteps[1] ),  self.getCurrentPosition( item )[1] + item.outerHeight(true))
            if ( hitN ) {
                self.changeHeading('S');
            }
        });

    };
    
    return logic;
});