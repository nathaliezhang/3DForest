import Tools from './Tools';

export default class Mushroom extends THREE.Group {

  constructor() {

    super();

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
    this.stemMesh.position.set(0, 0 + stemHeight, 0);
    this.add( this.stemMesh );

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
    this.capMesh.position.set(0, 0 + stemHeight , 0);
    this.add( this.capMesh );
  }

}
