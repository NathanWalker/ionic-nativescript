const activity = () => {
  return native.androidCapacitorActivity as androidx.appcompat.app.AppCompatActivity;
};
interface DisplayMetrics {
  density: number;
  scaledDensity: number;
  heightPixels: number;
  widthPixels: number;
}
let displayMetrics: DisplayMetrics;
const initDisplayMetrics = () => {
  const metrics = activity().getResources().getDisplayMetrics();
  displayMetrics = {
    density: metrics.density,
    scaledDensity: metrics.scaledDensity,
    heightPixels: metrics.heightPixels,
    widthPixels: metrics.widthPixels,
  };
};

/*Size values are in pixels*/
let activitySize: { width: number; height: number };
let rootView: android.view.ViewGroup;
const initActivitySize = () => {
  rootView = activity().findViewById(android.R.id.content) as any;
  if (rootView) {
    activitySize = {
      width: rootView.getWidth(),
      height: rootView.getHeight(),
    };
  }
};
const videoSize = () => {
  if (!activitySize) {
    initActivitySize();
  }

  if (!displayMetrics) {
    initDisplayMetrics();
  }
  // Return zero if anything fails
  const width = activitySize?.width ?? 0;
  return {
    width: width - width * 0.15,
    height: AndroidScreen.toPixels(200),
  };
};
// These values are based on the activity size not the actual screen
class AndroidScreen {
  private static get metrics(): DisplayMetrics {
    if (!displayMetrics) {
      initDisplayMetrics();
    }
    return displayMetrics;
  }
  private static get activitySize(): { width: number; height: number } {
    if (!activitySize) {
      initActivitySize();
    }
    return activitySize;
  }
  static widthPixels(): number {
    return AndroidScreen?.activitySize?.width ?? 0;
  }
  static heightPixels(): number {
    return AndroidScreen?.activitySize?.height ?? 0;
  }
  static widthDIPs(): number {
    return (
      AndroidScreen?.activitySize?.width ??
      0 / AndroidScreen?.metrics?.density ??
      0
    );
  }
  static heightDIPs(): number {
    return (
      AndroidScreen?.activitySize?.height ??
      0 / AndroidScreen?.metrics?.density ??
      0
    );
  }

  static scale(): number {
    return AndroidScreen?.metrics?.density ?? 0;
  }

  static toPixels(value: number): number {
    value = Number(value);
    return (AndroidScreen?.metrics?.density ?? 0) * (isNaN(value) ? 0 : value);
  }
}
const getVideoSize = (active: boolean) => {
  const size = videoSize();
  const width = active ? size.width + AndroidScreen.toPixels(40) : size.width;
  const height = active
    ? size.height + AndroidScreen.toPixels(20)
    : size.height;
  return {
    x: AndroidScreen.widthPixels() / 2 - width / 2,
    y: AndroidScreen.toPixels(80),
    width,
    height,
  };
};
let playerContainer: android.widget.LinearLayout;
let playerLayoutParams: android.view.ViewGroup.LayoutParams;
let playerEventListener;
const FRAGMENT_TAG = 'nativescript_cap:video';
let LAYOUT_ID = -1;
let currentFragment;
let PlayerFragment;
const STATE_READY: number = 3;
const STATE_ENDED: number = 4;
const SURFACE_READY: number = 1;
declare const com, io;
let player;
function ensurePlayerFragment() {
  if (!PlayerFragment) {
    @NativeClass()
    class PlayerFragmentImpl extends androidx.fragment.app.Fragment {
      playerViewTexture: android.view.TextureView;
      playerView;
      playerViewListener;
      constructor() {
        super();
        this.playerView = new com.google.android.exoplayer2.ui.PlayerView(
          activity()
        );
        this.playerView.setUseController(true);
        this.playerView.setPlayer(player);
        this.playerView.setLayoutParams(
          new android.view.ViewGroup.LayoutParams(
            android.view.ViewGroup.LayoutParams.MATCH_PARENT,
            android.view.ViewGroup.LayoutParams.MATCH_PARENT
          )
        );

        return global.__native(this);
      }

      public onCreateView(
        param0: globalAndroid.view.LayoutInflater,
        param1: globalAndroid.view.ViewGroup,
        param2: globalAndroid.os.Bundle
      ): globalAndroid.view.View {
        return this.playerView;
      }
    }
    PlayerFragment = PlayerFragmentImpl;
  }
}

