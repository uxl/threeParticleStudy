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

        init = function() {
            settings = {
                width: window.innerWidth,
                height: window.innerHeight,
                shape: 0,
                randomrot: true,
                rotation: 90,
                vertices: 4,
                number: 100,
                maxsize: 100,
                minsize: 50,
                hue: 215,
                saturation: 100,
                rainbow: rainbow,
                generate: generate
            };

            windowHalfX = window.innerWidth / 2;
            windowHalfY = window.innerHeight / 2;

            container = document.createElement('div');
            container.id = "particles";
            document.body.appendChild(container);

            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(settings.width, settings.height);
            container.appendChild(renderer.domElement);

            scene = new THREE.Scene;

            var cubeGeometry = new THREE.CubeGeometry(100, 100, 100);
            var cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
            var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
            cube.rotation.y = Math.PI * 45 / 180;
            scene.add(cube);

            camera = new THREE.PerspectiveCamera(45, settings.width / settings.height, 0.1, 10000);
            camera.position.y = 160;
            camera.position.z = 400;
            camera.lookAt(cube.position);

            scene.add(camera);

            var skyboxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
            var skyboxMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
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
            gui.add(settings, "number", 10, 1000).step(1);
            gui.add(settings, "maxsize", 1, 200).onChange(update);
            gui.add(settings, "minsize", 1, 200).onChange(function() {
                if (settings.minsize > settings.maxsize) this.setValue(settings.maxsize);
            });
            gui.add(settings, "hue", 0, 360).onChange(update);
            gui.add(settings, "saturation", 0, 100).onChange(update);
            gui.add(settings, "rainbow");
            gui.add(settings, "generate");

            //add renderer
            // renderer = new THREE.CanvasRenderer();
            // renderer.setClearColor(0x000000);
            // renderer.setPixelRatio(window.devicePixelRatio);
            // renderer.setSize(window.innerWidth, window.innerHeight);
            // container.appendChild(renderer.domElement);

            //add stats
            stats = new Stats();
            stats.domElement.style.position = 'absolute';
            stats.domElement.style.top = '0px';
            container.appendChild(stats.domElement);


            camera.position.x += (mouseX - camera.position.x) * 0.05;
            camera.position.y += (-mouseY - camera.position.y) * 0.05;
            camera.lookAt(scene.position);
            //renderer.render(scene, camera);
            /*
            animate();
            */

            //update();

            //img = document.getElementById("img");

            //cv = document.createElement("canvas");

            //generate();

            


            //
            animate();

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
        generate = function() {
            cv.width = settings.width;
            cv.height = 3 * settings.height;
            ctx = cv.getContext("2d");
            ctx.fillStyle = "000";
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillRect(0, 0, cv.width, cv.height);
            ctx.globalCompositeOperation = 'lighter';
            ctx.lineWidth = 3;
            ctx.shadowColor = "hsl(0, 0%, 50%)";
            ctx.shadowOffsetY = -settings.height;

            for (var i = 0; i < settings.number; i++) {
                var x = Math.floor(settings.width * Math.random()),
                    y = Math.floor(settings.height * Math.random()),
                    r = settings.maxsize - (settings.maxsize - settings.minsize) * Math.random();

                bokeh(x, y, r, settings.shape, settings.vertices, settings.randomrot, Math.PI * settings.rotation / 180);
            }

            colorize(settings.hue, settings.saturation);
            img.style.maxHeight = settings.height + "px";
            img.style.height = window.innerHeight + "px";
            img.style.marginTop = -Math.min(settings.height, window.innerHeight) / 2 + "px";
            img.style.marginLeft = -Math.min(settings.width, settings.width * window.innerHeight / settings.height) / 2 + "px";
        },

        bokeh = function(x, y, r, t, s, rr, ro) {
            ctx.shadowBlur = r / settings.minsize * (Math.random() * 9.9 + 0.1);

            ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillStyle = "rgba(0, 0, 0, 0.3)";

            ctx.save();
            ctx.translate(x, y + settings.height);
            ctx.beginPath();
            switch (parseInt(t)) {
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
            var a = 2 * Math.PI / s;

            ctx.rotate(rr * (1 - 2 * Math.random()) * Math.PI + a / 2 + ro);

            ctx.moveTo(0, r);
            for (var i = 0; i < s; i++) {
                ctx.rotate(a);
                ctx.lineTo(0, r);
            }
        },
        nstar = function(r, s, rr, ro) {
            var a = 2 * Math.PI / s;

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
        colorize = function(h, s) {
            var img = ctx.getImageData(0, 0, settings.width, settings.height),
                data = img.data;
            for (var i = 0; i < data.length; i += 4) {
                var l = RTH(data[i + 0], data[i + 1], data[i + 2]).l;
                var rgb = HTR(h / 360, s / 100, l);
                data[i + 0] = rgb.r;
                data[i + 1] = rgb.g;
                data[i + 2] = rgb.b;
            }
            cv.height = settings.height;
            ctx.putImageData(img, 0, 0);
            document.getElementById("img").src = cv.toDataURL();
        },
        rainbow = function() {
            var img = ctx.getImageData(0, 0, cv.width, cv.height),
                data = img.data;
            for (var i = 0; i < data.length; i += 4) {
                var p = i / 4,
                    x = p % cv.width,
                    y = Math.floor(p / cv.width),
                    h = (y / cv.height),
                    rgb = HTR(h % 1, 1.0, RTH(data[i + 0], data[i + 1], data[i + 2]).l);
                data[i + 0] = rgb.r;
                data[i + 1] = rgb.g;
                data[i + 2] = rgb.b;
            }
            ctx.putImageData(img, 0, 0);
            document.getElementById("img").src = cv.toDataURL();
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
        init: init
    };
}());