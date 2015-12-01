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
        particleNumber = 280,
        resetMe = false,
        gui = null,
        maxSize = 32,
        minSize = 16,
        particleShape = 0,

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

            //places particles on stage
            createParticles();

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

            window.addEventListener('resize', onWindowResize, false);
            animate();
            addGui();

            console.log('1 -- ' + scene);
            console.log('2 -- ' + scene.children);
            //console.log('3 -- ' + scene.getObjectByName('part1', true))
        },
        createParticles = function() {
            var material = new THREE.SpriteMaterial({
                map: new THREE.CanvasTexture(generateSprite()),
                blending: THREE.AdditiveBlending
            });

            for (var i = 0; i < particleNumber; i++) {
                console.log('creating: ' + i);
                particle = new THREE.Sprite(material);

                particle.name = "part" + i;

                initParticle(particle, i * 10);
                scene.add(particle);
            }
        },
        removeParticles = function() {
            resetMe = true;
            console.log('PARTICLES.reset called');
            render();
            var parent = document.getElementsByTagName("BODY")[0];

            for (var i = 0; i < particleNumber; i++) {
                console.log('removing: ' + i);
                var me = scene.getObjectByName('part' + i);
                scene.remove(me);
            }
            render();
        },
        bokeh = function(x, y, r, shape, s, rr, ro) {
            ctx.shadowBlur = r / settings.minsize * (Math.random() * 9.9 + 0.1);

            ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillStyle = "rgba(0, 0, 0, 0.3)";

            ctx.save();
            ctx.translate(x, y + settings.height);
            ctx.beginPath();
            switch (parseInt(shape)) {
                case 0:
                    ctx.arc(0, 0, r, 0, 2 * Math.PI);
                    break;
                case 1:
                    polygon(r, s, rr, ro);
                    break;
                case 2:
                    nstar(r, s, rr, ro);
                    break;
                case 3:
                    heart(r, rr, ro);
                    break;
            }
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        },
        polygon = function(r, s, rr, ro) {
            a = 2 * Math.PI / s;

            ctx.rotate(rr * (1 - 2 * Math.random()) * Math.PI + a / 2 + ro);

            ctx.moveTo(0, r);
            for (var i = 0; i < s; i++) {
                ctx.rotate(a);
                ctx.lineTo(0, r);
            }
        },
        nstar = function(r, s, rr, ro) {
            a = 2 * Math.PI / s;

            ctx.rotate(rr * (1 - 2 * Math.random()) * Math.PI + a / 2 + ro);

            ctx.moveTo(0, r);
            for (var i = 0; i < 2 * s; i++) {
                ctx.rotate(a / 2);
                ctx.lineTo(0, r - (i % 2 == 0) * 2 * r / 3);
            }
        },
        heart = function(r, rr, ro) {
            ctx.rotate(rr * (1 - 2 * Math.random()) * Math.PI + ro);

            ctx.moveTo(0, 3 * r / 2);
            ctx.arc(-r / 2, 0, r / 2, 3 * Math.PI / 4, 0);
            ctx.arc(r / 2, 0, r / 2, Math.PI, Math.PI / 4);
            ctx.lineTo(0, 3 * r / 2);
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
            canvas.width = 200;
            canvas.height = 200;

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
            particle.scale.x = particle.scale.y = Math.random() * maxSize + minSize;

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
            if (resetMe == true) {
                resetMe = false;
            } else {
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

        },
        resetScene = function() {
            removeParticles();
            createParticles();
            animate();
        },
        addGui = function() {

            console.log("PARTICLES.addGui")
            gui = new dat.GUI();
            var params = {
                zoom: 1000,
                speed: particleSpeed,
                spread: particleSpread,
                number: particleNumber,
                max_size: maxSize,
                min_size: minSize,
                shape: particleShape,
                reset: resetScene
            };
            gui.add(params, "shape", {
                circle: 0,
                polygon: 1,
                star: 2,
                hearts: 3
            }).onFinishChange(function() {
                // refresh based on the new value of params.interation
                particleShape = shape;
            });
            gui.add(params, 'zoom').min(0).max(5000).step(1).onFinishChange(function() {
                // refresh based on the new value of params.interation
                camera.position.z = params.zoom;
            });
            gui.add(params, 'speed').min(0).max(200000).step(1000).onFinishChange(function() {
                // refresh based on the new value of params.interation
                particleSpeed = params.speed;
            });
            gui.add(params, 'spread').min(0).max(5000).step(250).onFinishChange(function() {
                // refresh based on the new value of params.interation
                removeParticles();
                particleSpread = params.spread;
                createParticles();
                render();
                animate();
            });
            gui.add(params, 'number').min(0).max(2000).step(1).onFinishChange(function() {
                // refresh based on the new value of params.interation
                removeParticles();
                particleNumber = params.number;
                createParticles();
                render();
                animate();
            });
            gui.add(params, 'max_size').min(0).max(200).step(2).onFinishChange(function() {
                // refresh based on the new value of params.interation
                removeParticles();
                maxSize = params.max_size;
                createParticles();
                render();
                animate();

            });
            gui.add(params, 'min_size').min(0).max(200).step(2).onFinishChange(function() {
                // refresh based on the new value of params.interation
                removeParticles();
                minSize = params.min_size;
                createParticles();
                render();
                animate();
            });
            gui.add( params, "shaderFocus" ).onChange(function(){
                //refresh shaderfocus
            } );
            gui.add(params, "reset");


            //gui.add( effectController, "threshold", 0, 1, 0.001 ).onChange( matChanger );

            // gui.add( effectController, "enabled" ).onChange( matChanger );
            // gui.add( effectController, "jsDepthCalculation" ).onChange( matChanger );
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

        };
    return {
        init: init,
        removeParticles: removeParticles,
        scene: scene
    };
}());