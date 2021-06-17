import { isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';


@Injectable({
    providedIn: 'root'
})
export class GeneralFeedbackResolver implements Resolve<any> {

    constructor(
        @Inject(PLATFORM_ID) private platformId,
        private transferState: TransferState,
        private http: HttpClient
    )
    { }

    resolve(_activatedRouteSnapshot: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        console.log(_activatedRouteSnapshot.params['itemid'])
        const ORDER_ID = _activatedRouteSnapshot.params['itemid'];
        const GENERAL_FEEDBACK_KEY = makeStateKey<any>('GFDST');
        if (this.transferState.hasKey(GENERAL_FEEDBACK_KEY)) {
            const response = this.transferState.get<any>(GENERAL_FEEDBACK_KEY, null);
            this.transferState.remove(GENERAL_FEEDBACK_KEY);
            return of(response);
        }
        else {
            return of([]);
            // const url = CONSTANTS.NEW_MOGLIX_API + '/cmsApi/getPopularSearchTerms?categories=all';
            // return this.http.get(url)
            //     .pipe(
            //         catchError((err) => { return of(err); }),
            //         tap(response =>
            //         {
            //             if (isPlatformServer(this.platformId)) {
            //                 this.transferState.set(GENERAL_FEEDBACK_KEY, response);
            //             }
            //         })
            //     );
        }
    }
}