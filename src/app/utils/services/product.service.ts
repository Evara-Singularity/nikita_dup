import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { of } from "rxjs";
import { DataService } from "./data.service";
import CONSTANTS from "../../config/constants";
import { ENDPOINTS } from "@app/config/endpoints";
interface ProductDataArg {
  productBO: string;
  refreshCrousel?: boolean;
  subGroupMsnId?: string;
}

@Injectable({
  providedIn: "root",
})
export class ProductService {
  readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
  readonly imagePathAsset = CONSTANTS.IMAGE_ASSET_URL;
  private basePath = CONSTANTS.NEW_MOGLIX_API;

  oosSimilarProductsData = {
    similarData: [],
  };

  constructor(private _dataService: DataService, public http: HttpClient) {}

  getPurchaseList(data) {
    let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.PRC_LIST;
    return this._dataService.callRestful("GET", url, { params: data }).pipe(
      catchError((res: HttpErrorResponse) => {
        return of({ status: false, statusCode: res.status, data: [] });
      })
    );
  }

  addToPurchaseList(obj) {
    let url = this.basePath + ENDPOINTS.ADD_PURCHASE_LIST;
    return this._dataService.callRestful("POST", url, { body: obj });
  }

  removePurchaseList(data) {
    let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.RM_PCR_LIST;
    return this._dataService.callRestful("POST", url, { body: data });
  }

  getFBTProducts(msn) {
    return this._dataService.callRestful(
      "GET",
      CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.PRODUCT_FBT + "?productId=" + msn
    );
  }

  getProduct(msn) {
    return this._dataService.callRestful(
      "GET",
      CONSTANTS.NEW_MOGLIX_API +
        ENDPOINTS.PRODUCT_INFO +
        `?productId=${msn}&fetchGroup=true`
    );
  }

  getProductPageBreadcrum(msn) {
    return this._dataService.callRestful(
      "GET",
      CONSTANTS.NEW_MOGLIX_API +
        ENDPOINTS.BREADCRUMB +
        `?source=${msn}&type=product`
    );
  }

  getSimilarProducts(productName, categoryId) {
    const URL =
      this.basePath +
      ENDPOINTS.SIMILAR_PRODUCTS +
      "?str=" +
      productName +
      "&category=" +
      categoryId;
    return this._dataService.callRestful("GET", URL).pipe(
      catchError((res: HttpErrorResponse) => {
        return of({ products: [], httpStatus: res.status });
      })
    );
  }

  getrecentProduct(user_id) {
    return this._dataService.callRestful(
      "GET",
      CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.RECENTLY_VIEWED + user_id
    );
  }

  getGSTINDetails(gstin) {
    return this._dataService.callRestful(
      "GET",
      CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.TAXPAYER_BY_TIN + gstin
    );
  }

  postBulkEnquiry(obj) {
    let url = CONSTANTS.NEW_MOGLIX_API + "/rfq/createRfq";
    return this._dataService.callRestful("POST", url, { body: obj });
  }

  getStateCityByPinCode(pinCode) {
    return this._dataService.callRestful(
      "GET",
      CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CITY_BY_PIN + pinCode
    );
  }

  getLogisticAvailability(data) {
    let url = CONSTANTS.NEW_MOGLIX_API + "/logistics/getProductLogistics";
    return this._dataService.callRestful("POST", url, { body: data });
  }

  getAllOffers() {
    return this._dataService.callRestful(
      "GET",
      CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_CategoryExtras + "mobikwikpdp"
    );
  }

  getEmiPlans(price) {
    let url = this.basePath + ENDPOINTS.GET_EMI_VAL + "?price=" + price;
    return this._dataService.callRestful("GET", url);
  }

  getGroupProductObj(productID) {
    const url =
      this.basePath +
      ENDPOINTS.PRODUCT_INFO +
      "?productId=" +
      productID +
      "&fetchGroup=true";
    return this._dataService.callRestful("GET", url).pipe(
      catchError((res: HttpErrorResponse) => {
        return of({ active: false, httpStatus: res.status });
      })
    );
  }

