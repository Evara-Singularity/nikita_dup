import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';
import { DataService } from './data.service';
import { CartService } from './cart.service';
import { LocalAuthService } from './auth.service';
import { CommonService } from './common.service';
declare var digitalData: {};
declare let _satellite;


@Injectable({
    providedIn: 'root'
})
export class ProductUtilsService{

    readonly fixedCartProductMappings = { createdAt: new Date(), updatedAt: new Date(), offer: null, amountWithOffer: null, amountWithTaxes: null, isPersistant: true, expireAt: null, buyNow: false };
    readonly dynamicCartProductMapping = {
        productId: 'partNumber',
        amount: 'mrp',
        taxes: 'tax',
        totalPayableAmount: 'price',
        productName: 'productName',
        brandName: 'brand',
        productMRP: 'mrp',
        priceWithoutTax: 'priceWithoutTax',
        tpawot: 'priceWithoutTax',
        taxPercentage: 'taxPercentage',
        productSelling: 'price',
        discount: 'discount',
        productImg: 'productSmallImage',
        productUnitPrice: 'price',
        productUrl: 'url',
        bulkPriceMap: 'bulkPriceWithSameDiscount',
        categoryCode: 'categoryCode',
        taxonomyCode: 'taxonomyCode'
    }
    readonly dynamicCartKeys = Object.keys(this.dynamicCartProductMapping);
    fbtSource = new BehaviorSubject({ rootProduct: null, fbtProducts: [] });
    rootProduct = new BehaviorSubject(false);
    currentFBTSource = this.fbtSource.asObservable();
    notifyRootProduct = this.rootProduct.asObservable();
    sessionDetails = null;

    constructor(
        public dataService: DataService, 
        private cartService: CartService, 
        public localAuthService: LocalAuthService, 
        public commonService: CommonService, 
        public localStorageService: LocalStorageService){
    }

    changeFBTSource(rootProduct, fbtProducts)
    {
        this.fbtSource.next({ rootProduct: rootProduct, fbtProducts: fbtProducts });
        if (rootProduct && fbtProducts) {
            this.checkRootItemInCart(rootProduct['partNumber']);
        }
    }

    resetFBTSource(){
        this.fbtSource.next({ rootProduct: null, fbtProducts: [] });
        this.rootProduct.next(false);
    }

    checkRootItemInCart(msn)
    {
        this.rootProduct.next(this.checkItemInCart(this.cartService.getGenericCartSession, msn));
    }

    checkItemInCart(sessionDetails, msn: string)
    {
        let returnValue = false;
        if (sessionDetails && sessionDetails['itemsList'] && (sessionDetails['itemsList'] as any[]).length > 0) {
            let itemsList = (sessionDetails['itemsList'] as any[]);
            let filter = itemsList.filter((item) => msn.toLowerCase() === (item.productId as string).toLowerCase());
            if (filter.length == 1) {
                returnValue = true;
            }
        }
        return returnValue;
    }

    changeBulkPriceQuantity(quantity, product)
    {
        if (product['bulkPrice'] && (product['bulkPrice'] as any[]).length > 0) {
            (product['bulkPrice'] as any[]).forEach((element, index) =>
            {
                let condition1 = (element.minQty <= quantity && quantity <= element.maxQty);
                let condition2 = (product['bulkPrice'].length - 1 == index && quantity >= element.maxQty);
                if (condition1 || condition2) {
                    product['bulkSellingPrice'] = element.bulkSellingPrice;
                    product['bulkPriceWithoutTax'] = element.bulkSPWithoutTax;
                    if (product['mrp'] > 0 && product['price'] > 0) {
                        product['discount'] = (((product['mrp'] - element.bulkSellingPrice) / product['mrp']) * 100)
                    }
                }
            })
        }
        return product;
    }

