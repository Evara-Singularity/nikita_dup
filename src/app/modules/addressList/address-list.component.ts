import { Component, Output, Input, EventEmitter, Inject, OnInit, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectionStrategy, PLATFORM_ID, ViewChild } from '@angular/core';
import { of } from 'rxjs/observable/of';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { delay } from 'rxjs/operators';
import { AddressListService } from './address-list.service';
import { BottomMenuComponent } from '../bottomMenu/bottom-menu.component';
import { CartService } from '../../utils/services/cart.service';
import { CheckoutService } from '../../utils/services/checkout.service';


@Component({
    selector: 'app-address-list',
    templateUrl: './address-list.component.html',
    styleUrls: ['./address-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class AddressListComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(BottomMenuComponent) _bottomMenuComponent: BottomMenuComponent;
    @Output() outData$: EventEmitter<any> = new EventEmitter<any>();
    @Input() type: number;
    @Input() layoutType: string;
    @Input() invoiceType: string;
    @Input() showRadio: boolean;
    addressList: Array<{}>;
    sai: number; // sai: selected address index
    selectedBillingAddress: number;
    sbm: { index: number, type: number, address: {} }; // sbm: show bottom menu
    @Input() addresses: [];
    isServer: boolean;
    isBrowser: boolean;
    constructor(
        @Inject(PLATFORM_ID) platformId,
        private cartService: CartService,
        private _checkoutService: CheckoutService,
        private _addressListService: AddressListService) {
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit() {
        this.sai = 0;
        this.cartService.selectedBusinessAddressObservable.subscribe((data) => {
            this.selectedBillingAddress = data.length - 1;
            this._checkoutService.setBillingAddress(this.addressList[this.selectedBillingAddress]);
        });
        if (document.getElementsByClassName('open').length === 0) {
            document.getElementById('body').classList.add('popup-overlay');
        }
        this.setAddressIndex();

        if (!this.layoutType) {
            this.layoutType = 'LIST';
        }
    }

    setAddressIndex() {
        const selectedAddress = (this.type == 1) ? this._checkoutService.getCheckoutAddress() : this._checkoutService.getBillingAddress();

        if (this.addresses && selectedAddress && this.addresses.length > 0) {
            this.addresses.forEach((address, index) => {
                console.log(address['idAddress'], selectedAddress['idAddress']);
                if (address['idAddress'] == selectedAddress['idAddress']) {
                    this.sai = index;
                }
            });
        }

        // auto selected 
        this._addressListService.setLastSelectedAddress(null);
    }

    // ngOnChanges(changes: SimpleChanges): void {

    // }

    ngOnDestroy() {
        of(null)
            .pipe(
                delay(200)
            )
            .subscribe(() => {
                if (this.isBrowser && document.getElementsByClassName('open').length === 0) {
                    (<HTMLElement>document.getElementById('body')).classList.remove('stop-scroll');
                    this.enableScroll();
                }
            });
    }

    ngAfterViewInit() {
    }

    preventDefault(e) {
        e.preventDefault();
    }

    disableScroll() {
        document.body.addEventListener('touchmove', this.preventDefault, { passive: false });
    }

    enableScroll() {
        document.body.removeEventListener('touchmove', this.preventDefault);
    }

    displayAddress(address) {
        const a = [];
        if (address.addressLine !== undefined) {
            a.push(address.addressLine);
        }
        if (address.city !== undefined) {
            a.push(address.city);
        }
        if (address.state !== undefined && address.state.name !== undefined) {
            a.push(address.state.name);
        }
        if (address.country !== undefined && address.country.name !== undefined) {
            a.push(address.country.name);
        }
        return a.join(', ') + ' - ' + address.postCode;
    }

    /**
     * ucai: update checkout address index
     * @param index : selected shipping/billing address index
     * @param addressType : 1/2, 1: shipping, 2: billing
     */
    ucai(address, addressType, selectedIndex) {
        this.sai = selectedIndex;
        this._addressListService.setLastSelectedAddress({
            ucai: { address: address, type: addressType }
        });
        // this.outData$.emit({
        //     ucai: { address: address, type: addressType }
        // });
    }

    /**
     * used to update address shipping/billing
     * ua: Update Address
     */
    updateAddress() {
        this.outData$.emit({
            ua: this.sbm
        });
        this.sbm = undefined;

    }
    resetAddressCall() {
        this._bottomMenuComponent.updateParent({ popupClose: true });
    }
    resetAddress() {
        this.sbm = undefined;
        this.outData$.emit({
            ua: { ra: true } // ra: Reset Address
        });
    }
    onUpdate(data) {
        if (data.popupClose) {
            this.resetAddress();
        }
    }

    deleteAddress() {
        // console.log(this.sbm, this.sai);
        this.outData$.emit({
            da: this.sbm
        });

        this.sai = null;
        // if (this.sai == this.sbm.index) {
        //     this.sai = 0;
        // }

        this.sbm = undefined;
        this.setAddressIndex();
    }
}
