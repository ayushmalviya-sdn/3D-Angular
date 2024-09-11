import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameComponent } from './game/game.component';
import { GameMenuComponent } from './game-menu/game-menu.component';
import { OptionsComponent } from './options/options.component';

const routes: Routes = [
  { path: '', component: GameMenuComponent },
  { path: 'game', component: GameComponent },
  { path: 'options', component: OptionsComponent },
  { path: '**', redirectTo: '' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