function handleFragment() {
  const fragmentManager = activity().getSupportFragmentManager();
  ensurePlayerFragment();
  const fragment = new PlayerFragment();
  if (fragmentManager) {
    const ft = fragmentManager.beginTransaction();
    ft.replace(LAYOUT_ID, fragment, FRAGMENT_TAG);
    ft.commitAllowingStateLoss();
    currentFragment = fragment;
  }
}

function cleanUpFragment(){
  const fragmentManager = activity().getSupportFragmentManager();
  if (fragmentManager) {
    const frag = fragmentManager.findFragmentByTag(FRAGMENT_TAG);
    const ft = fragmentManager.beginTransaction();
    ft.remove(frag);
    ft.commitAllowingStateLoss();
    currentFragment = undefined;
  }
}


let playerReady = false;
let playerEnded = true;
function enablePip(activity: android.app.Activity) {
  const version = android.os.Build.VERSION.SDK_INT;
  if (version >= 24) {
    // Check is the device supports it because it can be disabled
    const supportsPip = activity
      .getPackageManager()
      .hasSystemFeature(
        android.content.pm.PackageManager.FEATURE_PICTURE_IN_PICTURE
      );
    if (supportsPip) {
      if (version >= 26) {
        const view = getVideoSize(true);
        const builder = new android.app.PictureInPictureParams.Builder();
        if(currentFragment){
          const aspectRatio = new android.util.Rational(view.width,view.height);
          builder.setAspectRatio(aspectRatio);
        }
        activity.enterPictureInPictureMode(builder.build());
      } else {
        activity.enterPictureInPictureMode();
      }
    }
  }
};

let mediaSession;
let mediaSessionConnector;
const PLAYER_ACTIONS = 'io.nstudio.triniwiz.Player.Actions';
const UPDATE_URL_ACTION = 'io.nstudio.triniwiz.Player.UPDATE_URL_ACTION';
const PLAY_ACTION = 'io.nstudio.triniwiz.Player.PLAY_ACTION';
const PAUSE_ACTION = 'io.nstudio.triniwiz.Player.PAUSE_ACTION';


/* 
Extending the default BridgeActivity to implement onPictureInPictureModeChanged
*/
function setupActivity() {
  @NativeClass()
  @JavaProxy('io.nstudio.ngconf2021.CustomActivity')
  class CustomActivity extends com.getcapacitor.BridgeActivity {
    public onCreate(param0: globalAndroid.os.Bundle) {
      super.onCreate(param0);
    }
  
    onPictureInPictureModeChanged(...args) {
      const isInPictureInPictureMode = args[0];
      if(currentFragment){
        if (isInPictureInPictureMode) {
          this.hideSystemUi();
          currentFragment.playerView.setUseController(false);
        } else {
          this.showSystemUI();
          currentFragment.playerView.setUseController(true);
        }
      }
    }
  
    onUserLeaveHint() {
      if(player){
        enablePip(this as any);
      }
    }
  
    onStop() {
      pauseVideo();
      super.onStop();
    }
  
    hideSystemUi() {
      if (mediaSessionConnector) {
          mediaSessionConnector.setPlayer(player);
      }
      const params = playerContainer.getLayoutParams();
      params.width = android.view.ViewGroup.LayoutParams.MATCH_PARENT;
      params.height = android.view.ViewGroup.LayoutParams.MATCH_PARENT;
      playerContainer.setX(0);
      playerContainer.setY(0);
      playerContainer.setScaleX(1);
      playerContainer.setScaleY(1);
      playerContainer.requestLayout();
      if(currentAnimation){
        currentAnimation.cancel();
      }
      this.getWindow()
        ?.getDecorView()
        ?.setSystemUiVisibility(
          android.view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
          android.view.View.SYSTEM_UI_FLAG_FULLSCREEN);
    }
  
    showSystemUI() {
      const size = getVideoSize(false);
      const params = playerContainer.getLayoutParams();
      params.width = size.width;
      params.height = size.height
      playerContainer.setX(size.x);
      playerContainer.setY(AndroidScreen.toPixels(80));
      playerContainer.requestLayout();
      if (mediaSessionConnector) {
        mediaSessionConnector.setPlayer(null);
    }
      this.getWindow()
        ?.getDecorView()
        ?.setSystemUiVisibility(android.view.View.SYSTEM_UI_FLAG_VISIBLE);
        animateVideo(true);
  }
  }
}

export function enterAndroidPipMode() {}

