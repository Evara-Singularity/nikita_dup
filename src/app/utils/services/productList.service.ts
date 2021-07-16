import { Injectable } from '@angular/core';
import { CommonService } from '@services/common.service';
import { ProductListingDataEntity, SearchResponse } from '@utils/models/product.listing.search';
import { LocalStorageService } from 'ngx-webstorage';
import { DataService } from './data.service';
import { GlobalAnalyticsService } from './global-analytics.service';

@Injectable({
  providedIn: 'root'
})
export class ProductListService {
  productListingData: ProductListingDataEntity;
  inlineFilterData: any;
  pageName = "";

  constructor(
    private _commonService: CommonService,
    private _analytics: GlobalAnalyticsService,
    private _dataService: DataService,
    public _localStorageService: LocalStorageService,
  ) {
  }

  createAndProvideDataToSharedListingComponent(rawSearchData: SearchResponse, heading) {

    this.productListingData = {
      totalCount: rawSearchData.productSearchResult ? rawSearchData.productSearchResult.totalCount : 0,
      products: rawSearchData.productSearchResult.products,
      filterData: JSON.parse(JSON.stringify(rawSearchData.buckets)),
      listingHeading: heading
    };

    if (this._commonService.isBrowser) {
      const fragment = (Object.keys(this.extractFragmentFromUrl(window.location.hash))[0]).split('#').join('');
      this._commonService.selectedFilterData.filter = this._commonService.updateSelectedFilterDataFilterFromFragment(fragment);
      this._commonService.selectedFilterData.filterChip = this._commonService.updateSelectedFilterDataFilterFromFragment(fragment);
      this.initializeSortBy();
    }

  }

