/* global console, PARTICLES */

//todo:
//complete rigging gui.dat
//pull in bokeh from this reference:
//http://jabtunes.com/labs/3d/dof/webgl_postprocessing_dof2.html

'use strict';

var PARTICLES = (function() {

    var settings = {},
        gui = null,
        img = null,
        cv = null,
        ctx = null,
        cvcontainer = null,
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
        init = function() {
            settings = {
                number: 200,
                width: window.innerWidth,
                height: window.innerHeight,
                shape: 0,
                randomrot: true,
                rotation: 90,
                vertices: 4,
                maxsize: 2,
                minsize: 1,
                hue: 215,
                saturation: 100,
                spread: 100,
                speed: 100000,
                zoom: 1000,
                renderer: 0
            };


            windowX = window.innerWidth;
            windowY = window.innerHeight;

            windowHalfX = windowX / 2;
            windowHalfY = windowY / 2;

            cvcontainer = document.createElement('div');
            cvcontainer.id = "particles";
            document.body.appendChild(cvcontainer);


            setRenderer(settings.renderer);
            renderer.setSize(windowX, windowY);

            cvcontainer.appendChild(renderer.domElement);

            scene = new THREE.Scene;

            var cubeGeometry = new THREE.BoxGeometry(20, 20, 20);
            var cubeMaterial = new THREE.MeshLambertMaterial({
                color: 0xFF0000
            });

            var mesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
            mesh.rotation.y = 45;
            mesh.position.y = -100;
            scene.add(mesh);

            geometry = new THREE.PlaneGeometry(window.innerWidth * 1.4, window.innerWidth, 200);

            var loader = new THREE.TextureLoader();
            loader.load('images/night.jpg', function(texture) {
                var material = new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.FrontSide,
                    overdraw: false
                });
                var map = new THREE.Mesh(geometry, material);
                //scene.add(map);
            });

            camera = new THREE.PerspectiveCamera(45, settings.width / settings.height, 0.1, 10000);
            camera.position.set(0, 0, settings.zoom);
            camera.lookAt(mesh.position);

            scene.add(camera);

            var skyboxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
            var skyboxMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,
                side: THREE.BackSide
            });
            var skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);

            scene.add(skybox);

            var pointLight = new THREE.PointLight(0xffffff);
            pointLight.position.set(0, 300, 200);

            scene.add(pointLight);


            //user events
            document.addEventListener('mousemove', onDocumentMouseMove, false);
            document.addEventListener('touchstart', onDocumentTouchStart, false);
            document.addEventListener('touchmove', onDocumentTouchMove, false);
            window.addEventListener('resize', onWindowResize, false);


            //add dat.gui//
            gui = new dat.GUI();
            gui.add(settings, "number").min(0).max(500).step(20).onFinishChange(reset);
            gui.add(settings, "spread").min(0).max(1000).step(1).onFinishChange(reset);
            gui.add(settings, "width", 0).step(1);
            gui.add(settings, "height", 0).step(1);
            gui.add(settings, "shape", {
                circle: 0,
                heart: 1
            });
            gui.add(settings, "renderer", {
                webgl: 0,
                canvas: 1,
                css: 2
            }).onChange(function() {
                setRenderer(settings.renderer)
            });
            gui.add(settings, "randomrot");
            gui.add(settings, "rotation", 0, 360);
            gui.add(settings, "vertices", 2, 10).step(1);
            gui.add(settings, "maxsize", 1, 200).onChange(update);
            gui.add(settings, "minsize", 1, 200).onChange(function() {
                if (settings.minsize > settings.maxsize) this.setValue(settings.maxsize);
            });
            gui.add(settings, "hue", 0, 360).onChange(update);
            gui.add(settings, "saturation", 0, 100).onChange(update);

            //add stats
            stats = new Stats();
            stats.domElement.style.position = 'absolute';
            stats.domElement.style.top = '0px';
            cvcontainer.appendChild(stats.domElement);
            camera.position.x += (mouseX - camera.position.x) * 0.05;
            camera.position.y += (-mouseY - camera.position.y) * 0.05;
            camera.lookAt(scene.position);

            createParticles();
            animate();

        },
        reset = function() {
            removeParticles();
            createParticles();
            animate();
        },
        setRenderer = function() {
            switch (settings.renderer) {
                case 0:
                    renderer = new THREE.WebGLRenderer();
                    break;
                case 1:
                    renderer = new THREE.CanvasRenderer();
                    break;
                case 2:
                    renderer = new THREE.CssRenderer();
                    break;
            }
        },
        createParticles = function() {
            var shape = circleShape;
            var geometry = new THREE.ShapeGeometry(shape);
            var material = new THREE.MeshPhongMaterial({
                color: 0xff0000,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                opacity: 0.5,
                transparent: true
            });

            for (var i = 0; i < settings.number; i++) {
                //console.log('creating: ' + i);
                particle = new THREE.Mesh(geometry, material);
                particle.name = "part" + i;
                var delay = i * Math.random() * 10;
                initParticle(particle, delay);
                scene.add(particle);
            }

        },
        initParticle = function(particle, delay) {
            var particle = this instanceof THREE.Mesh ? this : particle;
            var delay = delay !== undefined ? delay : 0;
            var randomx = Math.random() * windowX - windowHalfX;
            var randomy = Math.random() * windowY - windowHalfY;
            var randomz = 100;

            particle.position.set(randomx, randomy, randomz);

            // particle.position.x = Math.random() * windowX - windowHalfX;
            // particle.position.y = Math.random() * windowY - windowHalfY;
            // particle.position.z = 400;

            particle.scale.x = particle.scale.y = Math.random() * settings.maxsize + settings.minsize;

            //delay to reset particle
            new TWEEN.Tween(particle)
                .delay(delay)
                .to({}, 800)
                .onComplete(initParticle)
                .start();

            //
            new TWEEN.Tween(particle.position)
                .delay(delay)
                .to({
                    x: Math.random() * windowX - windowHalfX,
                    y: Math.random() * windowY - windowHalfY,
                    z: 0
                }, settings.speed)
                .start();

            new TWEEN.Tween(particle.scale)
                .delay(delay)
                .to({
                    x: 0.01,
                    y: 0.01
                }, 800)
                .start();

        },
        removeParticles = function() {
            var removeList = [];
            console.log('PARTICLES.reset called');
            scene.traverse(function(node) {
                    if (node instanceof THREE.Mesh) {
                        // insert your code here, for example:
                        if ('part' == node.name.substring(0, 4)) {
                            //console.log(node.name);
                            removeList.push(node.name);
                        }

                    }
                }
            );
            resetMe = true;
            for (var i = 0; i < removeList.length; i++) {
                var me = scene.getObjectByName(removeList[i]);
                scene.remove(me);
            }
            render();
        },
        update = function() {
            console.log('PARTICLE.update called')
            for (var i in gui.__controllers) {
                var c = gui.__controllers[i];
                switch (c.property) {
                    case "hue":
                        c.__foreground.style.backgroundColor = "hsl(" + settings.hue + ", 100%, 50%)";
                        break;
                    case "saturation":
                        c.__foreground.style.backgroundColor = "hsl(" + settings.hue + ", " + settings.saturation + "%, 50%)";
                        break;
                    case "minsize":
                        c.setValue(settings.maxsize / 2);
                        /*              c.__max = settings.maxsize; */
                        break;
                }
            }
        },

        // RGB and HSL functions from
        // https://gist.github.com/mjijackson/5311256
        RTH = function(r, g, b) {
            r /= 255, g /= 255, b /= 255;
            var max = Math.max(r, g, b),
                min = Math.min(r, g, b);
            var h, s, l = (max + min) / 2;
            if (max == min) {
                h = s = 0;
            } else {
                var d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r:
                        h = (g - b) / d + (g < b ? 6 : 0);
                        break;
                    case g:
                        h = (b - r) / d + 2;
                        break;
                    case b:
                        h = (r - g) / d + 4;
                        break;
                }
                h /= 6;
            }
            return {
                h: h,
                s: s,
                l: l
            };
        },

        HTR = function(h, s, l) {
            var r, g, b;
            if (s == 0) {
                r = g = b = l;
            } else {
                function hue2rgb(p, q, t) {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                }
                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }
            return {
                r: r * 255,
                g: g * 255,
                b: b * 255
            };
        },
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
        onWindowResize = function() {

            windowHalfX = window.innerWidth / 2;
            windowHalfY = window.innerHeight / 2;

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize(window.innerWidth, window.innerHeight);

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

            TWEEN.update();

            camera.position.x += (mouseX - camera.position.x) * 0.05;
            camera.position.y += (-mouseY - camera.position.y) * 0.05;
            camera.lookAt(scene.position);

            renderer.render(scene, camera);

        };
    return {
        init: init,
        settings: settings
    };
}());