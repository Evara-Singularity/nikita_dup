import { Component, Output, Input, EventEmitter, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, of, Subject, Subscription } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { DeliveryAddressService } from './deliveryAddress.service';
import { CartService } from '../../utils/services/cart.service';
import { CheckoutService } from '../../utils/services/checkout.service';
import { LocalAuthService } from '../../utils/services/auth.service';
import { CommonService } from '../../utils/services/common.service';
import { AddressListService } from '../addressList/address-list.service';
import CONSTANTS from '../../config/constants';
import { GlobalLoaderService } from '../../utils/services/global-loader.service';


declare let dataLayer;
declare var digitalData: {};
declare let _satellite;

@Component({
    selector: 'delivery-address',
    templateUrl: './deliveryAddress.html',
    styleUrls: ['./deliveryAddress.scss'],
    encapsulation: ViewEncapsulation.None
})

export class DeliveryAddressComponent implements OnInit, OnDestroy {
    selectedMenu: number;
    // @Output() onPageChange: EventEmitter<any> = new EventEmitter<any>();
    @Output() updateTabIndex: EventEmitter<number> = new EventEmitter<number>();
    @Output() updateCheckoutAddress$: EventEmitter<{}> = new EventEmitter<{}>();
    @Output() unServicableItems$: EventEmitter<{}> = new EventEmitter<{}>();
    @Input() isShowDeliveryCodeMessage: boolean = true;

    @Input() user: {};
    @Input() invoiceType: string;
    @Input() isCheckoutButtonVisible: boolean = true;
    @Input() addressFormButtonText: string;

    @Input() invoiceTypeSectionHeadingText: string;
    @Input() invoiceTypeSectionSubheadingText: string;
    @Input() deliverHereCTAText: string;

    private cDistryoyed = new Subject();
    tabIndex: number;

    country: string; state: string;
    address: string;

    countryList: Array<{}>;

    globalConstants: {};

    showAddressForm: boolean;

    addressList: Array<{}>;
    checkoutAddress: {};

    checkoutAddressIndex: number;
    deliveryMessage: string = '';
    totalAmount: number = 0;
    addressType: number;
    selectedBillingAddress: number;
    userType: any;
    shippingAddressMsg: string;
    @Input() isGridAddress: boolean = false;
    markBillingAddres: number = 9999;
    isGstEnable: boolean = false;
    isServer: boolean = typeof window !== 'undefined' ? false : true;
    nti: boolean;
    addShippingAddress: boolean;
    addBillingAddress: boolean;
    salpu: { shipping: boolean, billing: boolean }; // sapu: show address list popup
    saf: { sa: boolean, ba: boolean, address: null }; // saf: show address form
    editMode: boolean = false;
    billingAddressList = [];
    shippingAddressList = [];
    showRadio: boolean;
    editBillingSubscriber: Subscription = null;
    set showLoader(value) {
        this._loaderService.setLoaderState(value);
    }

    constructor(
        private _router: Router,
        private cartService: CartService,
        public _checkoutService: CheckoutService,
        private _addressService: DeliveryAddressService,
        private _localAuthService: LocalAuthService,
        private _commonService: CommonService,
        private _addressListService: AddressListService,
        private _loaderService: GlobalLoaderService,
        private _deliveryAddressService: DeliveryAddressService) {
        this.addressList = [];
        this.salpu = {
            shipping: false,
            billing: false
        };
        this.saf = {
            sa: false,
            ba: false,
            address: null
        };
    }

    ngOnInit() {
        this.addShippingAddress = false;
        this.addBillingAddress = false;
        this.nti = this.invoiceType === 'retail' ? false : true;
        this._checkoutService.setCheckoutAddress(null);
        this._checkoutService.setBillingAddress(null);

        this.tabIndex = 2;
        const userSession = this._localAuthService.getUserSession();

        this.user = userSession;

        this.globalConstants = CONSTANTS.GLOBAL;
        this.showAddressForm = false;
        this.checkoutAddress = {};

        this._commonService.showLoader = true;
        this.getAddressListApi();
        this.countryList = [];
        this._commonService.getCountryList().subscribe((rd) => {
            if (rd['statusCode'] === 200) {
                this.countryList = rd['dataList'];
            } else if (rd['statusCode'] === 500) { // Error in api

            }
        });
        this.cartService.selectedBusinessAddressObservable.subscribe((data) => {
            this.selectedBillingAddress = data.length - 1;
            this._checkoutService.setBillingAddress(this.addressList[this.selectedBillingAddress]);
        });

        this._deliveryAddressService.addNewAddressAction().subscribe((formType) => {
            this.updateCheckoutAddressIndex(this.globalConstants['newAddress'], formType, null, true);
        })

        this.editBillingSubscriber = this._deliveryAddressService.editBillingAddressAction().subscribe((data) => {
            this.updateCheckoutAddressIndex(this.selectedBillingAddress, 2, this._checkoutService.getBillingAddress(), true);
        })
    }

