import { CommonService } from '@app/utils/services/common.service';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class LoggerService
{
    constructor(private _commonService: CommonService) { }

    info(...args)
    {
        if (!this.isConsoleEnabled) return;
        console.info(...args);
    }

    debug(...args)
    {
        if (!this.isConsoleEnabled) return;
        console.debug(...args);
    }

    log(...args)
    {
        if (!this.isConsoleEnabled) return;
        console.log(...args);
    }

    table(...args)
    {
        if (!this.isConsoleEnabled) return;
        console.table(...args);
    }

    group(...args)
    {
        if (!this.isConsoleEnabled) return;
        console.group(...args);
    }

    private get isConsoleEnabled() { return environment.logger }
}
