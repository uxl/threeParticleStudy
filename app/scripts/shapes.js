// California

				var californiaPts = [];

				californiaPts.push( new THREE.Vector2 ( 610, 320 ) );
				californiaPts.push( new THREE.Vector2 ( 450, 300 ) );
				californiaPts.push( new THREE.Vector2 ( 392, 392 ) );
				californiaPts.push( new THREE.Vector2 ( 266, 438 ) );
				californiaPts.push( new THREE.Vector2 ( 190, 570 ) );
				californiaPts.push( new THREE.Vector2 ( 190, 600 ) );
				californiaPts.push( new THREE.Vector2 ( 160, 620 ) );
				californiaPts.push( new THREE.Vector2 ( 160, 650 ) );
				californiaPts.push( new THREE.Vector2 ( 180, 640 ) );
				californiaPts.push( new THREE.Vector2 ( 165, 680 ) );
				californiaPts.push( new THREE.Vector2 ( 150, 670 ) );
				californiaPts.push( new THREE.Vector2 (  90, 737 ) );
				californiaPts.push( new THREE.Vector2 (  80, 795 ) );
				californiaPts.push( new THREE.Vector2 (  50, 835 ) );
				californiaPts.push( new THREE.Vector2 (  64, 870 ) );
				californiaPts.push( new THREE.Vector2 (  60, 945 ) );
				californiaPts.push( new THREE.Vector2 ( 300, 945 ) );
				californiaPts.push( new THREE.Vector2 ( 300, 743 ) );
				californiaPts.push( new THREE.Vector2 ( 600, 473 ) );
				californiaPts.push( new THREE.Vector2 ( 626, 425 ) );
				californiaPts.push( new THREE.Vector2 ( 600, 370 ) );
				californiaPts.push( new THREE.Vector2 ( 610, 320 ) );

				for( var i = 0; i < californiaPts.length; i ++ ) californiaPts[ i ].multiplyScalar( 0.25 );

				var californiaShape = new THREE.Shape( californiaPts );


				// Triangle

				var triangleShape = new THREE.Shape();
				triangleShape.moveTo(  80, 20 );
				triangleShape.lineTo(  40, 80 );
				triangleShape.lineTo( 120, 80 );
				triangleShape.lineTo(  80, 20 ); // close path


				// Heart

				var x = 0, y = 0;

				var heartShape = new THREE.Shape(); // From http://blog.burlock.org/html5/130-paths

				heartShape.moveTo( x + 25, y + 25 );
				heartShape.bezierCurveTo( x + 25, y + 25, x + 20, y, x, y );
				heartShape.bezierCurveTo( x - 30, y, x - 30, y + 35,x - 30,y + 35 );
				heartShape.bezierCurveTo( x - 30, y + 55, x - 10, y + 77, x + 25, y + 95 );
				heartShape.bezierCurveTo( x + 60, y + 77, x + 80, y + 55, x + 80, y + 35 );
				heartShape.bezierCurveTo( x + 80, y + 35, x + 80, y, x + 50, y );
				heartShape.bezierCurveTo( x + 35, y, x + 25, y + 25, x + 25, y + 25 );


				// Square

				var sqLength = 80;

				var squareShape = new THREE.Shape();
				squareShape.moveTo( 0,0 );
				squareShape.lineTo( 0, sqLength );
				squareShape.lineTo( sqLength, sqLength );
				squareShape.lineTo( sqLength, 0 );
				squareShape.lineTo( 0, 0 );


				// Rectangle

				var rectLength = 120, rectWidth = 40;

				var rectShape = new THREE.Shape();
				rectShape.moveTo( 0,0 );
				rectShape.lineTo( 0, rectWidth );
				rectShape.lineTo( rectLength, rectWidth );
				rectShape.lineTo( rectLength, 0 );
				rectShape.lineTo( 0, 0 );


				// Rounded rectangle

				var roundedRectShape = new THREE.Shape();

				( function roundedRect( ctx, x, y, width, height, radius ){

					ctx.moveTo( x, y + radius );
					ctx.lineTo( x, y + height - radius );
					ctx.quadraticCurveTo( x, y + height, x + radius, y + height );
					ctx.lineTo( x + width - radius, y + height) ;
					ctx.quadraticCurveTo( x + width, y + height, x + width, y + height - radius );
					ctx.lineTo( x + width, y + radius );
					ctx.quadraticCurveTo( x + width, y, x + width - radius, y );
					ctx.lineTo( x + radius, y );
					ctx.quadraticCurveTo( x, y, x, y + radius );

				} )( roundedRectShape, 0, 0, 50, 50, 20 );


				// Track

				var trackShape = new THREE.Shape();

				trackShape.moveTo( 40, 40 );
				trackShape.lineTo( 40, 160 );
				trackShape.absarc( 60, 160, 20, Math.PI, 0, true );
				trackShape.lineTo( 80, 40 );
				trackShape.absarc( 60, 40, 20, 2 * Math.PI, Math.PI, true );


				// Circle

				var circleRadius = 100;
				var circleShape = new THREE.Shape();
				circleShape.moveTo( 0, circleRadius );
				circleShape.quadraticCurveTo( circleRadius, circleRadius, circleRadius, 0 );
				circleShape.quadraticCurveTo( circleRadius, -circleRadius, 0, -circleRadius );
				circleShape.quadraticCurveTo( -circleRadius, -circleRadius, -circleRadius, 0 );
				circleShape.quadraticCurveTo( -circleRadius, circleRadius, 0, circleRadius );


				// Fish

				var x = y = 0;

				var fishShape = new THREE.Shape();

				fishShape.moveTo(x,y);
				fishShape.quadraticCurveTo(x + 50, y - 80, x + 90, y - 10);
				fishShape.quadraticCurveTo(x + 100, y - 10, x + 115, y - 40);
				fishShape.quadraticCurveTo(x + 115, y, x + 115, y + 40);
				fishShape.quadraticCurveTo(x + 100, y + 10, x + 90, y + 10);
				fishShape.quadraticCurveTo(x + 50, y + 80, x, y);


				// Arc circle

				var arcShape = new THREE.Shape();
				arcShape.moveTo( 50, 10 );
				arcShape.absarc( 10, 10, 40, 0, Math.PI*2, false );

				var holePath = new THREE.Path();
				holePath.moveTo( 20, 10 );
				holePath.absarc( 10, 10, 10, 0, Math.PI*2, true );
				arcShape.holes.push( holePath );


				// Smiley

				var smileyShape = new THREE.Shape();
				smileyShape.moveTo( 80, 40 );
				smileyShape.absarc( 40, 40, 40, 0, Math.PI*2, false );

				var smileyEye1Path = new THREE.Path();
				smileyEye1Path.moveTo( 35, 20 );
				smileyEye1Path.absellipse( 25, 20, 10, 10, 0, Math.PI*2, true );

				smileyShape.holes.push( smileyEye1Path );

				var smileyEye2Path = new THREE.Path();
				smileyEye2Path.moveTo( 65, 20 );
				smileyEye2Path.absarc( 55, 20, 10, 0, Math.PI*2, true );
				smileyShape.holes.push( smileyEye2Path );

				var smileyMouthPath = new THREE.Path();
				smileyMouthPath.moveTo( 20, 40 );
				smileyMouthPath.quadraticCurveTo( 40, 60, 60, 40 );
				smileyMouthPath.bezierCurveTo( 70, 45, 70, 50, 60, 60 );
				smileyMouthPath.quadraticCurveTo( 40, 80, 20, 60 );
				smileyMouthPath.quadraticCurveTo( 5, 50, 20, 40 );

				smileyShape.holes.push( smileyMouthPath );

				// Spline shape

				var splinepts = [];
				splinepts.push( new THREE.Vector2 ( 70, 20 ) );
				splinepts.push( new THREE.Vector2 ( 80, 90 ) );
				splinepts.push( new THREE.Vector2 ( -30, 70 ) );
				splinepts.push( new THREE.Vector2 ( 0, 0 ) );

				var splineShape = new THREE.Shape();
				splineShape.moveTo( 0, 0 );
				splineShape.splineThru( splinepts );