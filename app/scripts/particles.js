/* global console, PARTICLES */

//todo:
//complete rigging gui.dat
//pull in bokeh from this reference:
//http://jabtunes.com/labs/3d/dof/webgl_postprocessing_dof2.html

'use strict';

var PARTICLES = (function($) {

    var settings = {},
        gui = null,
        img = null,
        cv = null,
        ctx = null,
        particles = null,
        camera = null,
        scene = null,
        windowX = null,
        windowY = null,
        windowHalfX = null,
        windowHalfY = null,
        mouseX = null,
        mouseY = null,
        geometry = null,
        renderer = null,
        stats = null,
        raycaster = null,
        resetMe = false,
        me = null,
        particle = null,
        texture = null,
        extrudeSettings = null,
        pointLight = null,
        particleList = [],
        init = function() {
            settings = {
                number: 100,
                zoom: 400,
                particleDepth: 200,
                speedMax: 4,
                speedMin: 3.5,
                width: screen.width,
                height: screen.height,
                shape: 0,
                rotation: 50,
                vertices: 4,
                maxsize: 0.2,
                minsize: 0.1,
                spread: 0, //doesn't work
                renderer: 0,
                cameramove: false,
                cameramove: false,
                reset: reset,
                color: "#1861b3",
                angle: 0,
                lightZ: 15300,
                targetActive: false,
                targetX: 400,
                targetY: 400,
                camx: 0,
                camy: 0
            };

            windowX = window.innerWidth;
            windowY = window.innerHeight;

            windowHalfX = windowX / 2;
            windowHalfY = windowY / 2;

            //user events
            document.addEventListener('mousemove', onDocumentMouseMove, false);
            document.addEventListener('touchstart', onDocumentTouchStart, false);
            document.addEventListener('touchmove', onDocumentTouchMove, false);
            window.addEventListener('resize', onWindowResize, false);

            //add dat.gui//
            gui = new dat.GUI();
            gui.add(settings, 'particleDepth').min(0).max(30000).step(100).onFinishChange(reset);
            gui.add(settings, "zoom").min(0).max(90000).step(500).onChange(function() {
                $('body').css('perspective', settings.zoom + 'px');
                reset();
            });
            gui.add(settings, "cameramove");
            gui.add(settings, 'camx').listen();
            gui.add(settings, 'camy').listen();
            gui.addColor(settings, 'color').onChange(
                function() {
                    $('.particle_color').css('background-color', settings.color)
                }
            );
            gui.add(settings, "speedMax").min(0).max(10).step(0.5).onFinishChange(function() {
                reset();
            });
            gui.add(settings, "speedMin").min(0).max(10).step(0.5).onFinishChange(function() {
                reset();
            });
            gui.add(settings, "number").min(0).max(500).step(1).onFinishChange(reset);
            gui.add(settings, "spread").min(0).max(40000).step(1).onFinishChange(reset);
            gui.add(settings, "width", 0).step(1);
            gui.add(settings, "height", 0).step(1);
            gui.add(settings, "shape", {
                circle: 0,
                heart: 1,
                hexagon: 2
            });
            gui.add(settings, "rotation", 0, 360);
            gui.add(settings, "targetActive");
            gui.add(settings, "targetX").min(0).max(1920).step(10).onFinishChange(reset);
            gui.add(settings, "targetY").min(0).max(1080).step(10).onFinishChange(reset);
            gui.add(settings, "vertices", 2, 10).step(1);
            gui.add(settings, "maxsize").min(0.1).max(1).step(0.1).onFinishChange(reset);
            gui.add(settings, "minsize").min(0.1).max(1).step(0.1).onFinishChange(function() {
                if (settings.minsize > settings.maxsize) this.setValue(settings.maxsize);
            });
            gui.add(settings, 'angle').listen();
            gui.add(settings, "reset");

            //add stats
            stats = new Stats();
            stats.domElement.style.position = 'absolute';
            stats.domElement.style.top = '0px';
            document.body.appendChild(stats.domElement);

            createParticles();
            animate();

        },
        reset = function() {
            removeParticles();
            createParticles();
            animate();
        },
        getColor = function() {
            //var colorObj = new THREE.Color( settings.color );
            var hex = colorObj.getHexString();
            var newcolor = "0x" + hex;
            return eval(newcolor);
        },
        createParticles = function() {
            particles = document.createElement('div');
            particles.id = "particles";
            document.body.appendChild(particles);

            for (var i = 0; i < settings.number; i++) {
                $('#particles').append('<div id="part' + i + '" class="hex1 hexagon-wrapper"><div class="particle_color hexagon"></div></div>');
                //add to objStore
                particleList.push(particle);
                //particle.orbit = Math.random*365;

                //var $part = $('#' + particle.id);
                var part = document.getElementById('part' + i);
                //initParticle(i, delay);
                //initParticle("part" + i, delay);


                var randomx = Math.round(settings.width / 2 - Math.random() * settings.width / 2);
                var randomy = Math.round(settings.height / 2 - Math.random() * settings.height / 2);
                var randomz = Math.round(Math.random() * settings.particleDepth + 100);
                var randomZrotation = Math.round(Math.random() * 4) * 360;
                var randomXrotation = Math.round(Math.random() * 4) * 360;
                var randomYrotation = Math.round(Math.random() * 4) * 360;
                var particleSpeed = Math.random() * (settings.speedMax - settings.speedMin) + settings.speedMin;
                var particleDelay = Math.random() * 0.5;


                TweenLite.set(part, {
                    rotationZ: randomZrotation,
                    rotationX: randomXrotation,
                    rotationY: randomYrotation,
                    x: randomx,
                    y: randomy,
                    z: randomz
                });
                TweenLite.to(part, particleSpeed, {
                    rotationX: 0,
                    rotationY: 0,
                    rotationZ: 0,
                    z: 0,
                    delay: particleDelay,
                    ease: Sine.easeOut,
                    transformOrigin: "left 50% -5"
               });
            }

        },
        removeParticles = function() {
            console.log('PARTICLES.removeParticles called');
            var len = particleList.length;
            for (var i = 0; i < len; i++) {
                $('#part' + i).remove();
            }
            particleList = [];
        },
        update = function() {


        },
        onDocumentMouseMove = function(event) {
            //console.log('moving');
            //console.log('mouseX: ' + mouseX + ' mouseY: ' + mouseY)

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
        onWindowResize = function() {
            windowX = window.innerWidth;
            windowY = window.innerHeight;

            windowHalfX = window.innerWidth / 2;
            windowHalfY = window.innerHeight / 2;
        },
        animate = function() {
            //console.log('PARTICLES.animate');

            if (resetMe == true) {
                resetMe = false;
            } else {
                requestAnimationFrame(animate);

                render();
                stats.update();
            }
        },
        render = function() {
            settings.angle = (settings.angle + 1) % 360;
            TWEEN.update();

            if (settings.cameramove) {

                settings.camx += (mouseX * 3 - settings.camx) * 0.05;
                settings.camy += (-mouseY * 3 - settings.camy) * 0.05;

                //solve percent of screen width
                //$('body').css('perspective-origin', settings.camx + ' ' + settings.camy);

            }
        };
    return {
        init: init
    };
}(jQuery));