    getAddressListApi() {
        // debugger;
        const userSession = this._localAuthService.getUserSession();
        const params = { customerId: userSession.userId, invoiceType: this.invoiceType };
        this._commonService.showLoader = true;
        this._commonService.getAddressList(params).subscribe((rd) => {
            if (rd['statusCode'] === 200) {
                this.user = userSession;

                const cartSession = this.cartService.getCartSession();
                this.totalAmount = (cartSession['itemsList'] != undefined && cartSession['itemsList'] != null) ? cartSession['cart']['totalAmount'] + cartSession['cart']['shippingCharges'] - cartSession['cart']['totalOffer'] : 0.00;
                this.cartService.orderSummary.subscribe(data => {
                    this.totalAmount = data['cart']['totalAmount'] + data['cart']['shippingCharges'] - data['cart']['totalOffer'];
                });
                // console.log("[getAddressListApi]..........");
                this.addressList = rd['addressList'];
                this.addressListApiCallback();

            } else if (rd['statusCode'] === 500) { // Error in api

            }
            // this._commonService.showLoader = false;
            // $('#page-loader').hide();
        });
    }


    addressListApiCallback() {

        // Reset CheckoutAdress and Billing address before callling API and callback will reset it.
        this._checkoutService.setCheckoutAddress(null);
        this._checkoutService.setBillingAddress(null);
        this.shippingAddressList = [];
        this.billingAddressList = [];

        if (this.addressList.length === 0) {
            this._commonService.showLoader = false;
            let itemsValidationMessage = this._commonService.itemsValidationMessage;
            itemsValidationMessage = itemsValidationMessage.filter(item => item['type'] != 'unservicable')
            this._commonService.itemsValidationMessage = [...itemsValidationMessage];
            this.unServicableItems$.emit();

            // Empty address list
            this.checkoutAddressIndex = this.globalConstants['newAddress'];
            this.addressType = 3;
            this.checkoutAddress['newform'] = true;
            this.showAddressForm = true;
            //update state vars for address listing
            this._checkoutService.setBillingAddress(null);
            this._checkoutService.setCheckoutAddress(null);
            this.shippingAddressList = [];
            this.billingAddressList = [];
            this.updateCheckoutAddress$.emit('noAddr');
            this.salpu.billing = false;
            this.salpu.shipping = false;
            this._commonService.showLoader = false;
        } else {
            /**
             * Business logic :: 
             * First time on page refresh first value from address list is added for billing and shipping respectively
             * After delete address listing API is called again and if billing and shipping address selected previously before delete then, 
             * state variable are updated to previous value only if selected value is not deleted
             * if selected value is deleted then first value is auto selected
             */
            // shipping address calc
            let sal = this.getAddressList(this.addressList, 1);
            if (sal && sal.length > 0) {
                const checkoutAddress = this._checkoutService.getCheckoutAddress()
                if (checkoutAddress) {
                    const addressExist = sal.filter(a => a['idAddress'] === checkoutAddress['idAddress']);
                    if (addressExist.length > 0) {
                        // console.log('checkoutAddress addressExist');
                        this._checkoutService.setCheckoutAddress(addressExist[0]);
                        this.shippingAddressList = [addressExist[0]]
                    } else {
                        // console.log('checkoutAddress not addressExist');
                        this._checkoutService.setCheckoutAddress(sal[0]);
                        this.shippingAddressList = [sal[0]]
                    }
                } else {
                    // console.log('checkoutAddress not deafult');
                    this.checkoutAddressIndex = 0;
                    this._checkoutService.setCheckoutAddress(sal[0]);
                    this.shippingAddressList = [sal[0]]
                }
            } else {
                this._checkoutService.setCheckoutAddress(null);
                this.shippingAddressList = [];
                this.salpu.shipping = false;
            }
            // billing address calc
            if (this.nti) {
                let bal = this.getAddressList(this.addressList, 2);
                if (bal && bal.length > 0) {
                    const billingAddress = this._checkoutService.getBillingAddress()
                    if (billingAddress) {
                        const addressExist = bal.filter(a => a['idAddress'] === billingAddress['idAddress']);
                        if (addressExist.length > 0) {
                            console.log('billingAddress addressExist');
                            this.billingAddressList = [addressExist[0]]
                            this._checkoutService.setBillingAddress(addressExist[0]);
                        } else {
                            console.log('billingAddress not addressExist');
                            this.selectedBillingAddress = 0;
                            this._checkoutService.setBillingAddress(bal[0]);
                            this.billingAddressList = [bal[0]]
                        }
                    } else {
                        console.log('billingAddress not deafult');
                        this.selectedBillingAddress = 0;
                        this._checkoutService.setBillingAddress(bal[0]);
                        this.billingAddressList = [bal[0]]
                    }
                } else {
                    this.salpu.billing = false;
                    this._checkoutService.setBillingAddress(null);
                }
            }
            // this._commonService.showLoader = false;
            // debugger;
            this.updateCheckoutAddress$.emit({});
            this.checkServiceability();
        }
    }

