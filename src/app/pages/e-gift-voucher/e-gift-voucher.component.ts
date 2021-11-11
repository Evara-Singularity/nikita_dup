import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import CONSTANTS from '@app/config/constants';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { DataService } from '@app/utils/services/data.service';
import { Step } from '@app/utils/validators/step.validate';
import { LocalStorageService } from 'ngx-webstorage';

@Component({
    selector: 'app-e-gift-voucher',
    templateUrl: './e-gift-voucher.component.html',
    styleUrls: ['./e-gift-voucher.component.scss']
})
export class EGiftVoucherComponent implements OnInit {

    user: any;
    showSuccessPopup = false;
    showListPopup = false;



    data: Object;
    categoryList: any[];
    brandList: any;
    TotalValue=0;
    rfqEnquiryItemsList: any[];
    catListAll: any = [];
    brandListAll: any[] = [];
    userId: any;
    email: any;
    eGiftForm: FormGroup;
    isFormValid: boolean=false;
    button: HTMLButtonElement;
    datalist: HTMLDataListElement;
    select: HTMLSelectElement;
    textContent: string;
    options: HTMLOptionsCollection;
    // eGiftForm: FormGroup;



    constructor(public formBuilder: FormBuilder,
        private fb: FormBuilder,
        private _dataService: DataService,
        private _tms: ToastMessageService,
        private _localStorageService: LocalStorageService,
        @Inject(DOCUMENT) private _document,


    ) {

    }


    ngOnInit() {


        this.user = this._localStorageService.retrieve('user');

        this.eGiftForm = this.fb.group({
            fullName: [this.user.userName, [Validators.required]],
            emailId: ['this.user.email', [Validators.required, Step.validateEmail]],
            phone: [this.user.phone, [Validators.required]],
            company: [''],
            requirements: new FormArray([])
        })


        //call api store it in a variable data 
        this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + '/rfq/getVoucherData').subscribe((res) => {
            if (res['statusCode'] === 200 && res['data']) {
                this.categoryList = [];
                res['data']['categoryList'].forEach(element => {
                    this.categoryList.push(element);
                    this.catListAll.push(element.categoryName);
                });


                for (let i = 0; i < this.catListAll.length; i++) {
                    if (this.categoryList[i].categoryName === this.catListAll[i]) {
                        for (let j = 0; j < this.categoryList[i].brandList.length; j++) {
                            console.log(this.categoryList[i].brandList.length)
                            let popUpObj = {
                                catName: '',
                                braName: '',
                                validity: ''
                            }
                            popUpObj['catName'] = this.categoryList[i].categoryName;
                            popUpObj['braName'] = this.categoryList[i].brandList[j].brandName,
                                popUpObj['validity'] = this.categoryList[i].brandList[j].validity
                            this.brandListAll.push(popUpObj)
                        }
                    }
                }
                this.valueChanged();
            }
        });

        (this.requirements as FormArray).push(this.getRequirements());
         this.autoFill();
    }

    valueChanged() {
        this.requirements.valueChanges.subscribe((changes) => {
            // this.calculator(itemForm)

            if (changes[0].category !== "") {
                this.categoryList.forEach((ele) => {
                    if (ele['categoryName'] === changes[0].category) {
                        this.brandList = ele['brandList'];
                    }
                })
            }
            if (changes[0].value !== "") {
                this.TotalValue = changes[0].quantity * changes[0].value;
            }
        });
    }


    getRequirements() {
        return this.fb.group(
            {
                category: ['',[Validators.required]],
                brand: ['',[Validators.required]],
                value: [''],
                quantity: ['1'],
                totalvalue: ['0'],
            }
        )
    }

    firstName(event) {
        var key;
        key = event.charCode;
        return ((key > 64 &&
            key < 91) || (key > 96 && key < 123) || key == 32 || key == 46);
    }

    checkQuantityCode(event) {
        return event.charCode >= 48 && event.charCode <= 57;
    }

    togglePopUp1() {
        this.showSuccessPopup = !this.showSuccessPopup;
    }

    togglePopUp2() {
        this.showListPopup = !this.showListPopup;
    }

    removeProduct(index) {
        (<FormArray>this.requirements).removeAt(index)
    }

    addProducts() {
        (this.requirements as FormArray).push(this.getRequirements());
    }



    onSubmit(request) {
        if (this.eGiftForm.valid) {
            this.rfqEnquiryItemsList = [];
            request.requirements.forEach(element => {
                this.rfqEnquiryItemsList.push({
                    "categoryName": element.category,
                    "quantity": element.quantity,
                    "brandName": element.brand,
                    "itemValue": element.value,
                    "totalValue": +element.totalValue
                })
            });

            this._dataService.callRestful("POST", CONSTANTS.NEW_MOGLIX_API + '/rfq/createVoucherRfq', {
                body: {
                    "rfqEnquiryCustomer": {
                        "name": request.fullName,
                        "email": request.emailId,
                        "mobile": request.phone,
                        "company": request.company,
                        "userId": this.user.userId || ''
                    },
                    "rfqEnquiryItemsList": this.rfqEnquiryItemsList

                }
            }).subscribe((res) => {
                if (res['statusCode'] == 200) {
                    //after success response 
                    this.showSuccessPopup = true;
                    //reset data
                    this.eGiftForm.reset();
                    this.requirements.value.forEach((e, index) => {
                        (<FormArray>this.requirements).removeAt(index)
                    });
                    (this.requirements as FormArray).push(this.getRequirements());
                    this.autoFill();
                }
                else {
                    this._tms.show({ type: 'error', text: 'Something Went Wrong' });


                }
            });
        }
        else if(!this.requirements.valid && !this.eGiftForm.controls.fullName.valid && !this.eGiftForm.controls.emailId.valid && !this.eGiftForm.controls.phone.valid){
            this.eGiftForm.markAllAsTouched();
            // Object.keys(this.eGiftForm.controls).forEach(field => {
            //     const control = this.eGiftForm.get(field);
            //     control.markAsTouched({ onlySelf: true });
            // });
            this._tms.show({ type: 'error', text: 'Please mention all details and your gift card requirements' });

        }
        else if(this.requirements.valid && !this.eGiftForm.controls.fullName.valid && !this.eGiftForm.controls.emailId.valid && !this.eGiftForm.controls.phone.valid){
            this.eGiftForm.markAllAsTouched();
            this._tms.show({ type: 'error', text: 'Please mention all details' });

        }
        else if(!this.requirements.valid && this.eGiftForm.controls.fullName.valid && this.eGiftForm.controls.emailId.valid && this.eGiftForm.controls.phone.valid){
            this.eGiftForm.markAllAsTouched();
            this._tms.show({ type: 'error', text: 'Please mention your gift card requirements' });

        }
    }


    updateTotatQuantity() {
        // alert("called")
        this.TotalValue = 0;
        this.requirements.value.forEach(element => {
            if (parseInt(element.value) && element.quantity) {
                this.TotalValue += (parseInt(element.value) * parseInt(element.quantity));
            }
        });
    }

    brandClicked() {
        let categorySelected = this.eGiftForm.controls['category'].value;
    }

    getData() {
        this._dataService.callRestful("GET", '').subscribe((data) => {
            this.data = data;
        });
    }

    //getters
    get requirements() { return this.eGiftForm.get('requirements') };


    autoFill() {
        this.eGiftForm.controls['fullName'].setValue(this.user.userName)
        this.eGiftForm.controls['phone'].setValue(this.user.phone)
        this.eGiftForm.controls['emailId'].setValue(this.user.email)
    }
}
