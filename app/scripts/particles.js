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
        resetMe = false,
        gui = null,
        context = null,
        canvas = null,
        geometry = null,
        testbox = null,

        //particle init values
        settings = {
            speed: 100000,
            spread: 1000,
            number: 280,
            maxSize: 32,
            minSize: 16,
            symbol: 0,
            focus: 50,
            hue: 280,
            saturation: 40,
            width: 1920,
            height: 1080,
            aspect: 1,
        },

        init = function() {
            console.log('PARTICLES.init called');
            //debugger;

            //add dom elements
            container = document.createElement('div');
            container.id = "particles";
            document.body.appendChild(container);

            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 5000);
            //debugger;
            camera.fov = 50;
            camera.position.z = 1000;
            camera.focus = settings.focus;
            camera.aspect = settings.aspect;

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

            //geometry
            geometry = new THREE.PlaneGeometry(window.innerWidth*3 , window.innerHeight*3, 200);

            var loader = new THREE.TextureLoader();
            loader.load('images/night.jpg', function(texture) {

                //var geometry = new THREE.SphereGeometry( 200, 20, 20 );

                var material = new THREE.MeshBasicMaterial({
                    map: texture,
                                    side: THREE.FrontSide,

                    overdraw: false
                });
                var mesh = new THREE.Mesh(geometry, material);
                scene.add(mesh);
                //raycaster = new THREE.Raycaster();
            });

            // var texture = texture = THREE.TextureLoader( 'images/night.jpg' );
            //var imageMat = new THREE.MeshBasicMaterial( {color:0xffffff, map: texture } );

            //console.log('1 -- ' + scene);
            //console.log('2 -- ' + scene.children);
            //console.log('3 -- ' + scene.getObjectByName('part1', true))
        },
        createParticles = function() {
            var material = new THREE.SpriteMaterial({
                map: new THREE.CanvasTexture(generateSprite()),
                blending: THREE.AdditiveBlending
            });

            for (var i = 0; i < settings.number; i++) {
                //console.log('creating: ' + i);
                particle = new THREE.Sprite(material);

                particle.name = "part" + i;

                initParticle(particle, i * 10);
                scene.add(particle);
            }
        },
        removeParticles = function() {
            resetMe = true;
            //console.log('PARTICLES.reset called');
            render();
            var parent = document.getElementsByTagName("BODY")[0];

            for (var i = 0; i < settings.number; i++) {
                console.log('removing: ' + i);
                var me = scene.getObjectByName('part' + i);
                scene.remove(me);
            }
            render();
        },
        bokeh = function(x, y, scale, symbol, verticies, randomRotation, rotation) {
            console.log("bokeh: " + scale);
            context.shadowBlur = scale / settings.minsize * (Math.random() * 9.9 + 0.1);

            context.strokeStyle = "rgba(0, 0, 0, 0.5)";
            context.fillStyle = "rgba(0, 0, 0, 0.3)";

            context.save();
            context.translate(x, y + settings.height);
            context.beginPath();
            switch (parseInt(symbol)) {
                case 0:
                    context.arc(0, 0, scale, 0, 2 * Math.PI);
                    break;
                case 1:
                    polygon(scale, verticies, randomRotation, rotation);
                    break;
                case 2:
                    nstar(scale, verticies, randomRotation, rotation);
                    break;
                case 3:
                    heart(scale, randomRotation, rotation);
                    break;
            }
            context.fill();
            context.stroke();
            context.restore();


        },
        polygon = function(scale, verticies, randomRotation, rotation) {
            a = 2 * Math.PI / verticies;

            context.rotate(randomRotation * (1 - 2 * Math.random()) * Math.PI + a / 2 + rotation);

            context.moveTo(0, scale);
            for (var i = 0; i < verticies; i++) {
                context.rotate(a);
                context.lineTo(0, scale);
            }
        },
        nstar = function(scale, verticies, randomRotation, rotation) {
            a = 2 * Math.PI / verticies;

            context.rotate(randomRotation * (1 - 2 * Math.random()) * Math.PI + a / 2 + rotation);

            context.moveTo(0, r);
            for (var i = 0; i < 2 * verticies; i++) {
                context.rotate(a / 2);
                context.lineTo(0, scale - (i % 2 == 0) * 2 * scale / 3);
            }
        },
        heart = function(scale, randomRotation, rotation) {
            context.rotate(randomRotation * (1 - 2 * Math.random()) * Math.PI + rotation);

            context.moveTo(0, 3 * scale / 2);
            context.arc(-scale / 2, 0, scale / 2, 3 * Math.PI / 4, 0);
            context.arc(scale / 2, 0, scale / 2, Math.PI, Math.PI / 4);
            context.lineTo(0, 3 * scale / 2);
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

            context.fillStyle = "000";
            context.globalCompositeOperation = 'source-over';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.globalCompositeOperation = 'lighter';
            context.lineWidth = 3;
            context.shadowColor = "hsl(0, 0%, 50%)";
            context.shadowOffsetY = -settings.height;

            // var gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
            // gradient.addColorStop(0, 'rgba(255,255,100,0.5)');
            // gradient.addColorStop(0.2, 'rgba(255,255,100,0.5)');
            // gradient.addColorStop(0.8, 'rgba(255,255,100,0.5)');
            // gradient.addColorStop(1, 'rgba(255,255,100,0)');

            context.fillStyle = 'white';
            context.fillRect(0, 0, canvas.width, canvas.height);

            return canvas;

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

        animate = function() {
            // console.log('PARTICLES.animate');
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
                speed: settings.speed,
                spread: settings.spread,
                number: settings.number,
                max_size: settings.maxSize,
                min_size: settings.minSize,
                symbol: settings.symbol,
                focus: settings.focus,
                reset: resetScene,
                hue: settings.hue,
                saturation: settings.saturation,
                aspect: settings.aspect
            };
            gui.add(params, "symbol", {
                circle: 0,
                polygon: 1,
                star: 2,
                hearts: 3
            }).onFinishChange(function() {
                // refresh based on the new value of params.interation
                removeParticles();
                settings.symbol = params.symbol;
                createParticles();
                render();
                animate();
            });
            gui.add(params, 'zoom').min(0).max(5000).step(1).onChange(function() {
                // refresh based on the new value of params.interation
                camera.position.z = params.zoom;
            });
            gui.add(params, 'speed').min(0).max(100000).step(1000).onFinishChange(function() {
                // refresh based on the new value of params.interation
                removeParticles();
                settings.speed = params.speed;
                createParticles();
                render();
                animate();
            });
            gui.add(params, 'spread').min(0).max(5000).step(250).onFinishChange(function() {
                // refresh based on the new value of params.interation
                removeParticles();
                settings.spread = params.spread;
                createParticles();
                render();
                animate();
            });
            gui.add(params, 'number').min(0).max(2000).step(1).onFinishChange(function() {
                // refresh based on the new value of params.interation
                removeParticles();
                settings.number = params.number;
                createParticles();
                render();
                animate();
            });
            gui.add(params, 'max_size').min(0).max(200).step(2).onFinishChange(function() {
                // refresh based on the new value of params.interation
                removeParticles();
                settings.maxSize = params.max_size;
                createParticles();
                render();
                animate();

            });
            gui.add(params, 'min_size').min(0).max(200).step(2).onFinishChange(function() {
                // refresh based on the new value of params.interation
                removeParticles();
                settings.minSize = params.min_size;
                createParticles();
                render();
                animate();
            });
            gui.add(params, "focus").min(0).max(1000).step(100).onFinishChange(function() {
                //refresh shaderfocus
                settings.focus = params.focus;
                camera.focus = settings.focus;
            });
             gui.add(params, "aspect").min(0).max(22).step(1).onFinishChange(function() {
                //refresh shaderfocus
                settings.aspect = params.aspect;
                camera.focus = settings.focus;
            });
            gui.add(params, "hue", 0, 360).onFinishChange(function() {
                alert('future feature');
            });
            gui.add(params, "saturation", 0, 100).onFinishChange(function() {
                alert('future feature');
            });

            gui.add(params, "reset");

            window.addEventListener('resize', onWindowResize, false);


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
        };
    return {
        init: init,
        removeParticles: removeParticles,
        scene: scene
    };
}());