import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import CONSTANTS from '@app/config/constants';
import { ModalService } from '@app/modules/modal/modal.service';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { CountryListModel, StateListModel } from '@app/utils/models/shared-checkout.models';
import { AddressService } from '@app/utils/services/address.service';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CommonService } from '@app/utils/services/common.service';
import { Step } from '@app/utils/validators/step.validate';
import { Subscription } from 'rxjs';

@Component({
    selector: 'create-edit-billing-address',
    templateUrl: './create-edit-billing-address.component.html',
    styleUrls: ['./create-edit-billing-address.component.scss']
})
export class CreateEditBillingAddressComponent implements OnInit, AfterViewInit, OnDestroy
{
    readonly ADDRESS_TYPE = "Billing";
    readonly globalConstants = CONSTANTS.GLOBAL;

    @Input("displayCreateEditPopup") displayCreateEditPopup = false;
    @Input("isAddMode") isAddMode = true;
    @Input("address") address = null;
    @Output("closeAddressPopUp$") closeAddressPopUp$: EventEmitter<any> = new EventEmitter<any>();

    addressForm = null;
    userSesssion = null;
    lastSearchedPincode = null;

    countryList = [];
    stateList = [];

    isVerifyingPincode = false;
    isPincodeValid = false;
    isGSTINVerified = false;

    gstingSubscription: Subscription = null;
    postCodeSubscription: Subscription = null;

    constructor(private _addressService: AddressService, private _localAuthService: LocalAuthService,
        private _commonService: CommonService, private _modalService: ModalService, private _toastMessage: ToastMessageService, private _formBuilder: FormBuilder,)
    {
        this.userSesssion = this._localAuthService.getUserSession();
    }
    

    ngOnInit() 
    {
        this.createAddressForm(this.address);
        this._addressService.getCountryList().subscribe((countryList: CountryListModel[]) =>
        {
            this.countryList = countryList;
            this.fetchStateList(this.countryList[0]['idCountry']);
        })
    }

    ngAfterViewInit()
    {

    }

    fetchStateList(countryId)
    {
        this._addressService.getStateList(countryId).subscribe((stateList: StateListModel[]) =>
        {
            this.stateList = stateList;
            const COUNTRY_ID = this._addressService.getCountry(this.countryList, null);
            const STATE_ID = this._addressService.getState(this.stateList, null);
            this.idCountry.patchValue(COUNTRY_ID);
            this.idState.patchValue(STATE_ID);
        })
    }

    createAddressForm(address)
    {
        return this._formBuilder.group({
            businessDetail: this._formBuilder.group({
                companyName: [address && address.addressCustomerName ? address.addressCustomerName : null, [Validators.required]],
                gstin: [(address && address.gstin) ? address.gstin : null, [Validators.required, Validators.minLength(15)]],
                email: [(address && address.email) ? address.email : null, [Step.validateEmail]],
                phone: [(address && address.phone) ? address.phone : null, [Validators.required, Step.validatePhone]],
            }),
            billingAddress: this._formBuilder.group({
                idAddress: (this.address && this.address['idAddress']) ? this.address['idAddress'] : null,
                postCode: [(address && address.postCode) ? address.postCode : null, [Validators.required, Step.validatePostCode]],
                landmark: [(address && address.landmark) ? address.landmark : null],
                addressLine: [(address && address.addressLine) ? address.addressLine : null, [Validators.required, Validators.pattern(/^[a-zA-Z0-9._;, \/()-]*$/)]],
                city: [(address && address.city) ? address.city : null, [Validators.required, Validators.pattern('^([a-zA-Z0-9_]*[ \t\r\n\f]*[\-\,\/\.\(\)]*)+')]],
                idCountry: [null, [Validators.required]],
                idState: [null, [Validators.required]],
            })
        });
    }

    //getters
    get gstin() { return this.addressForm.get('businessDetail').get('gstin'); }
    get companyName() { return this.addressForm.get('businessDetail').get('companyName'); }
    get email() { return this.addressForm.get('businessDetail').get('email'); }
    get phone() { return this.addressForm.get('businessDetail').get('phone'); }
    get postCode() { return this.addressForm.get('billingAddress').get('postCode'); }
    get addressLine() { return this.addressForm.get('billingAddress').get('addressLine'); }
    get city() { return this.addressForm.get('billingAddress').get('city'); }
    get idState() { return this.addressForm.get('billingAddress').get('idState'); }
    get idCountry() { return this.addressForm.get('billingAddress').get('idCountry'); }

    ngOnDestroy(): void
    {
        this.gstingSubscription.unsubscribe();
        this.postCodeSubscription.unsubscribe();
    }


}
