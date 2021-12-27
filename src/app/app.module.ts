import { InjectionToken, NgModule, Optional } from '@angular/core';
import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PLATFORM_ID, APP_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgxWebstorageModule } from 'ngx-webstorage';
import CONSTANTS from './config/constants';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
// import { SpeedTestModule } from 'ng-speed-test';


@NgModule({
  imports: [
    BrowserModule.withServerTransition({ appId: 'ssr-pwa' }),
    BrowserAnimationsModule,
    NoopAnimationsModule,
    AppRoutingModule,
    BrowserTransferStateModule,
    HttpClientModule,
    NgxWebstorageModule.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    // SpeedTestModule,
    // ErrorHandlerModule
  ],
  declarations: [
    AppComponent,
  ],
  providers: [
    {
      provide: CONSTANTS.BROWSER_AGENT_TOKEN,
      useFactory: userAgentFactory,
      deps: [PLATFORM_ID, [new Optional(), REQUEST] ],
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(APP_ID) private appId: string) {
    const platform = isPlatformBrowser(this.platformId) ?
      'in the browser' : 'on the server';
    console.log(`Running ${platform} with appId=${this.appId}`);
  }
}

export function userAgentFactory(platformId, req: Request): string {
  if (isPlatformBrowser(platformId)) {
    return navigator.userAgent.toLowerCase() || null;
  }
  const userAgent = (req['get']('user-agent') || '').toLowerCase();
  return userAgent;
}
