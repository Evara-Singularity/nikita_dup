import { SharedAuthService } from '../../modules/shared-auth-v1/shared-auth.service';
import { Router } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'auth',
    templateUrl: './auth-popup.component.html',
    styleUrls: ['./auth-popup.component.scss']
})
export class AuthPopUpComponent implements OnInit
{
    // @Input() flow : string;

    flow = "login"
    isCheckout = false;
    constructor(private _router:Router, private _sharedAuthService:SharedAuthService) { }

    ngOnInit(): void
    {
        // alert('flow'+this.flow)
        this.flow = this.removeQueryParams(this._router.url).split("/")[1];
    }

    removeQueryParams(url){
        return url.split("?")[0];
    }
}
