define([
  'order!jquery',
  'order!underscore',
  'order!backbone',
  'mustache',
  'models/score',
  'text!templates/surface/score.html'
], function( $, _, Backbone, mustache, ScoreModel, ScoreTemplate ) {
   
    var view = Backbone.View.extend({
        /**
         * initialize
         *
         * @param {Object} options
         * @return N/A
         */
        initialize: function( options ) {

            // Add current game items to model
            this.model = new ScoreModel({
                gameItems:  options.gameItems,
                app:        options.app
            });
            
            // Render view each time model is changed
            this.model.on('change', this.render, this);
            
            // Render view
            this.render();
        },
        /**
         * Render
         */
        render: function( ) {
            
            console.log('render score view');
            
            // Assemble current scores
            var data = {
                gameItems: this.model.getScores()
            };
            
            // Render score to html
            this.$el.html( mustache.to_html( ScoreTemplate, data ) );
            
            // For chaining
            return this;
        }
     });
     
     return view;
     
});