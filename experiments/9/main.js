var worldSize = 1000;

var renderer = new THREE.WebGLRenderer();
renderer.setClearColor( 0x000000 );
// renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMapEnabled = true;
renderer.shadowMapType = THREE.PCFSoftShadowMap;
document.body.appendChild( renderer.domElement );

var camera_wrapper, camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );

var scene = new THREE.Scene();

var objects = {};

function createScene() {

	camera_wrapper = new THREE.Object3D();
	camera_wrapper.add(camera);

	scene.add(camera_wrapper);

	camera_wrapper.position.z = 400;
	camera_wrapper.position.x = 400;
	camera_wrapper.position.y = 400;



	window.roomTextures = [];

	var wallTexture = THREE.ImageUtils.loadTexture( 'wood.png' );
	wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
	wallTexture.repeat.set(4,4);
	for(var i = 0; i < 6; i++){
		roomTextures.push(
			new THREE.MeshLambertMaterial({
				map: wallTexture,
				side: THREE.BackSide
			})
		);

		roomTextures[i].receiveShadow = true;
	}

	var room = new THREE.Mesh(
		new THREE.BoxGeometry(
			worldSize,
			worldSize,
			worldSize
		),
		new THREE.MeshFaceMaterial(roomTextures)
	);

	scene.add(room);

	light = new THREE.Object3D();

	spot = new THREE.SpotLight(0xFFFFFF);
	spot.castShadow = true;

	light.add(spot);

	sun = new THREE.PointLight(0xFFFFFF);

	light.add(sun);
	
	light.position.y = (worldSize) - 30;

	scene.add( light );

	var bulb = new THREE.Mesh(
		new THREE.BoxGeometry(100, 100, 100), 
		new THREE.MeshLambertMaterial( { color: 0x008CFF } ) 
	);
	// bulb.rotation.x = 90 * (Math.PI / 180);

	scene.add(bulb);

	bulb.castShadow = true;


	objects.room = room;
	objects.bulb = bulb;

}

createScene();

var fullscreen_button = document.querySelector('button#fullscreen');
fullscreen_button.addEventListener('click', goFullscreen);

function goFullscreen() {
	document.querySelector("canvas").webkitRequestFullScreen();
}

// Normal scene setup, then...
var vrControls = new THREE.VRControls(camera);

function onFullscreen() {
  // vrEffect.setFullScreen(true);
}

function onResize() {
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect	= window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
}
window.addEventListener("resize", onResize);

var one_degree = (Math.PI / 180);

function loop() {
	vrControls.update();
	renderer.render(scene, camera);
	requestAnimationFrame(loop);

	objects.bulb.rotation.z += one_degree;
	objects.bulb.rotation.x += one_degree;
}

loop();

//if vr device is available, overwrite our renderer with a stereoscopic version
function attachVRHeadset(vrs) {
	console.log("vr mode");

	for (var i = 0; i < vrs.length; ++i) {
		if (vrs[i] instanceof HMDVRDevice) {
			vrHMD = vrs[i];
			break;
		}
	}
	for (var i = 0; i < vrs.length; ++i) {
		if (vrs[i] instanceof PositionSensorVRDevice &&
			vrs[i].hardwareUnitId == vrHMD.hardwareUnitId) {
			vrHMDSensor = vrs[i];
			break;
		}
	}

	renderer = new THREE.VRRenderer(renderer, vrHMD, camera_wrapper);
}

if (navigator.getVRDevices){
	navigator.getVRDevices().then(attachVRHeadset);
}