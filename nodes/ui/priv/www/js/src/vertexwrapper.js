define([
    'src/geometrygraphsingleton', 
    'src/interactioncoordinator',
    ], 
    function(geometryGraph, coordinator) {

    // ---------- Common ----------
    
    var Model = Backbone.Model.extend({

        initialize: function(vertex) {
            this.vertex = vertex;
            this.views = [];
            this.vertex.on('descendantChanged', this.descendantChanged, this);
        },

        destroy: function() {
            this.views.forEach(function(view) {
                view.remove();
            });
            this.views = [];
            this.vertex.off('descendantChanged', this.descendantChanged, this);

        },  

        descendantChanged: function(descendant) {
            this.vertex.trigger('change', this.vertex);
        },

    });

    var DOMView = Backbone.View.extend({

    });

    // ---------- Editing ----------

    var EditingModel = Model.extend({

        okCreate: function() {
            geometryGraph.commitCreate(this.vertex);
        },

        okEdit: function() {
            geometryGraph.commitEdit();
        },

        cancel: function() {
            geometryGraph.cancel(this.vertex);
        },

    });

    var EditingDOMView = Backbone.View.extend({

        tagName: 'tr',
        className: 'vertex editing',

        initialize: function() {
            this.render();
            this.$el.addClass(this.model.vertex.id);
            this.model.vertex.on('change', this.update, this);
        },

        remove: function() {
            Backbone.View.prototype.remove.call(this);
            this.model.vertex.off('change', this.update, this);
        },

        events: {
            'focusin .field'  : 'fieldFocusIn',
            'focusout .field' : 'fieldFocusOut',
            'change .field'   : 'fieldChange',
            // 'keyup .field'    : 'fieldChange',
        },

        fieldFocusIn: function(event) {
            coordinator.setFieldFocus(true);
        },

        fieldFocusOut: function(event) {
            coordinator.setFieldFocus(false);
        },

        fieldChange: function(event) {
            this.updateFromDOM();
            this.model.vertex.trigger('change', this.model.vertex);
        },

    });


    // ---------- Display ---------

    var DisplayDOMView = Backbone.View.extend({

        tagName: "tr",
        className: 'vertex display',

        initialize: function() {
            this.render();
            this.$el.append('<td><div class="delete"></div></td>');
            this.$el.addClass(this.model.vertex.name);  
            this.model.on('selected', this.select, this);
            this.model.on('deselected', this.deselect, this);
            this.model.vertex.on('change', this.update, this);
        },

        remove: function() {
            Backbone.View.prototype.remove.call(this);
            this.model.off('selected', this.select, this);
            this.model.off('deselected', this.deselect, this);
            this.model.vertex.off('change', this.update, this);
        },

    });

    return {
        Model: Model,
        EditingModel: EditingModel,
        EditingDOMView: EditingDOMView,
        DisplayDOMView: DisplayDOMView,

    }
    

});

