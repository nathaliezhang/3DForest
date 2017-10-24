// example import asset
// import imgPath from './assets/img.jpg';

// TODO : add Dat.GUI
// TODO : add Stats

import OrbitControls from 'three/examples/js/controls/OrbitControls';
import PlainTexture from '../textures/texture.jpg';

export default class App {

    constructor() {

      this.container = document.querySelector( '#main' );
    	document.body.appendChild( this.container );

        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 250 );
        this.camera.position.y = 35;
        this.camera.position.z = 100;

    	this.scene = new THREE.Scene();



      /**
        Plain
        */

      let planeWidth = 350,
          planeHeight = 350;

      let plain = new THREE.PlaneGeometry(planeWidth, planeHeight, 100, 100);
      // console.log(plain.vertices);
      let plainTextureLoader = new THREE.TextureLoader();
      let plainTexture = plainTextureLoader.load(PlainTexture);

      plainTexture.wrapS = THREE.RepeatWrapping;
      plainTexture.wrapT = THREE.RepeatWrapping;

      let plainMaterial = new THREE.MeshPhongMaterial(
        {
          color: 0x30a280,
          emissive: 0x002a25,
          wireframe: true,
          map: plainTexture,
          displacementMap: plainTexture,
          displacementScale: 20
        }
      );

      this.meshPlain = new THREE.Mesh( plain, plainMaterial );
      this.meshPlain.rotation.x = - Math.PI / 2;
      this.scene.add( this.meshPlain );

      let plainCoordinates = this.meshPlain;
      // console.log( plainCoordinates.length);
      // console.log( plainCoordinates);

      this.createTrees(plainCoordinates); // draw Trees
      /**
        Fog
        */
      this.scene.background = new THREE.Color( 0xe9f8ff );
      // this.scene.fog = new THREE.FogExp2 (0xe9f8ff, 0.008);

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


    createTrees(plainCoordinate) {

      // Comparer x et z et affecter le y
      // console.log(plainCoordinate);

      // Create a canvas
      let canvas = document.createElement('canvas'),
          ctx = canvas.getContext('2d');

      // Show the canvas
      canvas.width = 256;
      canvas.height = 256;
      canvas.style.top = '0';
      canvas.style.position = 'absolute';
      document.body.appendChild(canvas);

      // Load the image
      let texture = new Image();
      texture.src = PlainTexture; // Retrieve import

      texture.addEventListener('load', function() {

        // console.log("Je suis chargée");
        ctx.drawImage(this, 0, 0, 256, 256);

        // Retrieve pixels values
        let textureData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let data = textureData.data;
        console.log(textureData);

      });

      // Convertir les positions du canvas vers le Plane
      // Placer les arbres selon la valeur de leurs position


      for (var i = 0; i < 80; i++) {
        let trunkRadius = .75,
            trunkHeight = this.getRandom(2, 4),
            trunkRadiusSegments = this.getRandom(5, 8),
            coordinate = plainCoordinate[this.getRandom(0, plainCoordinate.length)],
            // Donner une vertice de la plaine
            // trunkTreeX = coordinate.x,
            trunkTreeX = this.getRandom(-150, 150), // width : 350

            trunkTreeZ = this.getRandom(-100, 100), // height : 250
            coneRadius = this.getRandom(2, 5),
            coneHeight = this.getRandom(8, 15),
            coneRadialSegments = this.getRandom(8, 20);

            /**
              Retrieve Coordinate y
              */
            // var arrayCoordinates = plainCoordinate.filter(filterCoordinate);
            // // console.log(arrayCoordinates);
            //
            // function filterCoordinate(coordinate) {
            //   // console.log(coordinate);
            //   if ( coordinate.x === trunkTreeX && coordinate.z === trunkTreeZ ) {
            //     return true;
            //   }
            // }

        /**
          Trunk
          */
        let trunkTree = new THREE.CylinderGeometry (trunkRadius, trunkRadius, trunkHeight, trunkRadiusSegments);
        let trunkTreeMaterial = new THREE.MeshPhongMaterial(
          {
            color: 0x55503d,
            emissive: 0x393524,
            specular: 0xffffff
          }
        );

        /**
          Cone
          */
        let coneTree = new THREE.ConeGeometry(coneRadius, coneHeight, coneRadialSegments);
        let coneTreeMaterial = new THREE.MeshPhongMaterial(
          {
            color: 0x2c714a,
            emissive: 0x1a5e38,
            specular: 0x75b490,
            shininess: 10
          }
        );

        // console.log(this);
        this.trunkTreeMesh = new THREE.Mesh( trunkTree, trunkTreeMaterial );
        // console.log(this.trunkTreeMesh);
        this.coneTreeMesh = new THREE.Mesh( coneTree, coneTreeMaterial );

        this.trunkTreeMesh.position.set(trunkTreeX, trunkHeight / 2, trunkTreeZ);
        this.coneTreeMesh.position.set(trunkTreeX, trunkHeight + coneHeight / 2, trunkTreeZ);

        this.scene.add( this.trunkTreeMesh, this.coneTreeMesh );
      }
    }

    render() {

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