  extractFragmentFromUrl(str) {
    var pieces = str.split("&"), data = {}, i, parts;
    // process each query pair
    for (i = 0; i < pieces.length; i++) {
      parts = pieces[i].split("=");
      if (parts.length < 2) {
        parts.push("");
      }
      data[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
    }
    return data;
  }

  initializeSortBy() {
    const url = location.search.substring(1);
    const queryParams = url ? JSON.parse('{"' + decodeURI(url).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}') : {};

    if (queryParams.hasOwnProperty('orderBy') && queryParams.hasOwnProperty('orderWay') && queryParams['orderBy'] === 'price') {
      if (queryParams['orderWay'] === 'asc') {
        this._commonService.selectedFilterData['sortBy'] = 'lowPrice';
      } else {
        this._commonService.selectedFilterData['sortBy'] = 'highPrice';
      }
    } else {
      this._commonService.selectedFilterData['sortBy'] = 'popularity';
    }
  }

  calculateFilterCount(data) {
    let count = 0;
    data.forEach((el) => {
      for (let i = 0; i < el.terms.length; i++) {
        if (el.terms[i].selected) {
          console.log(el);
          count++;
          break;
        }
      }
    });
    return count;
  }

  analyticRFQ(isSubmitted: boolean = false, product) {
    console.log(product);
    const user = this._localStorageService.retrieve('user');
    let taxo1 = '';
    let taxo2 = '';
    let taxo3 = '';
    if (product['taxonomyCode']) {
      taxo1 = product['taxonomyCode'].split("/")[0] || '';
      taxo2 = product['taxonomyCode'].split("/")[1] || '';
      taxo3 = product['taxonomyCode'].split("/")[2] || '';
    }
    let ele = []; // product tags for adobe;
    product.productTags.forEach((element) => {
      ele.push(element.name);
    });
    const tagsForAdobe = ele.join("|");
    
    this._analytics.sendGTMCall({
      'event': !product.outOfStock ? 'rfq_instock' : 'rfq_oos'
    });
    
    if (isSubmitted) {
      this._analytics.sendGTMCall({
        'event': !product.outOfStock ? 'instockformSubmit' : 'oosformSubmit',
        'customerInfo': {
          "firstName": user['first_name'],
          "lastName": user['last_name'],
          "email": user['email'],
          "mobile": user['phone']
        },
        'productInfo': {
          'productName': product.productName,
          'brand': product['brand'],
          'quantity': (product['quantityAvailable'] ? product['quantityAvailable'] : null)
        }
      });
    }
    
    
    /*Start Adobe Analytics Tags */
    let page = null;
    if (!isSubmitted) {
      page = {
        'pageName': "moglix:bulk request form",
        'channel': "bulk request form",
        'subSection': "moglix:bulk request form",
        'loginStatus': (user && user["authenticated"] == 'true') ? "registered user" : "guest"
      }
    } else {
      page = {
        'pageName': "moglix:bulk request form",
        'channel': "bulk request form",
        'subSection': "moglix:bulk request form",
        'loginStatus': (user && user["authenticated"] == 'true') ? "registered user" : "guest",
        'linkPageName': "moglix:bulk request form",
        'linkName': "Get Quote"
      }
    }

    let custData = {
      'customerID': (user && user["userId"]) ? btoa(user["userId"]) : '',
      'emailID': (user && user["email"]) ? btoa(user["email"]) : '',
      'mobile': (user && user["phone"]) ? btoa(user["phone"]) : '',
      'customerType': (user && user["userType"]) ? user["userType"] : '',
    }
    let order = {
      'productID': product.msn,
      'productCategoryL1': taxo1,
      'productCategoryL2': taxo2,
      'productCategoryL3': taxo3,
      'brand': product['brand'],
      'tags': tagsForAdobe
    }
    this._analytics.sendAdobeCall({ page, custData, order }, (isSubmitted) ? "genericClick" : "genericPageLoad");
  }

  analyticAddToCart(routerlink, productDetails) {
    const user = this._localStorageService.retrieve('user');
    const taxonomy = productDetails['taxonomyCode'];
    const pageName = this.pageName.toLowerCase();
    let taxo1 = '';
    let taxo2 = '';
    let taxo3 = '';
    if (productDetails['taxonomyCode']) {
      taxo1 = productDetails['taxonomyCode'].split("/")[0] || '';
      taxo2 = productDetails['taxonomyCode'].split("/")[1] || '';
      taxo3 = productDetails['taxonomyCode'].split("/")[2] || '';
    }

    let ele = [];
    // this.productTags.forEach((element) => {
    //   ele.push(element.name);
    // });
    const tagsForAdobe = ele.join("|");
    
    let page = {
      'linkPageName': "moglix:" + taxo1 + ":" + taxo2 + ":" + taxo3 + ":pdp",
      'linkName': routerlink == "/quickorder" ? "Add to cart" : "Buy Now",
      'channel': pageName !== 'category' ? pageName : "listing",
      'pageName': pageName + "_page"
    }
    let custData = {
      'customerID': (user && user["userId"]) ? btoa(user["userId"]) : '',
      'emailID': (user && user["email"]) ? btoa(user["email"]) : '',
      'mobile': (user && user["phone"]) ? btoa(user["phone"]) : '',
      'customerType': (user && user["userType"]) ? user["userType"] : '',
    }
    let order = {
      'productID': productDetails.productId,
      'parentID': null,
      'productCategoryL1': taxo1,
      'productCategoryL2': taxo2,
      'productCategoryL3': taxo3,
      'price': productDetails.priceWithoutTax,
      'quantity': null,
      'brand': productDetails['brandName'],
      'tags': tagsForAdobe
    }

    this._analytics.sendAdobeCall({ page, custData, order }, "genericClick");

    this._analytics.sendGTMCall({
      'event': 'addToCart',
      'ecommerce': {
        'currencyCode': 'INR',
        'add': {
          'products': [{
            'name': productDetails.productName,     // Name or ID of the product is required.
            'id': productDetails.productId, // todo: partnumber
            'price': productDetails.priceWithoutTax,
            'brand': productDetails['brandName'],
            'category': (productDetails['taxonomy']) ? productDetails['taxonomy'] : '',
            'variant': '',
            'quantity': null,
            'productImg': productDetails.productImg
          }]
        }
      },
    });

    let trackingData = {
      event_type: "click",
      label: routerlink == "/quickorder" ? "add_to_cart" : "buy_now",
      product_name: productDetails.productName,
      msn: productDetails.productId,
      brand: productDetails['brandName'],
      price: productDetails.priceWithoutTax,
      quantity: null,
      channel: pageName !== 'category' ? pageName : "listing",
      category_l1: taxonomy.split("/")[0] ? taxonomy.split("/")[0] : null,
      category_l2: taxonomy.split("/")[1] ? taxonomy.split("/")[1] : null,
      category_l3: taxonomy.split("/")[2] ? taxonomy.split("/")[2] : null,
      page_type: pageName + "_page"
    }

    this._dataService.sendMessage(trackingData);
  }


}