    /**
     *
     * @param index : Index of address in array or new address index.
     * @param at : Address Type
     */
    updateCheckoutAddressIndex(index, at, address?, editMode = false) {
        // this.addShippingAddress = (at === 1) ? true : false;
        // this.addBillingAddress = (at === 2) ? true : false;
        this.editMode = editMode;



        if (at === 1) {
            this.saf.sa = true;
        } else if (at === 2) {
            this.saf.ba = true;
        }
        this.saf.address = address ? address : null;

        this.selectedMenu = undefined;
        this.isGstEnable = true;
        this.addressType = at;
        this.checkoutAddress = {};

        if (!this.isServer) {
            // if (true) {
            // setTimeout(() => {
            if (at === 2) {
                this.getBusinessDetail();
            } else {
                this.checkoutAddress['newform'] = true;
                this.showAddressForm = true;
            }
            // }, 100);
            /* setTimeout(() => {
                try {
                    const pageScrollOffset = (<HTMLElement>document.querySelector('#address-form')).offsetTop - 150;
                    const pageScrollInstance: PageScrollInstance = PageScrollInstance.newInstance({
                        document: this._document,
                        scrollTarget: '#address-form',
                        pageScrollOffset: pageScrollOffset
                    });
                    this._pageScrollService.start(pageScrollInstance);
                } catch (err) {

                }

            }, 300); */
            // }
            this.isGstEnable = false;
        }

        digitalData['page']['pageName'] = "moglix:order checkout:address details";
        digitalData['page']['subSection'] = "moglix:order checkout:address details";
        _satellite.track("genericPageLoad");

    }


    // After Address Created Or Updated
    acou(data) {
        // Hide address form on creating or updating the form.
        // this.showAddressForm = false;
        this.saf = {
            sa: false,
            ba: false,
            address: null
        };
        this.addressList = data['addressList'];
        // If new address is created.
        if (this.addressType === 1) {
            const sal = this.getAddressList(this.addressList, 1);
            // if (data['aType'] === this.globalConstants['created']) {
            this.checkoutAddressIndex = 0;
            this.addressListApiCallback();
            // }
            this.updateCheckoutAddress$.emit({ address: sal[0], type: 1 });
            // this.checkPinCodeAddressApi(this.checkoutAddressIndex, false);
            // this.checkPinCodeAddressApi();
            this.checkServiceability();
        } else if (this.addressType === 2) {
            const bal = this.getAddressList(this.addressList, 2);
            // if (data['aType'] === this.globalConstants['created']) {
            this.selectedBillingAddress = 0;
            this.addressListApiCallback();
            // }
            this.updateCheckoutAddress$.emit({ address: bal[0], type: 2 });
        } else if (this.addressType === 3) {
            for (let i = 0; i < this.addressList.length; i++) {
                if (this.addressList[i]['addressType']['idAddressType'] === 2) {
                    this.selectedBillingAddress = i;
                    break;
                }
            }
            for (let i = 0; i < this.addressList.length; i++) {
                if (this.addressList[i]['addressType']['idAddressType'] === 1) {
                    this.checkoutAddressIndex = i;
                    break;
                }
            }

            // console.log(this.checkoutAddressIndex, this.selectedBillingAddress);
            // this.updateCheckoutAddress$.emit(this.addressList[this.checkoutAddressIndex]);
            // this.checkPinCodeAddressApi(this.checkoutAddressIndex, false);
            // this.checkPinCodeAddressApi();
            this.checkServiceability();
            this._checkoutService.setBillingAddress(this.addressList[this.selectedBillingAddress]);
            this.addressListApiCallback();
        }
        // updates date after address list is updated
    }

