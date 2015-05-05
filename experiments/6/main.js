var camera, scene, renderer;
var geometry, material, mesh, light;
var controls;
var viewElement;

var vrHMD, vrHMDSensor;

var objects = [], boxes;

// var raycaster;

var controlsEnabled = false;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var jump = false;
var prevTime = performance.now();
// var velocity = new THREE.Vector3();

var speed = 20;

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
	scene.fog = new THREE.FogExp2( 0x110011, 0.0001 );

	scene.add( viewElement );



	light = new THREE.Object3D();

	sun = new THREE.PointLight(0xFFAA00);
	sun.add(
		new THREE.Mesh(
			new THREE.SphereGeometry(100), 
			new THREE.MeshBasicMaterial( { color: 0xFFFF00 } ) 
		) 
	);
	sun.position.x = 800;
	sun.position.y = 800;
	sun.position.z = 0;

	light.add(sun);

	sun = new THREE.PointLight(0xFFFFAA, 0.35);
	sun.add(
		new THREE.Mesh(
			new THREE.SphereGeometry(30), 
			new THREE.MeshBasicMaterial( { color: 0xFFFFAA } ) 
		) 
	);
	sun.position.x = 0;
	sun.position.y = 800;
	sun.position.z = 800;

	light.add(sun);

	sun = new THREE.PointLight(0xFFFFAA, 0.35);
	sun.add(
		new THREE.Mesh(
			new THREE.SphereGeometry(30), 
			new THREE.MeshBasicMaterial( { color: 0xFFFFAA } ) 
		) 
	);
	sun.position.x = 0;
	sun.position.y = 800;
	sun.position.z = -800;

	light.add(sun);

	sun = new THREE.PointLight(0xFFFFFF, 0.2);
	sun.add(
		new THREE.Mesh(
			new THREE.SphereGeometry(10), 
			new THREE.MeshBasicMaterial( { color: 0xFFFFFF } ) 
		) 
	);
	sun.position.x = -800;
	sun.position.y = 800;
	sun.position.z = 0;

	light.add(sun);
	
	scene.add( light );


	var worldSize = 4000;

	//sky
	var material = new THREE.MeshBasicMaterial({
    	map: THREE.ImageUtils.loadTexture('sky.png')
    });
    material.side = THREE.DoubleSide;

	sky = new THREE.Mesh( new THREE.BoxGeometry(worldSize, worldSize * 4, worldSize), material );
	sky.position.y = (worldSize / 2) - 11 ;
	// add it to the scene
	scene.add( sky );

	//create the floor
	geometry = new THREE.PlaneBufferGeometry( worldSize, worldSize, worldSize, 100 );
	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

	material = new THREE.MeshPhongMaterial( { color:0x111111 } );

	mesh = new THREE.Mesh( geometry, material );
	mesh.position.y -= 10;
	scene.add( mesh );



	boxes = new THREE.Object3D();

	//make the floating boxes
	geometry = new THREE.BoxGeometry( 10, 10, 10 );

	for ( var i = 0; i < 400; i ++ ) {

		var material = new THREE.MeshPhongMaterial({
		  	specular: 0xFFAA33, 
		  	shading: THREE.FlatShading, 
		  	vertexColors: THREE.VertexColors,
		  	color: 0x008cFF
		});

		var mesh = new THREE.Mesh(
			geometry,
			material
		);
		mesh.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
		mesh.position.y = Math.floor( Math.random() * 20 ) * 120 + 120;
		mesh.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;

		mesh.position.y += 20;
		boxes.add( mesh );

		material.color.setHSL( 0, 0, Math.random() * 0.2 + 0.7 );

		objects.push( mesh );

	}

	scene.add(boxes);
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
				moveLeft = true; break;
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

		//rotate the individual cubes
		// objects.forEach(function(object){
		// 	object.rotation.z += ((0.5 * Math.PI) / 180);
		// 	// object.rotation.x += ((0.5 * Math.PI) / 180);
		// });

		// rotate cluster of boxes
		boxes.rotation.y -= ((1 * Math.PI) / 180);

		//orbit the cluster of suns
		light.rotation.y -= ((1.5 * Math.PI) / 180);

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
		if(viewElement.position.y >= 5) jump = false;

		if(jump){
			viewElement.translateY(speed);
		} else {
			viewElement.translateY(-(speed*1.7));
		}

		if(viewElement.position.y <= 1){
			viewElement.position.y = 1;
		}

	}

	renderer.render( scene, camera );

}

window.addEventListener("load", function() {
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 20000 );
	viewElement = camera;

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0xCDCDCD );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
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