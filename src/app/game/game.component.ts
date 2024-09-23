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

  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  cube!: THREE.Mesh;
  background!: THREE.Mesh;
  ground!: THREE.Mesh;
  moveForward = false;
  moveBackward = false;
  moveLeft = false;
  moveRight = false;
  jump = false;
  boundaries: THREE.Mesh[] = [];
  velocityY = 0;
  gravity = -0.002;
  fruit!: THREE.Mesh;
  light!: THREE.PointLight;
  lightHelper!: THREE.PointLightHelper;
  sphereMaterial!: THREE.ShaderMaterial;
  alternateMaterial!: THREE.ShaderMaterial;
  score = 0;
  fruitBoundingBox!: THREE.Box3;
  topDownTimeout: any;
  cubeBoundingBox!: THREE.Box3;
  topdown: any;
  arrowHelper: any;
  width: number = 30;
  height: number = 30;
  cellSize: number = 4;
  collision: boolean=false;
  previousPosition: THREE.Vector3 = new THREE.Vector3();
  constructor(private router: Router) { }

  ngOnInit() {
    this.initThreeJs();
    this.addEventListeners();
  }
  topDown() {
    if (this.topdown) {
      this.topdown = !this.topdown
    } else {
      this.topdown = !this.topdown
    }

  }
  initThreeJs() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    // this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight - 20);
    // this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
    this.renderer.setClearColor(0x000000);
    this.scene.add(this.cube);

    this.createBackground();
    this.createGround();
    this.createBoundaries();
    // this.createMaze();
    this.camera.position.z = 10
    // this.setTopDownCamera()
    this.renderer.setClearColor(0x000000);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
    this.light = new THREE.PointLight(0xffffff, 9, 10);
    this.light.position.set(0, 5, 5);
    this.scene.add(this.light);
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    this.scene.add(light);


    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
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
    const direction = new THREE.Vector3(this.fruit.position.x, 0, this.fruit.position.z);
    const origin = new THREE.Vector3(this.cube.position.y + 10, this.cube.position.y + 10, this.cube.position.y + 5);
    const length = 3;
    const color = 0xe67e22;

    this.arrowHelper = this.createThickArrow(origin, direction, length, color);
    // this.arrowHelper.position.y =this.arrowHelper.position.x +10
    // Add the ArrowHelper to the scene
    this.scene.add(this.arrowHelper);
    this.createBoundaries();
    this.camera.position.set(this.cube.position.x, this.cube.position.y, this.cube.position.z);
    this.camera.lookAt(this.cube.position);
    this.lightHelper = new THREE.PointLightHelper(this.light, 1, 0xff0000);
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


  createThickArrow(origin: any, direction: any, length: any, color: any) {
    
    const shaftGeometry = new THREE.CylinderGeometry(0.1, 0.1, length - 1, 8);
    const shaftMaterial = new THREE.MeshPhongMaterial({ color: 0xf67904, shininess: 100 });
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    const headGeometry = new THREE.ConeGeometry(0.2, 1, 8);
    const headMaterial = new THREE.MeshPhongMaterial({ color: color, shininess: 100 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = length / 2;
    head.rotation.x = Math.PI / 80;
    const arrow = new THREE.Group();
    arrow.add(shaft);
    arrow.add(head);
    arrow.position.copy(origin);
    arrow.lookAt(direction.clone().add(origin));
    return arrow;
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
    const wallThickness = 1;
    const groundSize = 90;

    const material = new THREE.MeshBasicMaterial({ color: 0x8b3304, side: THREE.DoubleSide });

    const wallGeometries = [
      new THREE.PlaneGeometry(groundSize, wallHeight,wallThickness),
      new THREE.PlaneGeometry(groundSize, wallHeight,wallThickness),
      new THREE.PlaneGeometry(groundSize, wallHeight,wallThickness),
      new THREE.PlaneGeometry(groundSize, wallHeight,wallThickness),
    ];

    const walls = wallGeometries.map((geometry, index) => {
      const wall = new THREE.Mesh(geometry, material);
      switch (index) {
        case 0:
          wall.position.set(0, wallHeight / 2, -groundSize / 2);
          wall.rotation.y = Math.PI;
          // wall.position.y = -2
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
  createMaze() {
    const maze = this.generateMaze(this.width, this.height);
    const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x8b3304 });
    
    maze.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 1) {
          const wallGeometry = new THREE.BoxGeometry(this.cellSize, this.cellSize, this.cellSize);
          const wall = new THREE.Mesh(wallGeometry, wallMaterial);
          wall.position.set(x * this.cellSize - this.width * this.cellSize / 2, this.cellSize / 2, y * this.cellSize - this.height * this.cellSize / 2);
          this.scene.add(wall);
          this.boundaries.push(wall);
        }
      });
    });
  }

  generateMaze(width: number, height: number): number[][] {
    const maze = Array.from({ length: height }, () => Array(width).fill(0));

    function carvePassagesFrom(cx: number, cy: number) {
      const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      directions.sort(() => Math.random() - 0.5);

      directions.forEach(([dx, dy]) => {
        const nx = cx + dx * 2;
        const ny = cy + dy * 2;

        if (nx >= 0 && ny >= 0 && nx < width && ny < height && maze[ny][nx] === 0) {
          maze[cy + dy][cx + dx] = 1;
          maze[ny][nx] = 1;
          carvePassagesFrom(nx, ny);
        }
      });
    }

    carvePassagesFrom(0, 0);
    return maze;
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
    if (this.topdown) {
      this.camera.position.y = this.cube.position.y + 60;
    } else {

      this.camera.position.y = this.cube.position.y + 2;
    }
    
    this.camera.lookAt(this.cube.position);
    this.renderer.render(this.scene, this.camera);
  }


  
  createEdibles() {
    const geometry = new THREE.SphereGeometry(1);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    this.fruit = new THREE.Mesh(geometry, material);
  
    let positionIsValid = false;
    const maxAttempts = 100;
    let attempts = 0;
  
    while (!positionIsValid && attempts < maxAttempts) {
      this.fruit.position.set(
        Math.floor(30 * Math.random()),
        1,
        Math.floor(30 * Math.random())
      );
  
      positionIsValid = !this.isCollidingWithWalls(this.fruit);
      attempts++;
    }
  
    if (positionIsValid) {
      this.fruitBoundingBox = new THREE.Box3().setFromObject(this.fruit);
      this.scene.add(this.fruit);
    } else {
      console.warn('Could not find a valid position for the fruit after multiple attempts.');
    }
  }
  isCollidingWithWalls(fruit: THREE.Mesh): boolean {
    const fruitBoundingBox = new THREE.Box3().setFromObject(fruit);
  
    return this.boundaries.some(wall => {
      const wallBoundingBox = new THREE.Box3().setFromObject(wall);
      return fruitBoundingBox.intersectsBox(wallBoundingBox);
    });
  }
  
  detectCollision() {
    this.cubeBoundingBox = new THREE.Box3().setFromObject(this.cube);
    
    this.boundaries.forEach(wall => {
      const wallBoundingBox = new THREE.Box3().setFromObject(wall);
      if (this.cubeBoundingBox.intersectsBox(wallBoundingBox)) {
        this.cube.position.copy(this.previousPosition);
      }
    });
    if (this.cubeBoundingBox.intersectsBox(this.fruitBoundingBox)) {
      this.updateMaterial(true, 500); 
      this.scene.remove(this.fruit); 
      this.score++;
      this.topDown();
      this.createEdibles();
    } else {
      this.updateMaterial(false); 
    }
  }
  
  updateControls() {
    this.previousPosition.copy(this.cube.position);
    if(this.collision==true){
      return
    }
    const movementSpeed = 0.1;

    if (this.moveForward) {
      this.cube.position.z += movementSpeed * Math.cos(this.camera.rotation.y);
      this.cube.position.x += movementSpeed * Math.sin(this.camera.rotation.y);
      this.light.position.z = this.cube.position.z + 5;
      this.light.position.x = this.cube.position.x;
    }
    if (this.moveBackward) {
      this.cube.position.z -= movementSpeed * Math.cos(this.camera.rotation.y);
      this.cube.position.x -= movementSpeed * Math.sin(this.camera.rotation.y);
      this.light.position.z = this.cube.position.z + 5;
      this.light.position.x = this.cube.position.x;
    }
    if (this.moveLeft) {
      this.cube.position.z -= movementSpeed * Math.sin(this.camera.rotation.y);
      this.cube.position.x += movementSpeed * Math.cos(this.camera.rotation.y);
      this.light.position.z = this.cube.position.z + 5;
      this.light.position.x = this.cube.position.x;
    }
    if (this.moveRight) {
      this.cube.position.z += movementSpeed * Math.sin(this.camera.rotation.y);
      this.cube.position.x -= movementSpeed * Math.cos(this.camera.rotation.y);
      this.light.position.z = this.cube.position.z + 5;
      this.light.position.x = this.cube.position.x;
    }
    if (this.jump) {
      this.cube.position.y += 0.1;
    }

    const arrowPosition = new THREE.Vector3(this.cube.position.x, this.cube.position.y + 2, this.cube.position.z); // Place the arrow above the cube
    const fruitPosition = new THREE.Vector3().copy(this.fruit.position);
    const direction = new THREE.Vector3().subVectors(fruitPosition, arrowPosition).normalize();

   
    if (this.arrowHelper) {
      
      const targetRotation = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction));
      this.arrowHelper.rotation.copy(targetRotation);
      this.arrowHelper.position.copy(arrowPosition); 
    }

    if (Math.floor(this.fruit.position.x) == Math.floor(this.cube.position.x)) {
      this.light.rotateX(180);
    } else if (Math.floor(this.fruit.position.z) == Math.floor(this.cube.position.z)) {
      this.light.rotateZ(180);
    } else {
      this.light.rotation.x = 0;
    }
  }


  addEventListeners() {
    window.addEventListener('keydown', (event) => this.onKeyDown(event));
    window.addEventListener('keyup', (event) => this.onKeyUp(event));
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