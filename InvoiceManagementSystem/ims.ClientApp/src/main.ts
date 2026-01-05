import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Disable noisy console output in production-like builds; flip to false for debugging sessions.
const suppressVerboseConsole = true;
if (suppressVerboseConsole) {
  const noop = () => {};
  console.log = noop;
  console.debug = noop;
  console.info = noop;
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
