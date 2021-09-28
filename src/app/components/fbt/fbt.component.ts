
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, EventEmitter, Output, NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { ProductUtilsService } from '../../utils/services/product-utils.service';
import { CartService } from '../../utils/services/cart.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from '../../modules/modal/modal.module';
import { MathCeilPipeModule } from '../../utils/pipes/math-ceil';
import { MathFloorPipeModule } from '../../utils/pipes/math-floor';
import CONSTANTS from '../../config/constants';
import { CommonService } from '@app/utils/services/common.service';

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
    private cDistryoyed = new Subject();
    isModal = false;
    currentCTA = '';

    constructor(
        private cartService: CartService, 
        private _commonService: CommonService,
        private productUtil: ProductUtilsService, 
        private router: Router){
        this.isBrowser = _commonService.isBrowser;
    }

    ngOnInit() { this.intialize(); }

    intialize()
    {
        if (this.modalData) {
            this.isModal = this.modalData['isModal'];
            this.addToCartFromModal = this.modalData['backToCartFlow'];
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
            //console.log('fbtSource', fbtSource);
            if (fbtSource['rootProduct'] && fbtSource['fbtProducts']) {
                this.rootProduct = JSON.parse(JSON.stringify(fbtSource['rootProduct']));
                this.fbtProducts = JSON.parse(JSON.stringify(fbtSource['fbtProducts']));
                this.rootMSN = this.rootProduct['productBO']['partNumber'];
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
        let mainValidation = this.modifyProduct(this.rootProduct['productBO'], false);
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
            let priceQuantityCountry = productPartDetails[partReference]['productPriceQuantity']['india'];
            let oosFlag = priceQuantityCountry['outOfStockFlag'];
            let mrp = parseInt(priceQuantityCountry['mrp']);
            let sp = parseInt(priceQuantityCountry['sellingPrice']);
            if (oosFlag != true && mrp > 0 && sp > 0) {
                let productObject = {};
                let priceQuantityCountry = productPartDetails[partReference]['productPriceQuantity']['india'];
                productObject['status'] = true;
                productObject['outOfStock'] = oosFlag;
                productObject['productTags'] = product.productTags;
                productObject['canonicalUrl'] = product.defaultCanonicalUrl;
                let categoryDetails = product.categoryDetails[0];
                productObject['id_category_default'] = categoryDetails.categoryCode;
                productObject['category'] = categoryDetails.categoryName;
                productObject['taxonomy'] = categoryDetails.taxonomy;
                productObject['categoryCode'] = categoryDetails.categoryCode;
                productObject['taxonomyCode'] = categoryDetails.taxonomyCode;
                productObject['id_brand'] = product.brandDetails.idBrand;
                productObject['productName'] = product.productName;
                productObject['defaultPartNumber'] = product['defaultPartNumber'] ? product['defaultPartNumber'] : '';
                productObject['partNumber'] = product.partNumber;
                productObject['brand'] = product.brandDetails.brandName;
                productObject['productSmallImage'] = CONSTANTS.IMAGE_BASE_URL + product.productPartDetails[partReference].images[0].links.small;
                productObject['productImage'] = CONSTANTS.IMAGE_BASE_URL + product.productPartDetails[partReference].images[0].links.medium;
                productObject['url'] = product.productPartDetails[partReference].canonicalUrl;
                productObject['mrp'] = priceQuantityCountry.mrp;
                productObject['price'] = priceQuantityCountry.sellingPrice;
                productObject['priceWithoutTax'] = priceQuantityCountry.priceWithoutTax;
                productObject['moq'] = priceQuantityCountry.moq;
                productObject['incrementUnit'] = priceQuantityCountry.incrementUnit;
                productObject['quantity_avail'] = priceQuantityCountry.quantityAvailable;
                productObject['priceWithTax'] = priceQuantityCountry.sellingPrice;
                productObject['taxPercentage'] = 0;
                productObject['tax'] = 0;
                productObject['bulkPriceWithSameDiscount'] = priceQuantityCountry.bulkPrices;
                productObject['bulkPrice'] = null;
                //qunatity, discount,bulkSellingPrice,bulkPriceWithoutTax,discount   will be overriden as per quantity changes
                productObject['quantity'] = priceQuantityCountry.moq;
                productObject['discount'] = 0;
                productObject['bulkSellingPrice'] = null;
                productObject['bulkPriceWithoutTax'] = null;
                if (productObject['mrp'] > 0 && productObject['priceWithoutTax'] > 0) {
                    productObject['discount'] = (((productObject['mrp'] - productObject['priceWithoutTax']) / productObject['mrp']) * 100);
                }
                if (priceQuantityCountry.bulkPrices !== null && priceQuantityCountry.bulkPrices['india']) {
                    productObject['bulkPrice'] = priceQuantityCountry.bulkPrices['india'];
                }
                if (priceQuantityCountry.taxRule && priceQuantityCountry.taxRule.taxPercentage) {
                    productObject['taxPercentage'] = priceQuantityCountry.taxRule.taxPercentage;
                    productObject['tax'] = Number(productObject['price']) - Number(productObject['priceWithoutTax'])
                }
                productObject['isFBT'] = isFBT;
                if (isFBT) {
                    productObject['isSelected'] = true;
                    this.fbtMSNPrices[partReference] = productObject['priceWithoutTax'];
                } else {
                    productObject['isSelected'] = false;
                }
                returnObj = { mProduct: productObject, validation: true }
            }
        }
        return returnObj;
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
        let msn = product['partNumber'];
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

    initiateAddToCart()
    {
        this.setCTAType();
        this.addProducts();
    }

    setCTAType()
    {
        if (this.noOfFBTS > 0) {
            this.currentCTA = 'BUY TOGETHER';
        } else {
            this.currentCTA = this.isModal ? 'SKIP & GO TO CART' : 'ADD TO CART';
        }
        this.productUtil.sendTrackData(this.currentCTA, this.rootMSN);
    }

    addProducts()
    {
        let sessionDetails = this.cartService.getCartSession();
        let selectedItems = this.mFBTProducts.filter((product) => product['isSelected']);
        selectedItems.unshift(this.rootProduct);
        selectedItems.forEach((item) => { this.addProductInCart(sessionDetails['cart'], item); });
        this.removeCartPromoCode(sessionDetails);
        sessionDetails = this.cartService.getCartSession();
        this.updateCartSessions(this.cartService.getCartSession());
    }

    addProductInCart(sessionCartObject, product)
    {
        let sessionItemList: Array<any> = [];
        let sessionDetails = this.cartService.getCartSession();
        if (sessionDetails['itemsList']) {
            sessionItemList = sessionDetails['itemsList'];
        }
        let singleProductItem = { cartId: sessionCartObject.cartId };
        this.dynamicCartKeys.forEach((cartKey) =>
        {
            singleProductItem[cartKey] = product[this.dynamicCartProductMapping[cartKey]];
        })
        singleProductItem = Object.assign(singleProductItem, this.fixedCartProductMappings);
        let checkAddToCartData = this.checkAddToCart(sessionItemList, singleProductItem, product);
        if (checkAddToCartData.isvalid) {
            if (checkAddToCartData.product['partNumber'] == this.rootMSN) {
                this.productUtil.sendAdobeTags(checkAddToCartData.product, this.currentCTA);
            }
            sessionDetails["cart"]["buyNow"] = null;
            sessionDetails["itemsList"] = checkAddToCartData.itemlist;
            sessionDetails = this.cartService.updateCart(sessionDetails);
            this.cartService.setCartSession(sessionDetails);
        }
    }

    checkAddToCart(itemsList, addToCartItem, product): { itemlist: any, isvalid: boolean, product: any }
    {
        let isOrderValid: boolean = true;
        let addToCartItemIsExist: boolean = false;
        itemsList.forEach(item =>
        {
            if (addToCartItem.productId === item.productId) {
                addToCartItemIsExist = true;
                let quantity = item.productQuantity + product['incrementUnit'];
                if (quantity > Number(product['quantity_avail'])) {
                    item.productQuantity = item.productQuantity;
                    isOrderValid = false;
                }
                else {
                    this.productUtil.changeBulkPriceQuantity(quantity, product);
                    product['quantity'] = quantity;
                    item.productQuantity = product['quantity'];
                    item.taxes = product['quantity'] * product['tax'];
                    item.bulkPrice = product['bulkSellingPrice'];
                    item.bulkPriceWithoutTax = product['bulkPriceWithoutTax'];
                    item.bulkPriceMap = product['bulkPriceWithSameDiscount'];
                }
                item.totalPayableAmount = item.totalPayableAmount + addToCartItem.totalPayableAmount;
                item.tpawot = item.priceWithoutTax + addToCartItem.priceWithoutTax;
            }
        });
        if (!addToCartItemIsExist) {
            product['quantity'] = product['moq'];
            product = this.productUtil.changeBulkPriceQuantity(product['moq'], product);
            addToCartItem.productQuantity = product['quantity'];
            addToCartItem.taxes = product['quantity'] * product['tax'];
            addToCartItem.bulkPrice = product['bulkSellingPrice'];
            addToCartItem.bulkPriceWithoutTax = product['bulkPriceWithoutTax'];
            addToCartItem.bulkPriceMap = product['bulkPriceWithSameDiscount'];
            itemsList.push(addToCartItem);
        }
        return { itemlist: itemsList, isvalid: isOrderValid, product: product };
    }

    updateCartSessions(sessionDetails)
    {

        this._commonService.showLoader = true;
        let cartObject = {
            "cart": sessionDetails["cart"],
            "itemsList": sessionDetails["itemsList"],
            "addressList": sessionDetails['addressList'],
            "payment": sessionDetails['payment'],
            "deliveryMethod": sessionDetails['deliveryMethod'],
            "offersList": sessionDetails['offersList']
        };
        this.cartService.updateCartSession(cartObject).subscribe(
            data =>
            {
                if (data.status) {
                    this.cartService.setCartSession(data);
                    this.router.navigate(['/quickorder']);
                }
                this.closePopup$.emit();
                this._commonService.showLoader = false;
            },
            err => { this._commonService.showLoader = false; this.closePopup$.emit(); }
        );
    }

    backToCartFlow(routerLink)
    {
        this.closePopup$.emit();
        this.addToCartFromModal(routerLink);
    }

    navigateToPDP(url: string){
        this.router.navigateByUrl('/'+url);
    }

    removeCartPromoCode(cartSession)
    {
        cartSession['offersList'] = [];
        cartSession['extraOffer'] = null;
        cartSession['cart']['totalOffer'] = 0;
        let itemsList = cartSession["itemsList"];
        itemsList.forEach((element, index) =>
        {
            cartSession["itemsList"][index]['offer'] = null;
        });
        return cartSession;
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
  export default class FbtComponentModule {
  
  }
