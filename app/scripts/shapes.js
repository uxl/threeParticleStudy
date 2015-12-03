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
