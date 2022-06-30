import { CommonModule } from '@angular/common';
import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, NgModule, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationExtras, Router, RouterModule } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { Subscription } from 'rxjs';
import { PopUpModule } from '../../modules/popUp/pop-up.module';
import { ToastMessageService } from '../../modules/toastMessage/toast-message.service';
import { stateList } from '../../utils/data/state';
import { LocalAuthService } from '../../utils/services/auth.service';
import { BusinessDetailService } from '../../utils/services/business-detail.service';
import { ProductService } from '../../utils/services/product.service';
import { Step } from '../../utils/validators/step.validate';
import { ProductUtilsService } from './../../utils/services/product-utils.service';
import { CommonService } from '@app/utils/services/common.service';
import CONSTANTS from '@app/config/constants';
import { BottomMenuModule } from '@app/modules/bottomMenu/bottom-menu.module';

@Component({
    selector: 'product-rfq',
    templateUrl: './product-rfq.component.html',
    styleUrls: ['./product-rfq.component.scss']
})
export class ProductRFQComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
    readonly gstinValidators = [Validators.required, Validators.pattern('[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9A-Za-z]{1}[Z]{1}[0-9a-zA-Z]{1}')];
    readonly pincodeOptional = 'Pincode';
    readonly pincodeMandate = this.pincodeOptional + '*';
    readonly pincodeValidators = [Validators.minLength(6), Validators.pattern(/^[0-9]\d*$/)];
    readonly stateList: Array<{ 'idState': number, 'idCountry': number, 'name': string }>;
    readonly borf = 'gbqn';
    //inputs
    @Input('product') product = null;
    @Input('adobeTags') adobeTags = '';
    @Input('isOutOfStock') isOutOfStock = false;
    /**
     * isOutOfStock is also used to control popup and normal variant of this module,
     * incase isOutOfStock version needs to be opened with popup use extraOutOfStock flag used in PLP pages
    */
    @Input('extraOutOfStock') extraOutOfStock = false;
    @Input('isPopup') isPopup = false;
    //outputs
    @Output() isLoading: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output('hasGstin') hasGstin = new EventEmitter();
    @Output('rfqQuantity') rfqQuantity = new EventEmitter();
    @Output('rfqId') rfqId = new EventEmitter();

    //subscriber
    loginSubscriber: Subscription = null;
    pincodeSubscriber: Subscription = null;
    //falgs
    isGSTINVerified = false;
    isBrowser = false;
    isInvalidPincode = false;
    isUserLoggedIn = false;
    isRFQSubmitted = false;
    //others
    rfqGSTSINErrorMessage = null;
    verifiedGSTINValue = '';
    gstinError = null;
    userSession = null;
    productMOQ = 1;
    productMAQ = 999;
    getPincodeSubscriber: Subscription = null;
    rfqForm = new FormGroup({
        quantity: new FormControl(1),
        firstName: new FormControl('', [Validators.required, Validators.maxLength(30), Validators.pattern(/^[a-z\s]+$/i)]),
        mobile: new FormControl('', [Validators.required, Validators.minLength(10), Validators.pattern(/^[0-9]\d*$/)]),
        email: new FormControl('', [Step.validateEmail]),
        pincode: new FormControl('', [Validators.minLength(6), Validators.pattern(/^[0-9]\d*$/)]),
        city: new FormControl('', [Validators.maxLength(30), Validators.pattern(/^(?![\s-])[a-zA-Z\s-]+$/)]),
        description: new FormControl('', [Validators.pattern(/^[a-z\d\-_\s]+$/i)]),
        state: new FormControl(''),
        isPincodeUnKnown: new FormControl(false),
        isBusinessCustomer: new FormControl(false),
    });
    readonly imagePathAsset = CONSTANTS.IMAGE_ASSET_URL;

    constructor(private localStorageService: LocalStorageService, private productService: ProductService, private productUtil: ProductUtilsService, private tms: ToastMessageService,
        private router: Router, private localAuthService: LocalAuthService, private businessDetailService: BusinessDetailService, private cd: ChangeDetectorRef, public _commonService: CommonService) {
        this.stateList = stateList['dataList'];
        this.isBrowser = _commonService.isBrowser;
    }

    ngOnInit(): void {
        this.setProductDetails();
        this.userSession = this.localStorageService.retrieve('user');
        this.isUserLoggedIn = (this.userSession && this.userSession.authenticated == 'true');
        if (this.isUserLoggedIn) {
            this.setUserDetails();
            this.getBusinessDetail(this.userSession);
        }
    }

    ngAfterViewInit() { this.addSubscribers(); }

    ngAfterViewChecked() { this.cd.detectChanges(); }

    addSubscribers() {
        this.loginSubscriber = this.localAuthService.login$.subscribe((value) => {
            if (value) {
                this.isUserLoggedIn = true;
                this.setUserDetails();
                this.userSession = this.localStorageService.retrieve('user');
                this.getBusinessDetail(this.userSession);
            }
        })
        this.pincodeSubscriber = this.pincode.valueChanges.subscribe((value: string) => {
            if (value && value.length == 6) {
                this.fetchStateCityByPincode(value);
            }
        })
        this.localAuthService.logout$.subscribe((value) => {
            this.rfqForm.reset();
            this.quantity.setValue(this.productMOQ ? this.productMOQ : 1);
            this.isUserLoggedIn = false;
        })
    }

    initiateLogin($event?) {
        if ($event) {
            $event.preventDefault();
        }
        if (!this.isUserLoggedIn) {
            //use locaauthservice as it is hard to carry back url in otp
            this.localAuthService.setBackURLTitle(this.product['url'], "Continue to raise RFQ");
            let navigationExtras: NavigationExtras = { queryParams: { 'backurl': this.product['url'] } };
            this.router.navigate(['/login'], navigationExtras);
        }
    }

    setUserDetails() {
        this.userSession = this.localAuthService.getUserSession();
        this.firstName.setValue(this.userSession['userName']);
        this.email.setValue(this.userSession.email ? this.userSession.email : '');
        this.mobile.setValue(this.userSession.phone);
        this.setPincode();
    }

    setPincode() {
        let params = { customerId: this.localStorageService.retrieve('user').userId, invoiceType: "retail" };
        this.getPincodeSubscriber = this._commonService.getAddressList(params).subscribe((res) => {
            if (res["statusCode"] == 200 && res["addressList"] && res["addressList"].length > 1) {
                this.pincode.setValue(res["addressList"][0].postCode);
            }
        });
    }

    setProductDetails() {
        this.productMOQ = parseInt(this.product['moq']) ? parseInt(this.product['moq']) : 1;
        this.quantity.setValidators([Validators.required, Validators.pattern(/^[0-9]\d*$/), Validators.min(this.productMOQ), Validators.max(this.productMAQ), Validators.maxLength(3)]);
        this.quantity.setValue(this.productMOQ ? this.productMOQ : 1);
        this.quantity.updateValueAndValidity();
    }

    resetGSTINVarification(message) {
        this.isGSTINVerified = false;
        this.verifiedGSTINValue = '';
        this.gstinError = message;
    }

    handleBussinessCustomer() {
        if (this.isUserLoggedIn) {
            if (this.isBusinessCustomer.value) {
                this.rfqForm.addControl('tin', new FormControl(this.verifiedGSTINValue, this.gstinValidators));
            } else {
                this.tin.clearValidators();
                this.rfqForm.removeControl('tin');
            }
        } else {
            this.isBusinessCustomer.setValue(false);
            this.initiateLogin();
        }
    }

    handlePincodeCity() {
        if (this.isUserLoggedIn) {
            if (this.isPincodeUnKnown.value) {
                // this.pincode.clearValidators();
                // this.isInvalidPincode = false;
                this.state.setValue('');
            } else {
                this.pincode.setValidators(this.pincodeValidators);
            }
            this.city.patchValue('');
            this.pincode.patchValue('');
            this.pincode.updateValueAndValidity();
            this.city.updateValueAndValidity();
        } else {
            this.isPincodeUnKnown.setValue(false);
            this.initiateLogin();
        }
    }

    increaseQuantity() {
        if (this.isUserLoggedIn) {
            let value = parseInt(this.quantity.value);
            if (isNaN(value) || this.quantity.hasError('min')) {
                this.quantity.setValue(this.productMOQ);
            } else {
                let assumedQuantity = parseInt(this.quantity.value) + 1;
                if (assumedQuantity < this.productMAQ) {
                    this.quantity.setValue(assumedQuantity);
                }
            }
        } else {
            this.initiateLogin();
        }
    }

    decreaseQuantity() {
        if (this.isUserLoggedIn) {
            let value = parseInt(this.quantity.value);
            if (isNaN(value)) {
                this.quantity.setValue(this.productMOQ);
            } else if (this.quantity.valid) {
                let assumedQuantity = parseInt(this.quantity.value) - 1;
                if (assumedQuantity > this.productMOQ) {
                    this.quantity.setValue(assumedQuantity);
                } else {
                    this.quantity.setValue(this.productMOQ);
                }
            }
        } else {
            this.initiateLogin();
        }
    }

    close() {
        this.isPopup = false;
        this.isRFQSubmitted = false;
        this._commonService.oosSimilarCard$.next(false);
    }

    getBusinessDetail(userSession) {
        let details = { customerId: userSession.userId, userType: 'business' };
        this.businessDetailService.getBusinessDetail(details).subscribe((response) => {
            if (response['statusCode'] == 200) {
                this.email.setValue(this.userSession.email ? this.userSession.email : '');
                this.mobile.setValue(this.userSession.phone);
                if (response['data'] && response['data']['gstin']) {
                    this.verifiedGSTINValue = (response['data']['gstin'] as string).toUpperCase()
                    this.isGSTINVerified = true;
                    this.gstinError = null;
                } else {
                    this.isGSTINVerified = false;
                    this.verifiedGSTINValue = '';
                }
            }
        })
    }

    fetchStateCityByPincode(pincode) {
        this.productService.getStateCityByPinCode(pincode).subscribe(
            (response) => {
                if (response['status']) {
                    this.isInvalidPincode = false;
                    let dataList = (response['dataList'] as any[])[0];
                    this.city.setValue(dataList.city);
                    this.stateList.forEach(element => {
                        if (element.idState == parseInt(dataList['state'])) {
                            this.state.setValue(element.name);
                        }
                    })
                } else {
                    this.isInvalidPincode = true;
                    this.city.setValue('');
                }
            },
            (error) => { this.city.setValue(''); }
        )
    }

    processRFQ(rfqDetails) {
        if (this.isUserLoggedIn) {
            this.verifyGSTIN(rfqDetails);
        } else {
            this.initiateLogin();
        }
    }

    verifyGSTIN(rfqDetails) {
        this.isRFQSubmitted = true;
        this.rfqForm.markAllAsTouched();

        if (this.rfqForm.valid) {
            this.isLoading.emit(true);
            if (this.isBusinessCustomer.value && this.verifiedGSTINValue !== (this.tin.value as string).toUpperCase()) {
                let gstinValue = (this.tin.value as string).toUpperCase();
                this.productService.getGSTINDetails(gstinValue).subscribe((response) => {
                    if (response['statusCode'] == 200 && response['taxpayerDetails'] != null) {
                        this.isGSTINVerified = response['valid'];
                        this.verifiedGSTINValue = (gstinValue as string).toUpperCase();;
                        this.saveRFQ(rfqDetails);
                    } else {
                        this.resetGSTINVarification(response['message']);
                        this.isLoading.emit(false);
                    }
                },
                    (error) => { this.resetGSTINVarification(''); this.isLoading.emit(false); }
                )
            } else {
                this.saveRFQ(rfqDetails);
            }
        }
    }

    saveRFQ(rfqDetails) {
        let data = { rfqEnquiryCustomer: null, rfqEnquiryItemsList: null };
        let extraData = {
            'lastName': rfqDetails['last_name'],
            'designation': rfqDetails['designation'],
            'company': rfqDetails['company_name'],
            'buyerId': rfqDetails['buyertype'],
            'tin': this.isBusinessCustomer.value ? rfqDetails['tin'] : '',
            'device': 'mobile',
            'customerId': (this.userSession != undefined && this.userSession != null && this.userSession.authenticated == 'true') ? this.userSession.userId : '',
            'rfqValue': this.product['price'] * rfqDetails['quantity']
        }
        delete rfqDetails['quantity'];
        delete rfqDetails['isPincodeUnKnown'];
        delete rfqDetails['isBusinessCustomer'];
        data['rfqEnquiryItemsList'] = [{
            productName: this.product['productName'],
            brand: this.product['brand'],
            quantity: this.quantity.value,
            prodReference: this.product['msn'],
            taxonomyCode: this.product['taxonomyCode'],
            outOfStock: (this.isOutOfStock || this.extraOutOfStock) ? 'outOfStock' : 'inStock'
        }]
        data['rfqEnquiryCustomer'] = { ...rfqDetails, ...extraData };
        this.productService.postBulkEnquiry(data).subscribe(
            (response) => {
                if (response['statusCode'] == 200) {
                    this.hasGstin.emit(this.isBusinessCustomer.value ? true : false);
                    this.rfqQuantity.emit(this.quantity.value)
                    this.isOutOfStock ? this.resetOOSFields() : this.rfqForm.reset();
                    this.quantity.setValue(this.productMOQ);
                    this.isLoading.emit(false);
                    this.close();
                    this.rfqForm.markAsUntouched();
                    this.isRFQSubmitted = false;
                    this.rfqId.emit(response['data']);
                } else {
                    this.isLoading.emit(false);
                    this.tms.show({ type: 'error', text: response['message']['statusDescription'] });
                }
            },
            err => { this.isLoading.emit(false); }
        );
    }

    resetOOSFields() {
        this.setUserDetails();
        this.pincode.reset();
        this.city.reset();
        this.isPincodeUnKnown.setValue(false)
        this.isBusinessCustomer.setValue(false);
        this.description.reset();
        if (this.tin) { this.rfqForm.removeControl('tin'); }
    }

    checkPinocdeKey(event) { return (event.charCode >= 48 && event.charCode <= 57) || event.which === 8; }

    get quantity() { return this.rfqForm.get('quantity') };
    get firstName() { return this.rfqForm.get('firstName') };
    get mobile() { return this.rfqForm.get('mobile') };
    get email() { return this.rfqForm.get('email') };
    get pincode() { return this.rfqForm.get('pincode') };
    get city() { return this.rfqForm.get('city') };
    get description() { return this.rfqForm.get('description') };
    get state() { return this.rfqForm.get('state') };
    get tin() { return this.rfqForm.get('tin') };
    get isPincodeUnKnown() { return this.rfqForm.get('isPincodeUnKnown') };
    get isBusinessCustomer() { return this.rfqForm.get('isBusinessCustomer') };

    ngOnDestroy() {
        if (this.loginSubscriber) {
            this.loginSubscriber.unsubscribe();
        }
        if (this.pincodeSubscriber) {
            this.pincodeSubscriber.unsubscribe();
        }
        if (this.getPincodeSubscriber) {
            this.getPincodeSubscriber.unsubscribe();
        }
    }

    onUpdate(event) {
        console.log(event);
        this.isPopup = false;
    }
}

@NgModule({
    declarations: [
        ProductRFQComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PopUpModule,
        BottomMenuModule,
        RouterModule
    ],
})
export class ProductRFQModule { }

