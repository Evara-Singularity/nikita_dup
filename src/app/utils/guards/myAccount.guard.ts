import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { Router } from '@angular/router';
import { GLOBAL_CONSTANT } from '@app/config/global.constant';
import { CommonService } from '../services/common.service';
@Injectable()
export class MyAccountGuard implements CanActivate {

    private isServer: boolean;
    private isBrowser: boolean;
    constructor(private localStorageService: LocalStorageService, private router: Router, public _commonService: CommonService) {
        this.isServer = _commonService.isServer;
        this.isBrowser = _commonService.isBrowser;
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        // if (this.isServer || GLOBAL_CONSTANT.pageOnWhichBharatPaySupported.includes(window.location.pathname)) {
        //     return true;
        // }

        if (this.localStorageService.retrieve('user')) {
            const user = this.localStorageService.retrieve('user');
            if (user.authenticated === 'false') {
                this.router.navigateByUrl('/login');
                return false;
            }
            if (user.authenticated === 'true') {
                return true;
            } else {
                this.router.navigateByUrl('/login');
                return false;
            }
        } else {
            this.router.navigateByUrl('/login');
            return false;
        }
    }
}
