import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '@app/utils/services/common.service';
import { FooterService } from '@app/utils/services/footer.service';

@Component({
    selector: 'app-general-feedback',
    templateUrl: './general-feedback.component.html',
    styleUrls: ['./general-feedback.component.scss']
})
export class GeneralFeedbackComponent implements OnInit
{
    readonly CANCEL_REASONS = [
        'Purchased from somewhere else.',
        'Delivery took longer than expected.',
        'Duplicate order.',
        'COD order amount not ready.',
        'Previous bad experience with Moglix.'
    ];

    infoForm = new FormGroup({
        orderId: new FormControl("", [Validators.required]),
        itemId: new FormControl("", [Validators.required])
    })

    canelOrder = new FormGroup({
        key: new FormControl("Did you cancel the order"),
        value: new FormControl("", [Validators.required])
    })

    deliveryAttempted = new FormGroup({
        key: new FormControl("Was the delivery attempted"),
        value: new FormControl("")
    })

    executiveCall = new FormGroup({
        key: new FormControl("Did the delivery executive call you"),
        value: new FormControl("")
    })

    formArray = new FormArray([this.canelOrder, this.deliveryAttempted, this.executiveCall])

    listOfFormGroups = [this.canelOrder, this.deliveryAttempted, this.executiveCall];


    constructor(private footerService: FooterService, private _router: Router, private _activatedRoute: ActivatedRoute, private _commonService: CommonService) { }

    ngOnInit(): void
    {
        this._activatedRoute.data.subscribe(resolverData =>
        {
            this.initiallizeData(resolverData['feedback']);
        });
    }

    initiallizeData(response)
    {
        console.log(this.formArray.value);
    }


    submitFeedback()
    {
        console.log(this.canelOrder.value);
        console.log(this.deliveryAttempted.value);
        console.log(this.executiveCall.value);
    }
}
