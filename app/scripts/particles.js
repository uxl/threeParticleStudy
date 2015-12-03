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
        pointLight = null,
        init = function() {
            settings = {
                number: 380,
                width: window.innerWidth,
                height: window.innerHeight,
                shape: 0,
                rotation: 50,
                vertices: 4,
                maxsize: 0.2,
                minsize: 0.1,
                spread: 0, //doesn't work
                speed: 2100,
                zoom: 2000,
                renderer: 0,
                cameramove:false,
                reset:reset,
                color: "#1861b3",
                partZoom: 2000,
                angle: 0,
                lightZ: 15300,
                targetX: -1200, 
                targetY: 850
            };


            windowX = window.innerWidth;
            windowY = window.innerHeight;

            windowHalfX = windowX / 2;
            windowHalfY = windowY / 2;

            cvcontainer = document.createElement('div');
            cvcontainer.id = "particles";
            document.body.appendChild(cvcontainer);

            //renderer = new THREE.CSS3DRenderer(); //mesh objects don't render. 
            setRenderer(settings.renderer);
            

            renderer.setSize(windowX, windowY);

            cvcontainer.appendChild(renderer.domElement);

            scene = new THREE.Scene;

            // var cubeGeometry = new THREE.BoxGeometry(20, 20, 20);
            // var cubeMaterial = new THREE.MeshLambertMaterial({
            //     color: 0xFF0000
            // });

            // var mesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
            // mesh.rotation.y = 45;
            // mesh.position.y = -100;
            // scene.add(mesh);

            geometry = new THREE.PlaneGeometry(4000 * 1.4, 4000, 200);

            var loader = new THREE.TextureLoader();
            loader.load('images/night.jpg', function(texture) {
                var material = new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.FrontSide,
                    overdraw: false
                });
                var map = new THREE.Mesh(geometry, material);
                scene.add(map);

            });

            camera = new THREE.PerspectiveCamera(100, 1, 1, 2000);
            camera.position.set(0, 0, settings.zoom);
            //camera.lookAt(geometry.position);

            scene.add(camera);

            var skyboxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
            var skyboxMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,
                side: THREE.BackSide
            });
            var skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);

            scene.add(skybox);

            pointLight = new THREE.PointLight(0xffffff);
            pointLight.position.set(0, 300, settings.lightZ);
            scene.add(pointLight);

            var sphereSize = 1;
            var pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
            scene.add( pointLightHelper );

            //user events
            document.addEventListener('mousemove', onDocumentMouseMove, false);
            document.addEventListener('touchstart', onDocumentTouchStart, false);
            document.addEventListener('touchmove', onDocumentTouchMove, false);
            window.addEventListener('resize', onWindowResize, false);


            //add dat.gui//
            gui = new dat.GUI();
            gui.add(settings,'angle').listen();;
            gui.addColor(settings,'color').onChange(reset);
            gui.add(settings, "speed").min(500).max(30000).step(500).onFinishChange(function(){
                reset();
            });
            gui.add(settings,'partZoom').min(0).max(30000).step(100).onFinishChange(reset);
            gui.add(settings,'lightZ').min(0).max(30000).step(100).onFinishChange(reset);

            gui.add(settings, "zoom").min(0).max(10000).step(500).onFinishChange(function(){
                camera.position.set(0, 0, settings.zoom);
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
            gui.add(settings, "renderer", {
                webgl: 0,
                canvas: 1,
                css: 2
            }).onChange(function() {
                setRenderer(settings.renderer)
            });
            gui.add(settings, "cameramove");
            gui.add(settings, "rotation", 0, 360);
            gui.add(settings, "targetX").min(-3000).max(3000).step(100).onFinishChange(reset);
            gui.add(settings, "targetY").min(-1000).max(1000).step(100).onFinishChange(reset);
            gui.add(settings, "vertices", 2, 10).step(1);
            gui.add(settings, "maxsize").min(0.1).max(1).step(0.1).onFinishChange(reset);
            gui.add(settings, "minsize").min(0.1).max(1).step(0.1).onFinishChange(function() {
                if (settings.minsize > settings.maxsize) this.setValue(settings.maxsize);
            });
            gui.add(settings, "reset");


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
            pointLight.position.set(0, 300, settings.partZoom);

            removeParticles();
            //setRenderer();
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
                    renderer = new THREE.CSS3DRenderer();
                    break;
            }
        },
        getColor = function(){
            var colorObj = new THREE.Color( settings.color );
            var hex = colorObj.getHexString();
            var newcolor = "0x"+ hex;
            return eval(newcolor);
        },
        createParticles = function() {
            var shape = hexagonShape;
            var color = getColor();
            //console.log(color);
            var geometry = new THREE.ShapeGeometry(shape);
            var material = new THREE.MeshPhongMaterial({
                color: color,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                opacity: 0.5,
                transparent: true
            });

            for (var i = 0; i < settings.number; i++) {
                //console.log('creating: ' + i);
                particle = new THREE.Mesh(geometry, material);
                particle.name = "part" + i;
                particle.orbit = Math.random*365;
                var delay = i * Math.random() * 200;
                initParticle(particle, delay);
                scene.add(particle);
            }

        },
        initParticle = function(particle, delay) {
            var particle = this instanceof THREE.Mesh ? this : particle;
            var delay = delay !== undefined ? delay : 0;
            var randomx = Math.random() * windowX + settings.spread - windowHalfX;
            var randomy = Math.random() * windowY + settings.spread - windowHalfY;
            var randomz = settings.partZoom; //100

            particle.position.set(randomx, randomy, randomz);
            particle.scale.x = particle.scale.y = Math.random() * settings.maxsize + settings.minsize;

            //delay to reset particle
            // new TWEEN.Tween(particle)
            //     .delay(delay)
            //     .to({}, settings.speed)
            //     .onComplete(initParticle)
            //     .start();

            // //
            new TWEEN.Tween(particle.position)
                .delay(delay)
                .to({
                    x: ((Math.random()*100 - 50) + settings.targetX), // lon 
                    y: ((Math.random()*100 - 50) + settings.targetY), // lat 
                    z: 1
                }, settings.speed)
                .start().onComplete(function(){
                    //alert('woot');
                    //finished animation
                });
       new TWEEN.Tween(particle.rotation)
                .delay(delay)
                .to({
                    //x: Math.random()*settings.rotation,
                    y: Math.random()*settings.rotation,
                    z: Math.random()*settings.rotation
                }, settings.speed)
                .start();
            new TWEEN.Tween(particle.scale)
                .delay(delay)
                .to({
                    x: 0,
                    y: 0
                }, settings.speed)
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

            //loops through all gui settings
            //switch statement updates all
        //     for (var i in gui.__controllers) {
        //         var c = gui.__controllers[i];
        //         switch (c.property) {
        //             case "minsize":
        //                 c.setValue(settings.maxsize / 2);
        //                 /*              c.__max = settings.maxsize; */
        //                 break;
        //         }
        //     }
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
            settings.angle = (settings.angle + 1) % 360;

            TWEEN.update();
            if(settings.cameramove){
                camera.position.x += (mouseX - camera.position.x) * 0.05;
                camera.position.y += (-mouseY - camera.position.y) * 0.05;
                camera.lookAt(scene.position);
            }
            renderer.render(scene, camera);

        };
    return {
        init: init,
        camera: camera
    };
}());