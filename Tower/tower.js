/*
A tower that will eventually be modeled after the Eiffel Tower made with THREE.js with lathe, cylinder, and cube geometries.
Copyright (C) 2019, Viki Zygouras
This program is released under the GNU General Public License (GPL).

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

To contact the creator: email vzygoura@wellesley.edu.

*/
/* ============================================================================*/
/*Partial Eiffel Tower Information

The origin of the tower is centered at (0,0,0). It goes from -2 to 2 units in the X-axis direction, 35 units in the Y-axis direction,
and -2 to 2 units in the Z-axis direction. To create a tower there is only one call to zygourasPartialEiffelTower(hexColor) needs to be made.
There is one parameter "hexColor" which takes in colors of the format "0x...". This will change the color of the entire tower.
The word "partial" is included in the naming of this function because although this is a tower it is not a complete representation of the actual
Eiffel Tower yet. This is intented to be continued in the final project.

*/

function zygourasPartialEiffelTower(hexColor){
// upper part of the curve for the middle of tower
var upper = [ [1/2, 32.0],
                 [1.5/2, 28.0],
                 [2.0/2, 24.0],
                 [2.5/2, 20.0] ];

// middle part of the curve for the middle of tower
var middle = [ [3.0/2, 18.0],
              [3.5/2, 14.0],
              [5/2, 10.0],
              [6.0/2, 6.0] ];

// curve for the middle support legs
var middleLegs =[[1.5/2, 16.5],
                 [2/2, 13.0],
                 [2.5/2, 10.0],
                 [3/2, 9.0] ];

var bottomLegs = [[2/2, 16.5],
                 [3/2, 12.0],
                 [4/2, 8.5],
                 [5/2, 5.0] ];



//Functions below will set up the points for Lathe Geometry
function makePoints (pts) {
   var points = [];
   for(var i = 0; i < pts.length; i++) {
       points.push(new THREE.Vector3(pts[i][0], pts[i][1], 0));
   }
   return points;
}

// create a spline curve to use for the lathe geometry, can specify the number of curve points given (1 or 2)
function makeCurves (points, numPoints) {
   var curve1 = new THREE.CubicBezierCurve3(points[0],points[1],points[2],points[3]);
   var curve2 = new THREE.CubicBezierCurve3(points[4],points[5],points[6],points[7]);
   var geom = new THREE.Geometry();
   if (numPoints == 2){
   geom.vertices = Array.prototype.concat( curve1.getPoints(10),
                                           curve2.getPoints(10));
                                         }
  else {
    geom.vertices = curve1.getPoints(10);
  }
   var splineObj = new THREE.Line( geom, new THREE.LineBasicMaterial( { linewidth: 3, color: hexColor }) );
   return splineObj
}

// create a lathe geometry using the spline curve
function makeLatheObj(splineObject) {

   var geom = new THREE.LatheGeometry(splineObject.geometry.vertices,4, Math.PI/4);
   var mat1 = new THREE.MeshBasicMaterial( {color: hexColor,
                                            wireframe: true});
   var latheObj = new THREE.Mesh(geom, mat1);
   return latheObj

}

//Puts together the top of the tower: base, rounded cylinder, and spire
function makeDecorativeTop(){
  //Make rounded shape at top of tower
  var topObject = new THREE.Object3D();
  var geometry = new THREE.SphereGeometry(0.75, 3, 11, 0, 6.3, 4, 3);
  var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { linewidth: 3, color: hexColor}) );
  line.position.set(0, -2, 0);
  topObject.add(line)

  //Make Spire
  var spireGeom = new THREE.BoxGeometry(0.15, 3, 0.15 );
  var spireLine = new THREE.Line(spireGeom, new THREE.LineBasicMaterial( { linewidth: 3, color: hexColor}) );
  topObject.add(spireLine);

  //Make highest base
  var baseGeom = new THREE.CylinderGeometry(0.5, 0.8, 0.2, 6 ,1);
  var baseMaterial = new THREE.MeshBasicMaterial( {color: hexColor} );
  var base = new THREE.Mesh( baseGeom, baseMaterial );
  base.rotation.set(0,Math.PI/4,0);
  base.position.set(0, -2.5,0)
  topObject.add(base);

  return topObject;
}

