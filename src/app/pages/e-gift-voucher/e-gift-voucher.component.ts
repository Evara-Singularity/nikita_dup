import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import CONSTANTS from '@app/config/constants';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { DataService } from '@app/utils/services/data.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { Step } from '@app/utils/validators/step.validate';
import { LocalStorageService } from 'ngx-webstorage';

@Component({
    selector: 'app-e-gift-voucher',
    templateUrl: './e-gift-voucher.component.html',
    styleUrls: ['./e-gift-voucher.component.scss']
})
export class EGiftVoucherComponent implements OnInit, AfterViewInit
{
    user: any;
    showSuccessPopup = false;
    showListPopup = false;
    data: Object;
    categoryList: any[];
    brandList: any;
    totalValue: any = "00";
    rfqEnquiryItemsList: any[];
    catListAll: any = [];
    brandListAll: any[] = [];
    userId: any;
    email: any;
    eGiftForm: FormGroup;
    //10766
    readonly PRICE_VALUES = [500, 1000, 2000, 5000, 10000];
    categoryBrandInfo: any = null;
    categories: any[] = [];
    brands: any[] = [];


    constructor(
        private fb: FormBuilder,
        private _dataService: DataService,
        private _tms: ToastMessageService,
        private _localStorageService: LocalStorageService,
        private globalLoader: GlobalLoaderService,

    ) { }

    ngOnInit()
    {
        this.fetchVoucherData();
        this.eGiftForm = this.fb.group({
            fullName: ["", [Validators.required]],
            emailId: ["", [Validators.required, Step.validateEmail]],
            phone: ["", [Validators.required]],
            company: [''],
            requirements: new FormArray([])
        });
        this.addRequirementForm();
    }

    ngAfterViewInit(): void
    {
        this.user = this._localStorageService.retrieve('user');
        this.updateUserDetails(this.user);
    }

    fetchVoucherData()
    {
        this.globalLoader.setLoaderState(true);
        this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + '/rfq/getVoucherData').subscribe(
            (response) => 
            {
                if (!response['status']) { return; }
                const LIST: any[] = (response['data']['categoryList'] as any[]);
                let BRANDS = [];
                this.categoryBrandInfo = {};
                LIST.forEach((element) =>
                {
                    const cName = element['categoryName'];
                    const bList = element['brandList'];
                    BRANDS = [...BRANDS, ...bList.map(brand => (brand.brandName as string).trim())]
                    this.categoryBrandInfo[cName] = bList;
                });
                this.brands = this.extractUniqueBrands(BRANDS);
                this.categories = Object.keys(this.categoryBrandInfo);
            },
            (error) => { this._tms.show({ type: 'error', text: 'Something Went Wrong' }); },
            () => { this.globalLoader.setLoaderState(false);}
        );
    }

    updateUserDetails(user)
    {
        this.fullName.patchValue(user.userName);
        this.emailId.patchValue(user.email);
        this.phone.patchValue(user.phone);
    }

    addRequirementForm()
    {
        const REQUIREMENTS = new FormGroup({
            brandName: new FormControl("", [Validators.required]),
            itemValue: new FormControl("", [Validators.required]),
            quantity: new FormControl("", [Validators.required, Validators.min(1)]),
            totalValue: new FormControl(""),
        });
        (this.requirements as FormArray).push(REQUIREMENTS);
    }

    onSubmit(request)
    {
        if (this.eGiftForm.valid) {
            this.rfqEnquiryItemsList = [];
            request.requirements.forEach(element =>
            {
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
            }).subscribe((res) =>
            {
                if (res['statusCode'] == 200) {
                    //after success response 
                    this.showSuccessPopup = true;
                    //reset data
                    this.eGiftForm.reset();
                    this.requirements.value.forEach((e, index) =>
                    {
                        (<FormArray>this.requirements).removeAt(index)
                    });
                    this.addRequirementForm();
                    this.autoFill();
                }
                else {
                    this._tms.show({ type: 'error', text: 'Something Went Wrong' });
                }
            });
        }
        else {
            this.eGiftForm.markAllAsTouched();
            this._tms.show({ type: 'error', text: 'Please mention all details' });
        }
    }

    updateItemTotalValue(requirement: FormGroup)
    {
        if (requirement.invalid) return;
        const REQUIREMENT = requirement.value;
        const ITEM_TOTAL_VALUE = Number(REQUIREMENT.itemValue) * Number(REQUIREMENT.quantity)
        requirement.get("totalValue").setValue(ITEM_TOTAL_VALUE)
        this.updateTotalQuantity();
    }

    updateTotalQuantity()
    {
        const REQUIREMENTS = (this.requirements.value as any[]);
        const TOTAL_VALUE = REQUIREMENTS.map(requirement => Number(requirement.itemValue) * Number(requirement.quantity));
        this.totalValue = TOTAL_VALUE.reduce((value1, value2) => value1 + value2, 0);
    }


    checkQuantityCode(event) { return event.charCode >= 48 && event.charCode <= 57; }

    checkNumberic(event) { return event.charCode >= 48 && event.charCode <= 57; }

    togglePopUp1() { this.showSuccessPopup = !this.showSuccessPopup; }

    togglePopUp2() { this.showListPopup = !this.showListPopup; }

    removeProduct(index) { 
        (<FormArray>this.requirements).removeAt(index); 
        this.updateTotalQuantity();
    }

    //validations
    firstName(event)
    {
        var key;
        key = event.charCode;
        return ((key > 64 && key < 91) || (key > 96 && key < 123) || key == 32 || key == 46);
    }

    //getters
    get requirements() { return this.eGiftForm.get('requirements') };
    get fullName() { return this.eGiftForm.get("fullName") }
    get emailId() { return this.eGiftForm.get("emailId") }
    get phone() { return this.eGiftForm.get("phone") }

    autoFill()
    {
        this.eGiftForm.controls['fullName'].setValue(this.user.userName)
        this.eGiftForm.controls['phone'].setValue(this.user.phone)
        this.eGiftForm.controls['emailId'].setValue(this.user.email)
    }

    saveGift(eGift)
    {
        if (this.eGiftForm.invalid)
        {
            this.eGiftForm.markAllAsTouched();
            console.log(eGift);
            return;
        }
    }

    extractUniqueBrands(brands)
    {
        return brands.sort().filter(function (item, pos, ary)
        {
            return !pos || item != ary[pos - 1];
        });
    }

    updateState(formControl:FormControl, brandName)
    {
        //formControl.setValue(brandName);
    }
}
