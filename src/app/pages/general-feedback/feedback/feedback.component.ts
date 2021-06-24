import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { DataService } from "@app/utils/services/data.service";
import { FooterService } from '@app/utils/services/footer.service';
import { CommonService } from '@app/utils/services/common.service';
@Component({
    selector: 'feedback',
    templateUrl: './feedback.component.html',
    styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit, AfterViewInit
{
    readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
    imageURL = this.imagePath + "assets/img/home_card.webp";
    readonly URL = CONSTANTS.NEW_MOGLIX_API + '/order/pushEventFeedback';
    readonly CANCEL_REASONS = {
        Purchased: 'Purchased from somewhere else',
        delivery: 'Delivery took longer than expected',
        duplicate: 'Duplicate order',
        cod: 'COD order amount not ready',
        previous: 'Previous bad experience with Moglix'
    };
    readonly REASONS = Object.keys(this.CANCEL_REASONS);
    isOthersSelected = false;
    isSubmitted = false;
    comments = "";
    orderInfo = {};
    infoForm = new FormGroup({
        orderId: new FormControl("", [Validators.required]), itemId: new FormControl("", [Validators.required]),
        customerId: new FormControl("", [Validators.required])
    })
    cancelOrder = new FormGroup({ key: new FormControl("Did you cancel the order"), value: new FormControl("", [Validators.required]) })
    deliveryAttempted = new FormGroup({ key: new FormControl("Was the delivery attempted"), value: new FormControl("") })
    executiveCall = new FormGroup({ key: new FormControl("Did the delivery executive call you"), value: new FormControl("") })
    cancelReasons = new FormGroup(
        {
            key: new FormControl("Why did you cancel"),
            value: new FormControl([], [Validators.required]),
            Others: new FormControl("")
        })
    OtherDetails = new FormGroup({ key: new FormControl("Any other details you would like to share with us"), value: new FormControl("") })
    formArray = new FormArray([this.cancelOrder, this.deliveryAttempted, this.executiveCall, this.cancelReasons, this.OtherDetails]);

    constructor(public footerService: FooterService, private tms: ToastMessageService, private _router: Router, private _activatedRoute: ActivatedRoute, private _dataService: DataService,
        private _commonService: CommonService)
    {

    }


    ngOnInit(): void
    {
        this._activatedRoute.data.subscribe(resolverData =>
        {
            this.initiallizeData(resolverData['feedback']);
        });
        this.footerService.setFooterObj({ footerData: false });
        this.footerService.footerChangeSubject.next(this.footerService.getFooterObj());
    }

    ngAfterViewInit(): void
    {
        
    }

    initiallizeData(response)
    {
        this.orderInfo = response['data'];
        this.infoForm.get('orderId').setValue(this.orderInfo['orderId']);
        this.infoForm.get('itemId').setValue(this.orderInfo['itemId']);
        this.infoForm.get('customerId').setValue(this.orderInfo['customerId']);
        if (this.orderInfo['itemImage']) {
            this.imageURL = this.orderInfo['itemImage'];
        }
    }

    manageCancelReason(value: string)
    {
        const formControl = (this.cancelReasons.get('value') as FormControl);
        const formValue = (formControl.value as string[]);
        const valueIndex = (formValue as string[]).indexOf(value);
        (valueIndex < 0) ? formValue.push(value) : formValue.splice(valueIndex, 1);
        formControl.setValue(formValue);
    }

    manageOthers($event)
    {
        this.isOthersSelected = $event.target.checked;
        const othersControl = (this.cancelReasons.get('Others') as FormControl);
        const valueControl = (this.cancelReasons.get('value') as FormControl);
        if (this.isOthersSelected){
            othersControl.setValidators([Validators.required]);
            valueControl.clearValidators();
        }else{
            valueControl.setValidators([Validators.required]);
            othersControl.clearValidators();
        }
        othersControl.setValue("");
        valueControl.updateValueAndValidity();
        othersControl.updateValueAndValidity();
    }

    submitFeedback()
    {
        this.isSubmitted = true;
        let request = this.infoForm.value;
        request['feedback'] = JSON.stringify(Object.values(this.formArray.value));
        if (this.formArray.valid) {
            this._commonService.showLoader = true;
            this._dataService.callRestful("POST", this.URL, { body: request }).subscribe(
                (response) =>
                {
                    if (response['responseCode'] === 200) {
                        this._router.navigate(['feedback/status/success']);
                    } else {
                        this.isSubmitted = false;
                        if ((response["responseMessage"] as string).includes('Feedback already received')) {
                            this._router.navigate(['feedback/status/submitted']);
                        }else{
                            this.tms.show({ type: "error", text: response["responseMessage"] });
                        }
                    }
                    this._commonService.showLoader = false;
                },
                (error) => { this.isSubmitted = false; this._commonService.showLoader = false; });
        }
    }
}
