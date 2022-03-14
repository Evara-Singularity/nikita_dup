
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, EventEmitter, Output, NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, Subject, Observable, concat, combineLatest, zip, forkJoin } from 'rxjs';
import { ProductUtilsService } from '../../utils/services/product-utils.service';
import { CartService } from '../../utils/services/cart.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from '../../modules/modal/modal.module';
import { MathCeilPipeModule } from '../../utils/pipes/math-ceil';
import { MathFloorPipeModule } from '../../utils/pipes/math-floor';
import CONSTANTS from '../../config/constants';
import { CommonService } from '@app/utils/services/common.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';

@Component({
    selector: 'fbt',
    templateUrl: './fbt.component.html',
    styleUrls: ['./fbt.component.scss']
})
export class FbtComponent implements OnInit
{
    @Output() closePopup$: EventEmitter<any> = new EventEmitter<any>();
    @Input('addToCartFromModal') addToCartFromModal = null;
    rootProduct;
    rootMSN;
    fbtProducts = [];
    mFBTProducts = [];
    rootProductInCart = false;
    isBrowser = false;
    fbtMSNPrices = {};
    noOfFBTS = 0; mainMSNPrice = 0; totalPrice = 0; totalFBTPrices = 0;
    fixedCartProductMappings = null;
    dynamicCartProductMapping = null;
    dynamicCartKeys = [];
    imagePath = CONSTANTS.IMAGE_BASE_URL;
    fbtSubscription: Subscription = null;
    rootProductSubscription = null;
    @Input('modalData') modalData = null;
    @Input('analytics') analytics = null;
    private cDistryoyed = new Subject();
    isModal = false;
    currentCTA = '';

    constructor(
        private cartService: CartService,
        private _commonService: CommonService,
        private productUtil: ProductUtilsService,
        private _analyticsService: GlobalAnalyticsService,
        private router: Router)
    {
        this.isBrowser = _commonService.isBrowser;
    }

    ngOnInit() { this.intialize(); }

    intialize()
    {
        if (this.modalData) {
            this.isModal = this.modalData['isModal'];
            this.addToCartFromModal = this.modalData['backToCartFlow'];
            this.analytics = this.modalData['analytics'];
        } else {
            this.isModal = false;
        }
        this.fixedCartProductMappings = this.productUtil.getFixedCartKeys();
        this.dynamicCartProductMapping = this.productUtil.getProductMapping();
        this.dynamicCartKeys = this.productUtil.getDynamicCartkeys();
        this.addSubscription();
    }

    addSubscription()
    {
        this.fbtSubscription = this.productUtil.currentFBTSource.subscribe((fbtSource) =>
        {
            if (fbtSource['rootProduct'] && fbtSource['fbtProducts']) {
                this.rootProduct = JSON.parse(JSON.stringify(fbtSource['rootProduct']));
                this.fbtProducts = JSON.parse(JSON.stringify(fbtSource['fbtProducts']));
                this.rootMSN = this.rootProduct['partNumber'];
                this.startProcess();
            } else {
                this.fbtProducts = [];
                this.mFBTProducts = [];
            }
        });
        this.rootProductSubscription = this.productUtil.notifyRootProduct.subscribe((inCart) =>
        {
            this.rootProductInCart = inCart;
        });
    }

    /**@description  checks main product in cart, merges main product with fbt products list*/
    startProcess()
    {
        let mainValidation = this.modifyProduct(this.rootProduct, false);
        this.mFBTProducts = [];
        this.fbtMSNPrices = {};
        if (mainValidation.validation) {
            this.rootProduct = mainValidation.mProduct;
            this.rootProduct['isFBT'] = false;
            this.rootProduct['isSelected'] = true;
            this.mainMSNPrice = this.rootProduct['priceWithoutTax'];
            this.fbtProducts.forEach((item, index) =>
            {
                let fbtValidation = this.modifyProduct(item, false);
                if (fbtValidation.validation && index < 3) {
                    this.mFBTProducts.push(fbtValidation['mProduct']);
                }
            })
            this.updateFBTPriceSection();
        }
    }

