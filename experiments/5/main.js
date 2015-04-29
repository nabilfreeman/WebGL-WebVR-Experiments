var camera, scene, renderer;
var geometry, material, mesh, light;
var controls;

var objects = [];

// var raycaster;

var controlsEnabled = false;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var prevTime = performance.now();
// var velocity = new THREE.Vector3();

var speed = 5;

var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );

// http://www.html5rocks.com/en/tutorials/pointerlock/intro/

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

function createScene() {
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 4000 );

	scene = new THREE.Scene();
	//make a fading horizon
	// scene.fog = new THREE.FogExp2( 0xaae8FF, 0.001 );

	//first person mode
	controls = new THREE.PointerLockControls( camera );
	scene.add( controls.getObject() );


	light = new THREE.Object3D();

	sun = new THREE.PointLight(0xFFFFFF);
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

	sun = new THREE.PointLight(0xFFFFFF, 0.5);
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

	sun = new THREE.PointLight(0xFFFFFF, 0.5);
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


	// raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );




	//create the floor
	geometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

	material = new THREE.MeshPhongMaterial( { color:0x111111 } );

	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );



	//make the floating boxes
	geometry = new THREE.CubeGeometry( 10, 10, 10 );

	for ( var i = 0; i < 200; i ++ ) {

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
		mesh.position.y = Math.floor( Math.random() * 20 ) * 20 + 10;
		mesh.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;

		mesh.position.y += 20;
		scene.add( mesh );

		material.color.setHSL( 0, 0, Math.random() * 0.2 + 0.7 );

		objects.push( mesh );

	}
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
			// case 32: // space
			// 	if ( canJump === true ) velocity.y += 350;
			// 	canJump = false;
			// 	break;
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

function init() {
	createScene();
	setupMovement();

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0x110011 );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	var resize = new THREE.WindowResize(renderer, camera);
}

function animate() {

	requestAnimationFrame( animate );

	if ( controlsEnabled ) {
		// raycaster.ray.origin.copy( controls.getObject().position );
		// raycaster.ray.origin.y -= 10;

		// var intersections = raycaster.intersectObjects( objects );

		//rotate the cubes
		objects.forEach(function(object){
			// object.rotation.z += ((0.5 * Math.PI) / 180);
			// object.rotation.x += ((0.5 * Math.PI) / 180);
		});

		if(moveForward) controls.getObject().translateZ( -speed );
		if(moveBackward) controls.getObject().translateZ( speed );
		if(moveLeft) controls.getObject().translateX(-speed);
		if(moveRight) controls.getObject().translateX(speed);

		light.rotation.y += ((1 * Math.PI) / 180);
	}

	renderer.render( scene, camera );

}

//set up scene
init();
//draw!
animate();