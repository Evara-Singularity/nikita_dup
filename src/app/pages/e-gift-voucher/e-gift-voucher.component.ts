import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
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
    readonly PRICE_VALUES = [500, 1000, 2000, 5000, 10000];
    readonly API = CONSTANTS.NEW_MOGLIX_API;
    user: any;
    showSuccessPopup = false;
    showListPopup = false;
    categoryBrandInfo: any = null;
    categoryList = [];
    brandList = [];
    totalValue: any = "00";
    eGiftForm: FormGroup = null;

    constructor(
        private _dataService: DataService,
        private _tms: ToastMessageService,
        private _localStorageService: LocalStorageService,
        private globalLoader: GlobalLoaderService,

    ) { }

    ngOnInit()
    {
        this.fetchVoucherData();
        this.eGiftForm = new FormGroup({
            rfqEnquiryCustomer: new FormGroup(
                {
                    name: new FormControl("", [Validators.required]),
                    email: new FormControl("", [Validators.required, Step.validateEmail]),
                    mobile: new FormControl("", [Validators.required]),
                    company: new FormControl(""),
                    userId: new FormControl()
                }
            ),
            rfqEnquiryItemsList: new FormArray([])
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
        this._dataService.callRestful("GET", `${this.API}/rfq/getVoucherData`).subscribe(
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
                this.brandList = this.extractUniqueBrands(BRANDS);
                this.categoryList = Object.keys(this.categoryBrandInfo);
            },
            (error) => { this._tms.show({ type: 'error', text: 'Something Went Wrong' }); },
            () => { this.globalLoader.setLoaderState(false); }
        );
    }

    updateUserDetails(user)
    {
        this.name.patchValue(user.userName);
        this.email.patchValue(user.email);
        this.mobile.patchValue(user.phone);
        this.userId.patchValue(this.user.userId)
    }

    addRequirementForm()
    {
        const REQUIREMENTS = new FormGroup({
            brandName: new FormControl("", [Validators.required]),
            itemValue: new FormControl("", [Validators.required]),
            quantity: new FormControl("", [Validators.required, Validators.min(1)]),
            totalValue: new FormControl(""),
        });
        this.rfqEnquiryItemsList.push(REQUIREMENTS);
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
        const REQUIREMENTS = (this.rfqEnquiryItemsList.value as any[]);
        const TOTAL_VALUE = REQUIREMENTS.map(requirement => Number(requirement.itemValue) * Number(requirement.quantity));
        this.totalValue = TOTAL_VALUE.reduce((value1, value2) => value1 + value2, 0);
    }

    removeProduct(index)
    {
        this.rfqEnquiryItemsList.removeAt(index);
        this.updateTotalQuantity();
    }

    updateBrand(formControl: FormControl, brandName)
    {
        //TODO:incase if we need to add category
    }

    saveGift()
    {
        this.showSuccessPopup = true;
        // if (this.eGiftForm.invalid) {
        //     this.eGiftForm.markAllAsTouched();
        //     return
        // }
        // this.globalLoader.setLoaderState(true);
        // this._dataService.callRestful("POST", `${this.API}/rfq/createVoucherRfq`, { body: this.eGiftForm.value }).subscribe(
        //     (response) =>
        //     {
        //         if (response['status']) {
        //             this._tms.show({ type: 'success', text: 'E-Gift submitted successfully.' });
        //             this.showSuccessPopup = true;
        //             this.rfqEnquiryItemsList.clear();
        //             this.addRequirementForm();
        //         }
        //     },
        //     (error) => { this._tms.show({ type: 'error', text: 'Something Went Wrong.' }); },
        //     () => { this.globalLoader.setLoaderState(false); }
        // );
    }

    togglePopUp1() { this.showSuccessPopup = !this.showSuccessPopup; }

    togglePopUp2() { this.showListPopup = !this.showListPopup; }

    get canAddAnotherCard() { return (this.rfqEnquiryCustomer.valid && this.rfqEnquiryItemsList.valid); }

    //getters
    get rfqEnquiryCustomer() { return (this.eGiftForm.get("rfqEnquiryCustomer") as FormGroup) }
    get rfqEnquiryItemsList() { return (this.eGiftForm.get("rfqEnquiryItemsList") as FormArray) }
    get name() { return this.rfqEnquiryCustomer.get("name") }
    get email() { return this.rfqEnquiryCustomer.get("email") }
    get mobile() { return this.rfqEnquiryCustomer.get("mobile") }
    get userId() { return this.rfqEnquiryCustomer.get("userId") }

    //validations
    checkForspecialChars(event)
    {
        var key;
        key = event.charCode;
        return ((key > 64 && key < 91) || (key > 96 && key < 123) || key == 32 || key == 46);
    }

    checkNumberic(event) { return event.charCode >= 48 && event.charCode <= 57; }

    extractUniqueBrands(brands)
    {
        return brands.sort().filter(function (item, pos, ary)
        {
            return !pos || item != ary[pos - 1];
        });
    }
}
