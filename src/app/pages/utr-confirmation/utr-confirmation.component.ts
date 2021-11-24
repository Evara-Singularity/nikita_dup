import { DataService } from './../../utils/services/data.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'utr-confirmation',
    templateUrl: './utr-confirmation.component.html',
    styleUrls: ['./utr-confirmation.component.scss']
})
export class UTRConfirmationComponent implements OnInit
{

    orderId = null;
    utrForm:FormGroup = null;

    constructor(private _router: Router,private _route: ActivatedRoute, private _dataService: DataService) { }

    ngOnInit()
    {   
        this.orderId = this._route.snapshot.params['orderId'];
        if(!this.orderId){
            this._router.navigate['**'];
            return;
        }
        this.utrForm = this.createUTRForm();
    }

    createUTRForm()
    {
        return new FormGroup({
            amount:new FormControl("", [Validators.required]),
            utrNo: new FormControl("", [Validators.required])
        })
    }

    submitUTRForm(utr)
    {
        //TODO:Integrate with backend api
    }
}
