Tools// example import asset
// import imgPath from './assets/img.jpg';

// TODO : add Dat.GUI
// TODO : add Stats

import Tools from './Tools';
import OrbitControls from 'three/examples/js/controls/OrbitControls';
import PlainTexture from '../assets/textures/plain.jpg';
import Sound from './Sound';
import Tree from './Tree';
import Music from '../assets/sound/Sublustris Nox - Lost In the Woods.mp3';

export default class App {

    constructor() {

      this.debug = true;

      this.container = document.querySelector( '#main' );
    	document.body.appendChild( this.container );

      /**
        Camera
        */
      this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 550 );
      this.camera.position.y = 40;
      this.camera.position.z = 180;

    	this.scene = new THREE.Scene();

      /**
        Play Sound
        */

      this.audio = new Sound( Music, 100, 0, function() {
        // console.log(this);
        this.audio.play();
      }.bind(this), true );

      /**
        Kick
        */

      /** /!\ ADD A KICK FOR MUSHROOMS /!\ **/

      let kickSwing = this.audio.createKick({
        frequency: [15, 20],
        threshold: 150, // seuil
        decay: 1,
        onKick: () => {
          for (let i = 0, c = this.trees.length; i < c ; i++) {
            this.trees[i].swing();
          }
        },
        offKick: () => {
          for (let i = 0, c = this.trees.length; i < c ; i++) {
            this.trees[i].update();
          }
        }
      });
      kickSwing.on();

      let kickJump = this.audio.createKick({
        frequency: [60, 70],
        threshold: 120,
        decay: 1,
        onKick: () => {
          for (let i = 0, c = this.trees.length; i < c ; i++) {
            this.trees[i].jump();
          }
        },
        offKick: () => {
          for (let i = 0, c = this.trees.length; i < c ; i++) {
            this.trees[i].update();
          }
        }
      });
      // kickJump.on();

      this.addEventListener();

      /**
        Plain
        */
      this.planeWidth = 300;
      this.planeHeight = 300;

