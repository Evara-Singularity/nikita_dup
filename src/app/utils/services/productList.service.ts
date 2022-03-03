import { Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import CONSTANTS from "@app/config/constants";
import { ENDPOINTS } from "@app/config/endpoints";
import { CommonService } from "@services/common.service";
import { environment } from "environments/environment";
import {
  ProductListingDataEntity,
  ProductsEntity,
  SearchResponse,
} from "@utils/models/product.listing.search";
import { LocalStorageService } from "ngx-webstorage";
import { CartService } from "./cart.service";
import { DataService } from "./data.service";
import { GlobalAnalyticsService } from "./global-analytics.service";
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ProductListService {
  productListingData: ProductListingDataEntity;
  inlineFilterData: any;
  pageName = "";

  constructor(
    private _commonService: CommonService,
    private _analytics: GlobalAnalyticsService,
    private _dataService: DataService,
    private _activatedRoute: ActivatedRoute,
    private _cartService: CartService,
    public _localStorageService: LocalStorageService
  ) { }

  showMidPlpFilterLoader: boolean = true;
  excludeAttributes: string[] = [];

  filterBuckets(buckets: any[]) {
    if (this.excludeAttributes.length > 0) {
      return buckets.filter(
        (bucket) => this.excludeAttributes.indexOf(bucket.name) == -1
      );
    }
    return buckets;
  }

  createAndProvideDataToSharedListingComponent(
    rawSearchData: SearchResponse,
    heading,
    bucketAvailable?: boolean
  ) {
    if (bucketAvailable) {
      if (this.excludeAttributes.length > 0) {
        rawSearchData.buckets = this.filterBuckets(rawSearchData.buckets);
      }
      this.productListingData["filterData"] = JSON.parse(
        JSON.stringify(rawSearchData.buckets)
      );
      this.showMidPlpFilterLoader = false;
      return;
    }

    //Removing Products with null images
    rawSearchData.productSearchResult.products =
      rawSearchData.productSearchResult.products.filter(
        (res) => res.mainImageLink != null
      );

    this.productListingData = {
      totalCount: rawSearchData.productSearchResult.products.length
        ? rawSearchData.productSearchResult.totalCount
        : 0,
      products: [...rawSearchData.productSearchResult.products].map(
        (product) => {
          product["mainImageThumnailLink"] =
            this.getImageFromSearchProductResponse(
              product["mainImageLink"],
              "large",
              "thumbnail"
            );
          product["mainImageMediumLink"] =
            this.getImageFromSearchProductResponse(
              product["mainImageLink"],
              "large",
              "medium"
            );
          product["internalProduct"] = true;
          return product;
        }
      ),
      listingHeading: heading,
    };

    if (this._commonService.isBrowser) {
      const fragment = Object.keys(
        this.extractFragmentFromUrl(window.location.hash)
      )[0]
        .split("#")
        .join("");
      this._commonService.selectedFilterData.filter =
        this._commonService.updateSelectedFilterDataFilterFromFragment(
          fragment
        );
      this._commonService.selectedFilterData.filterChip =
        this._commonService.updateSelectedFilterDataFilterFromFragment(
          fragment
        );
      this.initializeSortBy();
    }
  }

  getFilterBucket(categoryId, pageName, brandName?: string) {
    if (this._commonService.isBrowser) {
      this.showMidPlpFilterLoader = true;

      let filter_url =
        environment.BASE_URL +
        "/" +
        pageName.toLowerCase() +
        ENDPOINTS.GET_BUCKET;

      if (categoryId) {
        filter_url += "?category=" + categoryId;
      }

      const fragment = Object.keys(
        this.extractFragmentFromUrl(window.location.hash)
      )[0]
        .split("#")
        .join("");

      const params = {
        filter:
          this._commonService.updateSelectedFilterDataFilterFromFragment(
            fragment
          ),
        queryParams: this._activatedRoute.snapshot.queryParams,
        pageName: pageName,
      };
      const actualParams = this._commonService.formatParams(params);
      if (pageName === "BRAND") {
        actualParams["brand"] = brandName;
      }
      return this._dataService.callRestful("GET", filter_url, {
        params: actualParams,
      });
    } else {
      return new Observable();
    }
  }

  getImageFromSearchProductResponse(
    originImageLink,
    variantFromName,
    variantGetName
  ) {
    const image = originImageLink.split("/");
    image[image.length - 1] = image[image.length - 1].replace(
      variantFromName,
      variantGetName
    );
    return image.join("/");
  }

  extractFragmentFromUrl(str) {
    var pieces = str.split("&"),
      data = {},
      i,
      parts;
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
    const queryParams = this._commonService.extractQueryParamsManually(location.search.substring(1));

    if (
      queryParams.hasOwnProperty("orderBy") &&
      queryParams.hasOwnProperty("orderWay") &&
      queryParams["orderBy"] === "price"
    ) {
      if (queryParams["orderWay"] === "asc") {
        this._commonService.selectedFilterData["sortBy"] = "lowPrice";
      } else {
        this._commonService.selectedFilterData["sortBy"] = "highPrice";
      }
    } else {
      this._commonService.selectedFilterData["sortBy"] = "popularity";
    }
  }

  calculateFilterCount(data) {
    let count = 0;
    data.forEach((el) => {
      for (let i = 0; i < el.terms.length; i++) {
        if (el.terms[i].selected) {
          count++;
          break;
        }
      }
    });
    return count;
  }

  analyticRFQ(isSubmitted: boolean = false, product) {
    const user = this._localStorageService.retrieve("user");
    let taxo1 = "";
    let taxo2 = "";
    let taxo3 = "";
    if (product["taxonomyCode"]) {
      taxo1 = product["taxonomyCode"].split("/")[0] || "";
      taxo2 = product["taxonomyCode"].split("/")[1] || "";
      taxo3 = product["taxonomyCode"].split("/")[2] || "";
    }
    let ele = []; // product tags for adobe;
    product.productTags.forEach((element) => {
      ele.push(element.name);
    });
    const tagsForAdobe = ele.join("|");

    this._analytics.sendGTMCall({
      event: !product.outOfStock ? "rfq_instock" : "rfq_oos",
    });

    if (isSubmitted) {
      this._analytics.sendGTMCall({
        event: !product.outOfStock ? "instockformSubmit" : "oosformSubmit",
        customerInfo: {
          firstName: user["first_name"],
          lastName: user["last_name"],
          email: user["email"],
          mobile: user["phone"],
        },
        productInfo: {
          productName: product.productName,
          brand: product["brand"],
          quantity: product["quantityAvailable"]
            ? product["quantityAvailable"]
            : null,
        },
      });
    }

    /*Start Adobe Analytics Tags */
    let page = null;
    if (!isSubmitted) {
      page = {
        channel: "bulk request form : " + this.pageName.toLowerCase(),
        loginStatus:
          user && user["authenticated"] == "true" ? "registered user" : "guest",
      };
    } else {
      page = {
        channel: "bulk request form :" + this.pageName.toLowerCase(),
        loginStatus:
          user && user["authenticated"] == "true" ? "registered user" : "guest",
        linkPageName:
          "moglix:bulk request form :" + this.pageName.toLowerCase(),
        linkName: "Get Quote",
      };
    }

    let custData = {
      customerID: user && user["userId"] ? btoa(user["userId"]) : "",
      emailID: user && user["email"] ? btoa(user["email"]) : "",
      mobile: user && user["phone"] ? btoa(user["phone"]) : "",
      customerType: user && user["userType"] ? user["userType"] : "",
    };
    let order = {
      productID: product.msn,
      productCategoryL1: taxo1,
      productCategoryL2: taxo2,
      productCategoryL3: taxo3,
      brand: product["brand"],
      tags: tagsForAdobe,
    };
    this._analytics.sendAdobeCall(
      { page, custData, order },
      isSubmitted ? "genericClick" : "genericPageLoad"
    );
  }

  getModuleString(module) {
    let str = 'listing';
    switch (module) {
      case 'PRODUCT':
        str = 'pdp'
        break;
      case 'LISTING':
        str = 'listing'
        break;
      case 'PRODUCT_SIMILAR_OUT_OF_STOCK':
        str = 'pdp:oos:similar'
        break;
      case 'PRODUCT_SIMILAR_OUT_OF_STOCK_TOP':
        str = 'pdp:oos:similar:top'
        break;
      case 'SEACRH_SUGGESTION':
        str = 'search:suggestion'
        break;
      case 'PRODUCT_PAST_ORDER':
        str = 'pdp:past_order'
        break;
      default:
        str = 'pdp-extra'
        break;
    }
    return str;
  }

  analyticAddToCart(routerlink, productDetails, usedInModule = 'PRODUCT') {
    const user = this._localStorageService.retrieve("user");
    const taxonomy = productDetails["taxonomyCode"];
    const pageName = this.pageName.toLowerCase();
    let taxo1 = "";
    let taxo2 = "";
    let taxo3 = "";
    if (productDetails["taxonomyCode"]) {
      taxo1 = productDetails["taxonomyCode"].split("/")[0] || "";
      taxo2 = productDetails["taxonomyCode"].split("/")[1] || "";
      taxo3 = productDetails["taxonomyCode"].split("/")[2] || "";
    }

    let ele = [];
    const tagsForAdobe = ele.join("|");
    let page = {
      'linkPageName': "moglix:" + taxo1 + ":" + taxo2 + ":" + taxo3 + ":" + this.getModuleString(usedInModule),
      'linkName': routerlink == "/quickorder" ? "Add to cart" : "Buy Now",
      'channel': pageName !== 'category' ? pageName : "listing",
      // 'pageName': pageName + "_page" // removing as we need same as visiting
    };
    let custData = {
      customerID: user && user["userId"] ? btoa(user["userId"]) : "",
      emailID: user && user["email"] ? btoa(user["email"]) : "",
      mobile: user && user["phone"] ? btoa(user["phone"]) : "",
      customerType: user && user["userType"] ? user["userType"] : "",
    };
    let order = {
      productID: productDetails.productId,
      parentID: null,
      productCategoryL1: taxo1,
      productCategoryL2: taxo2,
      productCategoryL3: taxo3,
      price: productDetails.productUnitPrice,
      quantity: productDetails["productQuantity"],
      brand: productDetails["brandName"],
      tags: tagsForAdobe,
    };

    this._analytics.sendAdobeCall({ page, custData, order }, "genericClick");

    this._analytics.sendGTMCall({
      event: "addToCart",
      ecommerce: {
        currencyCode: "INR",
        add: {
          products: [
            {
              name: productDetails.productName, // Name or ID of the product is required.
              id: productDetails.productId, // todo: partnumber
              price: productDetails.productUnitPrice,
              brand: productDetails["brandName"],
              category: productDetails["category"]
                ? productDetails["category"]
                : "",
              variant: "",
              quantity: productDetails["productQuantity"],
              productImg: productDetails.productImg,
              brandId: productDetails["brandId"],
              CatId: productDetails["taxonomyCode"],
              MRP: productDetails["amount"],
              Discount:
                productDetails["discount"] && !isNaN(productDetails["discount"])
                  ? parseInt(productDetails["discount"])
                  : null,
            },
          ],
        },
      },
    });

    let trackingData = {
      event_type: "click",
      label: routerlink == "/quickorder" ? "add_to_cart" : "buy_now",
      product_name: productDetails.productName,
      msn: productDetails.productId,
      brand: productDetails["brandName"],
      price: productDetails.productUnitPrice,
      quantity: productDetails.productQuantity,
      channel: pageName !== "category" ? pageName : "listing",
      category_l1: taxonomy.split("/")[0] ? taxonomy.split("/")[0] : null,
      category_l2: taxonomy.split("/")[1] ? taxonomy.split("/")[1] : null,
      category_l3: taxonomy.split("/")[2] ? taxonomy.split("/")[2] : null,
      page_type: pageName + "_page",
    };

    this._dataService.sendMessage(trackingData);
    this.fireViewBasketEvent();
  }

  fireViewBasketEvent() {
    let eventData = {
      prodId: "",
      prodPrice: 0,
      prodQuantity: 0,
      prodImage: "",
      prodName: "",
      prodURL: "",
    };
    let criteoItem = [];
    setTimeout(() => {
      const cartSession = this._cartService.getCartSession() || {};
      if (cartSession && cartSession.hasOwnProperty("itemsList")) {
        for (let p = 0; p < cartSession["itemsList"].length; p++) {
          criteoItem.push({
            name: cartSession["itemsList"][p]["productName"],
            id: cartSession["itemsList"][p]["productId"],
            price: cartSession["itemsList"][p]["productUnitPrice"],
            quantity: cartSession["itemsList"][p]["productQuantity"],
            image: cartSession["itemsList"][p]["productImg"],
            url:
              CONSTANTS.PROD + "/" + cartSession["itemsList"][p]["productUrl"],
          });
          eventData["prodId"] =
            cartSession["itemsList"][p]["productId"] +
            ", " +
            eventData["prodId"];
          eventData["prodPrice"] =
            cartSession["itemsList"][p]["productUnitPrice"] *
            cartSession["itemsList"][p]["productQuantity"] +
            eventData["prodPrice"];
          eventData["prodQuantity"] =
            cartSession["itemsList"][p]["productQuantity"] +
            eventData["prodQuantity"];
          eventData["prodImage"] =
            cartSession["itemsList"][p]["productImg"] +
            ", " +
            eventData["prodImage"];
          eventData["prodName"] =
            cartSession["itemsList"][p]["productName"] +
            ", " +
            eventData["prodName"];
          eventData["prodURL"] =
            cartSession["itemsList"][p]["productUrl"] +
            ", " +
            eventData["prodURL"];
        }
      }
    }, 0);
    let user = this._localStorageService.retrieve("user");

    /*Start Criteo DataLayer Tags */

    const dataLayerObj = {
      event: "viewBasket",
      email: user && user.email ? user.email : "",
      currency: "INR",
      productBasketProducts: criteoItem,
      eventData: eventData,
    };
    this._analytics.sendGTMCall(dataLayerObj);
    this._dataService.sendMessage(dataLayerObj);
  }

}