export function createAndroidVideoPlayer() {
  if (!player) {
    if (!mediaSession) {
      mediaSession = new android.support.v4.media.session.MediaSessionCompat(
        activity().getApplicationContext(),
        'NSCapPlayer'
      );
    }
    if (!mediaSessionConnector) {
      mediaSessionConnector = new com.google.android.exoplayer2.ext.mediasession.MediaSessionConnector(
        mediaSession
      );
    }

    mediaSessionConnector.setEnabledPlaybackActions(
      android.support.v4.media.session.PlaybackStateCompat.ACTION_PLAY_PAUSE |
        android.support.v4.media.session.PlaybackStateCompat.ACTION_PLAY |
        android.support.v4.media.session.PlaybackStateCompat.ACTION_PAUSE |
        android.support.v4.media.session.PlaybackStateCompat.ACTION_SEEK_TO |
        android.support.v4.media.session.PlaybackStateCompat
          .ACTION_FAST_FORWARD |
        android.support.v4.media.session.PlaybackStateCompat.ACTION_REWIND |
        android.support.v4.media.session.PlaybackStateCompat.ACTION_STOP
    );

    const builder = new com.google.android.exoplayer2.SimpleExoPlayer.Builder(
      activity().getApplicationContext()
    );

    player = builder.build();

    playerEventListener = new com.google.android.exoplayer2.Player.EventListener(
      {
        onIsPlayingChanged: function (isPlaying) {
          playing = isPlaying;
          if (isPlaying) {
            if (mediaSession) {
              mediaSession.setActive(true);
            }
            animateVideo(true);
          } else {
            if (mediaSession) {
              mediaSession.setActive(false);
            }
            animateVideo(false);
          }
        },
        onLoadingChanged: function (isLoading) {
          console.log('onLoadingChanged', isLoading);
        },
        onPlaybackParametersChanged: function (playbackParameters) {},
        onPlaybackSuppressionReasonChanged: function (
          playbackSuppressionReason
        ) {},
        onPlayerError: function (error) {
          console.log('PlayerError', error);
        },
        onPlayerStateChanged: function (playWhenReady, playbackState) {
          if (playbackState === STATE_READY) {
            playerReady = true;
          } else if (playbackState === STATE_ENDED) {
            playerEnded = true;
          }
        },
        onPositionDiscontinuity: function (reason) {},
        onRepeatModeChanged: function (repeatMode) {},
        onSeekProcessed: function () {},
        onShuffleModeEnabledChanged: function (shuffleModeEnabled) {},
        onTimelineChanged: function (timeline, manifest, reason) {},
        onTracksChanged: function (trackGroups, trackSelections) {},
      }
    );
    player.addListener(playerEventListener);

    playerContainer = new android.widget.LinearLayout(activity());
    playerContainer.setBackgroundColor(android.graphics.Color.BLACK);
    const size = getVideoSize(false);
    playerLayoutParams = new android.view.ViewGroup.LayoutParams(
      size.width,
      size.height
    );
    playerContainer.setLayoutParams(playerLayoutParams);
    playerContainer.setX(size.x);
    playerContainer.setY(AndroidScreen.toPixels(40));
    LAYOUT_ID = android.view.View.generateViewId();
    playerContainer.setId(LAYOUT_ID);
    if (!rootView) {
      rootView = activity().findViewById(android.R.id.content) as any;
    }
    if (rootView) {
      rootView.addView(playerContainer);
      animateVideo(false, true);
    }
    handleFragment();
  }
}

