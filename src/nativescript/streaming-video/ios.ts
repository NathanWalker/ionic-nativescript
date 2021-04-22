import { iosRootViewController } from '@nativescript/capacitor/bridge';

/**
 * iOS custom video player
 */
class IOSScreen {
  static widthPixels(): number {
    return IOSScreen.widthDIPs() * (native.isIOS ? UIScreen.mainScreen.scale : 0);
  }
  static heightPixels(): number {
    return IOSScreen.heightDIPs() * (native.isIOS ? UIScreen.mainScreen.scale : 0);
  }
  static widthDIPs(): number {
    return native.isIOS ? UIScreen.mainScreen.bounds.size?.width : 0;
  }
  static heightDIPs(): number {
    return native.isIOS ? UIScreen.mainScreen.bounds.size?.height : 0;
  }
}

let currentUrl: string;
let autoPlay = false;
let playing = false;
const videoSize = {
  width: IOSScreen.widthDIPs() - 75,
  height: 172,
};
let playerController: AVPlayerViewController;
let player: AVPlayer;
let AVPlayerDelegateClassImpl;
let avPlayerDelegateInstance;

export function toggleIOSPipMode(){
  
}

function createIOSAVPlayerDelegate() {
  // ensures the custom NativeClass is available for use
  setupIOSAVPlayerDelegate();
  // best practice to always retain delegate instances in NativeScript when in use
  avPlayerDelegateInstance = AVPlayerDelegateClassImpl.new();
  return avPlayerDelegateInstance;
}

function setupIOSAVPlayerDelegate() {
  // Define our custom NativeClass implementation of AVPlayerViewControllerDelegate
  @NativeClass()
  class AVPlayerViewControllerDelegateImpl
    extends NSObject
    implements AVPlayerViewControllerDelegate {
    static ObjCProtocols = [AVPlayerViewControllerDelegate];

    playerViewControllerWillStartPictureInPicture() {
      console.log('willStartPictureInPicture');
      native._eventBus$.next(native.eventBusTypes.pipStarted);
    }

    playerViewControllerWillStopPictureInPicture() {
      console.log('willStopPictureInPicture');
      native._eventBus$.next(native.eventBusTypes.pipEnded);
    }

    playerViewControllerDidStartPictureInPicture() {
      console.log('didStartPictureInPicture');
    }

    playerViewControllerDidStopPictureInPicture() {
      console.log('didStopPictureInPicture');
    }

    playerViewControllerFailedToStartPictureInPictureWithError() {
      console.log('failedToStartPictureInPicture');
    }

    playerViewControllerRestoreUserInterfaceForPictureInPictureStopWithCompletionHandler() {
      console.log('restoreUserInterfaceForPictureInPictureStop');
    }

    playerViewControllerShouldAutomaticallyDismissAtPictureInPictureStart() {
      return false;
    }

    playerViewControllerWillBeginFullScreenPresentationWithAnimationCoordinator() {
      console.log('willBeginFullScreenPresentation');
    }

    playerViewControllerWillEndFullScreenPresentationWithAnimationCoordinator() {
      console.log('willEndFullScreenPresentation');
    }
  }
  AVPlayerDelegateClassImpl = AVPlayerViewControllerDelegateImpl;
}

export function createIOSVideoPlayer() {
  setupIOSAudioSession();
  if (!playerController) {
    playerController = AVPlayerViewController.new();

    const size = getVideoSize(false);
    playerController.view.frame = CGRectMake(
      size.x,
      40,
      size.width,
      size.height
    );

    // provide a nice subtle shadow when viewed "inline/embedded"
    playerController.view.layer.masksToBounds = true;
    playerController.view.layer.shadowOpacity = 0.7;
    playerController.view.layer.shadowRadius = 5;
    playerController.view.layer.cornerRadius = 6;
    playerController.view.layer.shadowOffset = CGSizeMake(0, 0);
    playerController.view.layer.shadowColor = UIColor.whiteColor.CGColor;
    playerController.view.layer.shadowPath = UIBezierPath.bezierPathWithRoundedRectCornerRadius(
      playerController.view.bounds,
      6
    ).CGPath;

    player = AVPlayer.new();
    playerController.player = player;
    playerController.showsPlaybackControls = true;
    playerController.delegate = createIOSAVPlayerDelegate();

    iosRootViewController().addChildViewController(playerController);
    iosRootViewController().view.addSubview(playerController.view);
    playerController.didMoveToParentViewController(iosRootViewController());

    animateView({
      curve: UIViewAnimationOptions.CurveEaseIn,
      animations: () => {
        if (playerController) {
          const size = getVideoSize(false);
          playerController.view.frame = CGRectMake(
            size.x,
            size.y,
            size.width,
            size.height
          );
        }
      },
    });
  }
}

export function setIOSVideoUrl(value: string) {
  if (currentUrl !== value) {
    if (autoPlay) {
      playIOSVideo();
    }
    currentUrl = value;
    const url = NSURL.URLWithString(value);
    // Set to null in case a previous video was loaded
    // prevents it from showing while the new one is loading
    player.replaceCurrentItemWithPlayerItem(null);
    player.replaceCurrentItemWithPlayerItem(new AVPlayerItem(<any>url));
    playerController.player = null;
    playerController.player = player;
  } else {
    playIOSVideo();
  }
}

