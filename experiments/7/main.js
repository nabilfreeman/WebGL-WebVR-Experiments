var camera, scene, renderer;
var geometry, material, mesh, light;
var controls;
var viewElement;

var vrHMD, vrHMDSensor;

var objects = [], boxes;

var sun, mythicalCube;

// var raycaster;

var controlsEnabled = false;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var jump = false;
var prevTime = performance.now();
// var velocity = new THREE.Vector3();

var speed = 1;

var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );

function attachVRHeadset(vrs) {
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

	instructions.querySelector(".play").addEventListener( 'click', function ( event ) {

		instructions.style.display = 'none';

		controlsEnabled = true;

	});
}

function attachPointerLock(){
	var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

	if ( havePointerLock ) {

		var element = document.body;

		var pointerlockchange = function ( event ) {

			if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

				controlsEnabled = true;
				controls.enabled = true;

				blocker.style.display = 'none';

			} else {
				controlsEnabled = false;
				controls.enabled = false;

				blocker.style.display = '-webkit-box';
				blocker.style.display = '-moz-box';
				blocker.style.display = 'box';

				instructions.style.display = '';

			}

		}

		var pointerlockerror = function ( event ) {

			instructions.style.display = '';

		}

		// Hook pointer lock state change events
		document.addEventListener( 'pointerlockchange', pointerlockchange, false );
		document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
		document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

		document.addEventListener( 'pointerlockerror', pointerlockerror, false );
		document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
		document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

		instructions.querySelector(".play").addEventListener( 'click', function ( event ) {

			instructions.style.display = 'none';

			// Ask the browser to lock the pointer
			element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

			if ( /Firefox/i.test( navigator.userAgent ) ) {

				var fullscreenchange = function ( event ) {

					if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

						document.removeEventListener( 'fullscreenchange', fullscreenchange );
						document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

						element.requestPointerLock();
					}

				}

				document.addEventListener( 'fullscreenchange', fullscreenchange, false );
				document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

				element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

				element.requestFullscreen();

			} else {

				element.requestPointerLock();

			}

		});

	} else {
		instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
	}
}

