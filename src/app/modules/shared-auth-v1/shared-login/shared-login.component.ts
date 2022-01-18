import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
    selector: 'shared-login',
    templateUrl: './shared-login.component.html',
    styleUrls: ['./shared-login.component.scss']
})
export class SharedLoginComponent implements OnInit
{

    loginForm = new FormGroup({ username: new FormControl("") })

    constructor() { }

    ngOnInit(): void
    {
    }

    get username() { return this.loginForm.get("username");}

}
