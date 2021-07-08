import { Injectable, Injector } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { trackData } from '../clickStream';
import { Socket } from 'ngx-socket-io';

declare var dataLayer;
declare var digitalData;
declare var _satellite;

@Injectable({
  providedIn: 'root'
})
export class GlobalAnalyticsService {

  socket: any;
  isServer: boolean = typeof window !== "undefined" ? false : true;

  constructor(
    private injector: Injector,
    private localStorageService: LocalStorageService
  ) {
    if (!this.isServer) {
      this.socket = <Socket>this.injector.get(Socket);
    }
  }

  sendAdobeCall(data: any, trackingname = "genericPageLoad") {
    digitalData = Object.assign({}, data);
    _satellite.track(trackingname);
  }

  sendGTMCall(data: any) {
    dataLayer.push(data);
  }

  sendToClicstreamViaSocket(data) {
    if (navigator && navigator.userAgent.indexOf("Googlebot") === -1) {
      const user = this.localStorageService.retrieve('user');
      const previousUrl = localStorage.getItem("previousUrl");
      var trackingData = {
        message: (data.message) ? data.message : "tracking",
        session_id: user ? user.sessionId : null,
        cookie: "",
        user_id: user ? user.userId : null,
        url: document.location.href,
        device: "Mobile",
        ip_address: null,
        user_agent: navigator.userAgent,
        timestamp: new Date().getTime(),
        referrer: document.referrer,
        previous_url:( previousUrl &&  previousUrl.split("$$$").length >= 2) ? localStorage.getItem("previousUrl").split("$$$")[1] : ""
      }
      this.socket.emit("track", { ...trackingData, ...data });
    }
  }

  sendToClicstreamViaAPI(data) {
    trackData(data);
  }

}