//will add the decorative top to the main tower
function combineTop(){
// returns an array of Vector3 objects made from the input 2D points
 var curvePts = Array.prototype.concat(upper, middle);
 var curvePoints = makePoints(curvePts);
 var spline = makeCurves(curvePoints, 2);
 var upperSupportMesh = makeLatheObj(spline);

 var topObj = makeDecorativeTop();
 topObj.position.set(0,34.5,0);
 var topPart = new THREE.Object3D();

 topPart.add(upperSupportMesh)
 topPart.add(topObj)

return topPart
}

//puts together the middle of the tower which is: solid base, wire base, four lathe legs
function makeMiddle(){
  var MiddlePart = new THREE.Object3D();

  //Making the middle wire support platform
  var middleWireGeom = new THREE.BoxGeometry(6, 1, 6);
  var middleWireframe = new THREE.WireframeGeometry( middleWireGeom );
  var middleWireSupport = new THREE.LineSegments( middleWireframe );
  middleWireSupport.material.color.setHex(hexColor);
  MiddlePart.add(middleWireSupport);

  //make the middle solid support platform
  var solidSupportGeom = new THREE.BoxGeometry(7, 0.5, 7);
  var solidSupportMaterial = new THREE.MeshBasicMaterial( {color: hexColor} );
  var solidSupport = new THREE.Mesh( solidSupportGeom, solidSupportMaterial );
  solidSupport.position.set(0,0.5,0);
  MiddlePart.add(solidSupport);

  //Making the middle support legs
  var bodyPts = Array.prototype.concat(middleLegs);
  var bodyPoints = makePoints(bodyPts);
  var spline = makeCurves(bodyPoints, 1);
  var firstLeg = makeLatheObj(spline);

  //position and rotate legs
  firstLeg.position.set(-2, -16, 2);
  firstLeg.rotation.y = -Math.PI/4
  var secondLeg = firstLeg.clone();
  secondLeg.position.set(-2, -16, -2);
  var thirdLeg = firstLeg.clone();
  thirdLeg.position.set(2,-16,-2);
  var fourthLeg = firstLeg.clone();
  fourthLeg.position.set(2,-16,2);

  //put the middle together
  MiddlePart.add(firstLeg);
  MiddlePart.add(secondLeg);
  MiddlePart.add(thirdLeg);
  MiddlePart.add(fourthLeg);

  return MiddlePart
}

//to be implemented for the final project
function makeBase(){
  var base = new THREE.Object3D();

  //make wire decal
  var wireGeom = new THREE.BoxGeometry(9, 0.75, 9);
  var wireframe = new THREE.WireframeGeometry( wireGeom );
  var wireSupport = new THREE.LineSegments( wireframe );
  wireSupport.material.color.setHex(hexColor);
  base.add(wireSupport);

  //make solid base decal
  var solidSupportGeom = new THREE.BoxGeometry(9, 0.75, 9);
  var solidSupportMaterial = new THREE.MeshBasicMaterial( {color: hexColor} );
  var solidSupport = new THREE.Mesh( solidSupportGeom, solidSupportMaterial );
  solidSupport.position.set(0,-1,0);
  base.add(solidSupport);

  //Making the bottom support legs
  var bodyPts = Array.prototype.concat(bottomLegs);
  var bodyPoints = makePoints(bodyPts);
  var spline = makeCurves(bodyPoints, 1);
  var firstLeg = makeLatheObj(spline);

  //position and rotate legs
  firstLeg.position.set(-2, -16, 2);
  firstLeg.rotation.y = -Math.PI/4
  var secondLeg = firstLeg.clone();
  secondLeg.position.set(-2, -16, -2);
  var thirdLeg = firstLeg.clone();
  thirdLeg.position.set(2,-16,-2);
  var fourthLeg = firstLeg.clone();
  fourthLeg.position.set(2,-16,2);

  //put the middle together
  base.add(firstLeg);
  base.add(secondLeg);
  base.add(thirdLeg);
  base.add(fourthLeg);

  return base
}

//will combine the top and middle parts of the tower
function assembleTower(){
var eiffelTower = new THREE.Object3D();
var topOfTower = combineTop();
var middleOfTower = makeMiddle();
var bottomOfTower = makeBase();
middleOfTower.position.set(0, 6, 0);
bottomOfTower.position.set(0,-0.5,0);
eiffelTower.add(topOfTower);
eiffelTower.add(middleOfTower);

eiffelTower.add(bottomOfTower);
eiffelTower.position.set(0,0,0);
return eiffelTower

}

return assembleTower();
}
