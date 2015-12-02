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
        container = null,
        camera = null,
        scene = null,
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
        group = null,
        texture = null,
        extrudeSettings = null, 
        init = function() {
            settings = {
                number: 100,
                width: window.innerWidth,
                height: window.innerHeight,
                shape: 3,
                randomrot: true,
                rotation: 90,
                vertices: 4,
                number: 100,
                maxsize: 2,
                minsize: 1,
                hue: 215,
                saturation: 100
            };

            windowHalfX = window.innerWidth / 2;
            windowHalfY = window.innerHeight / 2;

            container = document.createElement('div');
            container.id = "particles";
            document.body.appendChild(container);

            renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight);
            container.appendChild(renderer.domElement);

            scene = new THREE.Scene;

            // var cubeGeometry = new THREE.CubeGeometry(100, 100, 100);
            // var cubeMaterial = new THREE.MeshLambertMaterial({
            //     color: 0xffffff
            // });
            // var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
            // cube.rotation.y = Math.PI * 45 / 180;
            // cube.position.y = 100;
            // scene.add(cube);

            //bokeh
            // cv = document.createElement("canvas");

            //generate();

            var cubeGeometry = new THREE.BoxGeometry(100, 100, 100);
            var cubeMaterial = new THREE.MeshLambertMaterial({
                color: 0xFF0000
            });

            var mesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
            mesh.rotation.y = 45;
            mesh.position.y = -100;
            scene.add(mesh);


            //shapes 
            group = new THREE.Group();
            group.position.y = 50;
            scene.add(group);

            texture = THREE.ImageUtils.loadTexture("images/UV_Grid_Sm.jpg");
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(0.008, 0.008);

            extrudeSettings = {
                amount: 8,
                bevelEnabled: true,
                bevelSegments: 2,
                steps: 2,
                bevelSize: 1,
                bevelThickness: 1
            };

            // addShape( shape, color, x, y, z, rx, ry,rz, s );

            // addShape('flat', circleShape, extrudeSettings, 0xf08000, -300, -100, 0, 0, 0, 0, 1);
            // addShape('flat', circleShape, extrudeSettings, 0x8080f0, -180, 0, 0, 0, 0, 0, 1);
            // addShape('flat', circleShape, extrudeSettings, 0x008000, -150, 150, 0, 0, 0, 0, 1);
            // addShape('flat', circleShape, extrudeSettings, 0x008080, 200, -100, 0, 0, 0, 0, 1);
            // addShape('flat', circleShape, extrudeSettings, 0x0040f0, 150, 100, 0, 0, 0, 0, 1);
            // addShape('flat', circleShape, extrudeSettings, 0xf00000, 60, 100, 0, 0, 0, Math.PI, 1);
            // addShape('flat', circleShape, extrudeSettings, 0x00f000, 120, 250, 0, 0, 0, 0, 1);
            // addShape('flat', circleShape, extrudeSettings, 0x404040, -60, 200, 0, 0, 0, 0, 1);
            // addShape('flat', circleShape, extrudeSettings, 0xf000f0, -200, 250, 0, 0, 0, Math.PI, 1);
            // addShape('flat', circleShape, extrudeSettings, 0x804000, 150, 0, 0, 0, 0, 0, 1);
            // addShape('flat', circleShape, extrudeSettings, 0x808080, -50, -100, 0, 0, 0, 0, 1);

            //

            createParticles();


            camera = new THREE.PerspectiveCamera(45, settings.width / settings.height, 0.1, 10000);
            camera.position.y = 160;
            camera.position.z = 1000;
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

            var clock = new THREE.Clock;

            //user events
            document.addEventListener('mousemove', onDocumentMouseMove, false);
            document.addEventListener('touchstart', onDocumentTouchStart, false);
            document.addEventListener('touchmove', onDocumentTouchMove, false);
            window.addEventListener('resize', onWindowResize, false);

            //add dat.gui
            gui = new dat.GUI();
            gui.add(settings, "number").min(0).max(1000).step(1).onChange(update);;

            gui.add(settings, "width", 0).step(1);
            gui.add(settings, "height", 0).step(1);
            gui.add(settings, "shape", {
                circle: 0,
                polygon: 1,
                star: 2,
                hearts: 3
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
            container.appendChild(stats.domElement);
            camera.position.x += (mouseX - camera.position.x) * 0.05;
            camera.position.y += (-mouseY - camera.position.y) * 0.05;
            camera.lookAt(scene.position);

            //
            animate();

        },

        createParticles = function() {

            for (var i = 0; i < settings.number; i++) {
                //console.log('creating: ' + i);
                // particle.name = "part" + i;
                // initParticle(particle, i * 10);
                
                // addShape( style, shape, color, x, y, z, rx, ry,rz, s );
                addShape('flat', circleShape, extrudeSettings, 0xff0000, Math.random()*settings.height - windowHalfX, Math.random()*settings.width - windowHalfY, Math.random()*100, 0, 0, 0, 1);

            }
        },

        update = function() {
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
        initParticle = function(particle, delay) {

            var particle = this instanceof THREE.Sprite ? this : particle;
            var delay = delay !== undefined ? delay : 0;
            var randomx = (Math.random() * settings.spread) - windowHalfX;
            var randomy = (Math.random() * settings.spread) - windowHalfY;
            var randomz = Math.random() * settings.spread;

            particle.position.set(randomx, randomy, randomz);
            particle.scale.x = particle.scale.y = Math.random() * settings.maxSize + settings.minSize;

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
                }, settings.speed)
                .start();

            new TWEEN.Tween(particle.scale)
                .delay(delay)
                .to({
                    x: 0.01,
                    y: 0.01
                }, 10000)
                .start();

        },

        render = function() {

            TWEEN.update();

            camera.position.x += (mouseX - camera.position.x) * 0.05;
            camera.position.y += (-mouseY - camera.position.y) * 0.05;
            camera.lookAt(scene.position);

            renderer.render(scene, camera);

        },
        addShape = function(style, shape, extrudeSettings, color, x, y, z, rx, ry, rz, s) {

            var points = shape.createPointsGeometry();
            var spacedPoints = shape.createSpacedPointsGeometry(50);

            switch (style) {
                case 'texture':
                    // flat shape with texture
                    // note: default UVs generated by ShapeGemoetry are simply the x- and y-coordinates of the vertices

                    var geometry = new THREE.ShapeGeometry(shape);

                    var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
                        side: THREE.DoubleSide,
                        map: texture
                    }));

                    mesh.position.set(x, y, z);
                    mesh.rotation.set(rx, ry, rz);
                    mesh.scale.set(s, s, s);
                    group.add(mesh);
                    break;
                case 'flat':
                    // flat shape
                    var geometry = new THREE.ShapeGeometry(shape);

                    var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
                        color: color,
                        side: THREE.DoubleSide,
                        blending: THREE.AdditiveBlending,
                        opacity: 0.5,
                        transparent: true
                    }));
                    //particle.name = "part" + i;
                    // initParticle(mesh, 0);
                    mesh.position.set(x, y, z);
                    mesh.rotation.set(rx, ry, rz);
                    mesh.scale.set(s, s, s);

                    group.add(mesh);

                    break;
                case '3d':
                    // 3d shape

                    var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

                    var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
                        color: color
                    }));
                    mesh.position.set(x, y, z - 75);
                    mesh.rotation.set(rx, ry, rz);
                    mesh.scale.set(s, s, s);
                    group.add(mesh);
                    break;
                case 'solidline':
                    // solid line

                    var line = new THREE.Line(points, new THREE.LineBasicMaterial({
                        color: color,
                        linewidth: 3
                    }));
                    line.position.set(x, y, z - 25);
                    line.rotation.set(rx, ry, rz);
                    line.scale.set(s, s, s);
                    group.add(line);
                    break;
                case 'vertices':
                    // vertices from real points

                    var pgeo = points.clone();
                    var particles = new THREE.Points(pgeo, new THREE.PointsMaterial({
                        color: color,
                        size: 4
                    }));
                    particles.position.set(x, y, z + 25);
                    particles.rotation.set(rx, ry, rz);
                    particles.scale.set(s, s, s);
                    group.add(particles);
                    break;
                case 'line':
                    // line from equidistance sampled points

                    var line = new THREE.Line(spacedPoints, new THREE.LineBasicMaterial({
                        color: color,
                        linewidth: 3
                    }));
                    line.position.set(x, y, z + 75);
                    line.rotation.set(rx, ry, rz);
                    line.scale.set(s, s, s);
                    group.add(line);
                    break;

                case 'points':
                    // equidistance sampled points

                    var pgeo = spacedPoints.clone();
                    var particles2 = new THREE.Points(pgeo, new THREE.PointsMaterial({
                        color: color,
                        size: 4
                    }));
                    particles2.position.set(x, y, z + 125);
                    particles2.rotation.set(rx, ry, rz);
                    particles2.scale.set(s, s, s);
                    group.add(particles2);
                    break;
            }
        };
    return {
        init: init
    };
}());