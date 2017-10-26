// example import asset
// import imgPath from './assets/img.jpg';

// TODO : add Dat.GUI
// TODO : add Stats

import OrbitControls from 'three/examples/js/controls/OrbitControls';
import PlainTexture from '../assets/textures/texture.jpg';
// import Sound from './Sound';
// import Music from '../assets/sound/Sublustris Nox - Lost In the Woods.mp3';

export default class App {

    constructor() {

      this.container = document.querySelector( '#main' );
    	document.body.appendChild( this.container );

        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 550 );
        this.camera.position.y = 60;
        this.camera.position.z = 130;

    	this.scene = new THREE.Scene();

      // this.audio = new Sound(Music);

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

      this.meshPlane = new THREE.Mesh( plane, planeMaterial );
      this.meshPlane.rotation.x = - Math.PI / 2;
      this.scene.add( this.meshPlane );

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
      let scaleZ = 0.08; // Scale of the position z
      let ratio = this.planeWidth / canvas.width;

      for (let i = 0, c = data.length; i < c; i+= 4) {
        pixels.push(
          {
            red: data[i] // R,G,B are the same for gray levels
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

      // Convert gray levels to z position
      for (let i = 0, c = positions.length; i < c; i++) {
        positions[i].z  = pixels[i].red * ratio * scaleZ;
      }

      this.createTrees(positions);
      this.createStones(positions);
      this.createMushrooms(positions);

    }

    /**
      TREES : place elements according to the positions calculate previously
      */

    createTrees(positions) {

      var nbTrees = 100;

      for (let i = 0; i < nbTrees; i++) {

        // Get a random position in the Plane
        let position = positions[this.getRandom(0, positions.length)],

            // Retrieve the position
            treeX = position.x,
            treeY = position.z,
            treeZ = position.y;

        /**
          Trunk
          */

        let trunkRadius = .75,
            trunkHeight = this.getRandom(4, 6),
            trunkRadiusSegments = this.getRandom(5, 8);

        let trunkTree = new THREE.CylinderGeometry (trunkRadius, trunkRadius, trunkHeight, trunkRadiusSegments);
        let trunkTreeMaterial = new THREE.MeshPhongMaterial(
          {
            color: 0x55503d,
            emissive: 0x393524,
            specular: 0xffffff
          }
        );

        this.trunkTreeMesh = new THREE.Mesh (trunkTree, trunkTreeMaterial);
        this.trunkTreeMesh.position.set(treeX, treeY + trunkHeight, treeZ);
        this.scene.add( this.trunkTreeMesh );

        /**
          Cones
          */

        var cones = [];

        var nbCones = this.getRandom(2, 5),
            coneRadius = this.getRandom(4, 8),
            coneHeight = this.getRandom(10, 18),
            coneRadialSegments = this.getRandom(8, 20),
            coneY = treeY + trunkHeight + coneHeight / 2; // Position Y of the cone


        // Loop to create trees with multiples cones
        for (let i = 0; i < nbCones; i++) {

          let coneTree = new THREE.ConeGeometry (coneRadius, coneHeight, coneRadialSegments);
          let coneTreeMaterial = new THREE.MeshPhongMaterial(
            {
              color: 0x2c714a,
              emissive: 0x1a5e38,
              specular: 0x75b490,
              shininess: 10
            }
          );

          this.coneTreeMesh = new THREE.Mesh (coneTree, coneTreeMaterial);
          this.coneTreeMesh.position.set(treeX, coneY, treeZ);

          cones[i] = this.coneTreeMesh;
          coneRadius = cones[i].geometry.parameters.radius - 1;
          coneHeight = cones[i].geometry.parameters.height - 2;
          coneY += coneHeight / 2;

          this.scene.add( this.coneTreeMesh );
        }

      }

    } // End createTrees

    /**
      STONES
      */

    createStones(positions) {

      var nbStones = 110;

      for (let i = 0; i < nbStones; i++) {

        // Get a random position in the Plane
        let position = positions[this.getRandom(0, positions.length)],

            // Retrieve the position
            stoneX = position.x,
            stoneY = position.z,
            stoneZ = position.y;

        let stroneRadius = this.getRandom(1, 3);

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
        this.stoneMesh.position.set(stoneX, stoneY + stroneRadius / 2, stoneZ);

        this.scene.add( this.stoneMesh );
      }
    }

    /**
      MUSHROOMS
      */

    createMushrooms(positions) {

      var nbMushrooms = 100;

      for (var i = 0; i < nbMushrooms; i++) {

        // Get a random position in the Plane
        let position = positions[this.getRandom(0, positions.length)],

            // Retrieve the position
            mushroomX = position.x,
            mushroomY = position.z,
            mushroomZ = position.y;

        /**
          Steam
          */

        let stemRadius = .5,
            stemHeight = this.getRandom(2, 3),
            stemRadiusSegments = this.getRandom(5, 10);

        let stem = new THREE.CylinderGeometry (stemRadius, stemRadius, stemHeight, stemRadiusSegments);
        let stemMaterial = new THREE.MeshPhongMaterial(
          {
            color: 0xf0e4d7,
            emissive: 0xdbd0c4,
            specular: 0xfcfaf7,
            shininess: 5
          }
        );

        this.stemMesh = new THREE.Mesh (stem, stemMaterial);
        this.stemMesh.position.set(mushroomX, mushroomY + stemHeight / 2 , mushroomZ);

        /**
          Cap
          */
        let capTopRadius = .75,
            capBottomRadius = capTopRadius * this.getRandom(2, 4),
            capHeight = this.getRandom(1, 3),
            capRadiusSegments = this.getRandom(5, 15);

        let cap = new THREE.CylinderGeometry (capTopRadius, capBottomRadius, capHeight, capRadiusSegments);
        let capMaterial = new THREE.MeshPhongMaterial(
          {
            color: 0xc2b8ac,
            emissive: 0xaca397,
            specular: 0xd7d0c6,
            shininess: 5
          }
        );

        this.capMesh = new THREE.Mesh (cap, capMaterial);
        this.capMesh.position.set(mushroomX, mushroomY + stemHeight + capHeight / 2 , mushroomZ);

        this.scene.add( this.stemMesh, this.capMesh );
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
