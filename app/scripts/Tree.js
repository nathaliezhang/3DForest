import Tools from './Tools';

import TweenLite from 'gsap';

export default class Tree extends THREE.Group {

  constructor() {

    super(); // Access properties and methods of the parent object (Object 3D like position, rotation...)

    this.defaultPositionY = 0;

    this.swingCurrent = -1;
    this.jumpCurrent = 0;

    /**
      Trunk
      */

    let trunkRadius = .75,
        trunkHeight = Tools.getRandom(4, 6),
        trunkRadiusSegments = Tools.getRandom(4, 8);

    let trunkTree = new THREE.CylinderGeometry (trunkRadius, trunkRadius, trunkHeight, trunkRadiusSegments);
    let trunkTreeMaterial = new THREE.MeshPhongMaterial(
      {
        color: 0x55503d,
        emissive: 0x393524,
        specular: 0xffffff
      }
    );

    this.trunkTreeMesh = new THREE.Mesh (trunkTree, trunkTreeMaterial);
    this.trunkTreeMesh.position.set(0, 0 + trunkHeight, 0);
    this.add( this.trunkTreeMesh ); // Add the mesh to the group

    /**
      Cones
      */

    var cones = [];

    var nbCones = Tools.getRandom(2, 5),
        coneRadius = Tools.getRandom(4, 8),
        coneHeight = Tools.getRandom(12, 18),
        coneRadialSegments = Tools.getRandom(5, 10), // 8, 20
        coneY = 0 + trunkHeight + coneHeight / 2; // Position Y of the cone

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
      this.coneTreeMesh.position.set(0, coneY, 0);

      // New properties for each loop
      cones[i] = this.coneTreeMesh;
      coneRadius = cones[i].geometry.parameters.radius - 1;
      coneHeight = cones[i].geometry.parameters.height - 2;
      coneY += coneHeight / 2;

      // this.cones.push(this.coneTreeMesh);
      // console.log(this.cones);

      this.add( this.coneTreeMesh );
    }
  }

  swing() {

    this.swingCurrent = 1;

    //TweenLite.to( this.position, .5, {y: Math.PI * 2, ease: Expo.easeOut} )

  }

  update() {

    // If it doesn't kick therefore current = 0

    if (this.swingCurrent > -1 && this.swingCurrent < 0) {
      // console.log("Hey");
      this.swingCurrent += .01;
      this.rotation.z = this.swingCurrent * Math.PI / 24;

    } else if (this.swingCurrent > 0){
      this.swingCurrent -= .01;
      this.rotation.z = this.swingCurrent * Math.PI / 24;
    }

    if (this.jumpCurrent > 0) { this.jumpCurrent -= .1; }
    // console.log(this.position.y);
    this.position.y = this.defaultPositionY + this.jumpCurrent * 2;

  }

  jump() {

    this.jumpCurrent = 1;

  }

}
