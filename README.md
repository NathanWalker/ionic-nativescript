## ngConf 2021 Angular Ionic app built with Capacitor + NativeScript

This example app demonstrates the following:

* How to use NativeScript with Angular Ionic apps in Capacitor
* Native iOS/Android UI with Web Dom interactions
* How to build a native video streaming player yourself with NativeScript inside of Capacitor
* How to handle battery level notices for iOS and Android using NativeScript inside of Capacitor

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
