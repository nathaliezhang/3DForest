import Tools from './Tools';

import TweenLite from 'gsap';

export default class Tree extends THREE.Group {

  constructor() {

    super(); // Access properties and methods of the parent object (Object 3D like position, rotation...)

    this.treeDefaultY = 0;

    this.currentJump = 0;

    this.coneColor = [{
      color: 0x2c714a,
      emissive: 0x1a5e38,
      specular: 0x75b490,
      shininess: 10
    }, {
      color: 0x114732,
      emissive: 0x0b3827,
      specular: 0x2d7358,
      shininess: 10
    }, {
      color: 0x307057,
      emissive: 0x1f5741,
      specular: 0x40876b,
      shininess: 10
    }];

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
        coneY = 0 + trunkHeight + coneHeight / 2, // Position Y of the cone
        coneColor = this.coneColor[Tools.getRandom(0, this.coneColor.length)];

    // Loop to create trees with multiples cones

    for (let i = 0; i < nbCones; i++) {

      let coneTree = new THREE.ConeGeometry (coneRadius, coneHeight, coneRadialSegments);
      let coneTreeMaterial = new THREE.MeshPhongMaterial(coneColor);

      this.coneTreeMesh = new THREE.Mesh (coneTree, coneTreeMaterial);
      this.coneTreeMesh.position.set(0, coneY, 0);

      // New properties for each loop
      cones[i] = this.coneTreeMesh;
      coneRadius = cones[i].geometry.parameters.radius - 1;
      coneHeight = cones[i].geometry.parameters.height - 2;
      coneY += coneHeight / 2;

      this.add( this.coneTreeMesh );
    }
  }

  jump() {

    this.currentJump = 1;

  }

  update() {

    // If it doesn't kick therefore current = 0
    if (this.currentJump > 0) { this.currentJump -= .1; }

    this.position.y = this.treeDefaultY + this.currentJump * 2;

  }

}
