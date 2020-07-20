/* Function that sets up the entire scene: background and tower */
function createScene() {

  if (! Detector.webgl) Detector.addGetWebGLMessage();

  //global variables
  var container;
  var camera, controls, scene, renderer, skyParams, lightsOn;
  var sky, sunSphere, sunLight;

  init();
  render();

/* Function that creates the tower */
  function zygourasEiffelTower(hexColor){
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
        solidSupport.position.set(0,-0.5,0);
        base.add(solidSupport);

        //Making the bottom support legs
        var bodyPts = Array.prototype.concat(bottomLegs);
        var bodyPoints = makePoints(bodyPts);
        var spline = makeCurves(bodyPoints, 1);
        var firstLeg = makeLatheObj(spline);

        //position and rotate legs
        var secondLeg = firstLeg.clone();
        secondLeg.rotation.x = THREE.Math.degToRad(10);
        secondLeg.rotation.z = THREE.Math.degToRad(20);
        secondLeg.position.set(8, -15, -5);

        var thirdLeg = firstLeg.clone();
        thirdLeg.rotation.x = THREE.Math.degToRad(10);
        thirdLeg.rotation.z = THREE.Math.degToRad(-20);
        thirdLeg.position.set(-8, -15, -5);

        var fourthLeg = firstLeg.clone();
        fourthLeg.rotation.x = THREE.Math.degToRad(-10);
        fourthLeg.position.set(8,-15,5);
        fourthLeg.rotation.z = THREE.Math.degToRad(20);
        firstLeg.rotation.x = THREE.Math.degToRad(-10);
        firstLeg.rotation.z = THREE.Math.degToRad(-20);
        firstLeg.position.set(-8, -15, 5);

        //put the middle together
        base.add(firstLeg);
        base.add(secondLeg);
        base.add(thirdLeg);
        base.add(fourthLeg);

        //make trapezoid center
        var x = 0;
        var y = 0;
        var trapezoidShape = new THREE.Shape();
        trapezoidShape.moveTo( x, y );
        trapezoidShape.lineTo(x + 1, y + 3);
        trapezoidShape.lineTo( x + 5, y + 3);
        trapezoidShape.lineTo(x + 6, y);
        trapezoidShape.moveTo(x + 6, y);
        trapezoidShape.quadraticCurveTo(3, 3, x, y);

        var trapezoidGeom = new THREE.ShapeGeometry(trapezoidShape);
        var trapezoidMaterial = new THREE.MeshBasicMaterial( {color: hexColor} );
        var trapezoid = new THREE.Mesh( trapezoidGeom, trapezoidMaterial );

        var trap2 = trapezoid.clone();
        var trap3 = trapezoid.clone();
        var trap4 = trapezoid.clone();

        trapezoid.position.set(-3,-3,4);
        trap2.rotation.y = Math.PI
        trap2.position.set(3,-3, -4);
        trap3.rotation.y = Math.PI /2
        trap3.position.set(4.5, -3, 3)
        trap4.rotation.y = - Math.PI /2
        trap4.position.set(-4.5, -3, -3)

        base.add(trapezoid);
        base.add(trap2);
        base.add(trap3);
        base.add(trap4);

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
          eiffelTower.position.set(0,5,0);
          return eiffelTower
      }

      return assembleTower();
  }

