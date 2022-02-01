import { SharedAuthService } from './../../modules/shared-auth-v1/shared-auth.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit
{
    flow = "login"
    isCheckout = false;
    constructor(private _router:Router, private _sharedAuthService:SharedAuthService) { }

    ngOnInit(): void
    {
        this.flow = this.removeQueryParams(this._router.url).split("/")[1];
    }

    removeQueryParams(url){
        return url.split("?")[0];
    }
}
