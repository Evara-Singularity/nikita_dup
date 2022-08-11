import { CommonService } from '@app/utils/services/common.service';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from 'environments/environment';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { ServerLogSchema } from '../models/log.modal';
import * as fs from "fs";

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  isServer: boolean = false;
  isBrowser: boolean = false;
  PATH_TO_LOG_FOLDER: string = './logs/log.txt';

  constructor(
    @Inject(PLATFORM_ID) platformId,
  ) {
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  info(...args) {
    this.isLoggingEnabled && console.info(...args);
  }

  debug(...args) {
    this.isLoggingEnabled && console.debug(...args);
  }

  error(...args) {
    this.isLoggingEnabled && console.error(...args);
  }

  apiServerLog(data: ServerLogSchema) {
    if (this.isServer) {
      fs.appendFile(this.PATH_TO_LOG_FOLDER, JSON.stringify(data), function (err) {
        if (err) {
          console.log('apiServerLog', err);
          // console.log(err);
        }
      });
    } else {
      this.isLoggingEnabled && console.log(data);
    }
  }

  private get isLoggingEnabled() { return this.isBrowser && environment.logger }

}
