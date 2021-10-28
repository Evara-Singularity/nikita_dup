import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
    TotalValue: any;
    rfqEnquiryItemsList: any[];
    brandListAll: [];
    userId: any;
    email: any;
    eGiftForm: FormGroup;
    // eGiftForm: FormGroup;


    constructor(public formBuilder: FormBuilder,
        private fb: FormBuilder,
        private _dataService: DataService,
        private _tms: ToastMessageService,
        private _localStorageService: LocalStorageService,

        ) {

    }


    ngOnInit() {


        this.user = this._localStorageService.retrieve('user');
<<<<<<< Updated upstream
        // alert(JSON.stringify(this.user,null,2))
        // alert(JSON.stringify(this.user.email,null,2))
        // alert(JSON.stringify(this.user.userName,null,2))
=======
>>>>>>> Stashed changes

        this.eGiftForm = this.fb.group({
            fullName: [this.user.userName, [Validators.required]],
            emailId: [this.user.email, [Validators.required, Step.validateEmail]],
            phone: [this.user.phone, [Validators.required]],
            company: [''],
            requirements: new FormArray([])
        })


        //call api store it in a variable data 
        this._dataService.callRestful("GET", 'https://nodeapiqa.moglilabs.com/nodeApi/v1/rfq/getVoucherData').subscribe((res) => {
             alert(JSON.stringify(res));
            if (res['statusCode'] === 200 && res['data']) {
                this.categoryList = [];
                res['data']['categoryList'].forEach(element => {
                    this.categoryList.push(element)
                });

                this.valueChanged();

            }
        });

        (this.requirements as FormArray).push(this.getRequirements());

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
                category: [''],
                brand: [''],
                value: [''],
                quantity: ['1'],
                totalvalue: [''],
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
                    "brandName": element.category,
                    "itemValue": element.value,
                    "totalValue": +element.totalValue
                })
            });

            this._dataService.callRestful("POST", 'https://nodeapiqa.moglilabs.com/nodeApi/v1/rfq/createVoucherRfq', {
                body: {
                    "rfqEnquiryCustomer": {
                        "name": request.fullName,
                        "email": request.emailId,
                        "mobile": request.phone,
                        "company": request.company,
                        "userId": "23211"
                    },
                    "rfqEnquiryItemsList": this.rfqEnquiryItemsList

                }
            }).subscribe((res) => {
                if (res['statusCode'] == 200) {
                    //after success response 
                    this.showSuccessPopup = true;
                    //reset data
                    this.eGiftForm.reset();
                    (formArray: FormArray) => {
                        formArray = this.formBuilder.array([]);
                      }
                      this.autoFill();
                }
                else {
                    this._tms.show({ type: 'error', text: 'Something Went Wrong' });


                }
            });
        }
        else {
             this.eGiftForm.markAllAsTouched();
            // Object.keys(this.eGiftForm.controls).forEach(field => {
            //     const control = this.eGiftForm.get(field);
            //     control.markAsTouched({ onlySelf: true });
            // });
            this._tms.show({ type: 'error', text: 'Please mention all details' });

        }
    }


    updateTotatQuantity() {
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