export function playIOSVideo() {
  if (!playing) {
    if (player) {
      playing = true;
      player.play();
      animateView({
        curve: UIViewAnimationOptions.CurveEaseIn,
        animations: () => {
          if (playerController) {
            playerController.view.transform = CGAffineTransformMakeScale(
              1.15,
              1.15
            );
          }
        },
      });
    }
  }
}

export function pauseIOSVideo() {
  if (playing) {
    if (player) {
      playing = false;
      player.pause();
      animateView({
        curve: UIViewAnimationOptions.CurveEaseOut,
        animations: () => {
          if (playerController) {
            playerController.view.transform = CGAffineTransformMakeScale(1, 1);
          }
        },
      });
    }
  }
}

export function hideIOSVideoPlayer() {
  if (playerController) {
    playerController.view.layer.opacity = 0;
  }
}

export function showIOSVideoPlayer() {
  if (playerController) {
    playerController.view.layer.opacity = 1;
  }
}

export function setIOSVideoPlayerPosition(
  x: number,
  y: number,
  width?: number,
  height?: number
) {
  if (playerController) {
    playerController.view.frame = CGRectMake(
      x,
      y,
      width || videoSize.width,
      height || videoSize.height
    );
  }
}

export function setIOSAutoPlay(value: boolean) {
  autoPlay = value;
}

export function toggleIOSEmbeddedVideoBox(show: boolean) {
  if (playerController && playerController.view) {
    // hides the default AVPlayer placeholder screen when in PIP mode and allows DOM view to takeover fullscreen
    if (show) {
      iosRootViewController().view.exchangeSubviewAtIndexWithSubviewAtIndex(
        1,
        0
      );
    } else {
      iosRootViewController().view.exchangeSubviewAtIndexWithSubviewAtIndex(
        0,
        1
      );
    }
    iosRootViewController().view.subviews.objectAtIndex(0).layer.zPosition = 0;
    iosRootViewController().view.subviews.objectAtIndex(1).layer.zPosition = 1;
  }
}

let blackShade: UIView;
export function destroyIOSVideoPlayer() {
  if (playerController) {
    if (playing) {
      pauseIOSVideo();
    }
    // simple simulation of UI handling for UX transitions
    blackShade = UIView.alloc().initWithFrame(
      CGRectMake(0, 0, IOSScreen.widthDIPs(), IOSScreen.heightDIPs())
    );
    blackShade.backgroundColor = UIColor.colorWithRedGreenBlueAlpha(
      0,
      0,
      0,
      0.9
    );
    blackShade.layer.opacity = 0;
    iosRootViewController().view.addSubview(blackShade);
    animateView({
      duration: 0.2,
      curve: UIViewAnimationOptions.CurveEaseIn,
      animations: () => {
        blackShade.layer.opacity = 1;
      },
      complete: () => {
        animateView({
          delay: 0.3,
          duration: 1.0,
          curve: UIViewAnimationOptions.CurveEaseOut,
          animations: () => {
            blackShade.layer.opacity = 0;
          },
          complete: () => {
            blackShade.removeFromSuperview();
            blackShade = null;
          },
        });
      },
    });
    animateView({
      curve: UIViewAnimationOptions.CurveEaseOut,
      animations: () => {
        if (playerController) {
          const size = getVideoSize(false);
          playerController.view.layer.opacity = 0;
          playerController.view.frame = CGRectMake(
            size.x,
            0,
            size.width,
            size.height
          );
        }
      },
      complete: () => {
        player.replaceCurrentItemWithPlayerItem(null);
        playerController.player = null;
        playerController.view.removeFromSuperview();
        playerController.removeFromParentViewController();
        playerController = null;
        avPlayerDelegateInstance = null;
        player = null;
        currentUrl = null;
        playing = false;
      },
    });
  }
}

// general native animation utility
function animateView(options: {
  animations: () => void;
  complete?: () => void;
  duration?: number;
  delay?: number;
  curve?: UIViewAnimationOptions;
}) {
  UIView.animateWithDurationDelayOptionsAnimationsCompletion(
    options.duration || 1.0,
    options.delay || 0,
    options.curve || UIViewAnimationOptions.CurveEaseIn,
    options.animations,
    () => {
      if (options.complete) {
        options.complete();
      }
    }
  );
}

function getVideoSize(active: boolean) {
  const width = active ? videoSize.width + 40 : videoSize.width;
  const height = active ? videoSize.height + 20 : videoSize.height;
  return {
    x: IOSScreen.widthDIPs() / 2 - width / 2,
    y: 120,
    width,
    height,
  };
}

function setupIOSAudioSession() {
  try {
    AVAudioSession.sharedInstance().setCategoryError(
      AVAudioSessionCategoryPlayback
    );
    AVAudioSession.sharedInstance().setActiveError(true);
  } catch (err) {
    console.log('audio category error:', err);
  }
}
