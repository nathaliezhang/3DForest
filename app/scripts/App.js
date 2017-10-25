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

        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 550 );
        this.camera.position.y = 35;
        this.camera.position.z = 100;

    	this.scene = new THREE.Scene();

      /**
        Plain
        */

      this.planeWidth = 300;
      this.planeHeight = 300;

      let plain = new THREE.PlaneGeometry(this.planeWidth, this.planeHeight, 100, 100);
      // console.log(plain);
      // console.log(plain.vertices);
      let plainTextureLoader = new THREE.TextureLoader();
      let plainTexture = plainTextureLoader.load(PlainTexture);

      plainTexture.wrapS = THREE.RepeatWrapping;
      plainTexture.wrapT = THREE.RepeatWrapping;

      let plainMaterial = new THREE.MeshPhongMaterial(
        {
          color: 0x30a280,
          emissive: 0x002a25,
          // wireframe: true,
          map: plainTexture,
          displacementMap: plainTexture,
          displacementScale: 20
        }
      );

      this.meshPlain = new THREE.Mesh( plain, plainMaterial );
      this.meshPlain.rotation.x = - Math.PI / 2;
      this.scene.add( this.meshPlain );

      this.treesPosition();

      /**
        Fog
        */
      this.scene.background = new THREE.Color( 0xe9f8ff );
      this.scene.fog = new THREE.FogExp2 (0xe9f8ff, 0.008);

      /**
        Light
        */
      let pointLight = new THREE.DirectionalLight( 0xffffff, 0.4);
      pointLight.position.set(30, 60, 60);
      this.scene.add( pointLight );

      let pointLightHelper = new THREE.PointLightHelper( pointLight, .5 );
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

    treesPosition() {

      // Load the image
      this.texture = new Image();
      this.texture.src = PlainTexture; // Retrieve image import
      this.texture.addEventListener('load', this.onLoadImage.bind(this)); // Context : App

    }

    onLoadImage (event) {
      // console.log(this.texture);
      var positions = [];

      // Create a canvas
      let canvas = document.createElement('canvas'),
          ctx = canvas.getContext('2d');

      canvas.width = 256;
      canvas.height = 256;

      // Show the canvas
      canvas.style.top = '0';
      canvas.style.position = 'absolute';
      document.body.appendChild(canvas);

      ctx.drawImage(this.texture, 0, 0, 256, 256);

      // Retrieve pixels values
      let textureData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let data = textureData.data; // All values
      let pixels = [];

      for (let i = 0, c = data.length; i < c; i+= 4) {
        pixels.push(
          {
            red: data[i] // RGB is the same for gray levels
          }
        )
      }
      // console.log(pixels);


      /** CONVERT CANVAS POSITIONS TO PLANE POSITIONS **/

      // Convert canvas x, y positions to Plane positions
      // First loop for coordinate y & second for x : from left to right, from top to bottom
      for (let i = 0, c = canvas.height; i < c; i++) { // i < 256
        for (let j = 0, c = canvas.width; j < c; j++) { // i < 256

          if (i <= canvas.height / 2) { // i < 128
            if (j <= canvas.width / 2) { // j < 128
              positions.push({
                x: (-this.planeWidth / 2) + (this.planeWidth / canvas.width) * j,
                y: (-this.planeWidth / 2) + (this.planeWidth / canvas.width) * i
              });
            } else { // j > 128
              positions.push({
                x: (j - canvas.width / 2) * (this.planeWidth / canvas.width),
                y: (-this.planeWidth / 2) + (this.planeWidth / canvas.width) * i
              });
            }
          }

          else if (i >= canvas.height / 2) { // i > 128
            if (j <= canvas.width / 2) { // j < 128
              positions.push({
                x: (-this.planeWidth / 2) + (this.planeWidth / canvas.width) * j,
                y: (i - canvas.width / 2) * (this.planeWidth / canvas.width)
              });
            } else { // j > 128
              positions.push({
                x: (j - canvas.width / 2) * (this.planeWidth / canvas.width),
                y: (i - canvas.width / 2) * (this.planeWidth / canvas.width)
              });
            }
          }

        }
      }

      // Convert gray levels to z position (add to variable positions)
      for (let i = 0, c = positions.length; i < c; i++) {
        positions[i].z  = pixels[i].red * (this.planeWidth / canvas.width);
      }

      // console.log(positions);

      this.createTrees(positions); // draw Trees

    }

    // Place trees according to positions values calculate previously
    createTrees(positions) {

      // console.log(positions);

      for (let i = 0; i < 60; i++) {
        
        let trunkRadius = .75,
            trunkHeight = this.getRandom(3, 6),
            trunkRadiusSegments = this.getRandom(5, 8),

            // Get a random position in the Plane
            position = positions[this.getRandom(0, positions.length)],
            zRating = 0.06,

            // Retrieve the position
            trunkTreeX = position.x,
            trunkTreeY = position.z * zRating,
            trunkTreeZ = position.y,

            coneRadius = this.getRandom(3, 6),
            coneHeight = this.getRandom(10, 18),
            coneRadialSegments = this.getRandom(8, 20);

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

        this.trunkTreeMesh.position.set(trunkTreeX, trunkTreeY + trunkHeight / 2, trunkTreeZ);
        this.coneTreeMesh.position.set(trunkTreeX, trunkTreeY + trunkHeight + coneHeight / 2, trunkTreeZ);

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
