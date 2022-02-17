import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { CommonService } from '@app/utils/services/common.service';
import { DataService } from '@app/utils/services/data.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { NumericValidator } from '@app/utils/validators/numeric.validator.';
import { StartWithSpaceValidator } from '@app/utils/validators/startwithspace.validator';
import { Step } from '@app/utils/validators/step.validate';
import { LocalStorageService } from 'ngx-webstorage';

@Component({
    selector: 'app-e-gift-voucher',
    templateUrl: './e-gift-voucher.component.html',
    styleUrls: ['./e-gift-voucher.component.scss']
})
export class EGiftVoucherComponent implements OnInit, AfterViewInit
{
    readonly TITLE = "Gift Cards & Gift Vouchers - Get Bulk Discounts";
    readonly PRICE_VALUES = [500, 1000, 2000, 5000, 10000];
    readonly API = CONSTANTS.NEW_MOGLIX_API;
    user: any;
    showSuccessPopup = false;
    showListPopup = false;
    categoryBrandInfo: any = null;
    categoryList = [];
    brandList = [];
    totalValue: any = 0;
    eGiftForm: FormGroup = null;
    isCheckboxChecked = false;

    constructor(
        private _dataService: DataService,
        private _tms: ToastMessageService,
        private _localStorageService: LocalStorageService,
        private globalLoader: GlobalLoaderService,
        private _title: Title,
        private _analytics: GlobalAnalyticsService,
        private _common: CommonService
    ) { }

    ngOnInit()
    {
        this._title.setTitle(this.TITLE);
        this.fetchVoucherData();
        this.eGiftForm = new FormGroup({
            rfqEnquiryCustomer: new FormGroup(
                {
                    name: new FormControl("", [Validators.required, StartWithSpaceValidator.validateSpaceStart]),
                    email: new FormControl("", [Validators.required, Step.validateEmail]),
                    mobile: new FormControl("", [Validators.required]),
                    company: new FormControl(""),
                    userId: new FormControl(),
                    sendMail: new FormControl("")
                }
            ),
            rfqEnquiryItemsList: new FormArray([])
        });
        this.addRequirementForm();
        if(this._common.isBrowser){
            this.adobeCall()
        }
        this.rfqEnquiryCustomer.get("sendMail").patchValue(this.isCheckboxChecked)
    }

    ngAfterViewInit(): void
    {
        this.user = this._localStorageService.retrieve('user');
        if (this.user && this.user.authenticated == "true") { this.updateUserDetails(this.user); return }
    }

    adobeCall(){
        const analyticObj: any = {
            page: {},
            custData: this._common.custDataTracking
          }
          analyticObj['page']['pageName'] = "moglix:e-gift-voucher",
          analyticObj['page']['linkName'] = '',
          analyticObj['page']['channel'] = '',
          this._analytics.sendAdobeCall(analyticObj,'genericPageLoad')
    }

    fetchVoucherData()
    {
        this.globalLoader.setLoaderState(true);
        this._dataService.callRestful("GET", `${this.API}/rfq/getVoucherData`).subscribe(
            (response) => 
            {
                this.globalLoader.setLoaderState(false);
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
            (error) => { this.globalLoader.setLoaderState(false); this._tms.show({ type: 'error', text: 'Something Went Wrong' }); }
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
            quantity: new FormControl("", [Validators.required, NumericValidator.validateNumber]),
            totalValue: new FormControl(0),
        });
        this.rfqEnquiryItemsList.push(REQUIREMENTS);
    }

    updateItemTotalValue(requirement: FormGroup)
    {
        if (requirement.invalid) { requirement.get("totalValue").setValue(0); };
        const REQUIREMENT = requirement.value;
        const ITEM_TOTAL_VALUE = Number(REQUIREMENT.itemValue) * Number(REQUIREMENT.quantity);
        requirement.get("totalValue").setValue(ITEM_TOTAL_VALUE);
        this.updateTotalValue();
    }

    updateTotalValue()
    {
        const REQUIREMENTS = (this.rfqEnquiryItemsList.value as any[]);
        const TOTAL_VALUE = REQUIREMENTS.map(requirement => Number(requirement.itemValue) * Number(requirement.quantity));
        this.totalValue = TOTAL_VALUE.reduce((value1, value2) => value1 + value2, 0);
    }

    removeProduct(index)
    {
        if (this.rfqEnquiryItemsList.length === 1) {
            if (this.rfqEnquiryItemsList.controls[index].valid) { this._tms.show({ type: 'error', text: 'Atleast one gift card is required.' }); }
            return;
        }
        this.rfqEnquiryItemsList.removeAt(index);
        this.updateTotalValue();
    }

    updateBrand(formControl: FormControl, brandName)
    {
        //TODO:incase if we need to add category
    }

    saveGift()
    {
        if (this.eGiftForm.invalid) {
            this.eGiftForm.markAllAsTouched();
            return
        }
        this.globalLoader.setLoaderState(true);
        this._dataService.callRestful("POST", `${this.API}/rfq/createVoucherRfq`, { body: this.eGiftForm.value }).subscribe(
            (response) =>
            {
                if (response['status']) {
                    this.showSuccessPopup = true;
                    this.rfqEnquiryItemsList.clear();
                    this.addRequirementForm();
                    this.isCheckboxChecked = false;
                }
            },
            (error) => { this._tms.show({ type: 'error', text: 'Something Went Wrong.' }); },
            () => { this.globalLoader.setLoaderState(false); }
        );
    }

    togglePopUp1() { this.totalValue = 0; this.showSuccessPopup = !this.showSuccessPopup; }

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

    checkNumberic(event) { return event.charCode >= 48 && event.charCode <= 57 }

    extractUniqueBrands(brands)
    {
        return brands.sort().filter(function (item, pos, ary)
        {
            return !pos || item != ary[pos - 1];
        });
    }
    onUpdate(e)
    {
        this.showSuccessPopup = false;
    }

    toggleCheckbox(){
        this.isCheckboxChecked = !this.isCheckboxChecked
        this.eGiftForm.value.rfqEnquiryCustomer.sendMail = this.isCheckboxChecked
    }
}
