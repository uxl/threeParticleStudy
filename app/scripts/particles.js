/* global console, jQuery, $, PARTICLES */

'use strict';

var PARTICLES = (function($) {
    //vars
    // set the scene size
    var WIDTH = 400,
        HEIGHT = 300,

        particleCount = 1800,

        // // set some camera attributes
        VIEW_ANGLE = 45,
        ASPECT = WIDTH / HEIGHT,
        NEAR = 0.1,
        FAR = 10000,
        camera = null,
        renderer = null,
        scene = null,
        pCloud = null,
        pMaterial = null, 

        // // get the DOM element to attach to
        // // - assume we've got jQuery to hand
        $container = $('#container'),

        // imagesrc = "",
        init = function() {
            console.log('PARTICLES.init called');

            // // create a WebGL renderer, camera
            // // and a scene
            renderer = new THREE.WebGLRenderer();
            camera = new THREE.Camera(VIEW_ANGLE,
                ASPECT,
                NEAR,
                FAR),
            scene = new THREE.Scene();

            // // the camera starts at 0,0,0 so pull it back
            camera.position.z = 300,

            // // attach the render-supplied DOM element
            $container.append(renderer.domElement);

            pCloud = new THREE.Geometry();
            pMaterial = new THREE.ParticleBasicMaterial({
                color: 0xFFFFFF,
                size: 20
            });
        
            // // start the renderer - set the clear colour
            // // to a full black
            renderer.setClearColor(new THREE.Color(0, 1));
            renderer.setSize(WIDTH, HEIGHT);

            // now create the individual particles
            for (var p = 0; p < particleCount; p++) {
                // create a particle with random
                // position values, -250 -> 250
                var pX = Math.random() * 500 - 250,
                    pY = Math.random() * 500 - 250,
                    pZ = Math.random() * 500 - 250,
                    particle = new THREE.Vector3(pX, pY, pZ);

                // add it to the geometry
                pCloud.vertices.push(particle);
            }

            // create the particle system
            // var particleSystem = new THREE.ParticleSystem(
            //     pCloud,
            //     pMaterial);

            // add it to the scene
            //scene.addChild(particleSystem);
        },
        reset = function() {

        };
    return {
        init: init,
        reset: reset
    };
}(jQuery));