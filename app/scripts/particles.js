/* global console, PARTICLES */
//reference http://jabtunes.com/labs/3d/dof/webgl_postprocessing_dof2.html

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

            init = function() {
                console.log('PARTICLES.init called');
                debugger;

                container = document.createElement( 'div' );
                container.id = "particles";
                document.body.appendChild( container );

                camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 5000 );
                camera.position.z = 1000;

                scene = new THREE.Scene();

                var material = new THREE.SpriteMaterial( {
                    map: new THREE.CanvasTexture( generateSprite() ),
                    blending: THREE.AdditiveBlending
                } );

                for ( var i = 0; i < 1000; i++ ) {

                    particle = new THREE.Sprite( material );

                    initParticle( particle, i * 10 );

                    scene.add( particle );
                }
                renderer = new THREE.CanvasRenderer();
                renderer.setClearColor( 0x000000 );
                renderer.setPixelRatio( window.devicePixelRatio );
                renderer.setSize( window.innerWidth, window.innerHeight );
                container.appendChild( renderer.domElement );

                stats = new Stats();
                stats.domElement.style.position = 'absolute';
                stats.domElement.style.top = '0px';
                container.appendChild( stats.domElement );

                document.addEventListener( 'mousemove', onDocumentMouseMove, false );
                document.addEventListener( 'touchstart', onDocumentTouchStart, false );
                document.addEventListener( 'touchmove', onDocumentTouchMove, false );

                //

                window.addEventListener( 'resize', onWindowResize, false );
                animate();
                addGui();
            },
            addGui = function(){
                var gui = new dat.GUI();
                var params = {
                    interation: 5000
                };
                gui.add(params, 'interation').onFinishChange(function(){
                    // refresh based on the new value of params.interation
                    console.log('######' + iteration);
                })
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

                window.addEventListener( 'resize', onWindowResize, false );

            },
             onWindowResize = function() {

                windowHalfX = window.innerWidth / 2;
                windowHalfY = window.innerHeight / 2;

                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();

                renderer.setSize( window.innerWidth, window.innerHeight );

            },

             generateSprite = function() {

                var canvas = document.createElement( 'canvas' );
                canvas.width = 16;
                canvas.height = 16;

                var context = canvas.getContext( '2d' );
                var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );
                gradient.addColorStop( 0, 'rgba(255,255,255,1)' );
                gradient.addColorStop( 0.2, 'rgba(0,255,255,1)' );
                gradient.addColorStop( 0.4, 'rgba(0,0,64,1)' );
                gradient.addColorStop( 1, 'rgba(0,0,0,1)' );

                context.fillStyle = gradient;
                context.fillRect( 0, 0, canvas.width, canvas.height );

                return canvas;

            },

             initParticle = function( particle, delay ) {

                var particle = this instanceof THREE.Sprite ? this : particle;
                var delay = delay !== undefined ? delay : 0;

                particle.position.set( 0, 0, 0 );
                particle.scale.x = particle.scale.y = Math.random() * 32 + 16;

                new TWEEN.Tween( particle )
                    .delay( delay )
                    .to( {}, 10000 )
                    .onComplete( initParticle )
                    .start();

                new TWEEN.Tween( particle.position )
                    .delay( delay )
                    .to( { x: Math.random() * 4000 - 2000, y: Math.random() * 1000 - 500, z: Math.random() * 4000 - 2000 }, 10000 )
                    .start();

                new TWEEN.Tween( particle.scale )
                    .delay( delay )
                    .to( { x: 0.01, y: 0.01 }, 10000 )
                    .start();

            },

            //

             onDocumentMouseMove = function( event ) {

                mouseX = event.clientX - windowHalfX;
                mouseY = event.clientY - windowHalfY;
            },

             onDocumentTouchStart = function( event ) {

                if ( event.touches.length == 1 ) {

                    event.preventDefault();

                    mouseX = event.touches[ 0 ].pageX - windowHalfX;
                    mouseY = event.touches[ 0 ].pageY - windowHalfY;

                }

            },

             onDocumentTouchMove = function( event ) {

                if ( event.touches.length == 1 ) {

                    event.preventDefault();

                    mouseX = event.touches[ 0 ].pageX - windowHalfX;
                    mouseY = event.touches[ 0 ].pageY - windowHalfY;

                }

            },

            //

             animate = function() {
                //bw debugging
                // requestAnimationFrame( animate );

                render();
                stats.update();

            },

             render = function() {

                TWEEN.update();

                camera.position.x += ( mouseX - camera.position.x ) * 0.05;
                camera.position.y += ( - mouseY - camera.position.y ) * 0.05;
                camera.lookAt( scene.position );

                renderer.render( scene, camera );

            }
    return {
        init: init
    };
}());