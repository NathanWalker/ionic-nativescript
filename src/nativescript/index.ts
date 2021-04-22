// init - keep here.
import '@nativescript/capacitor/bridge';

/**
 *      ****       ****
 *      ******     ****
 *      ********   ****
 *    ****** ***** ******  NativeScript
 *      ****   ********
 *      ****     ******
 *      ****       ****
 *
 *    🧠  Learn more:  👉  https://capacitor.nativescript.org/getting-started.html
 */

// Example A: direct native calls
const hello = `👋 🎉 ~ NativeScript Team`;
if (native.isAndroid) {
  console.log(new java.lang.String(`Hello Android ${hello}`));
} else {
  console.log(NSString.alloc().initWithString(`Hello iOS ${hello}`));
}

// general utilities
import './utils';

// custom video streaming player
import './streaming-video';

// battery level
import './battery-level';
