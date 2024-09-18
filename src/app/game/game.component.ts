import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as THREE from 'three';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private cube!: THREE.Mesh;
  private background!: THREE.Mesh;
  private ground!: THREE.Mesh;
  private moveForward = false;
  private moveBackward = false;
  private moveLeft = false;
  private moveRight = false;
  private jump = false;
  private boundaries: THREE.Mesh[] = [];
  private velocityY = 0;
  private gravity = -0.002;
  private fruit!: THREE.Mesh;
  private light!: THREE.PointLight;
  private lightHelper!: THREE.PointLightHelper;
  constructor(private router: Router) { }

  ngOnInit() {
    this.initThreeJs();
    this.addEventListeners();
  }

  initThreeJs() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight,1,1000);
    // this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    // const geometry = new THREE.SphereGeometry();
    // const material = new THREE.ShaderMaterial({
    //   vertexShader: `
    //     varying vec2 vUv;
    //     void main() {
    //       vUv = uv;
    //       gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    //     }
    //   `,
    //   fragmentShader: `
    //     varying vec2 vUv;
    //     void main() {
    //       vec3 color1 = vec3(0.3, 0,0);
    //       vec3 color2 = vec3(1, 0, 1);
    //       vec3 color = mix(color1, color2, vUv.y);
    //       gl_FragColor = vec4(color, 1.0);
    //     }
    //   `,
    //   side: THREE.DoubleSide
    // });
    this.renderer.setClearColor(0x000000);
    // this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);

    this.createBackground();
    this.createGround();
    this.createEdibles();
    this.createBoundaries();
     this.camera.position.z = 10
    // this.setTopDownCamera()
    this.renderer.setClearColor(0x000000); // Dark background
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    // Create the light
    this.light = new THREE.PointLight(0xffffff, 9, 10); // color, intensity, distance
    this.light.position.set(0, 5, 5); // Initial position
    this.scene.add(this.light);
    const geometry = new THREE.BoxGeometry(1, 1, 1); // Adjust size if needed
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);

    // Create the terrainwswww
    this.createGround();
    this.createBackground();
    this.createEdibles();
    this.createBoundaries();
    
    // Position the camera for a better view of the larger terrain
    this.camera.position.set(this.cube.position.x,this.cube.position.y,this.cube.position.z); // Adjust if needed
    this.camera.lookAt(this.cube.position); // Point the camera towards the cube

    // Add light helper
    this.lightHelper = new THREE.PointLightHelper(this.light, 1,0xff0000);
    this.scene.add(this.lightHelper);
    this.animate();
  }

  createBackground() {
    const loader = new THREE.TextureLoader();
    loader.load('assets/tech-minimalism-open-source-grid-sphere-hd-wallpaper-preview.jpg', (texture) => {
      const geometry = new THREE.PlaneGeometry(100, 100);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
      });
      this.background = new THREE.Mesh(geometry, material);
      this.background.position.z = -100;
      this.scene.add(this.background);
    });
  }
  createBoundaries() {
    const wallHeight = 5;
    const wallThickness = 0.1;
    const groundSize = 50;

    const material = new THREE.MeshBasicMaterial({ color: 0x834926, side: THREE.DoubleSide });

    const wallGeometries = [
      new THREE.PlaneGeometry(groundSize, wallHeight), 
      new THREE.PlaneGeometry(groundSize, wallHeight),  
      new THREE.PlaneGeometry(groundSize, wallHeight),  
      new THREE.PlaneGeometry(groundSize, wallHeight)   
    ];

    const walls = wallGeometries.map((geometry, index) => {
      const wall = new THREE.Mesh(geometry, material);
      switch (index) {
        case 0:
          wall.position.set(0, wallHeight / 2, -groundSize / 2);
          wall.rotation.y = Math.PI;
          //wall.position.y = -2
          break;
        case 1: 
          wall.position.set(0, wallHeight / 2, groundSize / 2);
          break;
        case 2: 
          wall.position.set(-groundSize / 2, wallHeight / 2, 0);
          wall.rotation.y = Math.PI / 2;
          
          break;
        case 3: 
          wall.position.set(groundSize / 2, wallHeight / 2, 0);
          wall.rotation.y = -Math.PI / 2;
          break;
      }
      this.scene.add(wall);
      return wall;
    });

    this.boundaries.push(...walls);
  }
  // createEdibles() {
  //   const geometry = new THREE.SphereGeometry();
  //   const material = new THREE.ShaderMaterial({
  //     vertexShader: `
  //       varying vec2 vUv;
  //       void main() {
  //         vUv = uv;
  //         gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  //       }
  //     `,
  //     fragmentShader: `
  //       varying vec2 vUv;
  //       void main() {
  //         vec3 color1 = vec3(0.3, 0,0);
  //         vec3 color2 = vec3(1, 0, 1);
  //         vec3 color = mix(color1, color2, vUv.y);
  //         gl_FragColor = vec4(color, 1.0);
  //       }
  //     `,
  //     side: THREE.DoubleSide
  //   });
  //   this.fruit = new THREE.Mesh(geometry, material);
  //   this.fruit.position.z =  Math.floor(24 * Math.random());
  //   this.fruit.position.x =  Math.floor(24 * Math.random());
  //   this.scene.add(this.fruit);
  // }
  setTopDownCamera() {
    // this.camera.position.set(0, 40, 0);
    this.camera.position.set(5, 2, -5); // Adjust the offset as needed

    this.camera.rotation.x = -Math.PI / 2;
  }
  // createGround() {
  //   const geometry = new THREE.PlaneGeometry(60, 60);
  //   const material = new THREE.MeshBasicMaterial({ color: 0xbd8143, side: THREE.DoubleSide });
  //   this.ground = new THREE.Mesh(geometry, material);
  //   this.ground.rotation.x = - Math.PI / 2;
  //   this.ground.position.y = -2;
  //   this.scene.add(this.ground);
  // }
  createGround() {
    const terrainSize = 100; // Adjust size to be larger than the cube
    const geometry = new THREE.PlaneGeometry(terrainSize, terrainSize);
    const material = new THREE.MeshBasicMaterial({ color: 0xbd8143, side: THREE.DoubleSide });
    this.ground = new THREE.Mesh(geometry, material);
    this.ground.rotation.x = -Math.PI / 2; // Rotate to lay flat
    this.ground.position.y = -1; // Position it slightly below the cube
    this.scene.add(this.ground);
}
  // animate() {
  //   requestAnimationFrame(() => this.animate());

  //   this.updateControls();
  //   if (this.cube.position.y > this.ground.position.y + 1) {
  //     this.velocityY += this.gravity;
  //     this.cube.position.y += this.velocityY;
  //     if (this.cube.position.y <= this.ground.position.y + 1) {
  //       this.cube.position.y = this.ground.position.y + 1;
  //       this.velocityY = 0;
  //     }
  //   }
  //   if (this.light.position.y > this.ground.position.y + 1) {
  //     this.velocityY += this.gravity;
  //     this.light.position.y += this.velocityY;
  //     if (this.light.position.y <= this.ground.position.y + 1) {
  //       this.light.position.y = this.ground.position.y + 1;
  //       this.velocityY = 0;
  //     }
  //   }
  //   this.renderer.render(this.scene, this.camera);
  // }
  animate() {
    requestAnimationFrame(() => this.animate());
  
    this.updateControls();
    if (this.cube.position.y > this.ground.position.y + 1) {
      this.velocityY += this.gravity;
      this.cube.position.y += this.velocityY;
      if (this.cube.position.y <= this.ground.position.y + 1) {
        this.cube.position.y = this.ground.position.y + 1;
        this.velocityY = 0;
      }
    }
  
    // Keep the camera behind the cube
    this.camera.position.x = this.cube.position.x; // Follow the cube on x-axis
    this.camera.position.z = this.cube.position.z - 5; // Follow behind on z-axis
    this.camera.position.y = this.cube.position.y + 2; // Above the cube
  
    this.camera.lookAt(this.cube.position); // Look at the cube
  
    this.renderer.render(this.scene, this.camera);
  }
  
  // updateControls() {
  //   if (this.moveForward) {
  //     this.cube.position.z -= 0.1
  //     if (this.cube.position.z < -24.5) {
  //       this.cube.position.z = 0
  //     }
  //     console.log(Math.floor(this.cube.position.z),"cube");
  //     console.log(Math.floor(this.fruit.position.z),"fruit");
      
  //     if(Math.floor(this.cube.position.z) == Math.floor(this.fruit.position.z)){
  //       this.scene.add(this.cube);
  //     }
      
  //   };
  //   if (this.moveBackward) {
  //     this.cube.position.z += 0.1
  //     if (this.cube.position.z > 24.5) {
  //       this.cube.position.z = 0
  //     }
     
  //   };
  //   if (this.moveLeft) {
  //     this.cube.position.x -= 0.1
  //     this.background.position.x -= 0.01
  //     if (this.cube.position.x < -24.5) {
  //       this.cube.position.x = 0
  //     }
  //   };
  //   if (this.moveRight) {
  //     this.cube.position.x += 0.1; this.background.position.x += 0.01
  //     if (this.cube.position.x > 24.5) {
  //       this.cube.position.x = 0
  //     }
  //   };
  //   if (this.jump) this.cube.position.y += 0.1;
  // }
  createEdibles() {
    const geometry = new THREE.SphereGeometry(1); // Adjust size as needed
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    this.fruit = new THREE.Mesh(geometry, material);
    this.fruit.position.z = Math.floor(50 * Math.random());
    this.fruit.position.x = Math.floor(50 * Math.random());
    this.scene.add(this.fruit);
}

