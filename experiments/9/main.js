document.documentElement.requestFullScreen = document.documentElement.requestFullScreen || document.documentElement.webkitRequestFullScreen || document.documentElement.mozRequestFullScreen;

var worldSize = 1000;

var renderer = new THREE.WebGLRenderer();
renderer.setClearColor( 0x000000 );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMapEnabled = true;
renderer.shadowMapType = THREE.PCFSoftShadowMap;
document.body.appendChild( renderer.domElement );

var camera_wrapper, camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );

var scene = new THREE.Scene();

var objects = {};

var one_degree = (Math.PI / 180);

function createScene() {

	var world = new THREE.Object3D();

	camera_wrapper = new THREE.Object3D();
	camera_wrapper.add(camera);

	world.add(camera_wrapper);

	camera_wrapper.position.z = 400;
	camera_wrapper.position.x = 400;
	camera_wrapper.position.y = 400;

	camera_wrapper.rotation.x = 0;
	camera_wrapper.rotation.y = one_degree*45;
	camera_wrapper.rotation.z = 0;


	window.roomTextures = [];

	var wallTexture = THREE.ImageUtils.loadTexture( 'planks_spruce.png' );
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

	var floorTexture = THREE.ImageUtils.loadTexture( 'grass_top.png' );
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
	floorTexture.repeat.set(4,4);
	roomTextures[3] = new THREE.MeshBasicMaterial({
		map: floorTexture,
		side: THREE.BackSide
	});

	var room = new THREE.Mesh(
		new THREE.BoxGeometry(
			worldSize,
			worldSize,
			worldSize
		),
		new THREE.MeshFaceMaterial(roomTextures)
	);

	world.add(room);

	light = new THREE.Object3D();

	spot = new THREE.SpotLight(0xFFFFFF);
	spot.castShadow = true;

	light.add(spot);

	sun = new THREE.PointLight(0xFFFFFF);

	light.add(sun);
	
	light.position.y = (worldSize) - 30;

	world.add( light );


	var bulb_pivot = new THREE.Object3D();

	var bulb = new THREE.Mesh(
		new THREE.BoxGeometry(200, 200, 200), 
		new THREE.MeshLambertMaterial({
			map: THREE.ImageUtils.loadTexture( 'endframe_top.png' )
		}) 
	);

	bulb.rotation.x = 35*one_degree;
	bulb.rotation.z = 45*one_degree;

	bulb_pivot.add(bulb);

	world.add(bulb_pivot);

	bulb.castShadow = true;


	objects.world = world;
	objects.room = room;
	objects.bulb_pivot = bulb_pivot;
	objects.bulb = bulb;

	scene.add(world);

}

createScene();

var lyingdown_button = document.querySelector("li#lyingdown");
lyingdown_button.addEventListener("click", function(){
	if(camera_wrapper.rotation.x === 0){
		camera_wrapper.rotation.x = -one_degree*90;
		camera_wrapper.rotation.y = 0;
		camera_wrapper.rotation.z = one_degree*45;

	} else {
		camera_wrapper.rotation.x = 0;
		camera_wrapper.rotation.y = one_degree*45;
		camera_wrapper.rotation.z = 0;
	}
});

var fullscreen_button = document.querySelector('li#fullscreen');
fullscreen_button.addEventListener('click', goFullscreen);

function goFullscreen() {
	document.documentElement.requestFullScreen();
}

// Normal scene setup, then...
var vrControls = new THREE.VRControls(camera);
vrControls.zeroSensor();

function onFullscreen() {
  // vrEffect.setFullScreen(true);
}

function onResize() {
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect	= window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
}
window.addEventListener("resize", onResize);


var fast_or_slow = 1; //default to accelerate, -1 = decelerate.
var rotation_amount = 0.5*one_degree;

function loop() {
	vrControls.update();
	renderer.render(scene, camera);

	if(rotation_amount > 40*one_degree){
		fast_or_slow = -1;
	}

	if(rotation_amount < 0.5*one_degree){
		fast_or_slow = 1;
	}

	rotation_amount *= (1 + (0.01 * fast_or_slow));

	objects.bulb_pivot.rotation.y += rotation_amount;

	requestAnimationFrame(loop);
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