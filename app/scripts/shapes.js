// // Circle
// var circleRadius = 20;
// var circleShape = new THREE.Shape();
// circleShape.moveTo( 0, circleRadius );
// circleShape.quadraticCurveTo( circleRadius, circleRadius, circleRadius, 0 );
// circleShape.quadraticCurveTo( circleRadius, -circleRadius, 0, -circleRadius );
// circleShape.quadraticCurveTo( -circleRadius, -circleRadius, -circleRadius, 0 );
// circleShape.quadraticCurveTo( -circleRadius, circleRadius, 0, circleRadius );


var circleShape = new THREE.Shape();
var radius = 6;

for (var i = 0; i < 16; i++) {
  var pct = (i + 1) / 16;
  var theta = pct * Math.PI * 2.0;
  var x = radius * Math.cos(theta);
  var y = radius * Math.sin(theta);
  if (i == 0) {
    circleShape.moveTo(x, y);
  } else {
    circleShape.lineTo(x, y);
  }
}

var hexagonShape = new THREE.Shape();
hexagonShape.moveTo(  270,0 );
hexagonShape.lineTo(  0,160 );
hexagonShape.lineTo( 0,485 );
hexagonShape.lineTo(  270,645 ); 
hexagonShape.lineTo(  560,485 ); 
hexagonShape.lineTo(  560,160 ); 

//star
var starShape = new THREE.Shape();
starShape.moveTo(  350, 75 );
starShape.lineTo(  379, 161 );
starShape.lineTo( 469, 161 );
starShape.lineTo(  397,215 ); 
starShape.lineTo(  423,301 ); 
starShape.lineTo(  350,250 ); 
starShape.lineTo(  277,301 ); 
starShape.lineTo(  303,215 ); 
starShape.lineTo(  231,161 ); 
starShape.lineTo(  321,161 ); 