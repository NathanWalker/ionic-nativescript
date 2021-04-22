import {
  Component,
  ElementRef,
  Input,
  NgZone,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Animation, AnimationController, Platform } from '@ionic/angular';
import { native } from '@nativescript/capacitor';
import { IFlickModel } from '../models';

@Component({
  selector: 'app-native-streaming-video',
  templateUrl: './native-streaming-video.component.html',
  styleUrls: ['./native-streaming-video.component.scss'],
})
export class NativeStreamingVideoComponent implements OnInit {
  @Input() item: IFlickModel;
  @Input() position: { x: number; y: number; width?: number; height?: number };
  @ViewChild('detailsContainer', { static: true }) detailsContainer: ElementRef;
  @ViewChild('backsplash', { static: true }) backsplashContainer: ElementRef;

  playing = false;
  showLowBatteryNote = false;
  inPipMode = false;
  isWeb: boolean;

  private animateDetailFadeIn: Animation;
  private animateBacksplashFadeIn: Animation;
  private animateDetailPipToggle: Animation;
  private animateBacksplashFadeOut: Animation;
  private shownLowBatteryNote = false;

  constructor(
    private zone: NgZone,
    private platform: Platform,
    private animationCtrl: AnimationController
  ) {
    this.isWeb = this.platform.platforms().includes('mobileweb');
  }

  ngOnInit() {
    // Allow the DOM to react to PIP mode
    native.onEvent('pipStarted', this.pipStarted.bind(this));
    native.onEvent('pipEnded', this.pipEnded.bind(this));

    // Enable battery level listening
    native.toggleBatteryLevelListener((level: number) => {
      console.log("Battery Level Changed:", level);
      if (level < 6 && !this.shownLowBatteryNote) {
        // NOTE: could save the currently running video time here to resume on recharge
        // implementation omitted for the demo

        // only show notice once
        this.shownLowBatteryNote = true;
        this.zone.run(() => {
          this.showLowBatteryNote = true;
        })
      }
    });
  }

  pipStarted() {
    if (!this.inPipMode) {
      this.inPipMode = true;
      native.toggleEmbeddedVideoBox(false);
      this.animateDetailPipToggle.direction('normal').fill('forwards').play();
      this.animateBacksplashFadeOut.direction('normal').fill('forwards').play();
    }
  }

  pipEnded() {
    if (this.inPipMode) {
      this.inPipMode = false;
      native.toggleEmbeddedVideoBox(true);
      this.animateDetailPipToggle.direction('reverse').fill('backwards').play();
      this.animateBacksplashFadeOut
        .direction('reverse')
        .fill('forwards')
        .play();
    }
  }

  dismissLowBatteryNote() {
    this.showLowBatteryNote = false;
    native.showVideoPlayer();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes.position.currentValue &&
      changes.position.previousValue !== changes.position.currentValue
    ) {
      const { x, y, width, height } = this.position;
      console.log('setVideoPlayerPosition:', x, y, width, height);
      native.setVideoPlayerPosition(x, y, width, height);
    }
  }

  ngAfterViewInit() {
    this.animateDetailFadeIn = this.animationCtrl
      .create()
      .addElement(this.detailsContainer.nativeElement)
      .delay(500)
      .duration(1000)
      .easing('ease-in')
      .fill('forwards')
      .fromTo('transform', 'translateY(0px)', 'translateY(255px)')
      // .fromTo('transform', 'translateY(0px)', 'translateY(325px)')
      .fromTo('opacity', '0', '1');

    this.animateBacksplashFadeIn = this.animationCtrl
      .create()
      .addElement(this.backsplashContainer.nativeElement)
      .delay(300)
      .duration(500)
      .easing('linear')
      .fill('forwards')
      .fromTo('opacity', '0', '1');

    this.animateDetailPipToggle = this.animationCtrl
      .create()
      .addElement(this.detailsContainer.nativeElement)
      .duration(500)
      .easing('ease-out')
      .fill('forwards')
      .fromTo('transform', 'translateY(255px)', 'translateY(0px)');
    // .fromTo('transform', 'translateY(325px)', 'translateY(0px)');

    this.animateBacksplashFadeOut = this.animationCtrl
      .create()
      .addElement(this.backsplashContainer.nativeElement)
      .duration(500)
      .easing('linear')
      .fill('forwards')
      .fromTo('opacity', '1', '0');

    setTimeout(() => {
      this.animateDetailFadeIn.play();
      this.animateBacksplashFadeIn.play();
      native.createVideoPlayer();
      this.play();
    }, 600);
  }

  togglePlay() {
    if (this.playing) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    this.playing = true;
    native.setAutoPlay(true);
    native.setVideoUrl(this.item.url);
  }

  pause() {
    this.playing = false;
    native.pauseVideo();
  }

  ngOnDestroy() {
    native.removeEvent('pipStarted');
    native.removeEvent('pipEnded');
    if (this.inPipMode) {
      native.toggleEmbeddedVideoBox(true);
    }
    native.toggleBatteryLevelListener();
    native.destroyVideoPlayer();
  }
}