  postReview(obj) {
    const url = this.basePath + ENDPOINTS.SET_REVIEWS;
    return this._dataService.callRestful("POST", url, { body: obj }).pipe(
      catchError((res: HttpErrorResponse) => {
        return of({ data: [], code: res.status });
      })
    );
  }

  postHelpful(obj) {
    const url = this.basePath + ENDPOINTS.IS_REVIEW_HELPFUL;
    return this._dataService.callRestful("POST", url, { body: obj }).pipe(
      catchError((res: HttpErrorResponse) => {
        return of({ data: [], code: res.status });
      })
    );
  }

  postQuestion(obj) {
    let url = this.basePath + ENDPOINTS.SET_QUEST;
    return this._dataService.callRestful("POST", url, { body: obj });
  }

  getRecentlyBoughtProducts(msn) {
    return this._dataService.callRestful(
      "GET",
      CONSTANTS.NEW_MOGLIX_API +
        ENDPOINTS.PRODUCT_STATUS_COUNT +
        "?timeInterval=10&productId=" +
        msn
    );
  }

  getReviewsRating(obj) {
    const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.PRODUCT_REVIEW;
    return this._dataService.callRestful("POST", url, { body: obj }).pipe(
      catchError((res: HttpErrorResponse) => {
        return of({ data: null, httpStatus: res.status });
      })
    );
  }

  getQuestionsAnswers(productId: string) {
    const url =
      CONSTANTS.NEW_MOGLIX_API +
      ENDPOINTS.Q_AND_A +
      "?itemId=" +
      productId.toUpperCase();
    return this._dataService.callRestful("GET", url).pipe(
      catchError((res: HttpErrorResponse) => {
        return of({ data: [], statusCode: res.status });
      })
    );
  }

  getSession() {
    return this._dataService.callRestful(
      "GET",
      CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_SESSION
    );
  }

  getCartBySession(params) {
    return this._dataService.callRestful(
      "GET",
      this.basePath + ENDPOINTS.GET_CartBySession,
      { params: params }
    );
  }

  getSponseredProducts(params) {
    return this._dataService.callRestful(
      "GET",
      CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.SPONSERED_PRODUCTS,
      { params: params }
    );
  }

  getProductStatusCount(productMsnId) {
    const PRODUCT_STATUS_COUNT_URL =
      CONSTANTS.NEW_MOGLIX_API +
      ENDPOINTS.PRODUCT_STATUS_COUNT +
      "?productId=" +
      productMsnId.toUpperCase();
    return this._dataService.callRestful("GET", PRODUCT_STATUS_COUNT_URL);
  }

  getUserDuplicateOrder(productMsnId, userId) {
    let DUPLICATE_ORDER_URL =
      CONSTANTS.NEW_MOGLIX_API +
      ENDPOINTS.DUPLICATE_ORDER +
      "?productId=" +
      productMsnId.toUpperCase();
    DUPLICATE_ORDER_URL += "&userId=" + userId;
    return this._dataService.callRestful("GET", DUPLICATE_ORDER_URL);
  }

