import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'success',
    templateUrl: './success.component.html',
    styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit
{
    message = ""
    constructor(private _router: Router, private _route: ActivatedRoute) { }
    ngOnInit(): void
    {
        const STATUS:string = (this._route.snapshot.paramMap.get('status') as string)
        if (STATUS === "success"){
            this.message = 'Thank you for submitting your feedback!';
        }
        else if (STATUS === "submitted") {
            this.message = 'Your feedback has already been submitted.';
        }else{
            this.navigateTo();
        }
    }
    navigateTo() { this._router.navigate(['/']) }
}
