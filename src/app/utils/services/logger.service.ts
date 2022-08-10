import { CommonService } from '@app/utils/services/common.service';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from 'environments/environment';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class LoggerService {

    isServer: boolean = false;
    isBrowser: boolean = false;

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

    apiLogs(url: string, data: any, method: string, status: number, response: any) {
        this.isServer && this.writeLog(`${method} ${url} ${status} ${JSON.stringify(data)} ${JSON.stringify(response)}`);
    }

    writeLog(message: string) {
        
    }

    private get isLoggingEnabled() { return this.isBrowser && environment.logger }

}
