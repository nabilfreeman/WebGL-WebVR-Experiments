var worldSize = 1000;

var renderer = new THREE.WebGLRenderer();
renderer.setClearColor( 0x000000 );
// renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMapEnabled = true;
renderer.shadowMapType = THREE.PCFSoftShadowMap;
document.body.appendChild( renderer.domElement );

var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );

var scene = new THREE.Scene();

var objects = {};

function createScene() {

	var roomTextures = [
		new THREE.MeshLambertMaterial({
			color: 0xFF0000,
			side: THREE.BackSide
		}),
		new THREE.MeshLambertMaterial({
			color: 0x00FF00,
			side: THREE.BackSide
		}),
		new THREE.MeshLambertMaterial({
			color: 0x0000FF,
			side: THREE.BackSide
		}),
		new THREE.MeshLambertMaterial({
			color: 0xFF00FF,
			side: THREE.BackSide
		}),
		new THREE.MeshLambertMaterial({
			color: 0xFFFF00,
			side: THREE.BackSide
		}),
		new THREE.MeshLambertMaterial({
			color: 0x00FFFF,
			side: THREE.BackSide
		}),
	];

	// var room_wallpaper = new THREE.MeshLambertMaterial({
	// 	color: 0xFF0000,
	// 	side: THREE.BackSide
	// });

	// for(var i = 0; i < 6; i++){
	// 	roomTextures.push(room_wallpaper);
	// }

	var room = new THREE.Mesh(
		new THREE.BoxGeometry(
			worldSize,
			worldSize,
			worldSize
		),
		new THREE.MeshFaceMaterial(roomTextures)
	);

	room.position.z = 250;

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
		new THREE.TorusKnotGeometry(worldSize / 40, worldSize / 40 / 2, 60, 60), 
		new THREE.MeshNormalMaterial( { color: 0xFFFF00 } ) 
	);
	// bulb.rotation.x = 90 * (Math.PI / 180);

	bulb.position.x = 0;
	bulb.position.y = 0;
	bulb.position.z = 0;

	scene.add(bulb);


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

function loop() {
  vrControls.update();
  renderer.render(scene, camera);
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

	renderer = new THREE.VRRenderer(renderer, vrHMD);
}

if (navigator.getVRDevices){
	navigator.getVRDevices().then(attachVRHeadset);
}