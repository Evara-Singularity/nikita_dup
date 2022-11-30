import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from 'environments/environment';
import { ServerLogSchema } from '../models/log.modal';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  isServer: boolean = false;
  isBrowser: boolean = false;
  private productionLogURL = "/var/log/moglix/online/pwa/";
  /**
   * In QA enviroment container logs file will be created in productionLogURL
   * & in local SSR build logs will created in dist/ 
   */
  PATH_TO_LOG_FOLDER: string = environment.enableServerLogs ? `${this.productionLogURL}apiServerLog.log`: ('./apiServerLog.log');

  constructor(
    @Inject(PLATFORM_ID) platformId,
  ) {
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  info(...args) {
    // this.isLoggingEnabled && console.info(...args);
  }

  debug(...args) {
    // this.isLoggingEnabled && console.debug(...args);
  }

  error(...args) {
    // this.isLoggingEnabled && console.error(...args);
  }

  apiResolverLog(data: ServerLogSchema) {

    if (this.isServer) {
      data.startDateTimeV2 = new Date(data.startDateTime).toLocaleString('en-GB'),
      data.endDateTimev2 = new Date(data.endDateTime).toLocaleString('en-GB'),
      data.apiRequestTime = data.endDateTime - data.startDateTime;
      console.log('apiResolverLog', JSON.stringify(data));
      // fs.appendFile(this.PATH_TO_LOG_FOLDER, JSON.stringify(data), function (err) {
      //   if (err) {
      //     console.log('apiServerLog', err);
      //     // console.log(err);
      //   }
      // });
    } else {
      // console.log("logger service is called")
      // console.log(data);
    }
  }

  apiServerLog(data: ServerLogSchema) {

    if (this.isServer) {
      data.startDateTimeV2 = new Date(data.startDateTime).toLocaleString('en-GB'),
      data.endDateTimev2 = new Date(data.endDateTime).toLocaleString('en-GB'),
      data.apiRequestTime = data.endDateTime - data.startDateTime;
      console.log('apiServerLog', JSON.stringify(data));
      // fs.appendFile(this.PATH_TO_LOG_FOLDER, JSON.stringify(data), function (err) {
      //   if (err) {
      //     console.log('apiServerLog', err);
      //     // console.log(err);
      //   }
      // });
    } else {
      // console.log("logger service is called")
      // console.log(data);
    }
  }

  // private get isLoggingEnabled() { return this.isBrowser && environment.logger }

}
