var camera, scene, renderer;
var controls;
var viewElement, moveElement;

var vrHMD, vrHMDSensor;

var objects = {};

var controlsEnabled = false;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var jump = false;

var speed = 2;
var worldSize = 200;

var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );

function debug(data){
	document.getElementById("debug").innerHTML = data;
}

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

	moveElement = viewElement;

	//make a fading horizon
	// scene.fog = new THREE.FogExp2( 0x110011, 0.0001 );

	// moveElement = new THREE.Object3D();
	// moveElement.add(viewElement);


	// var body = new THREE.Mesh(
	// 	new THREE.BoxGeometry(2, 2, 2),
	// 	new THREE.MeshBasicMaterial({color:0xffffff})
	// );

	// body.position.z = -5;
	// body.rotation.x = 45 * (Math.PI / 180);
	// moveElement.add(body);

	scene.add( moveElement );

	light = new THREE.Object3D();

	spot = new THREE.SpotLight(0xFFFFFF);
	spot.castShadow = true;

	light.add(spot);

	sun = new THREE.PointLight(0xFFFFFF);

	light.add(sun);
	
	light.position.y = (worldSize) - 30;

	scene.add( light );

	//sky

	// var skyTextures = [
	// 	"sky/sky_b.jpg",
	// 	"sky/sky_r.jpg",
	// 	"sky/sky_f.jpg",
	// 	"sky/sky_l.jpg"
	// ];

	// var sky = new THREE.Object3D();

	// skyTextures.forEach(function(texture, index){
	// 	var sphere = new THREE.Mesh(
	// 		new THREE.SphereGeometry(
	// 			worldSize*5, 
	// 			24, 16, 
	// 			index * Math.PI/2, Math.PI/2
	// 		),
	// 		new THREE.MeshLambertMaterial({
	// 			map: THREE.ImageUtils.loadTexture(texture),
	// 			side: THREE.BackSide
	// 		})
	// 	);
	// 	sky.add(sphere);
	// });

	window.roomTextures = [];

	var wallTexture = THREE.ImageUtils.loadTexture( 'patterns/pentagon.jpg' );
	wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
	wallTexture.repeat.set(4,4);
	for(var i = 0; i < 6; i++){
		roomTextures.push(
			new THREE.MeshLambertMaterial({
				map: wallTexture,
				side: THREE.BackSide
			})
		);
	}

	roomTextures[2] = new THREE.MeshBasicMaterial({
		map: THREE.ImageUtils.loadTexture("space.jpg"),
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

	room.position.y = (worldSize / 2) - 11 ;

	// add it to the scene
	scene.add( room );

	//create the floor
	var floorPlane = new THREE.PlaneGeometry( worldSize, worldSize, 8, 8 );

	var floorTextures = [];
	floorTextures.push( new THREE.MeshLambertMaterial( { color: 0x008cff, side: THREE.DoubleSide }) );
	floorTextures.push( new THREE.MeshLambertMaterial( { color: 0x333333, side: THREE.DoubleSide }) );

	var l = floorPlane.faces.length / 2;

	for( var i = 0; i < l; i ++ ) {
		var j = i * 2; // <-- Added this back so we can do every other 'face'
		floorPlane.faces[ j ].materialIndex = ((i + Math.floor(i/8)) % 2); // The code here is changed, replacing all 'i's with 'j's. KEEP THE 8
		floorPlane.faces[ j + 1 ].materialIndex = ((i + Math.floor(i/8)) % 2); // Add this line in, the material index should stay the same, we're just doing the other half of the same face
	}

	var floor = new THREE.Mesh(floorPlane, new THREE.MeshFaceMaterial(floorTextures));
	// var floor = new THREE.Mesh(floorPlane, new THREE.MeshLambertMaterial({color:0x008CFF}));
	floor.position.y -= 10.95;
	floor.rotation.x = -(Math.PI / 2);

	floor.receiveShadow = true;

	scene.add( floor );



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
	objects.bulb = bulb;

	scene.add(table);


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
				if(document.body.requestFullscreen){
					document.body.requestFullscreen();
				} else if(document.body.webkitRequestFullscreen){
					document.body.webkitRequestFullscreen();
				} else if(document.body.mozRequestFullScreen){
					document.body.mozRequestFullScreen();
				}
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

function move(jumpingEnabled){
	var worldBoundary = (worldSize / 2) - 2;

	if(moveForward) moveElement.translateZ( -speed );
	if(moveBackward) moveElement.translateZ( speed );
	if(moveLeft) moveElement.translateX(-speed);
	if(moveRight) moveElement.translateX(speed);

	if(moveElement.position.x > worldBoundary) moveElement.position.x = worldBoundary;
	if(moveElement.position.x < -worldBoundary) moveElement.position.x = -worldBoundary;
	if(moveElement.position.z > worldBoundary) moveElement.position.z = worldBoundary;
	if(moveElement.position.z < -worldBoundary) moveElement.position.z = -worldBoundary;

	if(jumpingEnabled){
		//jumping code
		if(moveElement.position.y >= 30) jump = false;

		if(jump){
			moveElement.translateY(speed);
		} else {
			moveElement.translateY(-(speed*2));
		}

		if(moveElement.position.y <= 10){
			// debug("floating..." + moveElement.position.y);
			moveElement.position.y = 10;
		}
	}
}

function animate() {

	requestAnimationFrame( animate );

	if ( controlsEnabled ) {
		objects.bulb.rotation.y -= ((2 * Math.PI) / 180);
		objects.bulb.rotation.z += ((2 * Math.PI) / 180);

		if(vrHMDSensor && vrHMDSensor.getState()){
			var state = vrHMDSensor.getState();

			if ( state.orientation !== null ) {

				var euler = new THREE.Euler().setFromQuaternion(state.orientation, 'XYZ');

				// viewElement.children[0].children[0].rotation.x = euler._x;
				viewElement.children[0].rotation.z = euler._z;
				// viewElement.rotation.y = euler._y;

				debug(euler._z);

				// viewElement.quaternion.copy( state.orientation );
			}
		}

		// moveElement.quaternion.copy(viewElement.quaternion);

		move(true);
		
	}

	renderer.render( scene, camera );

}

window.addEventListener("load", function() {
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
	viewElement = camera;

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0x008cff );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMapEnabled = true;
	renderer.shadowMapType = THREE.PCFSoftShadowMap;
	document.body.appendChild( renderer.domElement );

	if (navigator.getVRDevices) {
		navigator.getVRDevices().then(attachVRHeadset);

		var roll = new THREE.Object3D();
		roll.add(camera);

		var pitch = new THREE.Object3D();
		pitch.add(roll);

		var yaw = new THREE.Object3D();
		yaw.add(pitch);

		viewElement = yaw;

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