  getProductInfo(infoType, index) {
    const productInfo = {};
    productInfo["mainInfo"] = {
      productName: this.oosSimilarProductsData.similarData[index].productName,
      imgURL:
        this.oosSimilarProductsData.similarData[index].productAllImages[0][
          "large"
        ],
      brandName:
        this.oosSimilarProductsData.similarData[index].productBrandDetails[
          "brandName"
        ],
      productMrp: this.oosSimilarProductsData.similarData[index].productMrp,
      productDiscount:
        this.oosSimilarProductsData.similarData[index].productDiscount,
      bulkPriceWithoutTax:
        this.oosSimilarProductsData.similarData[index].bulkPriceWithoutTax,
      priceWithoutTax:
        this.oosSimilarProductsData.similarData[index].priceWithoutTax,
      taxPercentage:
        this.oosSimilarProductsData.similarData[index].taxPercentage,
      bulkDiscount: this.oosSimilarProductsData.similarData[index].bulkDiscount,
      productOutOfStock:
        this.oosSimilarProductsData.similarData[index].productOutOfStock,
    };
    let contentInfo = {};
    if (
      this.oosSimilarProductsData.similarData[index].productKeyFeatures &&
      this.oosSimilarProductsData.similarData[index].productKeyFeatures.length
    ) {
      contentInfo["key features"] =
        this.oosSimilarProductsData.similarData[index].productKeyFeatures;
    }
    if (this.oosSimilarProductsData.similarData[index].productAttributes) {
      const brand = {
        name: this.oosSimilarProductsData.similarData[index]
          .productBrandDetails["brandName"],
        link: this.getBrandLink(
          this.oosSimilarProductsData.similarData[index].productBrandDetails
        ),
      };
      contentInfo["specifications"] = {
        attributes:
          this.oosSimilarProductsData.similarData[index].productAttributes,
        brand: brand,
      };
    }
    if (
      this.oosSimilarProductsData.similarData[index].productVideos &&
      this.oosSimilarProductsData.similarData[index].productVideos.length
    ) {
      contentInfo["videos"] =
        this.oosSimilarProductsData.similarData[index].productVideos;
    }
    const details = {
      description:
        this.oosSimilarProductsData.similarData[index].productDescripton,
      category:
        this.oosSimilarProductsData.similarData[index].productCategoryDetails,
      brand: this.oosSimilarProductsData.similarData[index].productBrandDetails,
      brandCategoryURL:
        this.oosSimilarProductsData.similarData[index].productBrandCategoryUrl,
      productName: this.oosSimilarProductsData.similarData[index].productName,
    };
    contentInfo["product details"] = details;
    const IMAGES = (
      this.oosSimilarProductsData.similarData[index].productAllImages as any[]
    ).filter((image) => image["contentType"] === "IMAGE");
    if (IMAGES.length) {
      contentInfo["images"] = IMAGES;
    }
    productInfo["contentInfo"] = contentInfo;
    productInfo["infoType"] = infoType;
    const TAXONS = this.oosSimilarProductsData.similarData[index].taxons || [];
    let page = {
      pageName:
        TAXONS.length > 0
          ? `moglix:${TAXONS[0]}:${TAXONS[1]}:${TAXONS[2]}:pdp`
          : `moglix:pdp`,
      channel: "About This Product",
      subSection: null,
      linkPageName: null,
      linkName: null,
      loginStatus:
        this.oosSimilarProductsData.similarData[index].loginStatusTracking,
    };
    productInfo["analyticsInfo"] = {
      page: page,
      custData: this.oosSimilarProductsData.similarData[index].custDataTracking,
      order: this.oosSimilarProductsData.similarData[index].orderTracking,
    };
    return productInfo;
  }

  setProductImages(imagesArr: any[], index) {
    this.oosSimilarProductsData.similarData[index].productDefaultImage =
      imagesArr.length > 0
        ? this.imagePath + "" + imagesArr[0]["links"]["default"]
        : "";
    this.oosSimilarProductsData.similarData[index].productMediumImage =
      imagesArr.length > 0 ? imagesArr[0]["links"]["medium"] : "";
    this.oosSimilarProductsData.similarData[index].productAllImages = [];
    imagesArr.forEach((element) => {
      this.oosSimilarProductsData.similarData[index].productAllImages.push({
        src: this.imagePath + "" + element.links.xlarge,
        xlarge: this.imagePath + "" + element.links.xlarge,
        large: this.imagePath + "" + element.links.large,
        default: this.imagePath + "" + element.links.default,
        caption: this.imagePath + "" + element.links.icon,
        thumb: this.imagePath + "" + element.links.icon,
        medium: this.imagePath + "" + element.links.medium,
        small: this.imagePath + "" + element.links.small,
        xxlarge: this.imagePath + "" + element.links.xxlarge,
        video: "",
        title: "",
        contentType: "IMAGE",
      });
    });
    if (
      this.oosSimilarProductsData.similarData[index].productAllImages.length > 0
    ) {
      this.oosSimilarProductsData.similarData[index].productCartThumb =
        this.oosSimilarProductsData.similarData[index].productAllImages[0][
          "thumb"
        ];
    }
  }

