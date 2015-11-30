/* global console, PARTICLES */

//todo:
//complete rigging gui.dat
//pull in bokeh from this reference:
//http://jabtunes.com/labs/3d/dof/webgl_postprocessing_dof2.html

'use strict';

var PARTICLES = (function() {
    //vars
    var container,
        stats,
        camera,
        scene,
        renderer,
        particle,
        mouseX = 0,
        mouseY = 0,
        windowHalfX = window.innerWidth / 2,
        windowHalfY = window.innerHeight / 2,
        particleSpeed = 100000,
        particleSpread = 1000,
        particleNumber = 800,
        resetMe = false,
        gui=null,
        reset = function() {

            console.log('PARTICLES.reset called');
            resetMe = true; //stop animation frame

            //cancelAnimationFrame(this.id);// Stop the animation
            //this.renderer.domElement.addEventListener('depthblurclick', null, false); //remove listener to render
            scene = null;
            stats = null;
            renderer=null;
            particle=null;
            //projector = null;
            camera = null;
            gui = null; 
            //controls = null;
            //empty(this.modelContainer);


            //remove and replace dom elements
            var parent = document.getElementsByTagName("BODY")[0];
            var child = document.getElementById("particles");
            parent.removeChild(child);

            removeGui(parent,gui);

            //init();

        },
        init = function() {
            console.log('PARTICLES.init called');
            //debugger;

            //add dom elements
            container = document.createElement('div');
            container.id = "particles";
            document.body.appendChild(container);

            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 5000);
            camera.position.z = 1000;

            scene = new THREE.Scene();

            var material = new THREE.SpriteMaterial({
                map: new THREE.CanvasTexture(generateSprite()),
                blending: THREE.AdditiveBlending
            });

            for (var i = 0; i < particleNumber; i++) {

                particle = new THREE.Sprite(material);

                initParticle(particle, i * 10);

                scene.add(particle);
            }
            renderer = new THREE.CanvasRenderer();
            renderer.setClearColor(0x000000);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            container.appendChild(renderer.domElement);

            stats = new Stats();
            stats.domElement.style.position = 'absolute';
            stats.domElement.style.top = '0px';
            container.appendChild(stats.domElement);

            document.addEventListener('mousemove', onDocumentMouseMove, false);
            document.addEventListener('touchstart', onDocumentTouchStart, false);
            document.addEventListener('touchmove', onDocumentTouchMove, false);

            //

            window.addEventListener('resize', onWindowResize, false);
            animate();
            addGui();
        },
        removeGui = function(parent, gui){
              parent.removeChild(gui.domElement);
        },
        addGui = function() {

            console.log("PARTICLES.addGui")
            gui = new dat.GUI();
            var params = {
                cameraposZ: 1000,
                partSpeed: particleSpeed,
                partSpread: particleSpread,
                partNumber: particleNumber
            };
            gui.add(params, 'cameraposZ').min(0).max(5000).step(1).onFinishChange(function() {
                // refresh based on the new value of params.interation
                camera.position.z = params.cameraposZ;
            });
            gui.add(params, 'partSpeed').min(0).max(200000).step(1000).onFinishChange(function() {
                // refresh based on the new value of params.interation
                particleSpeed = params.partSpeed;
            });
            gui.add(params, 'partSpread').min(0).max(5000).step(250).onFinishChange(function() {
                // refresh based on the new value of params.interation
                particleSpread = params.partSpread;
            });
            gui.add(params, 'partNumber').min(0).max(5000).step(50).onFinishChange(function() {
                // refresh based on the new value of params.interation
                particleNumber = params.partNumber;
            });
            //gui.add( effectController, "threshold", 0, 1, 0.001 ).onChange( matChanger );

            // gui.add( effectController, "enabled" ).onChange( matChanger );
            // gui.add( effectController, "jsDepthCalculation" ).onChange( matChanger );
            // gui.add( effectController, "shaderFocus" ).onChange( matChanger );
            // gui.add( effectController, "focalDepth", 0.0, 200.0 ).listen().onChange( matChanger );

            // gui.add( effectController, "fstop", 0.1, 22, 0.001 ).onChange( matChanger );
            // gui.add( effectController, "maxblur", 0.0, 5.0, 0.025 ).onChange( matChanger );

            // gui.add( effectController, "showFocus" ).onChange( matChanger );
            // gui.add( effectController, "manualdof" ).onChange( matChanger );
            // gui.add( effectController, "vignetting" ).onChange( matChanger );

            // gui.add( effectController, "depthblur" ).onChange( matChanger );

            // gui.add( effectController, "threshold", 0, 1, 0.001 ).onChange( matChanger );
            // gui.add( effectController, "gain", 0, 100, 0.001 ).onChange( matChanger );
            // gui.add( effectController, "bias", 0,3, 0.001 ).onChange( matChanger );
            // gui.add( effectController, "fringe", 0, 5, 0.001 ).onChange( matChanger );

            // gui.add( effectController, "focalLength", 16, 80, 0.001 ).onChange( matChanger )

            // gui.add( effectController, "noise" ).onChange( matChanger );

            // gui.add( effectController, "dithering", 0, 0.001, 0.0001 ).onChange( matChanger );

            // gui.add( effectController, "pentagon" ).onChange( matChanger );

            // gui.add( shaderSettings, "rings", 1, 8).step(1).onChange( shaderUpdate );
            // gui.add( shaderSettings, "samples", 1, 13).step(1).onChange( shaderUpdate );

            // matChanger();

            window.addEventListener('resize', onWindowResize, false);

        },
        onWindowResize = function() {

            windowHalfX = window.innerWidth / 2;
            windowHalfY = window.innerHeight / 2;

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize(window.innerWidth, window.innerHeight);

        },

        generateSprite = function() {

            var canvas = document.createElement('canvas');
            canvas.width = 16;
            canvas.height = 16;

            var context = canvas.getContext('2d');
            var gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
            gradient.addColorStop(0, 'rgba(255,255,100,0.5)');
            gradient.addColorStop(0.2, 'rgba(255,255,100,0.5)');
            gradient.addColorStop(0.8, 'rgba(255,255,100,0.5)');
            gradient.addColorStop(1, 'rgba(255,255,100,0)');

            context.fillStyle = gradient;
            context.fillRect(0, 0, canvas.width, canvas.height);

            return canvas;

        },

        initParticle = function(particle, delay) {

            var particle = this instanceof THREE.Sprite ? this : particle;
            var delay = delay !== undefined ? delay : 0;
            var randomx = (Math.random() * particleSpread) - windowHalfX;
            var randomy = (Math.random() * particleSpread) - windowHalfY;
            var randomz = Math.random() * particleSpread;

            particle.position.set(randomx, randomy, randomz);
            particle.scale.x = particle.scale.y = Math.random() * 32 + 16;

            new TWEEN.Tween(particle)
                .delay(delay)
                .to({}, 10000)
                .onComplete(initParticle)
                .start();

            new TWEEN.Tween(particle.position)
                .delay(delay)
                .to({
                    x: Math.random() * 4000 - 2000,
                    y: Math.random() * 1000 - 500,
                    z: Math.random() * 4000 - 2000
                }, particleSpeed)
                .start();

            new TWEEN.Tween(particle.scale)
                .delay(delay)
                .to({
                    x: 0.01,
                    y: 0.01
                }, 10000)
                .start();

        },

        //

        onDocumentMouseMove = function(event) {

            mouseX = event.clientX - windowHalfX;
            mouseY = event.clientY - windowHalfY;
        },

        onDocumentTouchStart = function(event) {

            if (event.touches.length == 1) {

                event.preventDefault();

                mouseX = event.touches[0].pageX - windowHalfX;
                mouseY = event.touches[0].pageY - windowHalfY;

            }

        },

        onDocumentTouchMove = function(event) {

            if (event.touches.length == 1) {

                event.preventDefault();

                mouseX = event.touches[0].pageX - windowHalfX;
                mouseY = event.touches[0].pageY - windowHalfY;

            }
        },

        //

        animate = function() {
            console.log('PARTICLES.animate');
            if(resetMe == true){
                resetMe = false;
            }else{
                requestAnimationFrame(animate);

                render();
                stats.update();
            }
        },

        render = function() {

            TWEEN.update();

            camera.position.x += (mouseX - camera.position.x) * 0.05;
            camera.position.y += (-mouseY - camera.position.y) * 0.05;
            camera.lookAt(scene.position);

            renderer.render(scene, camera);

        }
    return {
        init: init,
        reset: reset
    };
}());