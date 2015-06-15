var worldSize = 1000;

var renderer = new THREE.WebGLRenderer();
renderer.setClearColor( 0x008cff );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMapEnabled = true;
renderer.shadowMapType = THREE.PCFSoftShadowMap;
document.body.appendChild( renderer.domElement );

var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
var scene = new THREE.Scene();

var objects = {};

function createScene() {

	light = new THREE.Object3D();

	spot = new THREE.SpotLight(0xFFFFFF);
	spot.castShadow = true;

	light.add(spot);

	sun = new THREE.PointLight(0xFFFFFF);

	light.add(sun);
	
	light.position.y = (worldSize) - 30;

	scene.add( light );

	objects.bulb = new THREE.Mesh(
		new THREE.TorusKnotGeometry(4, 1, 60, 60), 
		new THREE.MeshNormalMaterial( { color: 0xFFFF00 } ) 
	);
	// bulb.rotation.x = 90 * (Math.PI / 180);

	objects.bulb.position.z = -50;

	scene.add(objects.bulb);


}

createScene();

var fullscreen_button = document.querySelector('button#fullscreen');
fullscreen_button.addEventListener('click', goFullscreen);

function goFullscreen() {
    document.querySelector("canvas").webkitRequestFullScreen();
}

// Normal scene setup, then...
var vrControls = new THREE.VRControls(camera);
var vrEffect = new THREE.VREffect(renderer);

function onFullscreen() {
  vrEffect.setFullScreen(true);
}

function onResize() {
  vrEffect.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onResize);

function loop() {
  vrControls.update();
  vrEffect.render(scene, camera);
  // requestAnimationFrame(loop);
}

// setInterval(loop, 50);