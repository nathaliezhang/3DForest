// example import asset
// import imgPath from './assets/img.jpg';

// TODO : add Dat.GUI
// TODO : add Stats

import OrbitControls from 'three/examples/js/controls/OrbitControls';

export default class App {

    constructor() {

      this.container = document.querySelector( '#main' );
    	document.body.appendChild( this.container );

        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 250 );
        this.camera.position.y = 15;
        this.camera.position.z = 50;

    	this.scene = new THREE.Scene();

      /**
        Tree
        */
      let trunk = new THREE.CylinderGeometry( 1, 1, 2, 8 );
	    let trunkMaterial = new THREE.MeshPhongMaterial(
        {
          color: 0x55503d,
          emissive: 0x393524,
          specular: 0xffffff
        }
      );

    	this.mesh = new THREE.Mesh( trunk, trunkMaterial );
      this.mesh.position.y = 1;
    	this.scene.add( this.mesh );

      let leave = new THREE.ConeGeometry(4, 8, 6);
      let leaveMaterial = new THREE.MeshPhongMaterial(
        {
          color: 0x2c714a,
          emissive: 0x1a5e38,
          specular: 0x75b490,
          shininess: 10
        }
      );
      this.mesh = new THREE.Mesh( leave, leaveMaterial );
      this.mesh.position.y = 6;
      this.scene.add( this.mesh );

      // function
      this.createTrees();

      /**
        Plain
        */
      let plain = new THREE.PlaneGeometry(350, 250);
      // console.log(plain.vertices);
      let plainMaterial = new THREE.MeshPhongMaterial(
        {
          color: 0x30a280,
          emissive: 0x002a25
        }
      );
      this.meshPlain = new THREE.Mesh( plain, plainMaterial );
      this.meshPlain.rotation.x = - Math.PI / 2;
      this.scene.add( this.meshPlain );

      /**
        Fog
        */
      this.scene.background = new THREE.Color( 0xe9f8ff );
      this.scene.fog = new THREE.FogExp2 (0xe9f8ff, 0.012);

      /**
        Light
        */
      let pointLight = new THREE.DirectionalLight( 0xffffff, 0.4);
      pointLight.position.set(30, 60, 60);
      this.scene.add( pointLight );

      var pointLightHelper = new THREE.PointLightHelper( pointLight, .5 );
      this.scene.add( pointLightHelper );

    	this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    	this.renderer.setPixelRatio( window.devicePixelRatio );
    	this.renderer.setSize( window.innerWidth, window.innerHeight );
    	this.container.appendChild( this.renderer.domElement );

      /**
        Debug controls after camera and renderer
        */
      let controls;
      controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );

    	window.addEventListener('resize', this.onWindowResize.bind(this), false);
        this.onWindowResize();

        this.renderer.animate( this.render.bind(this) );
    }

    createTrees() {

      for (var i = 0; i < 5; i++) {
        let trunkRadius = 1,
            trunkHeight = this.getRandom(1, 4),
            trunkRadiusSegment = this.getRandom(4, 8),
            x = this.getRandom(0, 350),
            z = this.getRandom(0, 250);

        let trunkTree = new THREE.CylinderGeometry (trunkRadius, trunkRadius, trunkHeight, trunkRadiusSegment);
        let trunkTreeMaterial = new THREE.MeshPhongMaterial(
          {
            color: 0x55503d,
            emissive: 0x393524,
            specular: 0xffffff
          }
        );
        console.log(this);
        // this.mesh = new THREE.Mesh( trunkRadius, trunkTreeMaterial );
        // console.log(trunkTree);
        // // trunkTree.position.set(15, 0, 15);
      }
    }


    render() {
        //
        // this.mesh.rotation.x += 0.01;
        // this.mesh.rotation.y += 0.02;

    	this.renderer.render( this.scene, this.camera );
    }

    onWindowResize() {

    	this.camera.aspect = window.innerWidth / window.innerHeight;
    	this.camera.updateProjectionMatrix();
    	this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    getRandom(min, max) {
      return Math.floor(Math.random() * (max - min) + min);
    }
}