    /**
   * @description  modifies the item as per cart requirements and fbt section requirements
   * @param product:object to modify as per cart.
   * @param isFBT:boolean value to mark FBT type product or not
  */
    modifyProduct(product, isFBT)
    {
        let returnObj = { mProduct: product, validation: false }
        let partReference = product.partNumber;
        let productPartDetails = product['productPartDetails'];
        if (productPartDetails && productPartDetails[partReference]['productPriceQuantity'] && productPartDetails[partReference]['productPriceQuantity']['india']) {
            const productObject = this.cartService.getAddToCartProductItemRequest({ productGroupData: product, buyNow: false, quantity: 1, isFbt: isFBT });
            returnObj = { mProduct: productObject, validation: true }
        }
        return returnObj;
    }

    initiateAddToCart()
    {
        this.setCTAType();
        this.addToCart();
    }

    addToCart()
    {
        let selectedItems = this.mFBTProducts.filter((product) => product['isSelected']);
        selectedItems.unshift(this.rootProduct);
        this.handleCartSave(selectedItems);
    }

    handleCartSave(items: any[])
    {
        const LENGTH = items.length;
        this.cartService.addToCart({ buyNow: false, productDetails: items[0] }).subscribe((response) =>//length=1
        {
            this.updateCart(response, items.length === 1);
            if (LENGTH > 1) {
                this.cartService.addToCart({ buyNow: false, productDetails: items[1] }).subscribe((response) =>//length=2
                {
                    this.updateCart(response, items.length === 2);
                    if (LENGTH === 3) {
                        this.cartService.addToCart({ buyNow: false, productDetails: items[2] }).subscribe((response) =>//length=3
                        {
                            this.updateCart(response, items.length === 3);
                        });
                    }
                });
            }
        });
    }

    updateCart(result, isNaviagte)
    {
        this.cartService.setGenericCartSession(result);
        if (isNaviagte) {
            this.cartService.cart.next({ count: (result['itemsList'] as any[]).length });
            this.router.navigateByUrl('/quickorder');
        }
    }

    backToCartFlow()
    {
        this.closePopup$.emit();
        this.addToCartFromModal(false);
    }


    updateFBTPriceSection()
    {
        let fbts = (Object.values(this.fbtMSNPrices) as []);
        this.noOfFBTS = fbts.length;
        this.totalFBTPrices = (Object.values(fbts) as []).reduce((a, b) => a + b, 0);
        this.totalPrice = this.mainMSNPrice + this.totalFBTPrices;
    }

    updateFBT(product, index)
    {
        let msn = product['productId'];
        this.fbtMSNPrices.hasOwnProperty(msn);
        if (this.fbtMSNPrices.hasOwnProperty(msn)) {
            delete this.fbtMSNPrices[msn];
            this.mFBTProducts[index]['isSelected'] = false;
        } else {
            this.fbtMSNPrices[msn] = product['priceWithoutTax'];
            this.mFBTProducts[index]['isSelected'] = true;
        }
        this.updateFBTPriceSection();
    }


    setCTAType()
    {
        let linkName = "buy_together_fbt";
        if (this.noOfFBTS > 0) {
            this.currentCTA = 'BUY TOGETHER';
        } else {
            this.currentCTA = this.isModal ? 'SKIP & GO TO CART' : 'ADD TO CART';
            linkName = this.isModal ? 'skip_&_go_to_cart_fbt' : 'add_to_cart_fbt';
        }
        this.productUtil.sendTrackData(this.currentCTA, this.rootMSN);
        const page = this.analytics['page'];
        page['linkName'] = linkName;
        const custData = this.analytics['custData'];
        const order = this.analytics['order'];
        this._analyticsService.sendAdobeCall({ page, custData, order }, "genericClick");
    }


    navigateToPDP(url: string)
    {
        this.router.navigateByUrl('/' + url);
    }


    ngOnDestroy()
    {
        if (this.fbtSubscription && this.rootProductSubscription) {
            this.fbtSubscription.unsubscribe();
            this.rootProductSubscription.unsubscribe();
        }
        this.cDistryoyed.next();
        this.cDistryoyed.unsubscribe();
    }
}

@NgModule({
    declarations: [FbtComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule,
        MathCeilPipeModule,
        MathFloorPipeModule
    ]
})
export default class FbtComponentModule
{

}
