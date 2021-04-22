import type { NativeProperty } from '@nativescript/capacitor';
import type { Subject } from 'rxjs';

declare module '@nativescript/capacitor' {
  export interface customNativeAPI extends nativeCustom {}
}

/**
 * Define your own custom strongly typed native helpers here.
 */
type NativeEventBusTypes = 'pipStarted' | 'pipEnded';
interface INativeEventBusTypes { pipStarted: 'pipStarted'; pipEnded: 'pipEnded'; }
export interface nativeCustom {
  createVideoPlayer(): void;
  destroyVideoPlayer(): void;
  setVideoUrl(value: string): void;
  playVideo(): void;
  pauseVideo(): void;
  setVideoPlayerPosition(x: number, y: number, width?: number, height?: number): void;
  setAutoPlay(value: boolean): void;
  hideVideoPlayer(): void;
  showVideoPlayer(): void;
  toggleEmbeddedVideoBox(value: boolean): void;
  toggleBatteryLevelListener(callback?: (level: number) => void): void;
  eventBusTypes: INativeEventBusTypes;
  onEvent(name: NativeEventBusTypes, callback: () => void): void;
  removeEvent(name: NativeEventBusTypes): void;

  /**
   * Private
   * Internal api's used throughout 'nativescript' folder.
   */
  _eventBus$: Subject<NativeEventBusTypes>;
}
