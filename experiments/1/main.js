// set the scene size
var WIDTH = window.innerWidth,
  HEIGHT = window.innerHeight;

// set some camera attributes
var VIEW_ANGLE = 45,
  ASPECT = WIDTH / HEIGHT,
  NEAR = 0.1,
  FAR = 10000;

var CAMERARADIUS = 1000;

var RUN = true;





// get the DOM element to attach to
// - assume we've got jQuery to hand
var container = document.getElementById("container");

// create a WebGL renderer, camera
// and a scene
var renderer = new THREE.WebGLRenderer();

renderer.setClearColor(0xCDCDCD, 1);

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


var oldTheta = 0;
var theta = 0;
var cameraProjected = Math.PI * 0.5;

var rotateScene = function(modifier, degrees){
	//rotate 5 degrees in the direction that the modifier sets.
	cameraProjected += (Math.PI / 180) * modifier * degrees;

	//keep numbers within 360 degress. keeps things simple.
	if(cameraProjected < 0){
		cameraProjected = 2 * Math.PI;
	} else if(cameraProjected > (2 * Math.PI)){
		cameraProjected = 0;
	}

	//we calculate the coordinates of the new camera position with trig.
	camera.position.x = Math.cos(cameraProjected) * CAMERARADIUS;
	camera.position.z = Math.sin(cameraProjected) * CAMERARADIUS;

	//because of the camera moving in a circle around the scene, we need to constantly reposition it towards the origin. 
	//This is done below with some more trig. fucking circles.

	//tan theta = x / z
	//camera rotation = inverse tan x / z
	oldTheta = theta;
	theta = Math.atan(camera.position.x / camera.position.z);

	//all values (and the result) need to be positive.
	camera.rotation.y += Math.abs(Math.abs(theta) - Math.abs(oldTheta)) * -modifier;
}



var mouseData = {
	clicked: false,
	position: {
		x: 0,
		y: 0
	}
};

var mouseDown = function(event) {
	mouseData.clicked = true;

	mouseData.position.x = event.clientX;
	mouseData.position.y = event.clientY;
};

var mouseUp = function(event) {
	mouseData.clicked = false;
};

var mouseMove = function(event) {

  event.preventDefault();



  if (mouseData.clicked) {

  	//if these numbers are positive, mouse has moved up / left. if negative, down / right.
  	var draggedX = mouseData.position.x - event.clientX;
  	var draggedY = mouseData.position.y - event.clientY;

  	if(draggedX > 0){
  		rotateScene(-1, 4);
  	} else {
  		rotateScene(1, 4);
  	}

  	mouseData.position.x = event.clientX;
  	mouseData.position.y = event.clientY;
  	
  }

};

document.addEventListener('mousedown', mouseDown);
document.addEventListener('mouseup', mouseUp);
document.addEventListener('mousemove', mouseMove);


//create The Seed Cube
var cubeMaterial = new THREE.MeshLambertMaterial({
  color: 0x008CFF
});

var cube = new THREE.Mesh(

  new THREE.BoxGeometry(
    50,50,50),

  cubeMaterial);

//rotate cube 45 degrees to make a diamond
//NB three.js uses Radians for rotation. Hence the pi shit.
// cube.rotation.z = 45 * (Math.PI / 180);

// add the sphere to the scene
scene.add(cube);


var cubes = [];

cubes.push(cube);

for(var i = 100; i <= 200; i += 100){
	var newCube = cube.clone();
	newCube.position.y += i;
	newCube.scale.x = 0.2;
	newCube.scale.y = 0.2;
	newCube.scale.z = 0.2;
	scene.add(newCube);

	cubes.push(newCube);

	var newCube = cube.clone();
	newCube.position.y -= i;
	newCube.scale.x = 0.2;
	newCube.scale.y = 0.2;
	newCube.scale.z = 0.2;
	scene.add(newCube);	

	cubes.push(newCube);

	var newCube = cube.clone();
	newCube.position.x += i;
	newCube.scale.x = 0.2;
	newCube.scale.y = 0.2;
	newCube.scale.z = 0.2;
	scene.add(newCube);	

	cubes.push(newCube);

	var newCube = cube.clone();
	newCube.position.x -= i;
	newCube.scale.x = 0.2;
	newCube.scale.y = 0.2;
	newCube.scale.z = 0.2;
	scene.add(newCube);		

	cubes.push(newCube);
}



// create a point light
var pointLight = new THREE.PointLight(0xFFFFFF);

// set its position
pointLight.position.x = 150;
pointLight.position.y = 0;
pointLight.position.z = 150;

// add to the scene
scene.add(pointLight);



// var makeLabel = function(object){
// 	var position = {
// 		x: object.position.x,
// 		y: object.position.y,
// 		z: object.position.z
// 	};


// }




// draw!
var animate = function(){
	requestAnimationFrame(animate);
	
	if(RUN){
		renderer.render(scene, camera);

		cubes.forEach(function(cube){
			cube.rotation.x += 0.5 * (Math.PI / 180);
			cube.rotation.y += 0.5 * (Math.PI / 180);
		});

	}

}

animate();