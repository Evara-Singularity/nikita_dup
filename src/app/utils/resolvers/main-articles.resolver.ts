import { isPlatformServer } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ENDPOINTS } from '@app/config/endpoints';
import { environment } from 'environments/environment';
import { forkJoin, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { DataService } from './../services/data.service';

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
            const MAIN_ARTICLES_DATA = this.transferState.get<object>(MAIN_ARTICLES_KEY, null);
            this.transferState.remove(MAIN_ARTICLES_KEY);
            return of([MAIN_ARTICLES_DATA])
        }
        const name = (_activatedRouteSnapshot.params['name'] as string).trim();
        const MAIN_ARTICLES_URL = `${environment.BASE_URL}${ENDPOINTS.GET_LAYOUT}${name}`;
        //10766:please add urls in future
        const REQUEST_ARRAY = [this._dataService.callRestful("GET", MAIN_ARTICLES_URL)];
        return forkJoin(REQUEST_ARRAY).pipe(
            catchError((err) => { return of(err); }),
            tap(result =>
            {
                if (isPlatformServer(this.platformId)) {
                    this.transferState.set(MAIN_ARTICLES_KEY, result[0] || null);
                }
            })
        )
    }
}