import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { NavController } from '@ionic/angular';
import { IFlickModel } from '../models';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  @Input() list: Array<IFlickModel>;
  @Output() viewItem: EventEmitter<any> = new EventEmitter();

  constructor(private navCtrl: NavController) {

  }

  tapItem(card) {
    this.viewItem.emit(card);
  }
}