//   updateControls() {
//     const movementSpeed = 0.1;
//     const terrainLimit = 50; // Half of the terrain size to keep within bounds

//     if (this.moveForward) {
//         this.cube.position.z -= movementSpeed;
//         this.light.position.z -= movementSpeed;
//         if (this.cube.position.z < -terrainLimit) {
//             this.cube.position.z = -terrainLimit;
//             this.light.position.z = -terrainLimit;
//         }
//     }
//     if (this.moveBackward) {
//         this.cube.position.z += movementSpeed;
//         this.light.position.z += movementSpeed;
//         if (this.cube.position.z > terrainLimit) {
//             this.cube.position.z = terrainLimit;
//             this.light.position.z = terrainLimit;
//         }
//     }
//     if (this.moveLeft) {
//         this.cube.position.x -= movementSpeed;
//         this.light.position.x -= movementSpeed;
//         if (this.cube.position.x < -terrainLimit) {
//             this.cube.position.x = -terrainLimit;
//             this.light.position.x = -terrainLimit;
//         }
//     }
//     if (this.moveRight) {
//         this.cube.position.x += movementSpeed;
//         this.light.position.x += movementSpeed;
//         if (this.cube.position.x > terrainLimit) {
//             this.cube.position.x = terrainLimit;
//             this.light.position.x = terrainLimit;
//         }
//     }
//     if (this.jump) {
//         this.cube.position.y += 0.1;
//         this.light.position.y += 0.1;
//     } else {
//         // this.light.position.y = Math.max(this.light.position.y); // Keep light above ground
//     }
// }
updateControls() {
  const movementSpeed = 0.1;

  if (this.moveForward) {
    this.cube.position.z += movementSpeed * Math.cos(this.camera.rotation.y); // Forward based on camera's direction
    this.cube.position.x += movementSpeed * Math.sin(this.camera.rotation.y);
  }
  if (this.moveBackward) {
    this.cube.position.z -= movementSpeed * Math.cos(this.camera.rotation.y); // Backward based on camera's direction
    this.cube.position.x -= movementSpeed * Math.sin(this.camera.rotation.y);
  }
  if (this.moveLeft) {
    this.cube.position.z -= movementSpeed * Math.sin(this.camera.rotation.y); // Left based on camera's direction
    this.cube.position.x += movementSpeed * Math.cos(this.camera.rotation.y);
  }
  if (this.moveRight) {
    this.cube.position.z += movementSpeed * Math.sin(this.camera.rotation.y); // Right based on camera's direction
    this.cube.position.x -= movementSpeed * Math.cos(this.camera.rotation.y);
  }
  if (this.jump) {
    this.cube.position.y += 0.1; // Jump logic remains the same
  }
}

  addEventListeners() {
    window.addEventListener('keydown', (event) => this.onKeyDown(event));
    window.addEventListener('keyup', (event) => this.onKeyUp(event));
  }

  onKeyDown(event: KeyboardEvent) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.moveForward = true;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.moveBackward = true;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.moveLeft = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.moveRight = true;
        break;
      case 'Space':
        this.jump = true;
        break;
    }
  }

  onKeyUp(event: KeyboardEvent) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.moveForward = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.moveBackward = false;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.moveLeft = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.moveRight = false;
        break;
      case 'Space':
        this.jump = false;
        break;
    }
  }

  gotoSettings() {
    this.router.navigate(['/options']);
  }

  gotoMenu() {
    this.router.navigate(['/game-menu']);
  }
}
