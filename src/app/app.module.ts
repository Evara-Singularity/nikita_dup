import { NgModule } from '@angular/core';
import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PLATFORM_ID, APP_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import CONSTANTS from './config/constants';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { ErrorHandlerModule } from './utils/interceptors/error-handler.module';

const config: SocketIoConfig = { url: CONSTANTS.SOCKET_URL, options: {} };
@NgModule({
  imports: [
    BrowserModule.withServerTransition({ appId: 'ssr-pwa' }),
    BrowserAnimationsModule,
    NoopAnimationsModule,
    AppRoutingModule,
    BrowserTransferStateModule,
    HttpClientModule,
    NgxWebstorageModule.forRoot(),
    SocketIoModule.forRoot(config),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    // ErrorHandlerModule
  ],
  declarations: [
    AppComponent,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(APP_ID) private appId: string) {
    const platform = isPlatformBrowser(platformId) ?
      'in the browser' : 'on the server';
    console.log(`Running ${platform} with appId=${appId}`);
  }
}
