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

const config: SocketIoConfig = { url: CONSTANTS.SOCKET_URL_, options: {} };
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
