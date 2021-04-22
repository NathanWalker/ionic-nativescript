import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CinemaPageRoutingModule } from './cinema-routing.module';

import { CinemaPage } from './cinema.page';
import { NativeStreamingVideoComponent } from '../native-streaming-video/native-streaming-video.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CinemaPageRoutingModule
  ],
  declarations: [CinemaPage, NativeStreamingVideoComponent]
})
export class CinemaPageModule {}