    sendAdobeTags(product, cta:string)
    {
        let user = this.localStorageService.retrieve('user');
        let taxo1 = '', taxo2 = '', taxo3 = '', tagsForAdobe = '';
        if (product['productTags'] && product['productTags'].length > 0) {
            let ele = [];
            product['productTags'].forEach((element) => { ele.push(element.name); });
            tagsForAdobe = ele.join('|');
        }
        if (product['taxonomyCode']) {
            let arr = product['taxonomyCode'].split('/');
            taxo1 = arr[0] || ''; taxo2 = arr[1] || ''; taxo3 = arr[2] || '';
        }
        let page = {
            'linkPageName': 'moglix:' + taxo1 + ':' + taxo2 + ':' + taxo3 + ':pdp',
            'linkName': cta.toUpperCase().replace(/ /g, '_') + '_FBT',
        }
        let custData = {
            'customerID': (user && user['userId']) ? btoa(user['userId']) : '',
            'emailID': (user && user['email']) ? btoa(user['email']) : '',
            'mobile': (user && user['phone']) ? btoa(user['phone']) : '',
            'customerType': (user && user['userType']) ? user['userType'] : '',
        }
        let order = {
            'productID': product['partNumber'],
            'parentID': product['defaultPartNumber'] ? product['defaultPartNumber'] : '',
            'productCategoryL1': taxo1,
            'productCategoryL2': taxo2,
            'productCategoryL3': taxo3,
            'price': product['price'],
            'quantity': product['quantity'],
            'brand': product['brand'],
            'tags': tagsForAdobe
        }
        digitalData['page'] = page;
        digitalData['custData'] = custData;
        digitalData['order'] = order;
        if(_satellite){
            _satellite.track('genericClick');
        }
    }

    sendClickStream(product, cta:string)
    {
        let userId = this.localStorageService.retrieve('user') ? this.localStorageService.retrieve('user').sessionId : '';
        let clickStreamData = {
            msn: product['partNumber'],
            url_link: product['canonicalUrl'],
            availability_for_order: !product['outOfStock'] == true ? 1 : 0,
            session_id: userId,
            created_by_source: 'Mobile',
            category_id: product['id_category_default'],
            category_name: product['category'],
            id_brand: product['id_brand'],
            brand_name: product['brand'],
            product_name: product['productName'],
            user_id: userId ? userId : null,
            product_image: product['productImage'], 
            status: product['status'],
            product_url: product['url'],
            mrp: product['mrp'],
            price_without_tax: product['priceWithoutTax'],
            price_with_tax: product['priceWithTax'],
            out_of_stock: product['outOfStock']
        };
        //trackData(clickStreamData);
    }

    sendTrackData(cta: string, msn){
        let cartSession = this.cartService.getGenericCartSession;
        if (cartSession['itemsList'] !== null && cartSession['itemsList']) {
            var totQuantity = 0;
            var trackData = {
                event_type: 'click',
                page_type: 'product_page',
                msn: msn,
                label: 'cart_updated_fbt_' + cta.toLowerCase().replace(/ /g, '+'),
                channel: 'PDP',
                price: cartSession['cart']['totalPayableAmount'] ? cartSession['cart']['totalPayableAmount'].toString() : '',
                quantity: cartSession['itemsList'].map(item =>
                {
                    return totQuantity = totQuantity + item.productQuantity;
                })[cartSession['itemsList'].length - 1],
                shipping: parseFloat(cartSession['shippingCharges']),
                itemList: cartSession['itemsList'].map(item =>
                {
                    return {
                        category_l1: item['taxonomyCode'] ? item['taxonomyCode'].split('/')[0] : null,
                        category_l2: item['taxonomyCode'] ? item['taxonomyCode'].split('/')[1] : null,
                        category_l3: item['taxonomyCode'] ? item['taxonomyCode'].split('/')[2] : null,
                        price: item['totalPayableAmount'].toString(),
                        quantity: item['productQuantity']
                    }
                })
            }
            this.dataService.sendMessage(trackData);
        }
    }

    validateFBTProducts(fbtProducts: any[])
    {
        let validFBTS = [];
        fbtProducts.forEach((item) =>
        {
            if (this.validateProduct(item)) {
                validFBTS.push(item);
            }
        })
        return validFBTS;
    }

    validateProduct(item)
    {
        let isValid = false;
        if (!item) return isValid;
        let partReference = item.partNumber;
        let productPartDetails = item['productPartDetails'];
        if (productPartDetails && productPartDetails[partReference]['productPriceQuantity'] && productPartDetails[partReference]['productPriceQuantity']['india']) {
            let priceQuantityCountry = productPartDetails[partReference]['productPriceQuantity']['india'];
            let oosFlag = priceQuantityCountry['outOfStockFlag']
            let mrp = parseInt(priceQuantityCountry['mrp']);
            let sp = parseInt(priceQuantityCountry['sellingPrice']);
            if (oosFlag == false && mrp > 0 && sp > 0) {
                isValid = true;
            }
        }
        return isValid;
    }

    getFixedCartKeys() { return this.fixedCartProductMappings; }

    getProductMapping() { return this.dynamicCartProductMapping; }

    getDynamicCartkeys() { return this.dynamicCartKeys; }
}
