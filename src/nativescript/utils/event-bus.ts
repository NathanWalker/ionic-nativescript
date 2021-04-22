import { Subject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

/**
 * Simple rxjs event bus used internally with a public consumable api for ease of use
 * Used to communicate platform api events back/forth from custom native api development to the Capacitor/Ionic app
 */

let eventHandlers: { [key: string]: { callback: () => void; subscription: Subscription; } };
type NativeEventBusTypes = 'pipStarted' | 'pipEnded';
native.eventBusTypes = {
  pipStarted: 'pipStarted',
  pipEnded: 'pipEnded'
}

native.onEvent = (name: NativeEventBusTypes, callback: () => void) => {
  if (!native._eventBus$) {
    native._eventBus$ = new Subject();
  }
  if (!eventHandlers) {
    eventHandlers = {};
  }
  if (!eventHandlers[name]) {
    // note: only supporting one listener per event
    // could expand support for multiple listeners if you wanted
    eventHandlers[name] = {
      callback,
      subscription: native._eventBus$.pipe(
        filter(e => e === name)
      ).subscribe(() => {
        eventHandlers[name].callback();
      })
    };
  }
}

native.removeEvent = (name: NativeEventBusTypes) => {
  if (eventHandlers && eventHandlers[name]) {
    eventHandlers[name].subscription.unsubscribe();
    delete eventHandlers[name];
  }
}