import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
    selector: 'shared-forgot-password',
    templateUrl: './shared-forgot-password.component.html',
    styleUrls: ['./shared-forgot-password.component.scss']
})
export class SharedForgotPasswordComponent implements OnInit
{

    isSubmitted = false;
    fpForm = new FormGroup({
        name: new FormControl("")
    })


    constructor() { }

    ngOnInit(): void
    {
    }


    get name() { return this.fpForm.get("name")}

}
