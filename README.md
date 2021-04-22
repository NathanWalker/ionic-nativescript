## ngConf 2021 Angular Ionic app built with Capacitor + NativeScript

This example app demonstrates the following:

* How to use NativeScript with Angular Ionic apps in Capacitor
* Native iOS/Android UI with Web Dom interactions
* How to build a native video streaming player yourself with NativeScript for Capacitor
* How to handle battery level notices for iOS and Android using NativeScript for Capacitor

The Musical video clips used herein are only samples from recorded musical productions for free fairplay use and not intended to be high quality reproductions of those musicals in anyway.

## Take it for a spin

Run this after cloning:

```
npm run clean
```

NOTE: If you get prompted about installing `webpack` you can choose 'y'. This may prompt when using npm 7+.

It will set things up.

Now build it and prepare:

```
npm run build:mobile
npx cap sync
```

You can now run on either iOS or Android:

```
npx cap open ios
// or...
npx cap open android
```

## Troubleshooting 

### Android

1. If you see a build/run issue related to 'node', for example like this:

```
> Task :capacitor-android:compileDebugLibraryResources
> Task :app:runSbg FAILED
Error executing Static Binding Generator: java.io.IOException: Cannot run program "node": error=2, No such file or directory
```

This means Android Studio could not find node. Close and open Android Studio via Terminal as follows which will help:

```
open -a "Android Studio"
```

2. If you see an issue like this in the build log:

```
Caused by: java.lang.ClassNotFoundException: Didn't find class "io.nstudio.ngconf2021.CustomActivity" on path: DexPathList
```

This usually means a good project clean is needed. Try doing a full 'Project Clean' in Android Studio and build/run. If you still see the issue, try running once more - usually related to a clean/build cycle with Android Studio.

### iOS

Picture-in-Picture mode works only on a real device. You can plug an iPhone in and launch on your phone from Xcode to experience the PIP mode.

