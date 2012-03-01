define([
    'order!jquery',
    'order!underscore',
    'order!backbone',
    'models/gameItem',
    'text!templates/items/standard.html'
    ], function( $, _, Backbone, GameItem, standard ) {
    
        var view = Backbone.View.extend({
        
            model: GameItem,
        
            template: standard,

            events: {
                'click': 'itemClick'
            },
            /**
             * initialize
             *
             * @param {Object} options
             * @return N/A
             */
            initialize: function( options ) {
            
                console.log('gameItemView init', options);

                this.$el.html( options.model.get('template') ? options.model.get('template') : this.template );
                
                // Store element in model for later calculations
                this.model.set( 'element', this.$el.find('.gameItem') );
                
                // Set start position
                this.calculateStyle( {position: this.model.get('startPosition')} );
                
                this.model.get('element')
                    // Add class names
                    .addClass( this.model.get('className') )
                    // Set additional styling (if any)
                    .css( this.model.get('style') );
                
                // If model change render view
                this.model.bind('change', this.render, this);
                
                // If model destroys call items remove method
                this.model.bind('destroy', this.remove, this);
            },

            render: function() {
                //console.log('game item view render');
               
               this.calculateStyle();

               // Return for changing
               return this;
            },
            /**
             * Return item
             *
             * @return {HTML element}
             */
            getItem: function() {
                return this.$el;//this.model.get('element');
            },
            /**
             * Calculate style
             *
             * @param {Object} options
             * @return N/A
             */
            calculateStyle: function( options ) {
                 
                var css = this.parsePosition( ( options && options.position) ? options.position : this.model.get('position') );
                
                this.model.get('element').css( css );
            },
            /**
             * Parses position in translate3D for GPU acceleration
             *
             * @param {Array} position
             * @return {String} c
             */
            parsePosition: function( position ) {
                
                // TODO rewrite to regex for better performance
                return {
                    '-webkit-transform': 'translate3d({0}px,{1}px,0px)'
                        .replace('{0}', position[0])
                        .replace('{1}', position[1])
                };

            },
            itemClick: function ( e ) {
                this.model.destroy();
            }

        });

        return view;
    });