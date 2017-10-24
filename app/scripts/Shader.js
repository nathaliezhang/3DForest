import vertexShader from './vertexShader.vert';
import fragmentShader from './fragmentShader.frag';

export default class Shader {

  constructor() {

    this.container = document.querySelector( '#main' );
    document.body.appendChild( this.container );

      this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 250 );
      // this.camera.position.z = 10;

      this.scene = new THREE.Scene();

      let geometry = new THREE.BufferGeometry();
      // geometry.vertices.push(
      //     new THREE.Vector3( -1,  -1, 0 ), // bottom left
      //     new THREE.Vector3( 1, -1, 0 ), // bottom right
      //     new THREE.Vector3(  1, 1, 0 ), //top right
      //
      //     // new THREE.Vector3( 0.5,  0.5, 0 ), //4
      //
      //     new THREE.Vector3( -1, 1, 0 ), // top left
      //
      //     // new THREE.Vector3(  -0.5, -0.5, 0 ) //6
      // );
      // geometry.faces.push(
      //     new THREE.Face3( 0, 1, 2 ),
      //     // new THREE.Face3( 3, 4, 5 )
      //     new THREE.Face3( 0, 2, 3 )
      // );
      let vertices = new Float32Array([
        -1.0, -1.0, 0,
        1.0, -1.0, 0,
        1.0, 1.0, 0,
        -1.0, 1.0, 0
      ]);
      geometry.addAttribute( 'position', new THREE.BufferAttribute (vertices, 3));

      var indices = new Uint32Array([
        0, 1, 2,
        0, 2, 3
      ]);
      geometry.setIndex (new THREE.BufferAttribute (indices, 1));

      var colors = new Float32Array( indices.length * 3 );
      for ( var i = 0, i3 = 0, len = indices.length; i < len; i++, i3 += 3 ) {
          colors[ i3 + 0 ] = Math.random();
          colors[ i3 + 1 ] = Math.random();
          colors[ i3 + 2 ] = Math.random();
      }
      geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

      let material = new THREE.ShaderMaterial( {
          uniforms: {
            color: {value: new THREE.Color ( 0x00ff00 )}
          },
          vertexShader: vertexShader,
          fragmentShader: fragmentShader
      } );
      console.log(vertexShader);
      console.log(fragmentShader);

      this.mesh = new THREE.Mesh(geometry, material);
      this.scene.add( this.mesh );

      this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    	this.renderer.setPixelRatio( window.devicePixelRatio );
    	this.renderer.setSize( window.innerWidth, window.innerHeight );
    	this.container.appendChild( this.renderer.domElement );

      window.addEventListener('resize', this.onWindowResize.bind(this), false);
      this.onWindowResize();

      this.renderer.animate( this.render.bind(this) );
  }

  render() {

      this.renderer.render( this.scene, this.camera );

  }

  onWindowResize() {

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
  }
}