    /*getStateData(data){
     for(let state of this.stateList){
     if(state['idState'] == data.state['idState']){
     return state;
     }
     }
     return null;
     }

     getCountryData(data){
     for(let country of this.countryList){
     if(country['idCountry'] == data.country['idCountry']){
     return country;
     }
     }
     return null;
     }*/

    public addressTypeThree = {};
    public isAddressTypeThree: boolean = false;


    deleteAddress(da) {
        this.selectedMenu = undefined;
        const userSession = this._localAuthService.getUserSession();
        // const address = this.addressList[da['address']];
        const address = da['address'];
        address['active'] = false;


        const postDeleteAddress = {
            'idAddress': address['idAddress'],
            'addressCustomerName': address['addressCustomerName'],
            'phone': address['phone'],
            'email': address['email'] != null ? address['email'] : userSession['email'],
            'postCode': address['postCode'],
            'addressLine': address['addressLine'],
            'city': address['city'],
            'idState': address['state']['idState'],
            'idCountry': address['country']['idCountry'],
            'idCustomer': address['idCustomer'],
            'idAddressType': address['addressType']['idAddressType'],
            'active': false
        };

        postDeleteAddress['invoiceType'] = this.invoiceType;
        this._commonService.showLoader = true;
        //  $('#page-loader').show();
        this._addressService.postAddress(postDeleteAddress).subscribe((rd) => {
            if (rd['statusCode'] === 200) {
                this.addressList = rd['addressList'];
                this.addressListApiCallback();
            } else if (rd['statusCode'] === 500) {// Error in api

            }
            // this._commonService.showLoader = false;
        });
    }

    isBigEnough(element, index, array) {
        return element >= 10;
    }

    isBusinessAvialble: boolean = true;

    checkShippingAddress() {
        let isAdddressExist: boolean = false;
        this.addressList.forEach((element) => {
            if (element['addressType']['idAddressType'] == 1) {
                isAdddressExist = true;
            }
        })
        if (isAdddressExist) {
            return true;
        }
        else {
            return false;
        }
    }

    gstNo: string;
    getBusinessDetail(updateBilling?: any) {
        /**
         * Below code is extracted from above commented code, because we are not fetching business detail as per new checkout flow.
         */
        if (!updateBilling) {
            this.checkoutAddress['newform'] = true;
        }
        this.showAddressForm = true;
    }
    tabIndexUpdated(index, pinCodeStatus: Array<any>) {
        let isShippingAddressValid: boolean = false;
        //alert(JSON.stringify(pinCodeStatus));
        // let pinCodeStatus=this.checkPinCodeAddress();
        // alert(JSON.stringify(pinCodeStatus));
        let serviceAvailable: boolean = pinCodeStatus.every((element) => {
            return element.serviceAvailable == true;
        })
        let codAvailable: boolean = pinCodeStatus.every((element) => {
            return element.codAvailable == true;
        })
        this._commonService.cashOnDeliveryStatus.isEnable = codAvailable;
        if (serviceAvailable && true) {
            if (!this.isServer) {
                let cartSession = this.cartService.getCartSession();
                let dlp = [];
                for (let p = 0; p < cartSession["itemsList"].length; p++) {
                    let product = {
                        id: cartSession["itemsList"][p]['productId'],
                        name: cartSession["itemsList"][p]['productName'],
                        price: cartSession["itemsList"][p]['totalPayableAmount'],
                        // brand: psrp[p].brandName,
                        // category: cr,
                        variant: '',
                        quantity: cartSession["itemsList"][p]['productQuantity']
                    };
                    dlp.push(product);
                }

                dataLayer.push({
                    'event': 'checkout',
                    'ecommerce': {
                        'checkout': {
                            'actionField': { 'step': 3, 'option': 'address' },
                            'products': dlp
                        }
                    },
                });

                let userSession = this._localAuthService.getUserSession();
                if (userSession && userSession.authenticated && userSession.authenticated == "true") {

                    /*Start Criteo DataLayer Tags */
                    dataLayer.push({
                        'event': 'setEmail',
                        'email': (userSession && userSession.email) ? userSession.email : ''
                    });
                    /*End Criteo DataLayer Tags */
                }

                this.tabIndex = index;
                this.updateTabIndex.emit(4);
            }
        }

        if (!serviceAvailable) {
            this.deliveryMessage = "Delivery is not available on your selected shipping address pincode";
        }
    }


