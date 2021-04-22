import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { FlickService } from '../services/flick.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
 
  constructor(private navCtrl: NavController, public flickService: FlickService) { }

  ionViewDidEnter() {
    document.getElementsByTagName('body')[0].classList.remove('dark');
  }

  viewItem(item) {
    this.navCtrl.navigateForward(['cinema', item.id]);
  }

}