let currentAnimation;
function animateVideo(show: boolean, init?: boolean) {
  if (init) {
    const size = getVideoSize(show);
    const x = android.animation.ObjectAnimator.ofFloat(playerContainer, 'x', [
      playerContainer.getX(),
      size.x,
    ]);
    const y = android.animation.ObjectAnimator.ofFloat(playerContainer, 'y', [
      playerContainer.getY(),
      size.y,
    ]);
    const width = android.animation.ObjectAnimator.ofInt(
      playerContainer,
      'width',
      [0, size.width]
    );
    const height = android.animation.ObjectAnimator.ofInt(
      playerContainer,
      'height',
      [0, size.height]
    );
    const animationSet = new android.animation.AnimatorSet();
    const collections = new java.util.ArrayList();
    collections.add(x);
    collections.add(y);
    collections.add(width);
    collections.add(height);
    animationSet.playTogether(collections);
    const easeIn = new android.view.animation.AccelerateInterpolator(1);
    const easeOut = new android.view.animation.DecelerateInterpolator(1);
    animationSet.setInterpolator(show ? easeIn : easeOut);
    animationSet.setDuration(1000);
    animationSet.addListener(new android.animation.Animator.AnimatorListener({
      onAnimationStart(param0: android.animation.Animator){
        currentAnimation = param0;
      },
      onAnimationEnd(param0: android.animation.Animator){
        currentAnimation = undefined;
      },
      onAnimationCancel(param0: android.animation.Animator){
        currentAnimation = undefined;
      },
      onAnimationRepeat(param0: android.animation.Animator){},
}));
    animationSet.start();
  } else {
    const scale = show ? [1, 1.1] : [1.1, 1];
    const scaleX = android.animation.ObjectAnimator.ofFloat(
      playerContainer,
      'scaleX',
      scale
    );
    const scaleY = android.animation.ObjectAnimator.ofFloat(
      playerContainer,
      'scaleY',
      scale
    );
    const animationSet = new android.animation.AnimatorSet();
    const collections = new java.util.ArrayList();
    collections.add(scaleX);
    collections.add(scaleY);
    animationSet.playTogether(collections);
    const easeIn = new android.view.animation.AccelerateInterpolator(1);
    const easeOut = new android.view.animation.DecelerateInterpolator(1);
    animationSet.setInterpolator(show ? easeIn : easeOut);
    animationSet.setDuration(1000);
    animationSet.addListener(new android.animation.Animator.AnimatorListener({
          onAnimationStart(param0: android.animation.Animator){
            currentAnimation = param0;
          },
					onAnimationEnd(param0: android.animation.Animator){
            currentAnimation = undefined;
          },
					onAnimationCancel(param0: android.animation.Animator){
            currentAnimation = undefined;
          },
					onAnimationRepeat(param0: android.animation.Animator){},
    }));
    animationSet.start();
  }
}

let currentUrl: string;
let autoPlay = true;
let playing = false;
const isPlaying = () => {
  if (!player) {
    return false;
  }
  if (playerReady) {
    return player.getPlayWhenReady();
  }
  return false;
};
function setVideoUrl(value: string) {
  if (currentUrl !== value) {
    currentUrl = value;
    if (player) {
      try {
        player.setMediaItem(
          com.google.android.exoplayer2.MediaItem.fromUri(
            android.net.Uri.parse(value)
          )
        );
        player.prepare();
        if(autoPlay){
          player.setPlayWhenReady(true);
        }
      } catch (e) {
        console.log(e);
      }
    }
  } else {
    playAndroidVideo();
  }
}
export function setAndroidVideoUrl(value: string) {
  /* const intent = new android.content.Intent();
  intent.setAction(PLAYER_ACTIONS);
  intent.putExtra('action', 'set_url');
  intent.putExtra('url', value);
  activity().sendBroadcast(intent);*/
  setVideoUrl(value);
}

function playVideo() {
  if (player) {
    if (playerEnded) {
      player.seekToDefaultPosition();
    } else {
      player.setPlayWhenReady(true);
    }
  }
}
export function playAndroidVideo() {
  playVideo();
}

function pauseVideo() {
  if (player) {
    player.setPlayWhenReady(false);
  }
}
export function pauseAndroidVideo() {
  pauseVideo();
}

export function setAndroidVideoPlayerPosition(
  x: number,
  y: number,
  width?: number,
  height?: number
) {
  if (currentFragment) {
    const view = playerContainer;
    if (view) {
      const size = videoSize();
      if (!playerLayoutParams) {
        playerLayoutParams = new android.view.ViewGroup.LayoutParams(
          size.width,
          size.height
        );
      } else {
        playerLayoutParams.width = AndroidScreen.toPixels(width) || size.width;
        playerLayoutParams.height =
          AndroidScreen.toPixels(height) || size.height;
      }
      view.setLayoutParams(playerLayoutParams);
      view.setX(AndroidScreen.toPixels(x));
      view.setY(AndroidScreen.toPixels(y));
    }
  }
}

export function setAndroidAutoPlay(value: boolean) {
  autoPlay = value;
}

export function toggleAndroidEmbeddedVideoBox(show: boolean) {}

export function destroyAndroidVideoPlayer(){
  animateVideo(false);
  pauseVideo();

  if (mediaSessionConnector) {
      mediaSessionConnector.setPlayer(null);
  }

  cleanUpFragment();
  if (rootView) {
    rootView.removeView(playerContainer);
    animateVideo(false, true);
  }
  if(player){
    player.release();
    player = null;
  }
}

export function hideAndroidVideoPlayer() {
  if (playerContainer) {
    playerContainer.setAlpha(0);
  }
}

export function showAndroidVideoPlayer() {
  playerContainer.setAlpha(1);
}

if (native.isAndroid) {
  setupActivity();
}