  processProductData(args: ProductDataArg, index) {
    this.oosSimilarProductsData.similarData[index].rawProductData =
      args.productBO;
    // required for goruped products
    this.oosSimilarProductsData.similarData[index].defaultPartNumber =
      args.subGroupMsnId != null
        ? args.subGroupMsnId
        : this.oosSimilarProductsData.similarData[index].rawProductData[
            "defaultPartNumber"
          ];
    const partNumber =
      args.subGroupMsnId != null
        ? args.subGroupMsnId
        : this.oosSimilarProductsData.similarData[index].rawProductData[
            "partNumber"
          ];
    this.oosSimilarProductsData.similarData[index].productSubPartNumber =
      partNumber;
    // mapping general information
    this.oosSimilarProductsData.similarData[index].productName =
      this.oosSimilarProductsData.similarData[index].rawProductData[
        "productName"
      ];
    this.oosSimilarProductsData.similarData[index].isProductReturnAble =
      this.oosSimilarProductsData.similarData[index].rawProductData[
        "returnable"
      ] || false;
    this.oosSimilarProductsData.similarData[index].productDescripton =
      this.oosSimilarProductsData.similarData[index].rawProductData[
        "desciption"
      ];
    this.oosSimilarProductsData.similarData[index].productBrandDetails =
      this.oosSimilarProductsData.similarData[index].rawProductData[
        "brandDetails"
      ];
    this.oosSimilarProductsData.similarData[index].productCategoryDetails =
      this.oosSimilarProductsData.similarData[index].rawProductData[
        "categoryDetails"
      ][0];
    this.oosSimilarProductsData.similarData[index].productUrl =
      this.oosSimilarProductsData.similarData[index].rawProductData[
        "defaultCanonicalUrl"
      ];
    this.oosSimilarProductsData.similarData[index].productKeyFeatures =
      this.oosSimilarProductsData.similarData[index].rawProductData[
        "keyFeatures"
      ];
    this.oosSimilarProductsData.similarData[index].productVideos =
      this.oosSimilarProductsData.similarData[index].rawProductData[
        "videosInfo"
      ];
    this.oosSimilarProductsData.similarData[index].productDocumentInfo =
      this.oosSimilarProductsData.similarData[index].rawProductData[
        "documentInfo"
      ];
    this.oosSimilarProductsData.similarData[index].productTags =
      this.oosSimilarProductsData.similarData[index].rawProductData[
        "productTags"
      ];
    this.oosSimilarProductsData.similarData[index].productAttributes =
      this.oosSimilarProductsData.similarData[index].rawProductData[
        "productPartDetails"
      ][partNumber]["attributes"] || [];
    this.oosSimilarProductsData.similarData[index].productRating =
      this.oosSimilarProductsData.similarData[index].rawProductData[
        "productPartDetails"
      ][partNumber]["productRating"];
    this.oosSimilarProductsData.similarData[index].productBrandCategoryUrl =
      "brands/" +
      this.oosSimilarProductsData.similarData[index].productBrandDetails[
        "friendlyUrl"
      ] +
      "/" +
      this.oosSimilarProductsData.similarData[index].productCategoryDetails[
        "categoryLink"
      ];

    this.oosSimilarProductsData.similarData[index].isProductPriceValid =
      this.oosSimilarProductsData.similarData[index].rawProductData[
        "productPartDetails"
      ][partNumber]["productPriceQuantity"] != null;
    this.oosSimilarProductsData.similarData[index].priceQuantityCountry = this
      .oosSimilarProductsData.similarData[index].isProductPriceValid
      ? Object.assign(
          {},
          this.oosSimilarProductsData.similarData[index].rawProductData[
            "productPartDetails"
          ][partNumber]["productPriceQuantity"]["india"]
        )
      : null;
    this.oosSimilarProductsData.similarData[index].productMrp =
      this.oosSimilarProductsData.similarData[index].isProductPriceValid &&
      this.oosSimilarProductsData.similarData[index].priceQuantityCountry
        ? this.oosSimilarProductsData.similarData[index].priceQuantityCountry[
            "mrp"
          ]
        : null;

    if (this.oosSimilarProductsData.similarData[index].priceQuantityCountry) {
      this.oosSimilarProductsData.similarData[index].priceQuantityCountry[
        "bulkPricesIndia"
      ] = this.oosSimilarProductsData.similarData[index].isProductPriceValid
        ? Object.assign(
            {},
            this.oosSimilarProductsData.similarData[index].rawProductData[
              "productPartDetails"
            ][partNumber]["productPriceQuantity"]["india"]["bulkPrices"]
          )
        : null;
      this.oosSimilarProductsData.similarData[index].priceQuantityCountry[
        "bulkPricesModified"
      ] =
        this.oosSimilarProductsData.similarData[index].isProductPriceValid &&
        this.oosSimilarProductsData.similarData[index].rawProductData[
          "productPartDetails"
        ][partNumber]["productPriceQuantity"]["india"]["bulkPrices"]["india"]
          ? [
              ...this.oosSimilarProductsData.similarData[index].rawProductData[
                "productPartDetails"
              ][partNumber]["productPriceQuantity"]["india"]["bulkPrices"][
                "india"
              ],
            ]
          : null;
    }

    this.oosSimilarProductsData.similarData[index].priceWithoutTax = this
      .oosSimilarProductsData.similarData[index].priceQuantityCountry
      ? this.oosSimilarProductsData.similarData[index].priceQuantityCountry[
          "priceWithoutTax"
        ]
      : null;
    if (
      this.oosSimilarProductsData.similarData[index].priceQuantityCountry &&
      this.oosSimilarProductsData.similarData[index].priceQuantityCountry[
        "mrp"
      ] > 0 &&
      this.oosSimilarProductsData.similarData[index].priceQuantityCountry[
        "priceWithoutTax"
      ] > 0
    ) {
      this.oosSimilarProductsData.similarData[index].productDiscount =
        ((this.oosSimilarProductsData.similarData[index].priceQuantityCountry[
          "mrp"
        ] -
          this.oosSimilarProductsData.similarData[index].priceQuantityCountry[
            "priceWithoutTax"
          ]) /
          this.oosSimilarProductsData.similarData[index].priceQuantityCountry[
            "mrp"
          ]) *
        100;
    }
    this.oosSimilarProductsData.similarData[index].taxPercentage = this
      .oosSimilarProductsData.similarData[index].priceQuantityCountry
      ? this.oosSimilarProductsData.similarData[index].priceQuantityCountry[
          "taxRule"
        ]["taxPercentage"]
      : null;
    this.oosSimilarProductsData.similarData[index].productPrice =
      this.oosSimilarProductsData.similarData[index].priceQuantityCountry &&
      !isNaN(
        this.oosSimilarProductsData.similarData[index].priceQuantityCountry[
          "sellingPrice"
        ]
      )
        ? Number(
            this.oosSimilarProductsData.similarData[index].priceQuantityCountry[
              "sellingPrice"
            ]
          )
        : 0;

    this.oosSimilarProductsData.similarData[index].productTax =
      this.oosSimilarProductsData.similarData[index].priceQuantityCountry &&
      !isNaN(
        this.oosSimilarProductsData.similarData[index].priceQuantityCountry[
          "sellingPrice"
        ]
      ) &&
      !isNaN(
        this.oosSimilarProductsData.similarData[index].priceQuantityCountry[
          "sellingPrice"
        ]
      )
        ? Number(
            this.oosSimilarProductsData.similarData[index].priceQuantityCountry[
              "sellingPrice"
            ]
          ) -
          Number(
            this.oosSimilarProductsData.similarData[index].priceQuantityCountry[
              "sellingPrice"
            ]
          )
        : 0;
    this.oosSimilarProductsData.similarData[index].productMinimmumQuantity =
      this.oosSimilarProductsData.similarData[index].priceQuantityCountry &&
      this.oosSimilarProductsData.similarData[index].priceQuantityCountry["moq"]
        ? this.oosSimilarProductsData.similarData[index].priceQuantityCountry[
            "moq"
          ]
        : 1;

    // product media processing
    this.setProductImages(
      this.oosSimilarProductsData.similarData[index].rawProductData[
        "productPartDetails"
      ][partNumber]["images"],
      index
    );
  }

  getBrandLink(brandDetails: {}) {
    if (brandDetails == undefined) {
      return [];
    }
    let d = brandDetails["friendlyUrl"];
    return ["/brands/" + d.toLowerCase()];
  }
}
