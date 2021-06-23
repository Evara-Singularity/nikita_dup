import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { first, tap } from 'rxjs/operators';
import { isPlatformServer } from '@angular/common';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';
import { HttpClient } from '@angular/common/http';


@Injectable({
    providedIn: 'root'
})
export class PopularSearchResolver implements Resolve<any> {

    constructor(
        @Inject(PLATFORM_ID) private platformId,
        private transferState: TransferState,
        private http: HttpClient
    )
    { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        const POPULAR_SEARCH_KEY = makeStateKey<any>('PSST');
        if (this.transferState.hasKey(POPULAR_SEARCH_KEY)) {
            const response = this.transferState.get<any>(POPULAR_SEARCH_KEY, null);
            this.transferState.remove(POPULAR_SEARCH_KEY);
            return of(response);
        }
        else {
            const url = CONSTANTS.NEW_MOGLIX_API + '/cmsApi/getPopularSearchTerms?categories=all';
            return this.http.get(url)
                .pipe(
                    first(),
                    tap(response =>
                    {
                        if (isPlatformServer(this.platformId)) {
                            this.transferState.set(POPULAR_SEARCH_KEY, response);
                        }
                    })
                );
        }
    }
}