    //shippingAddressMessage=""

    checkPinCodeAddressApi(): any {
        // debugger;
        this._commonService.showLoader = true;
        let checkPinCodeAddressObservable = [];
        const ca = this._checkoutService.getCheckoutAddress();
        const sba = this._checkoutService.getBillingAddress();
        if (ca == undefined || ca == null)
            return [of(null)];
        if (ca && ca['postCode']) {
            let cartSession = this.cartService.getCartSession();
            let itemsList: Array<any> = (cartSession["itemsList"] != undefined && cartSession["itemsList"] != null) ? cartSession["itemsList"] : [];
            let pinCode = ca['postCode'];
            // checkPinCodeAddressObservable = itemsList.map((element, i) => {
            //     return this._productService.checkPincodeApi(element.productId, pinCode);
            // });
            const msnArr = itemsList.map(item => item.productId);
            const pd = this._commonService.checkPincodeApi({ productId: msnArr, toPincode: pinCode });
            checkPinCodeAddressObservable.push(pd);
        }
        return checkPinCodeAddressObservable;
    }

    // checkPinCodeAddress(index, continueToNextTab): any {
    checkPinCodeAddress(pincodeRes): any {

        // console.log("[checkPinCodeAddress]................");
        let allPinCodeStatus: Array<any> = [];
        const unServicableItems = [];

        let cartSession = this.cartService.getCartSession();
        let itemsList: Array<any> = (cartSession["itemsList"] != undefined && cartSession["itemsList"] != null) ? cartSession["itemsList"] : [];
        const itemsListObject = itemsList.reduce((obj, item) => {
            return {
                ...obj,
                [item['productId']]: item,
            };
        }, {});
        // debugger;
        if (pincodeRes && pincodeRes['statusCode'] == 200) {
            for (let productId in pincodeRes['data']) {
                // this.isPincodeAvailble = true;
                const partNumber = pincodeRes['data'][productId];
                let pinCodeStatus = { codAvailable: true, serviceAvailable: true };
                // if (response["data"] !== null && response["statusCode"] == 200) {
                //alert(i);
                // const productId = Object.keys(response["data"])[0];
                // let partNumber = response["data"][productId];
                if (partNumber.aggregate.codAvailable) {
                    pinCodeStatus.codAvailable = true;
                }
                else {
                    pinCodeStatus.codAvailable = false;
                }
                if (partNumber.aggregate.serviceable) {
                    pinCodeStatus.serviceAvailable = true;
                }
                else {
                    pinCodeStatus.serviceAvailable = false;
                    if (itemsListObject[productId]) {
                        unServicableItems.push({
                            count: 1,
                            data: {
                                productName: itemsListObject[productId]["productName"],
                                text1: "in your cart is unservicable"
                            },
                            msnid: productId,
                            type: "unservicable"
                        })
                    }
                }
                allPinCodeStatus.push(pinCodeStatus);
                let codAvailable: boolean = allPinCodeStatus.every((element) => {
                    return element.codAvailable == true;
                })
                this._commonService.cashOnDeliveryStatus.isEnable = codAvailable;
                // }
                // else {
                //     pinCodeStatus.codAvailable = false;
                //     pinCodeStatus.serviceAvailable = false;
                //     allPinCodeStatus.push(pinCodeStatus);
                // }            
            }
        }

        if (this._router.url.indexOf('/checkout') != -1) {
            // debugger;
            let itemsValidationMessage = this._commonService.itemsValidationMessage;
            itemsValidationMessage = itemsValidationMessage.filter(item => item['type'] != 'unservicable')
            this._commonService.itemsValidationMessage = [...unServicableItems, ...itemsValidationMessage];
            this.unServicableItems$.emit();
        }

    }

    showMenu(index) {
        setTimeout(() => {
            this.selectedMenu = index;
            this.checkoutAddressIndex = index;
        }, 100);
    }

    showBillingMenu(index) {
        setTimeout(() => {
            this.selectedMenu = index;
            this.selectedBillingAddress = index;
        }, 100);
    }

