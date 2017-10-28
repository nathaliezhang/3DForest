Tools// example import asset
// import imgPath from './assets/img.jpg';

// TODO : add Dat.GUI
// TODO : add Stats

import Tools from './Tools';
import OrbitControls from 'three/examples/js/controls/OrbitControls';
import PlainTexture from '../assets/textures/plain.jpg';
import Sound from './Sound';
import Tree from './Tree';
import Mushroom from './Mushroom';
import Stone from './Stone';
import Music from '../assets/sound/Sublustris Nox - Lost In the Woods.mp3';
import TweenLite from 'gsap';

export default class App {

    constructor() {

      this.debug = true;

      this.container = document.querySelector( '#main' );
    	document.body.appendChild( this.container );

      /**
        Camera
        */
      this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 550 );
      this.camera.position.y = 45;
      this.camera.position.z = 180;

    	this.scene = new THREE.Scene();

      /**
        Play Sound
        */

      this.audio = new Sound( Music, 100, 0, function() {
        // console.log(this);
        this.audio.play();
      }.bind(this), false );

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
      // kickSwing.on();

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

      this.elementsPosition();

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
      Retrieve elements position with the plane coordinates
      */
    elementsPosition() {

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
      TREES : Place the elements according to the positions calculate previously
      */

    createTrees(positions) {

      var nbTrees = 160;

      for (let i = 0; i < nbTrees; i++) {

        // let tree = new THREE.Group();
        // this.scene.add(tree);

        // Get a random position in the Plane and retrieve the coordinates
        let position = positions[Tools.getRandom(0, positions.length)];

        let tree = new Tree();
        tree.defaultPositionY = position.z; // Pass the position Z
        tree.position.set(position.x, position.z, position.y);

        this.scene.add(tree);
        this.trees.push(tree);
      }

    }

    /**
      STONES
      */

    createStones(positions) {

      var nbStones = 10;

      for (let i = 0; i < nbStones; i++) {

        // Get a random position in the Plane
        let position = positions[Tools.getRandom(0, positions.length)];

        let stone = new Stone();
        stone.position.set(position.x, position.z, position.y);

        this.scene.add( stone );
      }
    }

    /**
      MUSHROOMS
      */

    createMushrooms(positions) {

      var nbMushrooms = 10;

      for (var i = 0; i < nbMushrooms; i++) {

        // Get a random position in the Plane and retrieve the coordinates
        let position = positions[Tools.getRandom(0, positions.length)];

        let mushroom = new Mushroom();
        mushroom.position.set(position.x, position.z, position.y);

        this.scene.add(mushroom);
      }

    }

    /**
      Animations
      */

    treesAnimation() {

      // Retrieve all frequencies for each frame (amplitudes)
      var frequencies = this.audio.getSpectrum();

      // Retrieve a spectrum for each TREE
      var spectrumStart = 0;
      var spectrumLength = Math.round(frequencies.length / this.trees.length); // 16
      var spectrumEnd = spectrumLength;
      var treeSpectrum = [];

      for (let i = 0, c = frequencies.length; i < c; i++) {

        if (i === spectrumEnd) {
          treeSpectrum.push( frequencies.slice( spectrumStart, spectrumEnd ) );
          spectrumStart = spectrumEnd;
          spectrumEnd += spectrumLength;
        }

      }

      // Get the average amplitudes for each spectrum
      for (let i = 0, c = treeSpectrum.length; i < c; i++) {

        var sum = 0;
        for (let j = 0, c = treeSpectrum[i].length; j < c; j++) {
          sum += treeSpectrum[i][j];
        }
        var avarage = sum / treeSpectrum[i].length;

        // Jump based on the average
        var defaultPositionY = this.trees[i].defaultPositionY;
        TweenLite.to( this.trees[i].position, .2, {y: defaultPositionY + avarage * .3, ease: Expo.easeOut} );

      }
    }

    backgroundAnimation() {

      var frequencies = this.audio.getSpectrum();
      var backgroundColor = [0x064459, 0x395658];

      for(var i = 0, c = frequencies.length; i < c; i++) {

        var frequencyMax = 230;
        // console.log(frequencies[i]);

        if (frequencies[i] >= frequencyMax ) {

          // Change background color
          var randomColor = backgroundColor[Tools.getRandom(0, backgroundColor.length)];
          this.scene.background = new THREE.Color( randomColor );
          if (!this.debug) this.scene.fog = new THREE.FogExp2 (randomColor, 0.01);

          // Create firefly

        }

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
      
      this.treesAnimation();
      this.backgroundAnimation();

    	this.renderer.render( this.scene, this.camera );
    }

    onWindowResize() {

    	this.camera.aspect = window.innerWidth / window.innerHeight;
    	this.camera.updateProjectionMatrix();
    	this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

}
