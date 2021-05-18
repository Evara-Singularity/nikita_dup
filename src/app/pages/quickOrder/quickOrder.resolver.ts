import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { Resolve, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { map } from 'rxjs/operators/map';
import { mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { CommonService } from '../../utils/services/common.service';
import { DataService } from '../../utils/services/data.service';
import { LocalAuthService } from '../../utils/services/auth.service';
import { CartService } from '../../utils/services/cart.service';

@Injectable()
export class QuickOrderResolver implements Resolve<any> {
    isServer: boolean;
    isBrowser: boolean;

    constructor(
        private _router: Router,
        private _cartService: CartService,
        private _localAuthService: LocalAuthService,
        private _commonService: CommonService,
        @Inject(PLATFORM_ID) platformId,
        private _dataService: DataService) {

        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
    }

    resolve(route: ActivatedRouteSnapshot, rstate: RouterStateSnapshot): Observable<any> {

        if (this.isBrowser) {
            return this._commonService.getSession()
                .pipe(
                    map((res) => res),
                    mergeMap((gs) => {
                        this._localAuthService.setUserSession(gs);
                        let params = { "sessionid": gs["sessionId"] };
                        return this._cartService.getCartBySession(params)
                            .pipe(
                                map((cs) => {
                                    return cs;
                                })
                            )
                    })
                )
        } else {
            return of(null);
        }

    }
}