function createScene() {
	

	scene = new THREE.Scene();
	//make a fading horizon
	// scene.fog = new THREE.FogExp2( 0x110011, 0.0001 );

	scene.add( viewElement );

	var worldSize = 100;

	light = new THREE.Object3D();

	bulb = new THREE.SpotLight(0xFFFFFF);
	bulb.castShadow = true;
	// bulb.shadowCameraVisible = true;
	bulb.add(
		new THREE.Mesh(
			new THREE.SphereGeometry(5, 30, 30), 
			new THREE.MeshBasicMaterial( { color: 0xFFFF00 } ) 
		) 
	);
	bulb.position.y = 20;

	light.add(bulb);

	sun = new THREE.PointLight(0xFFFFFF);
	sun.position.y = worldSize*3;

	light.add(sun);
	
	light.position.y = worldSize;

	scene.add( light );

	//sky

	var skyTextures = [
		"sky/sky_b.jpg",
		"sky/sky_r.jpg",
		"sky/sky_f.jpg",
		"sky/sky_l.jpg"
	];

	var sky = new THREE.Object3D();

	skyTextures.forEach(function(texture, index){
		var sphere = new THREE.Mesh(
			new THREE.SphereGeometry(
				worldSize*5, 
				24, 16, 
				index * Math.PI/2, Math.PI/2
			),
			new THREE.MeshLambertMaterial({
				map: THREE.ImageUtils.loadTexture(texture),
				side: THREE.BackSide
			})
		);
		sky.add(sphere);
	});

	sky.position.y = (worldSize / 2) - 11 ;
	// add it to the scene
	scene.add( sky );

	//create the floor
	var floorPlane = new THREE.PlaneGeometry( worldSize, worldSize, 0, 0 );

	// var floorTextures = [];
	// floorTextures.push( new THREE.MeshLambertMaterial( { color: 0x008cff, side: THREE.DoubleSide }) );
	// floorTextures.push( new THREE.MeshLambertMaterial( { color: 0x0033aa, side: THREE.DoubleSide }) );

	// var l = floorPlane.faces.length / 2;

	// for( var i = 0; i < l; i ++ ) {
	// 	var j = i * 2; // <-- Added this back so we can do every other 'face'
	// 	floorPlane.faces[ j ].materialIndex = ((i + Math.floor(i/48)) % 2); // The code here is changed, replacing all 'i's with 'j's. KEEP THE 8
	// 	floorPlane.faces[ j + 1 ].materialIndex = ((i + Math.floor(i/48)) % 2); // Add this line in, the material index should stay the same, we're just doing the other half of the same face
	// }

	// var floor = new THREE.Mesh(floorPlane, new THREE.MeshFaceMaterial(floorTextures));
	var floor = new THREE.Mesh(floorPlane, new THREE.MeshLambertMaterial({color:0x008CFF}));
	floor.position.y -= 10;
	floor.rotation.x = -(Math.PI / 2);

	floor.receiveShadow = true;

	scene.add( floor );



	//table
	var table = new THREE.Object3D();
	var tableMaterial = new THREE.MeshLambertMaterial({color:0x49311c});
	var tableVals = {
		height: 10,
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

	scene.add(table);







	//black hole
	mythicalHeaven = new THREE.Mesh(
		new THREE.SphereGeometry(
			60, 30, 30
		),
		new THREE.MeshLambertMaterial({
			color:0x000000
		})
	);
	// mythicalCube.rotation.z = 45 * (Math.PI/180);
	// mythicalCube.rotation.x = 45 * (Math.PI/180);
	// mythicalCube.rotation.y = 45 * (Math.PI/180);

	mythicalHeaven.position.y = worldSize*5;
	scene.add(mythicalHeaven);

	mythicalHell = mythicalHeaven.clone();
	mythicalHeaven.position.y = -worldSize*5;
	scene.add(mythicalHell);

}

function setupMovement() {
	var onKeyDown = function ( event ) {
		switch ( event.keyCode ) {
			case 38: // up
			case 87: // w
				moveForward = true;
				break;
			case 37: // left
			case 65: // a
				moveLeft = true;
				break;
			case 40: // down
			case 83: // s
				moveBackward = true;
				break;
			case 39: // right
			case 68: // d
				moveRight = true;
				break;
			case 32: // space
				// if ( canJump === true ) velocity.y += 350;
				jump = true;
				break;
			case 70:
				document.body.webkitRequestFullscreen();
			break;
		}
	};
	var onKeyUp = function ( event ) {
		switch( event.keyCode ) {
			case 38: // up
			case 87: // w
				moveForward = false;
				break;
			case 37: // left
			case 65: // a
				moveLeft = false;
				break;
			case 40: // down
			case 83: // s
				moveBackward = false;
				break;
			case 39: // right
			case 68: // d
				moveRight = false;
				break;
		}
	};
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );
}

function animate() {

	requestAnimationFrame( animate );

	if ( controlsEnabled ) {
		//orbit
		// sky.rotation.y -= ((1 * Math.PI) / 180);

		if(vrHMDSensor && vrHMDSensor.getState()){
			var state = vrHMDSensor.getState();

			if ( state.orientation !== null ) {
				camera.quaternion.copy( state.orientation );
			}
		}


		if(moveForward) viewElement.translateZ( -speed );
		if(moveBackward) viewElement.translateZ( speed );
		if(moveLeft) viewElement.translateX(-speed);
		if(moveRight) viewElement.translateX(speed);

		//jumping code
		if(viewElement.position.y >= 30) jump = false;

		if(jump){
			viewElement.translateY(speed);
		} else {
			viewElement.translateY(-(speed*2));
		}

		if(viewElement.position.y <= 10){
			viewElement.position.y = 10;
		}

		
	}

	renderer.render( scene, camera );

}

window.addEventListener("load", function() {
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
	viewElement = camera;

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0xCDCDCD );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMapEnabled = true;
	renderer.shadowMapType = THREE.PCFSoftShadowMap;
	document.body.appendChild( renderer.domElement );

	if (navigator.getVRDevices) {
		navigator.getVRDevices().then(attachVRHeadset);
	} else {

		attachPointerLock();
		controls = new THREE.PointerLockControls( camera );
		//overwrite viewElement with the PointerLockControls object.
		viewElement = controls.getObject();

	}

	createScene();
	setupMovement();

	resize = new THREE.WindowResize(renderer, viewElement);

	//draw!
	animate();
}, false);