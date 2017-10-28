import Tools from './Tools';

export default class Stone extends THREE.Group {

  constructor() {
    
    super();

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
    this.stoneMesh.position.set(0, 0 + stroneRadius, 0);
    this.add( this.stoneMesh );

  }

}