/* Function sets up sky and sun and the gui*/
  function initSky() {
    // Add Sky Mesh
    sky = new THREE.Sky();
    scene.add(sky.mesh);

    //Add Sun
    sunSphere = new THREE.Mesh(new THREE.SphereBufferGeometry( 20000, 16, 8 ),
                              new THREE.MeshBasicMaterial( { color: 0xffffff }));
    sunSphere.visible = false;
    scene.add(sunSphere);

    //Add Ambient Light
    ambient = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambient);

    //Add spotlight
    sunLight = new THREE.SpotLight(0xffff99,.50,0,.75);
    sunLight.position.set(sunSphere.position)
    sunLight.target.position.set(0,50,1700);
    scene.add(sunLight);

    //set up Tower
    var EiffelTower = zygourasEiffelTower(0x404040);
    EiffelTower.position.set(0,50,1700);
    EiffelTower.scale.set(5,5,5);
    scene.add(EiffelTower);

    var skyParams = {
              turbidity: 10,
              rayleigh: 2,
              mieCoefficient: 0.005,
              mieDirectionalG: 0.8,
              luminance: 1,
              inclination: 0.49, // elevation / inclination
              azimuth: 0.195, // Facing front,
              sun: ! true,
              noon: false,
              sunset: false,
              night: false
            };

    var distance = 400000;

    lightsOn = false; //if the tower lights are twinkling, default = false

    //GUI
    function guiChanged() {
        var uniforms = sky.uniforms
        uniforms[ "turbidity" ].value = skyParams.turbidity;
        uniforms[ "rayleigh" ].value = skyParams.rayleigh;
        uniforms[ "mieCoefficient" ].value = skyParams.mieCoefficient;
        uniforms[ "mieDirectionalG" ].value = skyParams.mieDirectionalG;
        uniforms[ "luminance" ].value = skyParams.luminance;
        var theta = Math.PI * (skyParams.inclination - 0.5 );
        var phi = 2 * Math.PI * (skyParams.azimuth - 0.5 );
        sunSphere.position.x = distance * Math.cos( phi );
        sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
        sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );
        uniforms[ "sunPosition" ].value.copy(sunSphere.position);

        //if the lights are not on and the sun is below horizon
        if (skyParams.inclination > .50 && lightsOn == false){
          twinkle();
          lightsOn = true;
        }
        renderer.render(scene, camera);
     }
    var gui = new dat.GUI();
    gui.add(skyParams, "inclination", 0.48, .52 ).onChange(guiChanged);
    guiChanged()

    renderer.render(scene, camera);
  }

  /*Make glittery lights function */
  function makeLights(xMin, xMax, yMin, yMax, zCoord){
  var lightGeometry = new THREE.Geometry();

  for ( var i = 0; i < 120; i ++ ) {
      var light = new THREE.Vector3();
      light.x = (xMax - xMin) + xMin*(Math.random());
      light.y = (yMax - yMin) + yMax*(Math.random());
      light.z = zCoord*(Math.random()-0.25);
      lightGeometry.vertices.push( light );
  }

  var lightMaterial = new THREE.PointsMaterial( { color: 0xffdf00, size: 1.2} );
  var lightField = new THREE.Points( lightGeometry, lightMaterial );
  return lightField
}

  /*Creates and positions multiple sections of lights, uses clock
 to start and stop the lightshow */
  function twinkle(lights){

      //create the patches of lights
      var topLightsDown =  makeLights(10,20, -90, 110, 40);
      var topLightsUp =  topLightsDown.clone();

      var middleRightLightsDown = makeLights(15,16, -30 ,30 , 40);
      var middleRightLightsUp = middleRightLightsDown.clone();

      var middleLeftLightsDown = makeLights(-15,-16, -30, 30, 40);
      var middleLeftLightsUp = middleLeftLightsDown.clone();

      var bottomRightLightsDown = makeLights(-10,15, -10, 20, 40);
      var bottomRightLightsUp = bottomRightLightsDown.clone();

      var bottomLeftLightsDown = makeLights(-10,10, -10, 20, 40);
      var bottomLeftLightsUp = bottomLeftLightsDown.clone();

      var bottomFiller = makeLights(-10,5, -10, 15, 40);
      var bottomFiller2 = bottomFiller.clone();

      var filler = makeLights(0,25, -90, 100, 40);

      var posY = 0;
      //driver for lights to flash - changes their position by updating posY
      function lightShow () {
           posY = posY - 3;

           //top lights
           topLightsUp.position.set(-15, (-posY)-110, 1700);
           topLightsDown.position.set(-15, posY-110, 1700);

           //middle leg lights
           middleRightLightsDown.position.set(0, posY, 1700);
           middleRightLightsUp.position.set(0, (-posY) -25 , 1700);
           middleLeftLightsDown.position.set(-2, posY, 1700);
           middleLeftLightsUp.position.set(-2, (-posY)-25, 1700);

           //Bottom leg lights
           bottomLeftLightsDown.position.set(-35, posY, 1700);
           bottomLeftLightsUp.position.set(-35, (-posY) -30 , 1700);

           bottomRightLightsDown.position.set(2, posY, 1700);
           bottomRightLightsUp.position.set(2, (-posY) -30 , 1700);

           //additional lights to fill in gaps
           bottomFiller.position.set(15, -posY-40 , 1690);
           bottomFiller2.position.set(-40, -posY-40 , 1690);

           bottomFiller.position.set(15, posY-10 , 1690);
           bottomFiller2.position.set(-40, posY-10, 1690);

           filler.position.set(-30, -posY-120 , 1690);

           //add all of the lights to the scene
           scene.add(topLightsDown);
           scene.add(topLightsUp);

           scene.add(middleRightLightsDown);
           scene.add(middleRightLightsUp);

           scene.add(middleLeftLightsUp);
           scene.add(middleLeftLightsDown);

           scene.add(bottomLeftLightsDown);
           scene.add(bottomLeftLightsUp);

           scene.add(bottomRightLightsDown);
           scene.add(bottomRightLightsUp);

           scene.add(bottomFiller);
           scene.add(bottomFiller2);

           //drives the animation
           if (posY < -23) {
               clearInterval(clock);
           } else {
               render();
           }
        }
        var clock = setInterval(lightShow, 200);
  }

 /* Function to initilize scene */
  function init() {

      //create camera
      camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 50, 2000000);
      camera.position.set(0, 100, 2000);
      camera.lookAt(0,200,-2000);
      scene = new THREE.Scene();

      //set up renderer
      renderer = new THREE.WebGLRenderer();
      renderer.setPixelRatio( window.devicePixelRatio );
      renderer.setSize( window.innerWidth, window.innerHeight );
      document.body.appendChild( renderer.domElement );
      controls = new THREE.OrbitControls( camera, renderer.domElement );
      controls.addEventListener( 'change', render );
      controls.enableZoom = false;
      controls.enablePan = false;
      initSky();

      window.addEventListener( 'resize', onWindowResize, false );
  }

/* Function for window resize */
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
  }

/* Render function */
  function render() {
    renderer.render(scene, camera);
  }
}
