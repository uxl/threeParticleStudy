/* global console, PARTICLES */
//1359x800

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
        places = {'data':
                    [['ny',1470,1860],
                    ['miami',1130,2510],
                    ['newmexico',220,2510],
                    ['ca',-439,2081],
                    ['chicago', 796, 1864],
                    ['city', 861, 2038],
                    ['city', 211, 1561]]
                },
        colors = {'data':
                    ['#1861b3','#6897cd','#b331bb']
                },
        init = function() {
            settings = {
                number: 100,
                perspective: 500,
                particleDepth: 20,
                speedMax: 11,
                speedMin: 9.5,
                scaleMax: 2,
                scaleMin: .5,
                particleDelay: 5,
                width: screen.width,
                height: screen.height,
                shape: 0,
                rotation: 2,
                vertices: 4,
                spread: 0, //doesn't work
                renderer: 0,
                cameramove: false,
                cameramove: false,
                reset: reset,
                color: "#1861b3",
                angle: 0,
                lightZ: 15300,
                targetActive: false,
                targetX: 0,
                targetY: 0,
                targetXpercentage: 0,
                targetYpercentage: 0,
                camx: 0,
                camy: 0, 
                camPercentY:0, 
                camPercentX:0
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
            gui.add(settings, 'particleDepth').min(0).max(400).step(10).onFinishChange(reset);
            gui.add(settings, "perspective").min(0).max(90000).step(500).onChange(function() {
                $('body').css('perspective', settings.perspective + 'px');
                reset();
            });
            gui.add(settings, "particleDelay").min(0).max(30).step(0.5).onFinishChange(reset);

            gui.addColor(settings, 'color').onChange(
                function() {
                    //$('.particle_color').css('background-color', settings.color);
                    reset();
                }
            );
            gui.add(settings, "scaleMax").min(0).max(10).step(0.25).onFinishChange(reset);
            gui.add(settings, "scaleMin").min(0).max(20).step(0.25).onFinishChange(reset);

            gui.add(settings, "speedMax").min(0).max(20).step(0.5).onFinishChange(reset);
            gui.add(settings, "speedMin").min(0).max(20).step(0.5).onFinishChange(reset);
            gui.add(settings, "number").min(0).max(500).step(1).onFinishChange(reset);
            gui.add(settings, "spread").min(0).max(40000).step(1).onFinishChange(reset);
            gui.add(settings, "width");
            gui.add(settings, "height");

            gui.add(settings, "cameramove");
            gui.add(settings, 'camx').listen();
            gui.add(settings, 'camy').listen();
            gui.add(settings, "camPercentX").listen();
            gui.add(settings, "camPercentY").listen();
            gui.add(settings, "shape", {
                circle: 0,
                heart: 1,
                hexagon: 2
            });
            gui.add(settings, "rotation", 0, 10).onChange(reset);
            gui.add(settings, "targetActive").onChange(reset);
            gui.add(settings, "targetX").min(-2000).max(4000).step(1).onFinishChange(
                function(){
                    targetXpercentage = targetX*100/windowX;
                    reset();
                }
            );
            gui.add(settings, "targetY").min(0).max(4000).step(1).onFinishChange(reset);
            gui.add(settings, "targetXpercentage").listen();
            gui.add(settings, "targetYpercentage").listen();

            gui.add(settings, "vertices", 2, 10).step(1);
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
            //$('.particle_color').css('background-color', settings.color)
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
                $('#particles').append('<div id="part' + i + '" class="hex1 hexagon-wrapper"><div id="partcontent' + i + '" class="particle-color hexagon"></div></div>');
                //add to objStore
                particleList.push(particle);
                //particle.orbit = Math.random*365;

                //var $part = $('#' + particle.id);
                var part = document.getElementById('part' + i);
                //initParticle(i, delay);
                initParticle(part, i);
            };
        },
        initParticle = function(part, num){

                var randomx = Math.round(settings.width - Math.random() * settings.width);
                var randomy = Math.round(settings.height/4 - Math.random() * settings.height/4);
                var randomz = Math.round(Math.random() * settings.particleDepth + 100);

                var randomZrotation = Math.round(Math.random() * 1) * 360;
                var randomXrotation = Math.round(Math.random() * 1) * 360;
                var randomYrotation = Math.round(Math.random() * 1) * 360;

                var randomScale = Math.random() * (settings.scaleMax - settings.scaleMin) + settings.scaleMin;

                var particleSpeed = Math.random() * (settings.speedMax - settings.speedMin) + settings.speedMin;
                var particleDelay = Math.random() * settings.particleDelay;

                var randomPlace = Math.floor(Math.random() * places.data.length);

                var randomColor = colors.data[Math.floor(Math.random() * colors.data.length)];

                console.log(randomColor); //+ " | " + colors.data[randomColor]);

                var myTargetX = places.data[randomPlace][1];
                var myTargetY = places.data[randomPlace][2];



                var randomOpacity = (Math.round(Math.random()*100) * 0.01);

                //need to color per thing ajnd not a class.
                //$('.particle_color').css('background-color', randomColor);

                //background-color: randomColor,
                //"div > div", "#tab"
                //$me = "div > div," + part;
                // debugger;
                //$(part + "> particle_color").css("background-color", randomColor);
                $("#partcontent" + num).css("background-color", randomColor); 

                $(part > 'div').removeClass('particle-color');
                //$(part > 'div').css({'background-color':randomColor});

                TweenLite.set(part, {
                    rotationZ: randomZrotation,
                    rotationX: randomXrotation,
                    rotationY: randomYrotation,
                    scaleX: randomScale,
                    scaleY: randomScale,
                    x: randomx,
                    y: randomy,
                    z: randomz,
                    opacity: randomOpacity
                });
                if (settings.targetActive) {
                    TweenLite.to(part, particleSpeed, {
                        x: settings.targetX,
                        y: settings.targetY,
                        rotationX: 0,
                        rotationY: 0,
                        rotationZ: 0,
                        scaleX: 1,
                        scaleY: 1,
                        z: -1000,
                        delay: particleDelay,
                        transformOrigin: "left 50% -5"
                    });
                } else {
                    TweenLite.to(part, particleSpeed, {
                        x: myTargetX,
                        y: myTargetY,
                        scaleX: 1,
                        scaleY: 1,
                        rotationX: 0,
                        rotationY: 0,
                        rotationZ: 0,
                        z: -1000,
                        delay: particleDelay,
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

            mouseX = event.clientX;
            mouseY = event.clientY;

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

            if (settings.cameramove) {

                settings.camx += (mouseX - settings.camx) * 0.05;
                settings.camy += (-mouseY - settings.camy) * 0.05;

                //solve percent of screen width
                settings.camPercentX = mouseX*100/windowX;
                settings.camPercentY = mouseY*100/windowY;
                //$('body').css('perspective-origin', settings.camx + ' ' + settings.camy);
            }
        };
    return {
        init: init
    };
}(jQuery));