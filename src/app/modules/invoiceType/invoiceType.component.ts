import { Component, EventEmitter, Output, OnInit, Input, AfterViewInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { environment } from 'environments/environment';
import CONSTANTS from '../../config/constants';
import { CartService } from '../../utils/services/cart.service';
import { CheckoutService } from '../../utils/services/checkout.service';
import { DataService } from '../../utils/services/data.service';
@Component({
    selector: 'invoice-type',
    templateUrl: 'invoiceType.html',
    styleUrls: ['./invoiceType.scss'],
})

export class InvoiceTypeComponent implements OnInit, AfterViewInit {

    @Output() outData$: EventEmitter<any> = new EventEmitter<any>();
    @Output() updateTabIndex: EventEmitter<number> = new EventEmitter<number>();

    @Input() taxHeading: string;
    @Input() taxSubHeading: string;

    totalAmount: number;
    globalConstants: {};
    invoiceTypeForm: FormGroup;
    type;
    showToolTip: boolean;
    imgAssetPath: string = environment.IMAGE_ASSET_URL

    constructor(
        public dataService: DataService,
        public cartService: CartService,
        private _formBuilder: FormBuilder,
        private _checkoutService: CheckoutService) {

        this.totalAmount = 0;

        // update data layer for invoice type
        const invoiceType = this._checkoutService.getInvoiceType();
        this.invoiceTypeForm = this._formBuilder.group({
            'type': [(invoiceType != 'retail'), [Validators.required]]
        });
        this.type = invoiceType;
    }

    ngOnInit() {
        this.globalConstants = CONSTANTS.GLOBAL;
        var cartData = this.cartService.getCartSession();
        if (cartData['itemsList'] !== null && cartData['itemsList']) {
            var totQuantity = 0;
            var trackData = {
                event_type: "page_load",
                page_type: "invoice_type",
                label: "view",
                channel: "Checkout",
                invoiceType: this.invoiceTypeForm.controls.type.value,
                price: cartData["cart"]["totalPayableAmount"] ? cartData["cart"]["totalPayableAmount"].toString() : '0',
                quantity: cartData["itemsList"].map(item => {
                    return totQuantity = totQuantity + item.productQuantity;
                })[cartData["itemsList"].length - 1],
                shipping: parseFloat(cartData["shippingCharges"]),
                itemList: cartData["itemsList"].map(item => {
                    return {
                        category_l1: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[0] : null,
                        category_l2: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[1] : null,
                        category_l3: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[2] : null,
                        price: item["totalPayableAmount"].toString(),
                        quantity: item["productQuantity"]
                    }
                })
            }
            this.dataService.sendMessage(trackData);
            // this.sessionCart = this.session;
        }
    }

    ngAfterViewInit() {
        // need to update delivery address component as per value of this._checkoutService.getInvoiceType
        this.outData$.emit({ uit: { type: this.type } });
    }

    continueCheckout(tabIndex) {
        this.updateTabIndex.emit(tabIndex);
    }

    updateInvoiceType() {
        if (this.invoiceTypeForm.controls.type.value == false) {
            this.type = 'retail';
        }
        else {
            this.type = 'tax';
        }

        this._checkoutService.setInvoiceType(this.type);

        var cartData = this.cartService.getCartSession();
        if (cartData['itemsList'] !== null && cartData['itemsList']) {
            var totQuantity = 0;
            var trackData = {
                event_type: "click",
                page_type: "invoice_type",
                label: "select_invoice",
                channel: "Checkout",
                invoiceType: this.type,
                price: cartData["cart"]["totalPayableAmount"] ? cartData["cart"]["totalPayableAmount"].toString() : '0',
                quantity: cartData["itemsList"].map(item => {
                    return totQuantity = totQuantity + item.productQuantity;
                })[cartData["itemsList"].length - 1],
                shipping: parseFloat(cartData["shippingCharges"]),
                itemList: cartData["itemsList"].map(item => {
                    return {
                        category_l1: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[0] : null,
                        category_l2: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[1] : null,
                        category_l3: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[2] : null,
                        price: item["totalPayableAmount"].toString(),
                        quantity: item["productQuantity"]
                    }
                })
            }
            this.dataService.sendMessage(trackData);
            // this.sessionCart = this.session;
        }
        this.outData$.emit({ uit: { type: this.type } });
    }

    showToolTipBox(e) {
        e.stopPropagation();
        this.showToolTip = !this.showToolTip;
    }


}
