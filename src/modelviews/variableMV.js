define([
        'jquery',
        'lib/jquery.mustache',
        'lib/jquery.autoGrowInput',
        'modelviews/vertexMV',
        'geometrygraphsingleton', 
        'interactioncoordinator',
        'asyncAPI',
    ], function(
        $, __$, __$,
        VertexMV, 
        geometryGraph, 
        coordinator,
        AsyncAPI) {

    var replaceOrAppendInTable = function(newDOMView) {
        var originalModel = newDOMView.model.attributes.originalModel;
        var rowIndex =  originalModel ?
                originalModel.domView.$el.closest('tr').prevAll().length : undefined;
        if ((rowIndex !== undefined) && 
            (rowIndex < $('#variables tr').length)) {
            $($('#variables tr')[rowIndex]).before(newDOMView.$el);
        } else {
            $('#variables').append(newDOMView.$el);
        }
    }


    // ---------- Editing ----------

    var EditingModel = VertexMV.EditingModel.extend({

        initialize: function(original, vertex) {
            this.SceneView = VertexMV.SceneView;
            VertexMV.EditingModel.prototype.initialize.call(this, original, vertex);
            this.domView = new EditingView({model: this});
            this.views.push(this.domView);
            coordinator.on('sceneClick', this.tryCommit, this);
        },

        destroy: function() {
            VertexMV.EditingModel.prototype.destroy.call(this);
            coordinator.off('sceneClick', this.tryCommit, this);
        },

        containerClick: function(event) {
            event.stopPropagation();
            this.tryCommit();
        },

        // replaceOrAppendInTable: function(view, tableSelector) {
        //     var rowIndex = view.model.attributes.rowIndex;
        //     if ((rowIndex !== undefined) && 
        //         (rowIndex < $(tableSelector + ' tr').length)) {
        //         $($(tableSelector + ' tr')[rowIndex]).before(view.$el);
        //     } else {
        //         $(tableSelector).append(view.$el);
        //     }
        // },

    })

    var EditingView = VertexMV.EditingDOMView.extend({

        tagName: 'tr',

        initialize: function() {
            VertexMV.EditingDOMView.prototype.initialize.call(this);
            this.render();
            this.$el.addClass('variable');
            replaceOrAppendInTable(this); 
            $('.field').autoGrowInput();

        },

        remove: function() {
            VertexMV.EditingDOMView.prototype.remove.call(this);
            coordinator.off('sceneClick', this.model.tryCommit, this.model);
        },

        render: function() {
            var template = 
                '<td class="name">' +  
                '<input class="field var" placeholder="var" type="text" value="{{name}}"></input>' +
                '</td>' +
                '<td class="expression">' +  
                '<input class="field expr" placeholder="expr" type="text" value="{{expression}}"></input>' +
                '</td>' +
                '<td><i class="delete icon-remove"></i></td>';
            var view = {
                id: this.model.vertex.id,
            };
            if (!this.model.vertex.proto) {
                view.name = this.model.vertex.name;
                view.expression = this.model.vertex.parameters.expression;
            }
            this.$el.html($.mustache(template, view));
            return this;
        },

        update: function() {
            if (this.model.vertex.errors) {
                this.$el.addClass('error');
            } else {
                this.$el.removeClass('error');
            }
        },

        updateFromDOM: function() {
            var name = this.$el.find('.var').val();
            var expr = this.$el.find('.expr').val();
            this.model.vertex.name = name;
            this.model.vertex.parameters.expression = expr;
        },

    });

    // ---------- Editing ----------

    var DisplayModel = VertexMV.DisplayModel.extend({

        initialize: function(vertex) {
            this.SceneView = VertexMV.SceneView;
            VertexMV.DisplayModel.prototype.initialize.call(this, vertex);
            this.domView = new DisplayDOMView({model: this});
            this.views.push(this.domView);
        },

        destroy: function() {
            VertexMV.DisplayModel.prototype.destroy.call(this);
        },

        // replaceOrAppendInTable: function(view, tableSelector) {
        //     var rowIndex = view.model.attributes.rowIndex;
        //     if ((rowIndex !== undefined) && 
        //         (rowIndex < $(tableSelector + ' tr').length)) {
        //         $($(tableSelector + ' tr')[rowIndex]).before(view.$el);
        //     } else {
        //         $(tableSelector).append(view.$el);
        //     }
        // },

    })

    var DisplayDOMView = VertexMV.DisplayDOMView.extend({

        className: 'vertex display',
        tagName: 'tr',

        initialize: function() {
            VertexMV.DisplayDOMView.prototype.initialize.call(this);
            replaceOrAppendInTable(this); 
            $('.field').autoGrowInput();
        },

        remove: function() {
            VertexMV.DisplayDOMView.prototype.remove.call(this);
        },

        render: function() {
            var template = 
                '<td class="name">{{name}}</input></td>' +
                '<td class="expression">{{expression}}</td>' +
                '<td><i class="delete icon-remove"></i></td>';
            var view = {
                id: this.model.vertex.id,   
                name:  this.model.vertex.name,
                expression: this.model.vertex.parameters.expression,
            }
            this.$el.html($.mustache(template, view));
            return this;
        },

        events: {
            'click .name' : 'click',
            'click .expression' : 'click',
            'click .delete': 'delete',
        },

        click: function(event) {
            event.stopPropagation();
            if (!geometryGraph.isEditing()) {
                AsyncAPI.edit(this.model.vertex);
            }
        },

        delete: function(event) {
            event.stopPropagation();
            this.model.tryDelete();
        },

    });


    return {
        EditingModel: EditingModel,
        DisplayModel: DisplayModel,
    }

});