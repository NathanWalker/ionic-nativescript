import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IFlickModel } from '../models';
import { FlickService } from '../services/flick.service';

@Component({
  selector: 'app-cinema',
  templateUrl: './cinema.page.html',
  styleUrls: ['./cinema.page.scss'],
})
export class CinemaPage {
  item: IFlickModel;
  videoPosition: { x: number; y: number; width?: number; height?: number };

  constructor(
    private activatedRoute: ActivatedRoute,
    private ngZone: NgZone,
    public flickService: FlickService,
  ) {}

  ngOnInit() {
    const itemId = this.activatedRoute.snapshot.paramMap.get('id');
    this.item = this.flickService.list.find((i) => i.id === parseInt(itemId));
  }

  ionViewDidEnter() {
    console.log('CinemaPage ionViewDidEnter');
    document.getElementsByTagName('body')[0].classList.toggle("dark");
  }
}
