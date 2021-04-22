import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CinemaPage } from './cinema.page';

const routes: Routes = [
  {
    path: '',
    component: CinemaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CinemaPageRoutingModule {}
