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
import { product } from "@app/config/static-en";
import { HttpHeaders } from "@angular/common/http";

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
    public _localStorageService: LocalStorageService,
    private globalAnalyticsService: GlobalAnalyticsService,
  ) {}

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
              "medium"
            );
          product["mainImageMediumLink"] =
            this.getImageFromSearchProductResponse(
              product["mainImageLink"],
              "large",
              "medium"
            );
          product['productTags'] = this._commonService.sortProductTagsOnPriority(product['productTags']);
          product["internalProduct"] = product.hasOwnProperty("internalProduct")
            ? false
            : true, // if intenal product prop does not exist then it is internal product
          product["discount"] = this._commonService.calculcateDiscount(
            product["discount"],
            product["mrp"],
            product["salesPrice"]
          );
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

  getSerachProductList(productSearchResult) {
    return [...productSearchResult].map(
      (product) => {
        product["mainImageThumnailLink"] =
          this.getImageFromSearchProductResponse(
            product["mainImageLink"],
            "large",
            "medium"
          );
        product["mainImageMediumLink"] =
          this.getImageFromSearchProductResponse(
            product["mainImageLink"],
            "large",
            "medium"
          );
        product['productTags'] = (product['productTags'] && product['productTags'].length > 0)?[this._commonService.sortProductTagsOnPriority(product['productTags'])[0]]:'';
        product["internalProduct"] = product.hasOwnProperty("internalProduct")
          ? false
          : true, // if intenal product prop does not exist then it is internal product
          product["discount"] = this._commonService.calculcateDiscount(
            product["discount"],
            product["mrp"],
            product["salesPrice"]
          );
        return product;
      }
    );
  }

  getProductTag(product) {

    if (product && product["productTags"] && product["productTags"].length > 1) {
      return [product["productTags"][product["productTags"].length - 1]];
    }
    if (product["productTags"] && product["productTags"].length == 1) {
      return [product["productTags"][0]];
    }
    return [];
  }

  getFilterBucket(categoryId, pageName, brandName?: string, isHindiUrl?: boolean) {
    if (this._commonService.isBrowser) {
      this.showMidPlpFilterLoader = true;
      const headerData = {}
      if (isHindiUrl) {
        headerData['language'] = 'hi'
      }
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
        headerData: headerData
      });
    } else {
      return of({});
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
    // due to & split filter is not working for L&T, C&S type of brands
    var pieces = [str],
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
    const queryParams = this._commonService.extractQueryParamsManually(
      location.search.substring(1)
    );

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

    if (isSubmitted && product && product.productName && product['brand']) {
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

    let custData =this._commonService.custDataTracking
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
    let str = "listing";
    let adCampaignName =''
    if(module.startsWith('ADS_FEATURE')){
      adCampaignName = module.replace('ADS_FEATURE_','')
      module = 'ADS_FEATURE';
      // console.log('module ==>', module, adCampaignName);
    }
    switch (module) {
      case "PRODUCT":
        str = "pdp";
        break;
      case "LISTING_PAGES":
        str = "listing";
        break;
      case "PRODUCT_SIMILAR_OUT_OF_STOCK":
        str = "pdp:oos:similar";
        break;
      case "PRODUCT_SIMILAR_OUT_OF_STOCK_TOP":
        str = "pdp:oos:similar:top";
        break;
      case "SEACRH_SUGGESTION":
        str = "search:suggestion";
        break;
      case "PRODUCT_PAST_ORDER":
        str = "pdp:past_order";
        break;
      case "POPULAR_DEALS":
        str = "pdp:popular_deals";
        break;
      case "POPULAR_DEALS_HOME":
        str =  "homepage:popular_deals";
        break;
      case "POPULAR_DEALS_QUICKORDER":
        str =  "quickorder:you_may_interested_in";
        break;
      case "MORE_ITEMS_TO_EXPLORE":
        str =  "quickorder:more_items_to_explore";
        break;     
      case "SPONSERED_ADS":
        str = "pdp:sponsored_ads";
        break;
      case "PRODUCT_RECENT_PRODUCT":
        str = "pdp:product_recent_product";
        break;
      case "PRODUCT_RECENT_PRODUCT_ALP":
        str = "alp:product_recent_product";
        break;
      case "PRODUCT_RECENT_PRODUCT_BRAND":
        str = "brand:product_recent_product";
        break;
      case "PRODUCT_RECENT_PRODUCT_BRAND_CATEGORY":
        str = "category_brand:product_recent_product";
        break;
      case "PRODUCT_RECENT_PRODUCT_SEARCH":
        str = "search:product_recent_product";
        break;
      case "PRODUCT_RECENT_PRODUCT_CATEGORY":
        str = "category:product_recent_product";
        break;
      case "PRODUCT_RECENT_PRODUCT_PLP_PAGE_NOT_FOUND":
        str = "plp_notfound:product_recent_product";
        break;
      case "PRODUCT_RECENT_PRODUCT_PDP_PAGE_NOT_FOUND":
        str = "pdp_notfound:product_recent_product";
        break;  
      case "HOME_RECENT":
        str = "pdp:home_recent";
        break;
      case "SEACRH_SUGGESTION":
        str = "pdp:search_suggestion";
        break;
      case "PRODUCT_SIMILAR":
        str = "pdp:product_similar";
        break;
      case "HOME_PRODUCT":
        str = "pdp:home_product";
        break;
      case "WISHLIST":
        str = "pdp:widget:wishlist";
        break;
      case "CART-ADD-SIMILAR-PRODUCT":
        str = "pdp:widget:cart:similar";
        break;
      case "CART-ADD-COMPARE-PRODUCT":
        str = "pdp:widget:compare_products";
        break;
      case "ADS_FEATURE":
        str = "pdp:widget:" + adCampaignName;
        break;
      default:
        str = "pdp-extra";
        break;
    }
    return str;
  }

  analyticAddToCart(routerlink, productDetails, usedInModule = "PRODUCT") {
    // console.log("analyticAddToCart ======>" , usedInModule);
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

    // console.log('usedInModule', usedInModule);

    let ele = [];
    const tagsForAdobe = ele.join("|");
    let page = {
      linkPageName:
        "moglix:" +
        taxo1 +
        ":" +
        taxo2 +
        ":" +
        taxo3 +
        ":" +
        this.getModuleString(usedInModule),
      linkName: routerlink == "/quickorder" ? "Add to cart" : "Buy Now",
      channel: pageName !== "category" ? pageName : "listing",
      // 'pageName': pageName + "_page" // removing as we need same as visiting
    };
    let custData = this._commonService.custDataTracking
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
    if(
      product && productDetails.productName && 
      productDetails.productId && productDetails.productUnitPrice && 
      productDetails["brandName"] && productDetails["category"])
    {
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
    }

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

    this.globalAnalyticsService.sendMessage(trackingData);
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
      const cartSession = this._cartService.getGenericCartSession || {};
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
    if(criteoItem && criteoItem.length) {
      this._analytics.sendGTMCall(dataLayerObj);
    }
    this.globalAnalyticsService.sendMessage(dataLayerObj);
  }
}
