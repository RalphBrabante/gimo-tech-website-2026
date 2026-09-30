import 'zone.js/node';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { APP_INITIALIZER, TransferState } from '@angular/core';
import { AppComponent, HOME_SNAPSHOT, HomeSnapshot } from './app/app.component';
import { appConfig } from './app/app.config';

export default function render(document: string, url: string, snapshot: HomeSnapshot): Promise<string> {
  return renderApplication((context) => bootstrapApplication(AppComponent, {
    providers: [...appConfig.providers, provideServerRendering(),
      // Each request has its own injector and transfer state; never share customer state.
      { provide: APP_INITIALIZER, multi: true, deps: [TransferState], useFactory: (state: TransferState) => () => state.set(HOME_SNAPSHOT, snapshot) }
    ]
  }, context), { document, url });
}
