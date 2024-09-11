import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-menu',
  templateUrl: './game-menu.component.html',
  styleUrls: ['./game-menu.component.css']
})
export class GameMenuComponent {
  constructor(private router: Router) {}

  startGame() {
    // Navigate to the game component
    this.router.navigate(['/game']);
  }

  openOptions() {
    // Navigate to the options component
    this.router.navigate(['/options']);
  }

  exitGame() {
    // Handle exiting the game, perhaps close the window
    window.close();
  }
}