      let plain = new THREE.PlaneGeometry(this.planeWidth, this.planeHeight, 150, 150);
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
          displacementScale: 30
        }
      );

      this.meshPlane = new THREE.Mesh( plain, plainMaterial );
      this.meshPlane.rotation.x = - Math.PI / 2;
      this.scene.add( this.meshPlane );

      this.treesPosition();

      /**
        Fog
        */
      this.scene.background = new THREE.Color( 0xe9f8ff );
      if (!this.debug) this.scene.fog = new THREE.FogExp2 (0xe9f8ff, 0.01);

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

      /** Cone*/
      this.trees = [];
      this.angle = 0;
      this.move = 'up';

      /**
        Debug controls : after camera and renderer
        */
      let controls;
      controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );

    	window.addEventListener('resize', this.onWindowResize.bind(this), false);
      this.onWindowResize();

      this.renderer.animate( this.render.bind(this) );

      this.frame();
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

      var nbTrees = 250;

      for (let i = 0; i < nbTrees; i++) {

        // let tree = new THREE.Group();
        // this.scene.add(tree);

        // Get a random position in the Plane
        let position = positions[Tools.getRandom(0, positions.length)];

        // Retrieve the position
        let tree = new Tree(position);

        tree.defaultPositionY = position.z;
        // console.log(tree.defaultPositionY);

        tree.position.set(position.x, position.z, position.y);
        this.scene.add(tree);
        this.trees.push(tree);
        // console.log(this.cones);
      }

    } // End createTrees

    /**
      STONES
      */

    createStones(positions) {

      var nbStones = 120;

      for (let i = 0; i < nbStones; i++) {

        // Get a random position in the Plane
        let position = positions[Tools.getRandom(0, positions.length)],

            // Retrieve the position
            stoneX = position.x,
            stoneY = position.z,
            stoneZ = position.y;

        let stroneRadius = Tools.getRandom(1, 3);

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

    /**
      MUSHROOMS
      */

    createMushrooms(positions) {

      var nbMushrooms = 100;

      for (var i = 0; i < nbMushrooms; i++) {

        // Get a random position in the Plane
        let position = positions[Tools.getRandom(0, positions.length)],

            // Retrieve the position
            mushroomX = position.x,
            mushroomY = position.z,
            mushroomZ = position.y;

        /**
          Steam
          */

        let stemRadius = .5,
            stemHeight = Tools.getRandom(2, 4),
            stemRadiusSegments = Tools.getRandom(5, 10);

        let stem = new THREE.CylinderGeometry (stemRadius, stemRadius, stemHeight, stemRadiusSegments);
        let stemMaterial = new THREE.MeshPhongMaterial(
          {
            color: 0xf0e4d7,
            emissive: 0xdbd0c4,
            specular: 0xfcfaf7,
            shininess: 2
          }
        );

        this.stemMesh = new THREE.Mesh (stem, stemMaterial);
        this.stemMesh.position.set(mushroomX, mushroomY + stemHeight, mushroomZ);

        /**
          Cap
          */
        let capRadius = Tools.getRandom(2, 3),
            widthSegments = Tools.getRandom(5, 10),
            heightSegments = Tools.getRandom(5, 10),
            capPhiStart = 0,
            capPhiLength = Math.PI;

        let cap = new THREE.SphereGeometry(capRadius, widthSegments, heightSegments, capPhiStart, capPhiLength)
        let capMaterial = new THREE.MeshPhongMaterial(
          {
            color: 0xc2b8ac,
            emissive: 0xaca397,
            specular: 0xd7d0c6,
            shininess: 2
          }
        );

        this.capMesh = new THREE.Mesh (cap, capMaterial);
        this.capMesh.rotation.x = -Math.PI / 2;
        this.capMesh.position.set(mushroomX, mushroomY + stemHeight , mushroomZ);

        this.scene.add( this.stemMesh, this.capMesh );
      }

    }

    /**
      Analyse the sound
      */

    analyseSound() {
      // Get amplitude
      var frequencies = this.audio.getSpectrum();
      var backgroundColor = [0x064459, 0x395658];
      var angle = .1;
      // console.log(this.angle);

      // Retrieve all frequencies
      // Diviser le tab de fréquences par le nb d'arbres
      // Pour chaque arbre, récupérer la zone de fréquences
      // Jump en fonction de la fréquence

      if (this.angle >= Math.PI * 2) {
        this.move = 'down';
      } else if (this.angle < 0) {
        this.move = 'up';
      }

      if (this.move === 'down') {
        // console.log('down');
        this.angle -= angle;
      } else if (this.move === 'up') {
        // console.log('up');
        this.angle += angle;
      }

      for(var i = 0, c = frequencies.length; i < c; i++) {
        var frequencyMax1 = 230;
        var frequencyMax2 = 280;

        if (frequencies[i] >= frequencyMax1 ) {

          // Move cones
          for (let i = 0, c = this.trees.length; i < c ; i++) {
            // for (let j = 0, c = this.trees[i].length; j < c; j++) {
              // console.log(this.cones[i][j]);

              // Find a way to update the position x, z and y (easeOutBack)
              // let oldConeRotation = this.cones[i][j].rotation;
              // oldConeRotation.set(oldConeRotation.x, oldConeRotation.y + .15, oldConeRotation.z);
              //
              // let oldConePosition = this.cones[i][j].position;
              // oldConePosition.x = oldConePosition.x + Math.cos(this.angle);
              // Angle variation left and right

            // }

            // Move Trunk
            // console.log(i, this.trees[i])
            // let oldTreePosition = this.trees[i].position;
            // oldTreePosition.x = oldTreePosition.x + Math.cos(this.angle);

            // if (this.angle >= Math.PI * 2) {
            //   this.angle = (Math.PI * 2) - this.angle;
            //   console.log('positif');
            // } else if (this.angle <= 0) {
            //   this.angle = 0 + this.angle;
            //   console.log('negatif');
            // }
          }

          // Change background color
          var randomColor = backgroundColor[Tools.getRandom(0, backgroundColor.length)];
          this.scene.background = new THREE.Color( randomColor );
          if (!this.debug)this.scene.fog = new THREE.FogExp2 (randomColor, 0.01);

          // Create firefly

        }

        // if (frequencies[i] >= frequencyMax2) {
        //   this.scene.background = new THREE.Color( 0xeeeeee );
        //   this.scene.fog = new THREE.FogExp2 (0xeeeeee, 0.01);
        // }

      }
    }

    /**
      addEventListener
      */

    addEventListener() {

      // Pause and play
      document.addEventListener('keydown', function(e){
        var key = e.keyCode;
        if ( key === 32 ) {
          if ( this.audio._isPlaying === true ) {
            this.audio.pause();
          } else {
            this.audio.play();
          }
        }
        // console.log(this.audio);
      }.bind(this));

    }

    frame() {
      requestAnimationFrame(this.frame.bind(this));
      this.render;
    }

    render() {
      this.analyseSound();

        // this.mesh.rotation.x += 0.01;
        // this.mesh.rotation.y += 0.02;

    	this.renderer.render( this.scene, this.camera );
    }

    onWindowResize() {

    	this.camera.aspect = window.innerWidth / window.innerHeight;
    	this.camera.updateProjectionMatrix();
    	this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

}
