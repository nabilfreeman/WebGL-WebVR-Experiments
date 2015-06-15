var worldSize = 1000;

var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
var scene = new THREE.Scene();

var renderer = new THREE.WebGLRenderer();
renderer.setClearColor( 0x008cff );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMapEnabled = true;
renderer.shadowMapType = THREE.PCFSoftShadowMap;
document.body.appendChild( renderer.domElement );

function createScene() {

	light = new THREE.Object3D();

	spot = new THREE.SpotLight(0xFFFFFF);
	spot.castShadow = true;

	light.add(spot);

	sun = new THREE.PointLight(0xFFFFFF);

	light.add(sun);
	
	light.position.y = (worldSize) - 30;

	scene.add( light );

	//table
	var table = new THREE.Object3D();
	var tableMaterial = new THREE.MeshLambertMaterial({color:0x49311c});
	var tableVals = {
		height: 12,
	};
	tableVals.surface = {
		width: 20,
		length: 30,
		thickness: 1,
	};
	tableVals.legs = {
		width: 2,
		length: 2,
		height: (tableVals.height - tableVals.surface.thickness)
	};

	var tableSurface = new THREE.Mesh(
		new THREE.BoxGeometry(tableVals.surface.width, tableVals.surface.thickness, tableVals.surface.length),
		tableMaterial
	);
	tableSurface.castShadow = true;
	tableSurface.receiveShadow = true;
	tableSurface.position.y = 0;

	var posOffset = tableVals.legs.width;
	var leg1 = new THREE.Mesh(
		new THREE.BoxGeometry(tableVals.legs.width, tableVals.legs.height, tableVals.legs.length),
		tableMaterial
	);
	leg1.castShadow = true;
	leg1.receiveShadow = true;
	leg1.position.x = -((tableVals.surface.width / 2) - posOffset);
	leg1.position.z = (tableVals.surface.length / 2) - posOffset;
	leg1.position.y = -((tableVals.legs.height / 2) + (tableVals.surface.thickness / 2));

	var leg2 = new THREE.Mesh(
		new THREE.BoxGeometry(tableVals.legs.width, tableVals.legs.height, tableVals.legs.length),
		tableMaterial
	);
	leg2.castShadow = true;
	leg2.receiveShadow = true;
	leg2.position.x = (tableVals.surface.width / 2) - posOffset;
	leg2.position.z = (tableVals.surface.length / 2) - posOffset;
	leg2.position.y = -((tableVals.legs.height / 2) + (tableVals.surface.thickness / 2));

	var leg3 = new THREE.Mesh(
		new THREE.BoxGeometry(tableVals.legs.width, tableVals.legs.height, tableVals.legs.length),
		tableMaterial
	);
	leg3.castShadow = true;
	leg3.receiveShadow = true;
	leg3.position.x = -((tableVals.surface.width / 2) - posOffset);
	leg3.position.z = -((tableVals.surface.length / 2) - posOffset);
	leg3.position.y = -((tableVals.legs.height / 2) + (tableVals.surface.thickness / 2));

	var leg4 = new THREE.Mesh(
		new THREE.BoxGeometry(tableVals.legs.width, tableVals.legs.height, tableVals.legs.length),
		tableMaterial
	);
	leg4.castShadow = true;
	leg4.receiveShadow = true;
	leg4.position.x = (tableVals.surface.width / 2) - posOffset;
	leg4.position.z = -((tableVals.surface.length / 2) - posOffset);
	leg4.position.y = -((tableVals.legs.height / 2) + (tableVals.surface.thickness / 2));

	table.add(leg1);
	table.add(leg2);
	table.add(leg3);
	table.add(leg4);
	table.add(tableSurface);

	table.position.y = 0;

	table.castShadow = true;


	var bulb = new THREE.Mesh(
		new THREE.TorusKnotGeometry(4, 1, 60, 60), 
		new THREE.MeshNormalMaterial( { color: 0xFFFF00 } ) 
	);
	// bulb.rotation.x = 90 * (Math.PI / 180);

	bulb.position.y = 10;

	bulb.castShadow = true;

	table.add(bulb);

	scene.add(table);


}

createScene();

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

setInterval(loop, 50);