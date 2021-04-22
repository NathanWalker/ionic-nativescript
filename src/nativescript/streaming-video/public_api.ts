import {
  createAndroidVideoPlayer,
  pauseAndroidVideo,
  playAndroidVideo,
  setAndroidAutoPlay,
  setAndroidVideoPlayerPosition,
  setAndroidVideoUrl,
  toggleAndroidEmbeddedVideoBox,
  enterAndroidPipMode,
  hideAndroidVideoPlayer,
  showAndroidVideoPlayer,
  destroyAndroidVideoPlayer
} from './android';

import { createIOSVideoPlayer,
  destroyIOSVideoPlayer,
  hideIOSVideoPlayer,
  pauseIOSVideo,
  playIOSVideo,
  setIOSAutoPlay,
  setIOSVideoPlayerPosition,
  setIOSVideoUrl,
  showIOSVideoPlayer,
  toggleIOSEmbeddedVideoBox } from './ios';

native.createVideoPlayer = () => {
  if (native.isAndroid) {
    createAndroidVideoPlayer();
  } else {
    createIOSVideoPlayer();
  }
};

native.setVideoUrl = (value: string) => {
  if (native.isAndroid) {
    setAndroidVideoUrl(value);
  } else {
    setIOSVideoUrl(value);
  }
};

native.playVideo = () => {
  if (native.isAndroid) {
    playAndroidVideo();
  } else {
    playIOSVideo();
  }
};

native.pauseVideo = () => {
  if (native.isAndroid) {
    pauseAndroidVideo();
  } else {
    pauseIOSVideo();
  }
};

native.setVideoPlayerPosition = (
  x: number,
  y: number,
  width?: number,
  height?: number
) => {
  if (native.isAndroid) {
    setAndroidVideoPlayerPosition(x, y, width, height);
  } else {
    setIOSVideoPlayerPosition(x, y, width, height);
  }
};

native.setAutoPlay = (value: boolean) => {
  if (native.isAndroid) {
    setAndroidAutoPlay(value);
  } else {
    setIOSAutoPlay(value);
  }
};

native.toggleEmbeddedVideoBox = (show: boolean) => {
  if (native.isAndroid) {
    toggleAndroidEmbeddedVideoBox(show);
  } else {
    toggleIOSEmbeddedVideoBox(show);
  }
};

native.hideVideoPlayer = () => {
  if (native.isAndroid) {
    hideAndroidVideoPlayer();
  } else {
    hideIOSVideoPlayer();
  }
};

native.showVideoPlayer = () => {
  if (native.isAndroid) {
    showAndroidVideoPlayer();
  } else {
    showIOSVideoPlayer();
  }
};

native.destroyVideoPlayer = () => {
  if (native.isAndroid) {
    destroyAndroidVideoPlayer()
  } else {
    destroyIOSVideoPlayer();
  }
};
