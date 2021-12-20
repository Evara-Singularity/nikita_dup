import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { CommonService } from '../../utils/services/common.service';
import { LocalAuthService } from '../../utils/services/auth.service';
import { CartService } from '../../utils/services/cart.service';

@Injectable()
export class QuickOrderResolver implements Resolve<object> {
    isServer: boolean;
    isBrowser: boolean;

    constructor(
        private _cartService: CartService,
        private _localAuthService: LocalAuthService,
        private _commonService: CommonService,
        ) {

        this.isServer = _commonService.isServer;
        this.isBrowser = _commonService.isBrowser;
    }

    resolve(route: ActivatedRouteSnapshot, rstate: RouterStateSnapshot): Observable<object> {

        if (this.isBrowser) {
            return this._commonService.getSession().pipe(
                mergeMap(gs => {
                    this._localAuthService.setUserSession(gs);
                    let params = { "sessionid": gs["sessionId"] };
                    return this._cartService.getCartBySession(params)
                })
            );
        } else {
            return of(null);
        }

    }
}

