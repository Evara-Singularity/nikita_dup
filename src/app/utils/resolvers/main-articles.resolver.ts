import { isPlatformServer } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { environment } from 'environments/environment';
import { forkJoin, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { DataService } from './../services/data.service';

@Injectable()
export class MainArticlesResolver implements Resolve<any> {

    constructor(
        @Inject(PLATFORM_ID) private platformId,
        private transferState: TransferState,
        private _dataService: DataService
    ) { }

    resolve(_activatedRouteSnapshot: ActivatedRouteSnapshot, state: RouterStateSnapshot)
    {
        const MAIN_ARTICLES_KEY = makeStateKey<object>('main-articles');
        if (this.transferState.hasKey(MAIN_ARTICLES_KEY)) {
            const MAIN_ARTICLES_DATA = this.transferState.get<object>(MAIN_ARTICLES_KEY, {});
            this.transferState.remove(MAIN_ARTICLES_KEY);
            return of([MAIN_ARTICLES_DATA])
        }
        const MAIN_ARTICLES_URL = `${environment.BASE_URL}/cmsApi/getArticlesListByCategory?categoryCode=all&pageNumber=0&pageSize=10`;
        const REQUEST_ARRAY = [this._dataService.callRestful("GET", MAIN_ARTICLES_URL)];
        return forkJoin(REQUEST_ARRAY).pipe(
            catchError((err) => { return of(err); }),
            tap(result =>
            {
                if (isPlatformServer(this.platformId)) {
                    this.transferState.set(MAIN_ARTICLES_KEY, result[0] || {});
                }
            })
        )
    }
}




