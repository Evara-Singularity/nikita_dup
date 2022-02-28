import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { Observable, of } from "rxjs";
import { DataService } from "./data.service";
import CONSTANTS from "../../config/constants";
import { ENDPOINTS } from "@app/config/endpoints";
import { ProductsEntity } from "../models/product.listing.search";
import { CommonService } from "./common.service";
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

    constructor(private _dataService: DataService, public http: HttpClient, private _commonService: CommonService) { }

    getSimilarProductBoByIndex(index) {
        return this.oosSimilarProductsData.similarData[index].rawProductData;
    }

    resetOOOSimilarProductsData() {
        this.oosSimilarProductsData = {
            similarData: [],
        };
    }

    getSimilarProductInfoByIndex(index) {
        return this.oosSimilarProductsData.similarData[index];
    }

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

    getSimilarProducts(productName, categoryId, productId, groupId) {
        let URL =
            this.basePath +
            ENDPOINTS.SIMILAR_PRODUCTS +
            "?str=" +
            productName +
            "&category=" +
            categoryId + 
            "&productId=" +
            productId;
    
        if (groupId) {
            URL += "&groupId=" + groupId;
        }
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
        console.trace('getCartBySession product service');
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
        productInfo["analyticsInfo"] = this.getAdobeAnalyticsObjectData(index, 'pdp:oos:similar');
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

    setProductVideo(videoArr, index) {
        if (this.oosSimilarProductsData.similarData[index].productAllImages.length > 0 && videoArr &&
            (videoArr as any[]).length > 0) {
            (videoArr as any[]).reverse().forEach((element) => {
                this.oosSimilarProductsData.similarData[index].productAllImages.splice(1, 0, {
                    src: "",
                    default: "",
                    caption: "",
                    thumb: "",
                    medium: "",
                    xxlarge: "",
                    title: element["title"],
                    video: element["link"],
                    contentType: "YOUTUBE_VIDEO",
                });
            });
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
        this.setProductVideo(this.oosSimilarProductsData.similarData[index].rawProductData["videosInfo"], index);
    }

    getBrandLink(brandDetails: {}) {
        if (brandDetails == undefined) {
            return [];
        }
        let d = brandDetails["friendlyUrl"];
        return ["/brands/" + d.toLowerCase()];
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

    searchResponseToProductEntity(product: any) {
        const partNumber =
            product["partNumber"] ||
            product["defaultPartNumber"] ||
            product["moglixPartNumber"];
        const productMrp = product["mrp"];
        const productPrice = product["salesPrice"];
        const priceWithoutTax = product["priceWithoutTax"];
        return {
            moglixPartNumber: partNumber,
            moglixProductNo: product["moglixProductNo"] || null,
            mrp: productMrp,
            salesPrice: productPrice,
            priceWithoutTax: priceWithoutTax,
            productName: product["productName"],
            variantName: product["productName"],
            productUrl: product["productUrl"],
            shortDesc: product["shortDesc"],
            brandId: product["brandId"],
            brandName: product["brandName"],
            quantityAvailable: product["quantityAvailable"],
            discount: (((productMrp - priceWithoutTax) / productMrp) * 100).toFixed(
                0
            ),
            rating: product["rating"] || null,
            categoryCodes: null,
            taxonomy: product["taxonomy"],
            mainImageLink: product["moglixImageNumber"]
                ? product["mainImageLink"]
                : "",
            mainImageThumnailLink: this.getImageFromSearchProductResponse(
                product["mainImageLink"],
                "large",
                "thumbnail"
            ),
            mainImageMediumLink: this.getImageFromSearchProductResponse(
                product["mainImageLink"],
                "large",
                "medium"
            ),
            productTags: [],
            filterableAttributes: {},
            avgRating: product.avgRating,
            itemInPack: null,
            ratingCount: product.ratingCount,
            reviewCount: product.reviewCount,
            uclid: product.uclid,
            keyFeatures: product.keyFeatures || [],
            internalProduct: !product.hasOwnProperty("internalProduct")
                ? true
                : product.internalProduct, // if intenal product prop does not exist then it is internal product
        } as ProductsEntity;
    }

    recentProductResponseToProductEntity(product: any) {
        const partNumber =
            product["partNumber"] ||
            product["defaultPartNumber"] ||
            product["moglixPartNumber"];
        const productMrp = product["priceMrp"];
        const productPrice = product["priceWithTax"];
        const priceWithoutTax = product["priceWithoutTax"];
        return {
            moglixPartNumber: partNumber,
            moglixProductNo: product["moglixProductNo"] || null,
            mrp: productMrp,
            salesPrice: productPrice,
            priceWithoutTax: priceWithoutTax,
            productName: product["productName"],
            variantName: product["productName"],
            productUrl: product["url"],
            shortDesc: product["shortDesc"] || null,
            brandId: product["brandId"] || null,
            brandName: product["brandName"],
            quantityAvailable: 1,
            discount: (((productMrp - priceWithoutTax) / productMrp) * 100).toFixed(
                0
            ),
            rating: product["rating"] || null,
            categoryCodes: null,
            taxonomy: product["taxonomy"] || null,
            mainImageLink: product["productImage"] ? this.getForLeadingSlash(product["productImage"]) : "",
            mainImageMediumLink: product["productImage"]
                ? this.getForLeadingSlash(product["productImage"])
                : "",
            mainImageThumnailLink: product["productImage"]
                ? this.getForLeadingSlash(product["productImage"])
                : "",
            productTags: [],
            filterableAttributes: {},
            avgRating: product.avgRating || 0,
            itemInPack: null,
            ratingCount: product.ratingCount || 0,
            reviewCount: product.reviewCount || 0,
            internalProduct: true,
            outOfStock: product.outOfStock,
        } as ProductsEntity;
    }

    getForLeadingSlash(imgUrl){
        if(imgUrl && imgUrl.startsWith("/")){
            return imgUrl.substring(1);
        }
        return imgUrl;
    }

    productEntityFromProductBO(productBO, overrideProductB0 = null) {
        const partNumber = productBO['partNumber'] || productBO['defaultPartNumber'];
        const isProductPriceValid = productBO['productPartDetails'][partNumber]['productPriceQuantity'] != null;
        const productPartDetails = productBO['productPartDetails'][partNumber];
        const priceQuantityCountry = (isProductPriceValid) ? Object.assign({}, productBO['productPartDetails'][partNumber]['productPriceQuantity']['india']) : null;
        const productMrp = (isProductPriceValid && priceQuantityCountry) ? priceQuantityCountry['mrp'] : null;
        const productTax = (priceQuantityCountry && !isNaN(priceQuantityCountry['sellingPrice']) && !isNaN(priceQuantityCountry['sellingPrice'])) ?
            (Number(priceQuantityCountry['sellingPrice']) - Number(priceQuantityCountry['sellingPrice'])) : 0;
        const productPrice = (priceQuantityCountry && !isNaN(priceQuantityCountry['sellingPrice'])) ? Number(priceQuantityCountry['sellingPrice']) : 0;
        const priceWithoutTax = (priceQuantityCountry) ? priceQuantityCountry['priceWithoutTax'] : null;
        const productBrandDetails = productBO['brandDetails'];
        const productCategoryDetails = productBO['categoryDetails'][0];
        const productMinimmumQuantity = (priceQuantityCountry && priceQuantityCountry['moq']) ? priceQuantityCountry['moq'] : 1

        const product: ProductsEntity = {
            moglixPartNumber: partNumber,
            moglixProductNo: null,
            mrp: productMrp,
            salesPrice: productPrice,
            priceWithoutTax: priceWithoutTax,
            productName: productBO['productName'],
            variantName: productBO['productName'],
            productUrl: productBO['defaultCanonicalUrl'],
            shortDesc: productBO['shortDesc'],
            brandId: productBrandDetails['idBrand'],
            brandName: productBrandDetails['brandName'],
            quantityAvailable: priceQuantityCountry['quantityAvailable'],
            productMinimmumQuantity: productMinimmumQuantity,
            discount: (((productMrp - priceWithoutTax) / productMrp) * 100).toFixed(0),
            rating: (overrideProductB0 && overrideProductB0.rating) ? overrideProductB0.rating : null,
            categoryCodes: productCategoryDetails['categoryCode'],
            taxonomy: productCategoryDetails['taxonomyCode'],
            mainImageLink: (productPartDetails['images']) ? productPartDetails['images'][0]['links']['thumbnail'] : '',
            productTags: [],
            filterableAttributes: {},
            avgRating: (overrideProductB0 && overrideProductB0.avgRating) ? overrideProductB0.avgRating : null, //this.product.avgRating,
            itemInPack: null,
            ratingCount: (overrideProductB0 && overrideProductB0.ratingCount) ? overrideProductB0.ratingCount : null, //this.product.ratingCount,
            reviewCount: (overrideProductB0 && overrideProductB0.reviewCount) ? overrideProductB0.reviewCount : null //this.product.reviewCount
        };
        return product;
    }

    getRFQProductSchema(product) {
        const partNumber = product['partNumber'] || product['defaultPartNumber'];
        const isProductPriceValid = product['productPartDetails'][partNumber]['productPriceQuantity'] != null;
        const priceQuantityCountry = (isProductPriceValid) ? Object.assign({}, product['productPartDetails'][partNumber]['productPriceQuantity']['india']) : null;
        const productPrice = (priceQuantityCountry && !isNaN(priceQuantityCountry['sellingPrice'])) ? Number(priceQuantityCountry['sellingPrice']) : 0;
        const productMinimmumQuantity = (priceQuantityCountry && priceQuantityCountry['moq']) ? priceQuantityCountry['moq'] : 1;
        const productBrandDetails = product['brandDetails'];
        const productCategoryDetails = product['categoryDetails'][0];
        const productTags = product['productTags'];
        const outOfStock = product['outOfStock'];
        const quantityAvailable = product['quantityAvailable'];

        return {
            url: product['friendlyUrl'],
            price: productPrice,
            msn: partNumber,
            moq: productMinimmumQuantity,
            brand: productBrandDetails['brandName'],
            taxonomyCode: productCategoryDetails['taxonomy'],
            productName: product['productName'],
            adobeTags: '',
            productTags,
            outOfStock,
            quantityAvailable
        }

    }

    getProductGroupDetails(productMsnId): Observable<any> {
        const PRODUCT_URL = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.PRODUCT_INFO + `?productId=${productMsnId}&fetchGroup=true`;
        return this._dataService.callRestful("GET", PRODUCT_URL);
    }


    getAdobeAnalyticsObjectData(index, identifier = 'pdp') {

        const productCategoryDetails = this.oosSimilarProductsData.similarData[index]['productCategoryDetails'];
        const productSubPartNumber = this.oosSimilarProductsData.similarData[index]['productSubPartNumber'];
        const productBrandDetails = this.oosSimilarProductsData.similarData[index]['productBrandDetails'];
        const productPrice = this.oosSimilarProductsData.similarData[index]['productPrice'];
        const productOutOfStock = this.oosSimilarProductsData.similarData[index]['productPrice'];

        let taxo1 = "";
        let taxo2 = "";
        let taxo3 = "";

        if (productCategoryDetails["taxonomyCode"]) {
            taxo1 = productCategoryDetails["taxonomyCode"].split("/")[0] || "";
            taxo2 = productCategoryDetails["taxonomyCode"].split("/")[1] || "";
            taxo3 = productCategoryDetails["taxonomyCode"].split("/")[2] || "";
        }

        let page = {
            pageName: "moglix:" + taxo1 + ":" + taxo2 + ":" + taxo3 + ":" + identifier,
            channel: "pdp",
            subSection: "moglix:" + taxo1 + ":" + taxo2 + ":" + taxo3 + ":" + identifier,
            loginStatus: this._commonService.loginStatusTracking,
        };
        let custData = this._commonService.custDataTracking;

        let order = {
            productID: productSubPartNumber,
            productCategoryL1: taxo1,
            productCategoryL2: taxo2,
            productCategoryL3: taxo3,
            brand: productBrandDetails["brandName"],
            price: productPrice,
            stockStatus: productOutOfStock ? "Out of Stock" : "In Stock",
        };

        return { page, custData, order }
    }


}
