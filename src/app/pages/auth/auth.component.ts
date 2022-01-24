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
    constructor(private _router:Router) { }
    ngOnInit(): void
    {
        this.flow = this._router.url.split("/")[1];
    }
}
