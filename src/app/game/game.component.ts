import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { timeout } from 'rxjs';
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
  private sphereMaterial!: THREE.ShaderMaterial;
  private alternateMaterial!: THREE.ShaderMaterial;
   score = 0;
  private fruitBoundingBox!: THREE.Box3; 
  private cubeBoundingBox!: THREE.Box3;
  topdown: any;
  constructor(private router: Router) { }

  ngOnInit() {
    this.initThreeJs();
    this.addEventListeners();
  }
  topDown(){
    if(this.topdown){
      this.topdown = !this.topdown
    }else{
      this.topdown = !this.topdown
    }

  }
  initThreeJs() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight,1,1000);
    // this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth , window.innerHeight-20);
    // this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
    this.renderer.setClearColor(0x000000);
    this.scene.add(this.cube);

    this.createBackground();
    this.createGround();
    this.createBoundaries();
     this.camera.position.z = 10
    // this.setTopDownCamera()
    this.renderer.setClearColor(0x000000);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
    this.light = new THREE.PointLight(0xffffff, 9, 10); 
    this.light.position.set(0, 5, 5); 
    this.scene.add(this.light);
    const geometry = new THREE.SphereGeometry();
      this.sphereMaterial = new THREE.ShaderMaterial({
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          void main() {
            vec3 color1 = vec3(0.6, 0,0.2);
            vec3 color2 = vec3(0.9, 0.6, 0.2);
            vec3 color = mix(color1, color2, vUv.y);
            gl_FragColor = vec4(color, 1.0);
          }
        `,
        side: THREE.DoubleSide
      });
      this.alternateMaterial = new THREE.ShaderMaterial({
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          void main() {
            vec3 color1 = vec3(1, 1,1);
            vec3 color2 = vec3(0.9, 0.4, 0.2);
            vec3 color = mix(color1, color2, vUv.y);
            gl_FragColor = vec4(color, 1.0);
          }
        `,
        side: THREE.DoubleSide
      });
    this.cube = new THREE.Mesh(geometry, this.sphereMaterial);
    this.scene.add(this.cube);
    this.createGround();
    this.createBackground();
    this.createEdibles();
    this.createBoundaries();
    this.camera.position.set(this.cube.position.x,this.cube.position.y,this.cube.position.z); 
    this.camera.lookAt(this.cube.position); 
    this.lightHelper = new THREE.PointLightHelper(this.light, 1,0xff0000);
    this.scene.add(this.lightHelper);
    this.animate();
  }
  updateMaterial(isCollision: boolean, duration: number = 0) {
    if (isCollision) {
      this.cube.material = this.alternateMaterial;
      setTimeout(() => {
        this.cube.material = this.sphereMaterial; 
      }, duration);
    } else {
      this.cube.material = this.sphereMaterial;
    }
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
 
  setTopDownCamera() {
  
    this.camera.position.set(5, 2, -5); 

    this.camera.rotation.x = -Math.PI / 2;
  }
 
  createGround() {
    const terrainSize = 100; 
    const geometry = new THREE.PlaneGeometry(terrainSize, terrainSize);
    const material = new THREE.MeshBasicMaterial({ color: 0xbd8143, side: THREE.DoubleSide });
    this.ground = new THREE.Mesh(geometry, material);
    this.ground.rotation.x = -Math.PI / 2; 
    this.ground.position.y = -1;
    this.scene.add(this.ground);
}
  
  animate() {
    requestAnimationFrame(() => this.animate());
  
    this.updateControls();
    this.detectCollision(); 
    if (this.cube.position.y > this.ground.position.y + 1) {
      this.velocityY += this.gravity;
      this.cube.position.y += this.velocityY;
      if (this.cube.position.y <= this.ground.position.y + 1) {
        this.cube.position.y = this.ground.position.y + 1;
        this.velocityY = 0;
      }
    }
    // this.updateMaterial(null);
    this.camera.position.x = this.cube.position.x; 
    this.camera.position.z = this.cube.position.z - 5; 
    if(this.topdown){
      this.camera.position.y = this.cube.position.y + 60; 
    }else{

      this.camera.position.y = this.cube.position.y + 2; 
    }
    // this.camera.position.y = this.cube.position.y + 60; 
    this.camera.lookAt(this.cube.position); 
    this.renderer.render(this.scene, this.camera);
  }
  
  
//   createEdibles() {
//     const geometry = new THREE.SphereGeometry(1); 
//     const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
//     this.fruit = new THREE.Mesh(geometry, material);
//     this.fruit.position.z = Math.floor(50 * Math.random());
//     this.fruit.position.x = Math.floor(50 * Math.random());
//     this.scene.add(this.fruit);
// }

// Update to create a new edible at random position after collision
createEdibles() {
  // this.updateMaterial(null)
  const geometry = new THREE.SphereGeometry(1); 
  const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  this.fruit = new THREE.Mesh(geometry, material);
  this.fruit.position.set(
    Math.floor(50 * Math.random()),
    1,
    Math.floor(50 * Math.random())
  );
  this.fruitBoundingBox = new THREE.Box3().setFromObject(this.fruit); 
  this.scene.add(this.fruit);
}


detectCollision() {
  this.cubeBoundingBox = new THREE.Box3().setFromObject(this.cube);
  
  if (this.cubeBoundingBox.intersectsBox(this.fruitBoundingBox)) {
    this.updateMaterial(true, 500); 
    this.scene.remove(this.fruit); 
    this.score++;
    console.log(`Score: ${this.score}`);
    this.createEdibles();
  }
  //  else {
    
  //   this.updateMaterial(false); 
  // }
}
updateControls() {
  const movementSpeed = 0.1;

  if (this.moveForward) {
    this.cube.position.z += movementSpeed * Math.cos(this.camera.rotation.y); 
    this.cube.position.x += movementSpeed * Math.sin(this.camera.rotation.y);
  }
  if (this.moveBackward) {
    this.cube.position.z -= movementSpeed * Math.cos(this.camera.rotation.y);
    this.cube.position.x -= movementSpeed * Math.sin(this.camera.rotation.y);
  }
  if (this.moveLeft) {
    this.cube.position.z -= movementSpeed * Math.sin(this.camera.rotation.y); 
    this.cube.position.x += movementSpeed * Math.cos(this.camera.rotation.y);
  }
  if (this.moveRight) {
    this.cube.position.z += movementSpeed * Math.sin(this.camera.rotation.y);
    this.cube.position.x -= movementSpeed * Math.cos(this.camera.rotation.y);
  }
  if (this.jump) {
    this.cube.position.y += 0.1; 
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