    changeShippingAddress(global, type) {
        this.addShippingAddress = (type === 1) ? true : false;
        this.addBillingAddress = (type === 2) ? true : false;
        this.addressType = type;
        this.selectedBillingAddress = -1;
        this.checkoutAddressIndex = -1;
        this.updateCheckoutAddressIndex(global, type);
    }

    getAddressessCount(addressList, type) {
        return addressList.filter(a => a['addressType']['idAddressType'] === type).length;
    }

    onClickOutside(event) {
        // console.log(event);
        this.selectedMenu = event;
    }

    getAddressList(al, type, getSelectedType = null) {

        let filteredData = al.filter(a => a['addressType']['idAddressType'] === type);
        if (getSelectedType) {
            const selectedAddress = (getSelectedType == 1) ? this._checkoutService.getCheckoutAddress() : this._checkoutService.getBillingAddress();
            if (selectedAddress) {
                filteredData = al.filter(a => a['idAddress'] === selectedAddress['idAddress']);
            } else {
                return [];
            }
        }
        return filteredData;
    }

    outData(data) {
        // debugger;
        console.log(data);
        if (data.ua) {
            if (data.ua.index !== undefined) {
                this.updateCheckoutAddressIndex(data.ua.index, data.ua.type, data.ua.address);
                /* if (data.ua.type === 1) {
                    this.saf.sa = true;
                } else if (data.ua.type === 2) {
                    this.saf.ba = true;
                } */
            }

            if (data.ua.ra) {
                this.saf = { sa: false, ba: false, address: null };
            }
        } else if (data && data.da && data.da.index !== undefined) {
            this.deleteAddress(data.da);
        }

        if (data.ucai) {
            if (data.ucai['type'] === 1) {
                this.checkoutAddress = data.ucai['address'];
                this._checkoutService.setCheckoutAddress(data.ucai['address']);
                this.shippingAddressList = [data.ucai['address']];
            } else {
                this._checkoutService.setBillingAddress(data.ucai['address']);
                this.billingAddressList = [data.ucai['address']];
            }
            this.updateCheckoutAddress$.emit(data.ucai);
            if (data.ucai['type'] === 1) {
                this.checkServiceability();
            }
            // this.salpu.shipping = this.salpu.billing = false;              
        }

        if (data.hide) {
            this.salpu.shipping = this.salpu.billing = false;
        }
        /**
         * uit : Update Invoice Type
         */
        if (data.uit) {
            this.invoiceType = data.uit.type;
            if (data.uit.type != 'retail') {
                this.nti = true;
            }
            this.getAddressListApi();
        }
    }

    selectAddress() {
        const selectedAddressData = this._addressListService.getLastSelectedAddress();
        // console.log('selectedAddressData == ', selectedAddressData);
        if (selectedAddressData != null) {
            this.outData(selectedAddressData);
        }
        this.salpu.billing = false;
        this.salpu.shipping = false;
    }

    checkServiceability() {
        // debugger;
        /// console.log("[checkServiceability]..................");
        forkJoin([
            ...this.checkPinCodeAddressApi()
        ]).pipe(
            takeUntil(this.cDistryoyed),
            catchError((err) => {
                this._commonService.showLoader = false;
                return of(null);
            })
        ).subscribe((pincodeRes) => {
            this._commonService.showLoader = false;
            let isValidPincodeRes = true;
            for (let res of pincodeRes) {
                if (res == null) {
                    isValidPincodeRes = false
                }
            }
            if (isValidPincodeRes) {
                this.checkPinCodeAddress(pincodeRes[0]);
            } else {
                let itemsValidationMessage = this._commonService.itemsValidationMessage;
                itemsValidationMessage = itemsValidationMessage.filter(item => item['type'] != 'unservicable')
                this._commonService.itemsValidationMessage = itemsValidationMessage;
                this.unServicableItems$.emit();
            }
        })
    }
    closePopup(type?: number) {
        this.salpu.shipping = this.salpu.billing = false;
        // this.saf.sa = this.saf.ba = false;
        this.orderAddressList(type === 1 ? this.checkoutAddress : this.selectedBillingAddress);
    }

    orderAddressList(address) {
        const aList = [...this.addressList];
        const sai = aList.findIndex((add) => {
            // console.log(add, address);
            return add['idAddress'] === address['idAddress'];
        });

        aList.unshift(aList.splice(sai, 1)[0]);
        // console.log(aList);
        this.addressList = [...aList];
    }

    ngOnDestroy() {
        if (this.editBillingSubscriber) {
            this.editBillingSubscriber.unsubscribe();
        }
    }
}
