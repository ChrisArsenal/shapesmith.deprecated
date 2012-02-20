var SS = SS || {};

SS.TorusCreator = SS.PrimitiveCreator.extend({

    initialize: function(attributes) {
        SS.PrimitiveCreator.prototype.initialize.call(this, attributes);

        this.views = this.views.concat([
            new SS.TorusPreview({model: this}),
            new SS.DraggableRadiusCorner({model: this, key: 'r1'}),
            new SS.TorusR2Corner({model: this}),
        ]);
        this.trigger('change', this);
    },
    
    setDefaultParamters: function() {
        this.node.parameters.r1 = 20;
        this.node.parameters.r2 = 5;
        this.node.extra = {angle: 0};
    },

    mouseDownOnRadius: function(corner) {
        this.activateCorner(corner);
    },

    getBoundingBox: function() {
        var origin = this.node.origin;
        var r1 = this.node.parameters.r1;
        var r2 = this.node.parameters.r2;
        return {min: new THREE.Vector3(origin.x - r1 - r2, origin.y - r1 - r2, origin.z - r2),
                max: new THREE.Vector3(origin.x + r1 + r2, origin.y + r1 + r2, origin.z + r2)};
    },

});

SS.TorusPreview = SS.PreviewWithOrigin.extend({

    initialize: function() {
        SS.PreviewWithOrigin.prototype.initialize.call(this);
        this.render();
    },
    
    render: function() {
        this.clear();
        SS.PreviewWithOrigin.prototype.render.call(this);

        var origin = this.model.node.origin;
        var r1 = this.model.node.parameters.r1;
        var r2 = this.model.node.parameters.r2;

        if (r1) {
	    var circleGeom = new THREE.Geometry();
	    for(var i = 0; i <= 50; ++i) {
	        var theta = Math.PI*2*i/50;
	        var dx = r1*Math.cos(theta);
	        var dy = r1*Math.sin(theta);
	        circleGeom.vertices.push(new THREE.Vertex(new THREE.Vector3(dx, dy, 0)));
	    }
	    var circle1 = new THREE.Line(circleGeom, SS.constructors.lineMaterial);
	    this.sceneObject.add(circle1);

            if (z !== 0) {
	        var circle2 = new THREE.Line(circleGeom, SS.constructors.lineMaterial);
                circle2.position.z = -origin.z;
	        this.sceneObject.add(circle2);
            }
        }

        if (r1 && r2) {
            var circleGeomA = new THREE.Geometry(), circleGeomB = new THREE.Geometry();
	    for(var i = 0; i <= 50; ++i) {
		var theta = Math.PI*2*i/50;
		var dx1 = (r1 + r2)*Math.cos(theta);
		var dy1 = (r1 + r2)*Math.sin(theta);
		var dx2 = (r1 - r2)*Math.cos(theta);
		var dy2 = (r1 - r2)*Math.sin(theta);
		circleGeomA.vertices.push(new THREE.Vertex(new THREE.Vector3(dx1, dy1, 0)));
		circleGeomB.vertices.push(new THREE.Vertex(new THREE.Vector3(dx2, dy2, 0)));
	    }
	    var circle3 = new THREE.Line(circleGeomA, SS.constructors.lineMaterial);
	    this.sceneObject.add(circle3);

	    var circle4 = new THREE.Line(circleGeomB, SS.constructors.lineMaterial);
	    this.sceneObject.add(circle4);

	    var geometry = new THREE.TorusGeometry(r1, r2, 10, 50);
	    var torus = new THREE.Mesh(geometry, SS.constructors.faceMaterial);

	    this.sceneObject.add(torus);

            if (origin.z !== 0) {
	        var circle5 = new THREE.Line(circleGeomA, SS.constructors.lineMaterial);
                circle5.position.z = -origin.z;
	        this.sceneObject.add(circle5);

	        var circle6 = new THREE.Line(circleGeomB, SS.constructors.lineMaterial);
	        this.sceneObject.add(circle6);
                circle6.position.z = -origin.z;

            }
        }
        

       
        this.postRender();
    },

});


SS.TorusR2Corner = SS.DraggableCorner.extend({

    initialize: function(options) {
        SS.DraggableCorner.prototype.initialize.call(this, options);
        this.render();
    },

    priority: 2,

    mouseDown: function() {
        this.model.mouseDownOnRadius(this);
    },

    cornerPositionFromModel: function() {
        var r1 = this.model.node.parameters.r1;
        var r2 = this.model.node.parameters.r2;
        var angle = this.model.node.extra.angle;
        var dx = Math.cos(angle)*(r1 + r2);
        var dy = Math.sin(angle)*(r1 + r2);
        return {x: this.model.node.origin.x + dx,
                y: this.model.node.origin.y + dy,
                z: this.model.node.origin.z};
    },

    updateModelFromCorner: function(position) {
        var dx = position.x - this.model.node.origin.x;
        var dy = position.y - this.model.node.origin.y;
        var angle = Math.atan2(dy, dx);

        var r = Math.sqrt(dx*dx + dy*dy);
        var r2 = Math.abs(r - this.model.node.parameters.r1);
        this.model.node.parameters.r2 = Math.round(r2);
        this.model.node.extra = {angle: angle};
    },

});