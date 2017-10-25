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
        this.camera.position.y = 40;
        this.camera.position.z = 80;

    	this.scene = new THREE.Scene();

      /**
        Plain
        */

      this.planeWidth = 300;
      this.planeHeight = 300;

      let plane = new THREE.PlaneGeometry(this.planeWidth, this.planeHeight, 100, 100);
      // console.log(plain.vertices);
      let planeTextureLoader = new THREE.TextureLoader();
      let planeTexture = planeTextureLoader.load(PlainTexture);

      planeTexture.wrapS = THREE.RepeatWrapping;
      planeTexture.wrapT = THREE.RepeatWrapping;

      let planeMaterial = new THREE.MeshPhongMaterial(
        {
          color: 0x30a280,
          emissive: 0x002a25,
          // wireframe: true,
          map: planeTexture,
          displacementMap: planeTexture,
          displacementScale: 30
        }
      );

      this.meshPlain = new THREE.Mesh( plane, planeMaterial );
      this.meshPlain.rotation.x = - Math.PI / 2;
      this.scene.add( this.meshPlain );

      this.treesPosition();

      /**
        Fog
        */
      this.scene.background = new THREE.Color( 0xe9f8ff );
      this.scene.fog = new THREE.FogExp2 (0xe9f8ff, 0.01);

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
        Debug controls : after camera and renderer
        */
      let controls;
      controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );

    	window.addEventListener('resize', this.onWindowResize.bind(this), false);
        this.onWindowResize();

        this.renderer.animate( this.render.bind(this) );
    }

    /**
      Retrieve trees positions with the plane coordinates
      */
    treesPosition() {

      // Load the image
      this.texture = new Image();
      this.texture.src = PlainTexture; // Retrieve image import
      this.texture.addEventListener('load', this.onLoadImage.bind(this)); // Context : App

    }

    /**
      CONVERT CANVAS POSITIONS TO PLANE POSITIONS
      */
    onLoadImage (event) {
      // console.log(this.texture);
      var positions = [];

      // Create a canvas
      let canvas = document.createElement('canvas'),
          ctx = canvas.getContext('2d');

      canvas.width = 256;
      canvas.height = 256;

      // Show the canvas
      // canvas.style.top = '0';
      // canvas.style.position = 'absolute';
      // document.body.appendChild(canvas);

      ctx.drawImage(this.texture, 0, 0, 256, 256);

      // Retrieve pixels values of the image
      let textureData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let data = textureData.data; // All values
      let pixels = [];
      let scaleZ = 0.095; // Scale of the position z
      let ratio = this.planeWidth / canvas.width;

      for (let i = 0, c = data.length; i < c; i+= 4) {
        pixels.push(
          {
            red: data[i] // RGB is the same for gray levels
          }
        )
      }

      // Convert canvas x, y positions to Plane positions
      // First loop for coordinate y & second for x : from left to right, from top to bottom
      for (let i = 0, c = canvas.height; i < c; i++) { // i < 256
        for (let j = 0, c = canvas.width; j < c; j++) { // i < 256

          if (i <= canvas.height / 2) { // i < 128
            if (j <= canvas.width / 2) { // j < 128
              positions.push({
                x: (-this.planeWidth / 2) + ratio * j,
                y: (-this.planeWidth / 2) + ratio * i
              });
            } else { // j > 128
              positions.push({
                x: (j - canvas.width / 2) * ratio,
                y: (-this.planeWidth / 2) + ratio * i
              });
            }
          }

          else if (i >= canvas.height / 2) { // i > 128
            if (j <= canvas.width / 2) { // j < 128
              positions.push({
                x: (-this.planeWidth / 2) + ratio * j,
                y: (i - canvas.width / 2) * ratio
              });
            } else { // j > 128
              positions.push({
                x: (j - canvas.width / 2) * ratio,
                y: (i - canvas.width / 2) * ratio
              });
            }
          }

        }
      }

      // Convert gray levels to z position (add to variable positions)
      for (let i = 0, c = positions.length; i < c; i++) {
        positions[i].z  = pixels[i].red * ratio * scaleZ;
      }

      this.createTrees(positions);
      this.createStones(positions);

    }

    /**
      Place trees according to positions values calculate previously
      */
    createTrees(positions) {

      for (let i = 0; i < 60; i++) {

        let trunkRadius = .75,
            trunkHeight = this.getRandom(3, 6),
            trunkRadiusSegments = this.getRandom(5, 8),

            // Get a random position in the Plane
            position = positions[this.getRandom(0, positions.length)],

            // Retrieve the position
            treeX = position.x,
            treeY = position.z,
            treeZ = position.y,

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

        this.trunkTreeMesh = new THREE.Mesh (trunkTree, trunkTreeMaterial);
        this.trunkTreeMesh.position.set(treeX, treeY + trunkHeight / 2, treeZ);

        /**
          Cone
          */
        let coneTree = new THREE.ConeGeometry (coneRadius, coneHeight, coneRadialSegments);
        let coneTreeMaterial = new THREE.MeshPhongMaterial(
          {
            color: 0x2c714a,
            emissive: 0x1a5e38,
            specular: 0x75b490,
            shininess: 10
          }
        );

        // console.log(this.trunkTreeMesh);
        this.coneTreeMesh = new THREE.Mesh (coneTree, coneTreeMaterial);
        this.coneTreeMesh.position.set(treeX, treeY + trunkHeight + coneHeight / 2, treeZ);

        this.scene.add( this.trunkTreeMesh, this.coneTreeMesh );
      }

    }


    /**
      Stones
      */

    createStones(positions) {
      for (let i = 0; i < 30; i++) {
        let stroneRadius = this.getRandom(1, 4),

          // Get a random position in the Plane
          position = positions[this.getRandom(0, positions.length)],

          // Retrieve the position
          stoneX = position.x,
          stoneY = position.z,
          stoneZ = position.y;

        let stone = new THREE.DodecahedronGeometry (stroneRadius);
        let stoneMaterial = new THREE.MeshPhongMaterial(
          {
            color: 0x736b6b,
            emissive: 0x524848,
            specular: 0xa69f9f,
            shininess: 5
          }
        );

        this.stoneMesh = new THREE.Mesh (stone, stoneMaterial);
        this.stoneMesh.position.set(stoneX, stoneY + stroneRadius, stoneZ);

        this.scene.add( this.stoneMesh );
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
