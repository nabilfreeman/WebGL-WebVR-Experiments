// set the scene size
var WIDTH = window.innerWidth,
  HEIGHT = window.innerHeight;

// set some camera attributes
var VIEW_ANGLE = 45,
  ASPECT = WIDTH / HEIGHT,
  NEAR = 0.1,
  FAR = 10000;

var CAMERARADIUS = 1500;

var RUN = true;





// get the DOM element to attach to
// - assume we've got jQuery to hand
var container = document.getElementById("container");

// create a WebGL renderer, camera
// and a scene
var renderer = new THREE.WebGLRenderer();

renderer.setClearColor(0xCDCDCD, 1);

renderer.shadowMapEnabled = true;
renderer.shadowMapType = THREE.PCFSoftShadowMap;

// start the renderer
renderer.setSize(WIDTH, HEIGHT);

// attach the render-supplied DOM element
container.appendChild(renderer.domElement);





var camera =
  new THREE.PerspectiveCamera(
    VIEW_ANGLE,
    ASPECT,
    NEAR,
    FAR);
var scene = new THREE.Scene();
// add the camera to the scene
scene.add(camera);
// the camera starts at 0,0,0
// so pull it back
camera.position.z = CAMERARADIUS;

// create a point light
var light = new THREE.DirectionalLight(0xFFFFFF);

// set its position
light.position.copy(camera.position);

light.castShadow = true;

light.shadowDarkness = 0.1;

light.shadowMapWidth = 1000;
light.shadowMapHeight = 1000;

// add to the scene
scene.add(light);

var orbit = new THREE.OrbitControls(camera, renderer.domElement);
orbit.addEventListener('change', function(){
	//move the light to wherever the camera is.
	//this copy function is interesting. 
	//might be useful if I ever embed a camera in a 3d body.
	light.position.copy(camera.position);
});





var floor = new THREE.Mesh(

	new THREE.BoxGeometry(1000, 1, 1000),

	new THREE.MeshLambertMaterial({
		color: 0xBCBCBC
	})

);

floor.position.y -= 250;
floor.receiveShadow = true;

scene.add(floor);



//create The Seed Cube
var cube = new THREE.Mesh(

  new THREE.BoxGeometry(50,50,50),

  new THREE.MeshLambertMaterial({
  	color: 0x008CFF
  })

);

//rotate cube 45 degrees to make a diamond
//NB three.js uses Radians for rotation. Hence the pi shit.
// cube.rotation.z = 45 * (Math.PI / 180);

cube.castShadow = true;
cube.receiveShadow = true;

// add the sphere to the scene
scene.add(cube);


//make lots of little cubes around the big cube. coz it looks cool
var cubes = [];

cubes.push(cube);

for(var i = 100; i <= 200; i += 100){
	var newCube = cube.clone();
	newCube.position.y += i;

	cubes.push(newCube);

	var newCube = cube.clone();
	newCube.position.y -= i;

	cubes.push(newCube);

	var newCube = cube.clone();
	newCube.position.x += i;

	scene.add(newCube);	

	cubes.push(newCube);

	var newCube = cube.clone();
	newCube.position.x -= i;

	cubes.push(newCube);

	var newCube = cube.clone();
	newCube.position.z -= i;	

	cubes.push(newCube);

	var newCube = cube.clone();
	newCube.position.z += i;

	cubes.push(newCube);
}

//we want to process every cube in the array apart from the first one.
for(var i = 1; i < cubes.length; i++){
	cubes[i].scale.x = 0.2;
	cubes[i].scale.y = 0.2;
	cubes[i].scale.z = 0.2;
	scene.add(cubes[i]);	
}








// draw!
var animate = function(){
	requestAnimationFrame(animate);
	
	if(RUN){
		renderer.render(scene, camera);

		//rotate 0.5 degrees per frame
		cubes.forEach(function(cube){
			cube.rotation.x += 0.5 * (Math.PI / 180);
			cube.rotation.y += 0.5 * (Math.PI / 180);
		});

	}

}

animate();