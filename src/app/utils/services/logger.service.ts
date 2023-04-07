import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { environment } from 'environments/environment';
import { ServerLogSchema } from '../models/log.modal';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  isServer: boolean = false;
  isBrowser: boolean = false;
  private productionLogURL = environment.LOG_FILE_PATH;
  /**
   * In QA enviroment container logs file will be created in productionLogURL
   * & in local SSR build logs will created in dist/ 
   */
  PATH_TO_LOG_FOLDER: string = this.productionLogURL ? `${this.productionLogURL}apiServerLog.log` : ('./apiServerLog.log');

  constructor(
    @Inject(PLATFORM_ID) platformId,
    @Optional() @Inject(CONSTANTS.LOG_TOKEN_MAIN) private logToken: string,
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
  
  apiServerLog(data: ServerLogSchema, logNameIdentifier?) {
    if (this.isServer) {
      data.logId = this.logToken;
      data.startDateTimeV2 = new Date(data.startDateTime).toLocaleString('en-GB');
      data.endDateTimev2 = new Date(data.endDateTime).toLocaleString('en-GB');
      data.apiRequestTime = data.endDateTime - data.startDateTime;
      // console.log(logName, data);
      // const fs = require("fs");
      // const fileLine = (logNameIdentifier) ? `${logNameIdentifier} :: ${JSON.stringify(data)}\n` : `${JSON.stringify(data)}\n`;
      // fs.appendFile(this.PATH_TO_LOG_FOLDER, fileLine, function (err) {
      //   if (err) {
      //     console.log('apiServerLog', err);
      //     // console.log(err);
      //   }
      // });
    } else {
      // console.log("logger service is called")
      // this.isLoggingEnabled && console.log(data);
    }
  }

  // private get isLoggingEnabled() { return this.isBrowser && environment.logger }

}
