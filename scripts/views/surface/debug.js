define([
  'order!jquery',
  'order!underscore',
  'order!backbone',
  'mustache',
  'text!templates/surface/debug.html'
], function( $, _, Backbone, mustache, Template ) {
   
    var view = Backbone.View.extend({
        /**
         * initialize
         *
         * @param {Object} options
         * @return N/A
         */
        initialize: function( options ) {
        },
        /**
         * Render
         */
        render: function( options ) {
                        
            // Assemble current scores
            var data = options.data;
            
            // Render score to html
            this.$el.find( options.element ).html( mustache.to_html( Template, data ) );
            
            // For chaining
            return this;
        }
     });
     
     return view;
     
});