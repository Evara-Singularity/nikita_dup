import { DOCUMENT, Location } from "@angular/common";
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactoryResolver, EventEmitter, Inject, Injector, OnDestroy, OnInit, Optional, Renderer2, ViewChild, ViewContainerRef } from "@angular/core";
import { FormControl } from "@angular/forms";
import { DomSanitizer, Meta, Title } from "@angular/platform-browser";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import { YoutubePlayerComponent } from "@app/components/youtube-player/youtube-player.component";
import CONSTANTS from "@app/config/constants";
import { ModalService } from "@app/modules/modal/modal.service";
import { ToastMessageService } from "@app/modules/toastMessage/toast-message.service";
import { ClientUtility } from "@app/utils/client.utility";
import { LocalAuthService } from "@app/utils/services/auth.service";
import { CommonService } from "@app/utils/services/common.service";
import { GlobalAnalyticsService } from "@app/utils/services/global-analytics.service";
import { GlobalLoaderService } from "@app/utils/services/global-loader.service";
import { ProductUtilsService } from "@app/utils/services/product-utils.service";
import { ProductService } from "@app/utils/services/product.service";
import { TrackingService } from "@app/utils/services/tracking.service";
import { RESPONSE } from "@nguniversal/express-engine/tokens";
import { LocalStorageService, SessionStorageService } from "ngx-webstorage";
import { Subject } from "rxjs";
import * as localization_en from '../../config/static-en';
import * as localization_hi from '../../config/static-hi';

@Component({
    selector: "product-v1",
    templateUrl: "./product-v1.component.html",
    styleUrls: ["./product-v1.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductV1Component implements OnInit, AfterViewInit, OnDestroy {
    readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
    readonly baseDomain = CONSTANTS.PROD;
    readonly DOCUMENT_URL = CONSTANTS.DOCUMENT_URL;
    readonly imagePathAsset = CONSTANTS.IMAGE_ASSET_URL;
    isServer: boolean;
    isBrowser: boolean;
    productNotFound: boolean;

    apiResponse: any;
    productStaticData: any = this.commonService.defaultLocaleValue;
    isAcceptLanguage: boolean;
    productFound: boolean;
    englishUrl: string;
    hindiUrl: string;
    isLanguageHindi: boolean;
    rawProductData: any;
    carouselInitialized: boolean = false;
    iOptions: any = null;
    user: any;
    isPurcahseListProduct: boolean;
    moveToSlide$ = new Subject<number>();
    displayCardCta: boolean;
    pageUrl: string;
    backTrackIndex = -1;
    refreshSiemaItems$ = new Subject<{
        items: Array<{}>;
        type: string;
        currentSlide: number;
    }>();
    productTags = [];
    productDefaultImage: string;
    productAllImages: any[] = [];
    productBulkPirces: any;
    productCartThumb: any;
    productMediumImage: any;
    qunatityFormControl: FormControl = new FormControl(1, []); // setting a default quantity to 1
    productBulkPrices: any;
    isBulkPricesProduct: boolean;
    selectedProductBulkPrice: any;
    bulkPriceWithoutTax: any;
    isHindiUrl: any;
    ProductStatusCount: any;
    rawProductCountData: any;
    rawProductCountMessage: any;
    rawCartNotificationMessage: any;
    originalProductBO = null;


    // lazy loaded component refs
    productShareInstance = null;
    @ViewChild("productShare", { read: ViewContainerRef })
    productShareContainerRef: ViewContainerRef;

    popupCrouselInstance = null;
    @ViewChild("popupCrousel", { read: ViewContainerRef })
    popupCrouselContainerRef: ViewContainerRef;
    // ondemad loaded components offer section
    offerSectionInstance = null;
    @ViewChild("offerSection", { read: ViewContainerRef })
    offerSectionContainerRef: ViewContainerRef;
    // ondemad loaded components offer section popup
    offerPopupInstance = null;
    @ViewChild("offerPopup", { read: ViewContainerRef })
    offerPopupContainerRef: ViewContainerRef;
    // ondemad loaded components promo more offer section popup
    promoOfferPopupInstance = null;
    @ViewChild("promoOfferPopup", { read: ViewContainerRef })
    promoOfferPopupContainerRef: ViewContainerRef;
    // ondemad loaded components offer compare section popup
    offerComparePopupInstance = null;
    @ViewChild("offerComparePopup", { read: ViewContainerRef })
    offerComparePopupContainerRef: ViewContainerRef;
    // ondemad loaded components for pincode servicibility check
    pincodeFormInstance = null;
    @ViewChild("pincodeForm", { read: ViewContainerRef })
    pincodeFormContainerRef: ViewContainerRef;

    // ondemand loaded component for return info
    returnInfoInstance = null;
    @ViewChild("returnInfo", { read: ViewContainerRef })
    returnInfoContainerRef: ViewContainerRef;
    youtubeModalInstance = null;
    productInfoPopupInstance = null;
    @ViewChild("productInfoPopup", { read: ViewContainerRef })
    productInfoPopupContainerRef: ViewContainerRef;
    holdRFQForm: boolean;
    // ondemad loaded components for post a product review
    writeReviewPopupInstance = null;
    @ViewChild("writeReviewPopup", { read: ViewContainerRef })
    writeReviewPopupContainerRef: ViewContainerRef;
    // ondemad loaded components for green aleart box as success messge
    alertBoxInstance = null;
    @ViewChild("alertBox", { read: ViewContainerRef })
    alertBoxContainerRef: ViewContainerRef;
    // ondemad loaded components for review & rating
    reviewRatingPopupInstance = null;
    @ViewChild("reviewRatingPopup", { read: ViewContainerRef })
    reviewRatingPopupContainerRef: ViewContainerRef;
    // ondemad loaded components for question & answer
    questionAnswerPopupInstance = null;
    @ViewChild("questionAnswersPopup", { read: ViewContainerRef })
    questionAnswerPopupContainerRef: ViewContainerRef;
    // ondemad loaded components for FAQ listing
    faqListPopupInstance = null;
    @ViewChild("faqListPopup", { read: ViewContainerRef })
    faqListPopupContainerRef: ViewContainerRef;
    // ondemad loaded components to submit question
    askQuestionPopupInstance = null;
    @ViewChild("askQuestionPopup", { read: ViewContainerRef })
    askQuestionPopupContainerRef: ViewContainerRef;
    // ondemad loaded components for FAQ success popup
    faqSuccessPopupInstance = null;
    @ViewChild("faqSuccessPopup", { read: ViewContainerRef })
    faqSuccessPopupContainerRef: ViewContainerRef;
    
    fbtFlag: boolean;
    fbtAnalytics: { page: { pageName: string; channel: string; subSection: any; linkPageName: any; linkName: any; loginStatus: string; }; custData: { customerID: string; emailID: string; mobile: string; customerType: any; customerCategory: any; }; order: { productID: any; productCategoryL1: any; productCategoryL2: any; productCategoryL3: any; brand: any; price: number; stockStatus: string; tags: string; }; };
    isAskQuestionPopupOpen: boolean;


    set showLoader(value: boolean) { this.globalLoader.setLoaderState(value); }

    // get getWhatsText()
    // {
    //     return `Hi, I want to buy ${this.productName} (${this.rawProductData.defaultPartNumber})`;
    // }
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private commonService: CommonService,
        private globalLoader: GlobalLoaderService,
        public pageTitle: Title,
        public meta: Meta,
        private renderer2: Renderer2,
        private analytics: GlobalAnalyticsService,
        private cfr: ComponentFactoryResolver,
        private injector: Injector,
        private sanitizer: DomSanitizer,
        private localStorageService: LocalStorageService,
        private productService: ProductService,
        private _tms: ToastMessageService,
        private _trackingService: TrackingService,
        private location: Location,
        private sessionStorageService: SessionStorageService,
        private cdr: ChangeDetectorRef,
        private modalService: ModalService,
        private localAuthService: LocalAuthService,
        private productUtil: ProductUtilsService,
        @Inject(DOCUMENT) private document,
        @Optional() @Inject(RESPONSE) private _response: any,
    ) {
        this.isServer = commonService.isServer;
        this.isBrowser = commonService.isBrowser;
        this.isLanguageHindi = ((this.router.url).toLowerCase().indexOf('/hi/') !== -1) || false;
        if (((this.router.url).toLowerCase().indexOf('/hi/') !== -1)) {
            this.englishUrl = this.router.url.toLowerCase().split("/hi/").join('/');;
            this.hindiUrl = this.router.url;
        }
        else {
            this.hindiUrl = "/hi" + this.router.url;
            this.englishUrl = (this.router.url).toLowerCase().split("/hi/").join('/');
        }
    }

    ngOnInit() {
        this.user = this.localStorageService.retrieve('user');
        this.pageUrl = this.router.url;
        this.route.data.subscribe((rawData) => {
            // && rawData["product"][0]['data']['data']['productGroup']["active"]
            if (!rawData["product"][0]["error"]) {
                this.apiResponse = rawData.product[0].data.data;
                console.log(this.apiResponse);
                this.rawProductData = this.apiResponse.productGroup;
                this.apiResponse['productGroup']['productAllImages'] = this.rawProductData['productDefaultImage']
                this.originalProductBO = {
                    "filterAttributesList": null,
                    "partNumber": "MSN2R9CFNAUWXD",
                    "defaultPartNumber": "MSN2R9CFNAUWXD",
                    "categoryDetails": [
                      {
                        "categoryCode": "128111100",
                        "categoryName": "Centrifugal Pumps",
                        "taxonomy": "Pumps & Motors/Water Pumps/Centrifugal Pumps",
                        "taxonomyCode": "128000000/128110000/128111100",
                        "categoryLink": "pumps-motors/pumps/centrifugal-pumps/128111100"
                      }
                    ],
                    "productName": "Sameer 1 HP i-Flo Water Pump with 1 Year Warranty, Total Head: 100 ft",
                    "desciption": "The Sameer 1 HP i-Flo Water Pump, is a Single Phase pump that is used for pumping water. This product works at a speed of 2880 rpm. The power rating of this pump is 0.5 kW. Its dimensions are 315x190x250 mm. This pump weighs 8.5 kg. It comes with a warranty of 1 year. With a discharge of 600-2400 LPH, this product can pump water up to 10-30 m head height. This pump has a suction capacity of 25ft. The material used in the motor body is cast iron. It is operated at the voltage of 180-240V single phase energy supply. This range of centrifugal pumps is ideally suited for the supply of water to domestic & industrial places.",
                    "shortDesc": "Brand: Sameer||Item Code: i-Flo||Colour: Blue||Weight: 7 kg",
                    "brandDetails": {
                      "idBrand": "98753730-2bd1-488c-9c7b-74797e2c17b2",
                      "brandName": "Sameer",
                      "storedBrandName": "sameer",
                      "friendlyUrl": "sameer",
                      "brandTag": "Brand Label"
                    },
                    "seoDetails": {
                      "metaDescription": null,
                      "title": null,
                      "metaKeywords": [
                        ""
                      ],
                      "tags": [
                        ""
                      ]
                    },
                    "productPartDetails": {
                      "MSN2R9CFNAUWXD": {
                        "itemCode": "i-Flo",
                        "images": [
                          {
                            "links": {
                              "small": "p/YiqkejgQ5GTRr-small.jpg",
                              "thumbnail": "p/YiqkejgQ5GTRr-thumbnail.jpg",
                              "default": "p/YiqkejgQ5GTRr.jpg",
                              "large": "p/YiqkejgQ5GTRr-large.jpg",
                              "xlarge": "p/YiqkejgQ5GTRr-xlarge.jpg",
                              "icon": "p/YiqkejgQ5GTRr-icon.jpg",
                              "xxlarge": "p/YiqkejgQ5GTRr-xxlarge.jpg",
                              "medium": "p/YiqkejgQ5GTRr-medium.jpg"
                            },
                            "moglixImageNumber": "YiqkejgQ5GTRr",
                            "altTag": null,
                            "position": 0
                          },
                          {
                            "links": {
                              "small": "p/05rho32V6PYLc-small.jpg",
                              "thumbnail": "p/05rho32V6PYLc-thumbnail.jpg",
                              "default": "p/05rho32V6PYLc.jpg",
                              "large": "p/05rho32V6PYLc-large.jpg",
                              "xlarge": "p/05rho32V6PYLc-xlarge.jpg",
                              "icon": "p/05rho32V6PYLc-icon.jpg",
                              "xxlarge": "p/05rho32V6PYLc-xxlarge.jpg",
                              "medium": "p/05rho32V6PYLc-medium.jpg"
                            },
                            "moglixImageNumber": "05rho32V6PYLc",
                            "altTag": null,
                            "position": 1
                          },
                          {
                            "links": {
                              "small": "p/8YzIKOM2SeBzY-small.jpg",
                              "thumbnail": "p/8YzIKOM2SeBzY-thumbnail.jpg",
                              "default": "p/8YzIKOM2SeBzY.jpg",
                              "large": "p/8YzIKOM2SeBzY-large.jpg",
                              "xlarge": "p/8YzIKOM2SeBzY-xlarge.jpg",
                              "icon": "p/8YzIKOM2SeBzY-icon.jpg",
                              "xxlarge": "p/8YzIKOM2SeBzY-xxlarge.jpg",
                              "medium": "p/8YzIKOM2SeBzY-medium.jpg"
                            },
                            "moglixImageNumber": "8YzIKOM2SeBzY",
                            "altTag": null,
                            "position": 2
                          },
                          {
                            "links": {
                              "small": "p/zFNcoO5tcrmhb-small.jpg",
                              "thumbnail": "p/zFNcoO5tcrmhb-thumbnail.jpg",
                              "default": "p/zFNcoO5tcrmhb.jpg",
                              "large": "p/zFNcoO5tcrmhb-large.jpg",
                              "xlarge": "p/zFNcoO5tcrmhb-xlarge.jpg",
                              "icon": "p/zFNcoO5tcrmhb-icon.jpg",
                              "xxlarge": "p/zFNcoO5tcrmhb-xxlarge.jpg",
                              "medium": "p/zFNcoO5tcrmhb-medium.jpg"
                            },
                            "moglixImageNumber": "zFNcoO5tcrmhb",
                            "altTag": null,
                            "position": 3
                          },
                          {
                            "links": {
                              "small": "p/ATPcxJdbkDHZa-small.jpg",
                              "thumbnail": "p/ATPcxJdbkDHZa-thumbnail.jpg",
                              "default": "p/ATPcxJdbkDHZa.jpg",
                              "large": "p/ATPcxJdbkDHZa-large.jpg",
                              "xlarge": "p/ATPcxJdbkDHZa-xlarge.jpg",
                              "icon": "p/ATPcxJdbkDHZa-icon.jpg",
                              "xxlarge": "p/ATPcxJdbkDHZa-xxlarge.jpg",
                              "medium": "p/ATPcxJdbkDHZa-medium.jpg"
                            },
                            "moglixImageNumber": "ATPcxJdbkDHZa",
                            "altTag": null,
                            "position": 4
                          },
                          {
                            "links": {
                              "small": "p/j3BpOjnvcCEOK-small.jpg",
                              "thumbnail": "p/j3BpOjnvcCEOK-thumbnail.jpg",
                              "default": "p/j3BpOjnvcCEOK.jpg",
                              "large": "p/j3BpOjnvcCEOK-large.jpg",
                              "xlarge": "p/j3BpOjnvcCEOK-xlarge.jpg",
                              "icon": "p/j3BpOjnvcCEOK-icon.jpg",
                              "xxlarge": "p/j3BpOjnvcCEOK-xxlarge.jpg",
                              "medium": "p/j3BpOjnvcCEOK-medium.jpg"
                            },
                            "moglixImageNumber": "j3BpOjnvcCEOK",
                            "altTag": null,
                            "position": 5
                          },
                          {
                            "links": {
                              "small": "p/ejwpbXT1hit8F-small.jpg",
                              "thumbnail": "p/ejwpbXT1hit8F-thumbnail.jpg",
                              "default": "p/ejwpbXT1hit8F.jpg",
                              "large": "p/ejwpbXT1hit8F-large.jpg",
                              "xlarge": "p/ejwpbXT1hit8F-xlarge.jpg",
                              "icon": "p/ejwpbXT1hit8F-icon.jpg",
                              "xxlarge": "p/ejwpbXT1hit8F-xxlarge.jpg",
                              "medium": "p/ejwpbXT1hit8F-medium.jpg"
                            },
                            "moglixImageNumber": "ejwpbXT1hit8F",
                            "altTag": null,
                            "position": 6
                          }
                        ],
                        "qualityImage": true,
                        "attributes": {
                          "Delivery Size": [
                            "25 mm"
                          ],
                          "Head Range": [
                            "30-10 m"
                          ],
                          "Motor Power": [
                            "1 HP"
                          ],
                          "Phase": [
                            "Single Phase"
                          ],
                          "Power Rating": [
                            "0.75 kW"
                          ],
                          "Suction Size": [
                            "25 mm"
                          ],
                          "Body Material": [
                            "Cast Iron"
                          ],
                          "Discharge Range": [
                            "600-2400 lph"
                          ],
                          "Impeller Material": [
                            "Brass"
                          ],
                          "Item Code": [
                            "i-Flo"
                          ],
                          "Speed": [
                            "2880 rpm"
                          ],
                          "Voltage": [
                            "180-240 V"
                          ],
                          "Additional Details": [
                            "Coating: Chrome Plated"
                          ],
                          "Applications": [
                            "For Domestic & Industrial Use"
                          ],
                          "Colour": [
                            "Blue"
                          ],
                          "Dimensions": [
                            "315x190x250 mm"
                          ],
                          "Frequency": [
                            "50 Hz"
                          ],
                          "Lifting Height": [
                            "25 ft"
                          ],
                          "Motor Winding": [
                            "CCA"
                          ],
                          "Standards": [
                            "ISO 9001 Certified"
                          ],
                          "Warranty": [
                            "1 Year Replacement Warranty against Manufacturing Defects (Accidental Damages, Dry Running Damage not Covered in Warranty)"
                          ],
                          "Weight": [
                            "8.5 kg"
                          ],
                          "Country of origin": [
                            "India"
                          ]
                        },
                        "shipmentDetails": null,
                        "countriesSellingIn": [
                          "india"
                        ],
                        "productPriceQuantity": {
                          "india": {
                            "mrp": 4600,
                            "offeredPriceWithoutTax": 2118,
                            "offeredPriceWithTax": 2499,
                            "moq": 1,
                            "quantityAvailable": 99,
                            "incrementUnit": 1,
                            "packageUnit": "1 Piece",
                            "sellingPrice": 2849,
                            "taxRule": {
                              "name": null,
                              "storedName": null,
                              "taxType": null,
                              "taxPercentage": 18,
                              "status": null,
                              "deletedFlag": false,
                              "createdOn": 1685081780173,
                              "updatedOn": 1685081780173,
                              "hsn": "84137010",
                              "countryCode": 356,
                              "createdBy": null,
                              "updatedBy": null
                            },
                            "estimatedDelivery": "4-5 day",
                            "priceQuantityRange": null,
                            "outOfStockFlag": false,
                            "priceWithoutTax": 2414,
                            "discount": 38,
                            "bulkPrices": {}
                          }
                        },
                        "defaultCombination": false,
                        "variantName": "Sameer 1 HP i-Flo Water Pump with 1 Year Warranty, Total Head: 100 ft",
                        "productLinks": {
                          "canonical": "sameer-1-hp-i-flo-water-pump-with-1-year-warranty/mp/msn2r9cfnauwxd",
                          "default": "sameer-1-hp-i-flo-water-pump-with-1-year-warranty/mp/msn2r9cfnauwxd"
                        },
                        "productRating": null,
                        "canonicalUrl": "sameer-1-hp-i-flo-water-pump-with-1-year-warranty/mp/msn2r9cfnauwxd"
                      }
                    },
                    "groupedAttributes": {},
                    "keyFeatures": [
                      "Power Saving F Class Insulation Motor",
                      "Higher Suction Power & Give High Discharge in its Operating Range",
                      "High Quality Mechanical Seal has Long Life & it Completely Seals & Prevents the Water Entering into the Motor Side also it Works for Longer Period with Lesser Wear & Tear",
                      "High Grade Pump C.I Castings (FG-200 grade) Ensures Very Slow Rusting of Pump & Pump Life is Increases Due to Less Rusting",
                      "The Motor is Protected by T.O.P, which Ensures the Motor Stops Automatically when the Temprature of Pump Reaches Beyond the Limit",
                      "The Pumps is Self Primed, there is no Need to Add any Check Valve or Non Return Valve During Installation",
                      "The Pump is Painted with High Grade Powder Coats which Ensures no Rusting on the Motor Body",
                      "There are Plenty of Uses for this Water Pump Such as Residential Use to Transfer Water from Storage Tanks to Our Bathrooms, Kitchen etc, Agricultural Use to Transfer Water from Water Wells, Lakes, Rivers & Streams Towards Farm Lands & Animal Shelters or even Industrial Use to Handle Fire Accidents or to Ensure the Adequate Water Supply to Required Application Departments",
                      "Energy Efficient Motor: Power Saving F Class Insulation Motor",
                      "High Suction Lift: Higher Suction Power & Give High Discharge in Its Operating Range",
                      "Leakage Proof: High Quality Mechanical Seal Has Long Life. it Completely Seals & Prevents the Water Entering Into the Motor Side. it Works for Longer Period with Lesser Wear & Tear",
                      "Long Life: High Grade Pump C.I Castings (Fg-200 Grade) Ensures Very Slow Rusting of Pump & Pump Life is Increases Due to Less Rusting & Wear & Tear",
                      "Thermal Overload Protector: the Motor is Protected By T.O.P, Which Ensures the Motor Stops Automatically When the Temprature of Pump Reaches Beyond the Limit",
                      "Self Priming Pump: the Pumps is Self Primed, There is No Need to Add Any Check Valve Or Non Return Valve During Installation",
                      "No Rusting: the Pump is Painted with High Grade Powder Coats, Which Ensures No Rusting on the Motor Body"
                    ],
                    "friendlyUrl": "sameer-1-hp-i-flo-water-pump-with-1-year-warranty",
                    "groupId": "MPN1675076889862",
                    "rating": null,
                    "quantityAvailable": 99,
                    "outOfStock": false,
                    "productTags": null,
                    "defaultCanonicalUrl": null,
                    "videosInfo": null,
                    "documentInfo": null,
                    "saleType": null,
                    "packaging": "",
                    "manufacturerDetails": null,
                    "packerDetails": null,
                    "importerDetails": null,
                    "displayName": null,
                    "bestBefore": null,
                    "itemDimension": null,
                    "itemWeight": null,
                    "uom": "PCS",
                    "quantityUom": 1,
                    "weightInKg": null,
                    "dimensionInCms": null,
                    "weightSlabInKg": null,
                    "categoryConfirmationNeed": null,
                    "gmPercentOnline": null,
                    "attributeValueUniverse": null,
                    "returnable": null
                  }

                // if (this.rawProductData.priceQuantityCountry) {
                //     this.rawProductData.priceQuantityCountry["bulkPricesIndia"] = this.isProductPriceValid
                //         ? Object.assign(
                //             {},
                //             this.rawProductData["productPartDetails"][this.rawProductData.partNumber][
                //             "productPriceQuantity"
                //             ]["india"]["bulkPrices"]
                //         )
                //         : null;
                //     this.rawProductData.priceQuantityCountry["bulkPricesModified"] =
                //         this.isProductPriceValid &&
                //             this.rawProductData["productPartDetails"][this.rawProductData.partNumber][
                //             "productPriceQuantity"
                //             ]["india"]["bulkPrices"]["india"]
                //             ? [
                //                 ...this.rawProductData["productPartDetails"][this.rawProductData.partNumber][
                //                 "productPriceQuantity"
                //                 ]["india"]["bulkPrices"]["india"],
                //             ]
                //             : null;
                // }
                if (
                    this.apiResponse['productGroup'] &&
                    Object.values(this.rawProductData["productAllImages"]) !== null
                ) {
                    this.commonService.enableNudge = false;
                    this.isAcceptLanguage = (this.apiResponse.productGroup["acceptLanguage"] != null && rawData["product"][0]["acceptLanguage"] != undefined) ? true : false;
                    this.setProductImages(this.rawProductData["productAllImages"])
                } else {
                    this.setProductNotFound();
                }
            } else {
                this.setProductNotFound();
            }
        })
        this.createSiemaOption();
    }

    ngAfterViewInit() {
        this.getPurchaseList();
        this.productStatusCount();
        this.productFbtData();
    }

    // Frequently brought togther functions

    productFbtData()
    {
        this.productService
            .getFBTProducts(this.rawProductData.defaultPartNumber)
            .subscribe((rawProductFbtData) =>
            {
                this.fetchFBTProducts(
                    this.rawProductData,
                    Object.assign({}, rawProductFbtData)
                );
            });
    }

    fetchFBTProducts(productBO, rawProductFbtData)
    {
        if (this.rawProductData.productOutOfStock) {
            this.productUtil.resetFBTSource();
        } else {
            this.fbtFlag = false;
            let rootvalidation = this.productUtil.validateProduct(productBO);
            if (rootvalidation) {
                this.processFBTResponse(productBO, rawProductFbtData);
            }
        }
    }

    processFBTResponse(productResponse, fbtResponse)
    {
        if (fbtResponse["status"] && fbtResponse["data"]) {
            let validFbts: any[] = this.productUtil.validateFBTProducts(
                fbtResponse["data"]
            );
            if (validFbts.length > 0) {
                this.productUtil.changeFBTSource(productResponse, validFbts);
                this.getFbtIntance(); 
                this.fbtFlag = true;
                this.cdr.detectChanges();
            } else {
                this.fbtFlag = false;
            }
        } else {
            this.productUtil.resetFBTSource();
        }
        this.cdr.detectChanges();
    }

    getFbtIntance() {
        const TAXONS = this.taxons;
        let page = {
            pageName: `moglix:${TAXONS[0]}:${TAXONS[1]}:${TAXONS[2]}:pdp`,
            channel: "About This Product",
            subSection: null,
            linkPageName: null,
            linkName: null,
            loginStatus: this.commonService.loginStatusTracking,
        };
        this.fbtAnalytics = {
            page: page,
            custData: this.commonService.custDataTracking,
            order: this.orderTracking,
        };
        this.cdr.detectChanges();
    }

    translate() {
        if ((this.router.url).toLowerCase().indexOf('/hi/') !== -1) {
            const URL = this.getSanitizedUrl(this.router.url).split("/hi/").join('/');
            // console.log(this.commonService.defaultLocaleValue.language, URL);
            // console.log("this.productUrl",this.productUrl)
            this.router.navigate([URL]);
        }
        else {
            const URL = '/hi' + this.getSanitizedUrl(this.router.url);
            this.router.navigate([URL]);
        }
    }

    refreshProductCrousel() {
        this.refreshSiemaItems$.next({
            items: this.productAllImages,
            type: "refresh",
            currentSlide: 0,
        });
    }
    setProductImages(imagesArr: any[]) {
        this.productDefaultImage =
            imagesArr.length > 0
                ? this.imagePath + "" + imagesArr[0]["links"]["default"]
                : "";
        this.productMediumImage =
            imagesArr.length > 0 ? imagesArr[0]["links"]["medium"] : "";
        this.productAllImages = [];
        imagesArr.forEach((element) => {
            this.productAllImages.push({
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
        if (this.productAllImages.length > 0) {
            this.productCartThumb = this.productAllImages[0]["thumb"];
        }
    }
    scrollToId(id: string) {
        // this.holdRFQForm = true;
        if (document.getElementById(id)) {
            let footerOffset = document.getElementById(id).offsetTop;
            ClientUtility.scrollToTop(1000, footerOffset + 190);
        }
    }

    getSanitizedUrl(url) {
        return (url).toLowerCase().split('#')[0].split('?')[0];
    }

    // Wishlist related functionality
    getPurchaseList() {
        if (!this.rawProductData) {
            return;
        }
        this.isPurcahseListProduct = false;
        if (this.user) {
            if (this.user.authenticated == "true") {
                const request = { idUser: this.user.userId, userType: "business" };

                this.productService.getPurchaseList(request).subscribe((res) => {
                    this.showLoader = false;
                    if (res["status"] && res["statusCode"] == 200) {
                        let purchaseLists: Array<any> = [];
                        purchaseLists = res["data"];
                        purchaseLists.forEach((element) => {
                            if (
                                (element.productDetail &&
                                    element.productDetail.partNumber ==
                                    this.rawProductData.defaultPartNumber) ||
                                (element.productDetail &&
                                    element.productDetail.partNumber ==
                                    this.rawProductData.defaultPartNumber)
                            ) {
                                this.isPurcahseListProduct = true;
                            }
                        });
                    }
                });
            }
        }
    }

    addToPurchaseList() {
        if (this.isPurcahseListProduct) {
            this.removeItemFromPurchaseList();
        } else {
            if (this.user) {
                if (this.user && this.user.authenticated == "true") {
                    this.isPurcahseListProduct = true;
                    let obj = {
                        idUser: this.user.userId,
                        userType: "business",
                        idProduct: this.rawProductData.defaultPartNumber || this.rawProductData.defaultPartNumber,
                        productName: this.rawProductData.productName,
                        description: this.rawProductData.desciption,
                        brand: this.rawProductData.brandDetails["brandName"],
                        category: this.rawProductData.categoryDetails["categoryCode"],
                    };
                    this.showLoader = true;
                    this.productService.addToPurchaseList(obj).subscribe((res) => {
                        this.showLoader = false;
                        if (res["status"]) {
                            this._tms.show({
                                type: "success",
                                text: this.productStaticData.successfully_added_to_wishlist,
                            });
                        }
                    });
                } else {
                    // this.goToLoginPage(this.productUrl);
                }
            } else {
                // this.goToLoginPage(this.productUrl);
            }
        }
    }

    removeItemFromPurchaseList() {
        this.showLoader = true;
        let obj = {
            idUser: this.user.userId,
            userType: "business",
            idProduct: this.rawProductData.defaultPartNumber || this.rawProductData.defaultPartNumber,
            productName: this.rawProductData.productName,
            description: this.rawProductData.productDescripton,
            brand: this.rawProductData.brandDetails["brandName"],
            category: this.rawProductData.categoryDetails[0]["categoryCode"],
        };

        this.productService.removePurchaseList(obj).subscribe(
            (res) => {
                if (res["status"]) {
                    this._tms.show({
                        type: "success",
                        text: "Successfully removed from WishList",
                    });
                    this.showLoader = false;
                    this.getPurchaseList();
                } else {
                    this.showLoader = false;
                }
            },
            (err) => {
                this.showLoader = false;
            }
        );
    }

    setProductNotFound() {
        this.showLoader = false;
        this.globalLoader.setLoaderState(false);
        this.productNotFound = true;
        this.pageTitle.setTitle("Page Not Found");
        if (this.isServer && this.productNotFound) {
            this._response.status(404);
        }
    }

    initializeLocalization() {
        if ((this.router.url).includes("/hi/")) {
            this.commonService.defaultLocaleValue = localization_hi.product;
            this.productStaticData = localization_hi.product;
            this.commonService.changeStaticJson.next(this.productStaticData);
        } else {
            this.commonService.defaultLocaleValue = localization_en.product;
            this.productStaticData = localization_en.product;
            this.commonService.changeStaticJson.next(this.productStaticData);
        }
        this.commonService.changeStaticJson.asObservable().subscribe(localization_content => {
            this.productStaticData = localization_content;
        })
    }

    createSiemaOption() {
        if (!this.rawProductData) {
            return;
        }
        this.iOptions = {
            selector: ".img-siema",
            perPage: 1,
            productNew: true,
            pager: true,
            imageAlt: this.rawProductData.productName,
            loop: true,
            onInit: () => {
                setTimeout(() => {
                    this.carouselInitialized = true;
                }, 0);
            },
        };
    }

    // lazy loaded modules
    async loadProductShare() {
        if (!this.productShareInstance) {
            const shareURL = CONSTANTS.PROD + this.router.url;
            const { ProductShareComponent } = await import(
                "./../../components/product-share/product-share.component"
            );
            const factory = this.cfr.resolveComponentFactory(ProductShareComponent);
            this.productShareInstance = this.productShareContainerRef.createComponent(
                factory,
                null,
                this.injector
            );
            const productResult = {
                productName: this.rawProductData.productName,
                canonicalUrl: this.rawProductData["defaultCanonicalUrl"],
            };
            this.productShareInstance.instance["btmMenu"] = true;
            this.productShareInstance.instance["productResult"] = productResult;
            this.productShareInstance.instance["shareFbUrl"] =
                CONSTANTS.FB_URL + shareURL + "&redirect_uri=" + CONSTANTS.PROD;
            this.productShareInstance.instance["shareTwitterUrl"] =
                CONSTANTS.TWITTER_URL + shareURL;
            this.productShareInstance.instance["shareLinkedInUrl"] =
                CONSTANTS.LINKEDIN_URL + shareURL;
            this.productShareInstance.instance["shareWhatsappUrl"] =
                this.sanitizer.bypassSecurityTrustUrl(
                    "whatsapp://send?text=" + encodeURIComponent(shareURL)
                );
            (
                this.productShareInstance.instance["removed"] as EventEmitter<boolean>
            ).subscribe((status) => {
                this.productShareInstance = null;
                this.productShareContainerRef.detach();
            });
        } else {
            //toggle side menu
            this.productShareInstance.instance["btmMenu"] = true;
        }
    }

    async openPopUpcrousel(slideNumber: number = 0, oosProductIndex: number = -1) {
        if (!this.popupCrouselInstance) {
            this.showLoader = true;
            this.displayCardCta = true;
            const { ProductCrouselPopupComponent } = await import("../../components/product-crousel-popup/product-crousel-popup.component").finally(() => {
                this.showLoader = false;
            });
            const factory = this.cfr.resolveComponentFactory(ProductCrouselPopupComponent);
            this.popupCrouselInstance = this.popupCrouselContainerRef.createComponent(factory, null, this.injector);
            this.productService.notifyImagePopupState.next(true);
            this.updateBackHandling();
            // sent anaytic call
            this.sendProductImageClickTracking(":oos:similar")
            const options = Object.assign({}, this.iOptions);
            options.pager = false;
            this.popupCrouselInstance.instance["analyticProduct"] = this._trackingService.basicPDPTracking(this.rawProductData);
            this.popupCrouselInstance.instance["oosProductIndex"] = oosProductIndex;
            this.popupCrouselInstance.instance["options"] = options;
            this.popupCrouselInstance.instance["productAllImages"] = oosProductIndex < 0 ? this.productAllImages : this.productService.oosSimilarProductsData.similarData[oosProductIndex].productAllImages;
            this.popupCrouselInstance.instance["slideNumber"] = slideNumber;
            (this.popupCrouselInstance.instance["out"] as EventEmitter<boolean>).subscribe((status) => {
                // this.productService.notifyImagePopupState.next(false);
                this.clearImageCrouselPopup()
            });
            (this.popupCrouselInstance.instance["currentSlide"] as EventEmitter<boolean>).subscribe((slideData) => {
                if (slideData) {
                    this.moveToSlide$.next(slideData.currentSlide);
                }
            });
            this.backTrackIndex = oosProductIndex;
        }
        this.cdr.detectChanges();
    }
    private clearImageCrouselPopup() {
        this.displayCardCta = false;
        if (this.popupCrouselInstance) {
            this.popupCrouselInstance = null;
            this.popupCrouselContainerRef.remove();
        }
        this.backUrlNavigationHandler();
        this.commonService.setBodyScroll(null, true);
    }
    backUrlNavigationHandler() {
        // make sure no browser history is present
        if (this.location.getState() && this.location.getState()['navigationId'] == 1) {
            this.sessionStorageService.store('NO_HISTROY_PDP', 'NO_HISTROY_PDP');
            if (this.rawProductData.categoryDetails && this.rawProductData.categoryDetails['categoryLink']) {
                window.history.replaceState('', '', this.rawProductData.categoryDetails['categoryLink'] + '?back=1');
                window.history.pushState('', '', this.router.url);
            }
        }
    }
    attachBackClickHandler() {
        window.addEventListener('popstate', (event) => {
            //Your code here
            let url = this.backTrackIndex < 0 ? this.rawProductData.defaultCanonicalUrl : this.productService.oosSimilarProductsData.similarData[this.backTrackIndex]["productUrl"];
            window.history.replaceState('', '', url);
        });
    }
    updateBackHandling() {
        window.history.replaceState('', '', this.pageUrl);
        window.history.pushState('', '', this.pageUrl);
    }

    sendProductImageClickTracking(infoStr = "") {
        let page = {
            channel: "pdp image carausel" + infoStr,
            pageName: "moglix:image carausel:pdp" + infoStr,
            linkName: "moglix:productmainimageclick_0",
            subSection: "moglix:pdp carausel main image:pdp",
            linkPageName: "moglix:" + this.router.url,
        };
        this.analytics.sendAdobeCall({ page }, "genericPageLoad");
    }

    // PDP Cart revamp : product quantity handle START HERE

    get cartQunatityForProduct() {
        return parseInt(this.qunatityFormControl.value) || 1;
    }

    onChangeCartQuanityValue() {
        this.checkCartQuantityAndUpdate(this.qunatityFormControl.value);
    }

    checkCartQuantityAndUpdate(value): void {
        if (!value) {
            this._tms.show({
                type: 'error',
                text: (value == 0) ? 'Minimum qty can be ordered is: 1' : 'Please enter a value quantity',
            })
            this.qunatityFormControl.setValue(this.rawProductData.productMinimmumQuantity);
        } else {
            if (parseInt(value) < parseInt(this.rawProductData.productMinimmumQuantity)) {
                this._tms.show({
                    type: 'error',
                    text: 'Minimum qty can be ordered is: ' + this.rawProductData.productMinimmumQuantity
                })
                this.qunatityFormControl.setValue(this.rawProductData.productMinimmumQuantity);
            } else if (parseInt(value) > parseInt(this.rawProductData.priceQuantityCountry['quantityAvailable'])) {
                this._tms.show({
                    type: 'error',
                    text: 'Maximum qty can be ordered is: ' + this.rawProductData.priceQuantityCountry['quantityAvailable']
                })
                this.qunatityFormControl.setValue(this.rawProductData.priceQuantityCountry['quantityAvailable']);
            } else if (isNaN(parseInt(value))) {
                this.qunatityFormControl.setValue(this.rawProductData.productMinimmumQuantity);
                this.checkBulkPriceMode();
            } else {
                this.qunatityFormControl.setValue(value);
                this.checkBulkPriceMode();
            }
        }
    }

    updateProductQunatity(type: 'INCREMENT' | 'DECREMENT') {
        switch (type) {
            case 'DECREMENT':
                this.checkCartQuantityAndUpdate((this.cartQunatityForProduct - 1))
                break;
            case 'INCREMENT':
                this.checkCartQuantityAndUpdate((this.cartQunatityForProduct + 1))
                break;
            default:
                break;
        }
    }

    checkForBulkPricesProduct() {
        if (this.rawProductData['productPrice']) {
            const productBulkPrices = this.rawProductData['productPriceQuantity']['bulkPrices'] || {};
            this.productBulkPrices = (Object.keys(productBulkPrices).length > 0) ? Object.assign([], productBulkPrices) : null;
            this.isBulkPricesProduct = this.productBulkPrices ? true : false;
            if (this.isBulkPricesProduct) {
                this.productBulkPrices = this.productBulkPrices.map(priceMap => {
                    const discount = this.commonService.calculcateDiscount(null, this.rawProductData.product, priceMap.bulkSellingPrice);
                    return { ...priceMap, discount }
                })
                //filtering Data to show the 
                this.productBulkPrices = this.productBulkPrices.filter((bulkPrice) => {
                    return this.rawProductData['quantityAvailable'] >= bulkPrice['minQty'] && bulkPrice['minQty'] >= this.rawProductData.productMinimmumQuantity;

                });
                this.checkBulkPriceMode();
            }
        }
    }

    checkBulkPriceMode() {
        if (this.isBulkPricesProduct) {
            const selectedProductBulkPrice = this.productBulkPrices.filter(prices => (this.cartQunatityForProduct >= prices.minQty && this.cartQunatityForProduct <= prices.maxQty));
            this.selectedProductBulkPrice = (selectedProductBulkPrice.length > 0) ? selectedProductBulkPrice[0] : null;
            if (this.selectedProductBulkPrice) {
                this.bulkPriceWithoutTax = this.selectedProductBulkPrice['bulkSPWithoutTax'];
            }
        }
    }

    selectProductBulkPrice(qunatity) {
        if (qunatity > this.rawProductData.priceQuantityCountry['quantityAvailable']) {
            this._tms.show({
                type: 'error',
                text: 'Maximum qty can be ordered is: ' + this.rawProductData.priceQuantityCountry['quantityAvailable']
            })
            return;
        }
        this.checkBulkPriceMode();
    }

    productStatusCount() {
        if (this.isHindiUrl) {
            this.ProductStatusCount = this.productService.getProductStatusCount(this.rawProductData.defaultPartNumber, { headerData: { 'language': 'hi' } })
        }
        else {
            this.ProductStatusCount = this.productService.getProductStatusCount(this.rawProductData.defaultPartNumber)
        }
        this.ProductStatusCount.subscribe((productStatusCountResult) => {
            this.rawProductCountData = Object.assign({}, productStatusCountResult);
            this.remoteApiCallRecentlyBought();
        });
    }

    remoteApiCallRecentlyBought() {
        let MSG = null;
        let CART_NOTIFICATION_MSG = null;
        if (
            this.rawProductData &&
            this.rawProductCountData &&
            !this.rawProductData.productOutOfStock
        ) {
            if (
                this.rawProductCountData["status"] &&
                this.rawProductCountData["statusCode"] &&
                this.rawProductCountData["statusCode"] == 200 &&
                this.rawProductCountData["data"]
            ) {
                MSG = this.rawProductCountData["data"]["message"] || null;
                CART_NOTIFICATION_MSG =
                    this.rawProductCountData["data"]["toastMessage"] ||
                    "Product added successfully";
            }
        }
        this.rawProductCountMessage = MSG;
        this.rawCartNotificationMessage = CART_NOTIFICATION_MSG;
    }

    async viewPopUpOpen(data) {
        if (!this.offerPopupInstance) {
            this.showLoader = true;
            const { ProductOfferPopupComponent } = await import(
                "./../../components/product-offer-popup/product-offer-popup.component"
            ).finally(() => {
                this.showLoader = false;
            });
            const factory = this.cfr.resolveComponentFactory(
                ProductOfferPopupComponent
            );
            this.offerPopupInstance = this.offerPopupContainerRef.createComponent(
                factory,
                null,
                this.injector
            );
            this.offerPopupInstance.instance["data"] = data["block_data"];
            this.offerPopupInstance.instance["offerIndex"] = data["index"];
            let gstPercentage = this.rawProductData.taxPercentage;
            this.offerPopupInstance.instance['gstPercentage'] = gstPercentage;
            this.offerPopupInstance.instance["openMobikwikPopup"] = true;
            (
                this.offerPopupInstance.instance["out"] as EventEmitter<boolean>
            ).subscribe((data) => {
                // create a new component after component is closed
                // this is required, to refresh input data
                this.offerPopupInstance = null;
                this.offerPopupContainerRef.remove();
            });
            (
                this.offerPopupInstance.instance[
                "isLoading"
                ] as EventEmitter<boolean>
            ).subscribe((loaderStatus) => {
                this.showLoader = loaderStatus;
            });
        }
    }

    async promoCodePopUpOpen(data) {
        if (!this.promoOfferPopupInstance) {
            this.showLoader = true;
            const { ProductMoreOffersComponent } = await import(
                "./../../components/product-more-offers/product-more-offers.component"
            ).finally(() => {
                this.showLoader = false;
            });
            const factory = this.cfr.resolveComponentFactory(
                ProductMoreOffersComponent
            );
            this.promoOfferPopupInstance = this.promoOfferPopupContainerRef.createComponent(
                factory,
                null,
                this.injector
            );
            this.promoOfferPopupInstance.instance["data"] = data;
            (
                this.promoOfferPopupInstance.instance["out"] as EventEmitter<boolean>
            ).subscribe((data) => {
                // create a new component after component is closed
                // this is required, to refresh input data
                this.promoOfferPopupInstance = null;
                this.promoOfferPopupContainerRef.remove();
            });
            (
                this.promoOfferPopupInstance.instance[
                "isLoading"
                ] as EventEmitter<boolean>
            ).subscribe((loaderStatus) => {
                this.showLoader = loaderStatus;
            });
        }
    }

    async emiComparePopUpOpen(status) {
        if (!this.offerComparePopupInstance && status) {
            this.showLoader = true;
            const quantity = this.cartQunatityForProduct;
            const { EmiPlansComponent } = await import(
                "./../../modules/emi-plans/emi-plans.component"
            ).finally(() => {
                this.showLoader = false;
            });
            const factory = this.cfr.resolveComponentFactory(EmiPlansComponent);
            this.offerComparePopupInstance =
                this.offerComparePopupContainerRef.createComponent(
                    factory,
                    null,
                    this.injector
                );
            const productInfo = {};
            productInfo["productName"] = this.rawProductData.productName;
            productInfo["minimal_quantity"] = this.rawProductData.productMinimmumQuantity;
            productInfo["priceWithoutTax"] = this.rawProductData.priceWithoutTax;
            productInfo["productPrice"] = this.rawProductData.productPrice;
            this.offerComparePopupInstance.instance["productInfo"] = productInfo;
            this.offerComparePopupInstance.instance["quantity"] = quantity;
            this.offerComparePopupInstance.instance["openEMIPopup"] = true;
            (
                this.offerComparePopupInstance.instance["out"] as EventEmitter<boolean>
            ).subscribe((data) => {
                // create a new component after component is closed
                // this is required, to refresh input data
                this.offerComparePopupInstance = null;
                this.offerComparePopupContainerRef.detach();
            });
            (
                this.offerComparePopupInstance.instance[
                "isLoading"
                ] as EventEmitter<boolean>
            ).subscribe((loaderStatus) => {
                this.showLoader = loaderStatus;
            });
        }
    }

    async onVisiblePincodeSection($event) {
        this.showLoader = true;
        const { ProductCheckPincodeComponent } = await import(
            "./../../components/product-check-pincode/product-check-pincode.component"
        ).finally(() => {
            this.showLoader = false;
        });
        const factory = this.cfr.resolveComponentFactory(
            ProductCheckPincodeComponent
        );
        this.pincodeFormInstance = this.pincodeFormContainerRef.createComponent(
            factory,
            null,
            this.injector
        );
        const quantity = this.cartQunatityForProduct;
        const productInfo = {};
        productInfo["partNumber"] =
            this.rawProductData.defaultPartNumber || this.rawProductData.defaultPartNumber;
        productInfo["estimatedDelivery"] =
            this.rawProductData.priceQuantityCountry["estimatedDelivery"];
        productInfo["categoryDetails"] = this.rawProductData.productCategoryDetails;
        productInfo["productPrice"] = this.rawProductData.productPrice;
        productInfo["quantity"] = quantity;
        productInfo["isHindiMode"] = this.isHindiUrl;
        this.pincodeFormInstance.instance["pageData"] = productInfo;
        if (this.pincodeFormInstance) {
            (
                this.pincodeFormInstance.instance[
                "sendAnalyticsCall"
                ] as EventEmitter<any>
            ).subscribe((data) => {
                this.analyticPincodeAvaliabilty(data);
            });
        }
        this.cdr.detectChanges();
    }
    analyticPincodeAvaliabilty(analytics) {
        const taxonomy = this.rawProductData.productCategoryDetails["taxonomy"];
        let taxo1 = "";
        let taxo2 = "";
        let taxo3 = "";
        if (this.rawProductData.productCategoryDetails["taxonomyCode"]) {
            taxo1 = this.rawProductData.productCategoryDetails["taxonomyCode"].split("/")[0] || "";
            taxo2 = this.rawProductData.productCategoryDetails["taxonomyCode"].split("/")[1] || "";
            taxo3 = this.rawProductData.productCategoryDetails["taxonomyCode"].split("/")[2] || "";
        }
        const user = this.localStorageService.retrieve("user");
        let page = {
            linkPageName: "moglix: " + taxo1 + ":" + taxo2 + ":" + taxo3 + ": pdp",
            linkName: "check now",
            channel: "pdp",
            loginStatus: user.userId ? "registered" : "guest",
        };
        let custData = this.commonService.custDataTracking;
        let order = {
            productID: this.rawProductData.defaultPartNumber,
            productCategoryL1: taxo1,
            productCategoryL2: taxo2,
            productCategoryL3: taxo3,
            brand: this.rawProductData.productBrandDetails["brandName"],
            productPrice: this.rawProductData.productPrice,
            serviceability: analytics.serviceability ? "yes" : "no",
            codserviceability: analytics.codserviceability ? "yes" : "no",
            pincode: analytics.pincode,
            deliveryTAT: analytics.deliveryDays ? analytics.deliveryDays : "NA",
            deliveryAnalytics: analytics.deliveryAnalytics,
        };
        this.analytics.sendAdobeCall({ page, custData, order }, "genericClick");
    }

    async loadReturnInfo() {
        if (!this.returnInfoInstance) {
            const { ReturnInfoComponent } = await import(
                "./../../components/return-info/return-info.component"
            );
            const factory = this.cfr.resolveComponentFactory(ReturnInfoComponent);
            this.returnInfoInstance = this.returnInfoContainerRef.createComponent(
                factory,
                null,
                this.injector
            );
            this.returnInfoInstance.instance['isBrandMsn'] = this.rawProductData.productBrandDetails.brandTag == 'Brandd' ? true : false;
            this.returnInfoInstance.instance['show'] = true;
            (
                this.returnInfoInstance.instance["removed"] as EventEmitter<boolean>
            ).subscribe((status) => {
                this.returnInfoInstance = null;
                this.returnInfoContainerRef.detach();
            });
            (
                this.returnInfoInstance.instance["navigateToFAQ$"] as EventEmitter<boolean>
            ).subscribe((status) => {
                this.navigateToFAQ();
            });
        } else {
            //toggle side menu
            this.returnInfoInstance.instance["show"] = true;
        }
        this.cdr.detectChanges();
    }

    showYTVideo1(link) {
        this.showYTVideo(link)
    }

    async handleProductInfoPopup1(event) {
        this.handleProductInfoPopup(event.infoType, event.cta)
    }

    async handleProductInfoPopup(infoType, cta, oosProductIndex: number = -1) {
        this.holdRFQForm = true;
        this.sendProductInfotracking(cta);
        this.showLoader = true;
        this.displayCardCta = true;
        const { ProductInfoComponent } = await import(
            "./../../modules/product-info/product-info.component"
        ).finally(() => {
            this.showLoader = false;
        });
        const factory = this.cfr.resolveComponentFactory(ProductInfoComponent);
        this.productInfoPopupInstance =
            this.productInfoPopupContainerRef.createComponent(
                factory,
                null,
                this.injector
            );
        this.productInfoPopupInstance.instance["oosProductIndex"] = oosProductIndex;
        this.productInfoPopupInstance.instance["analyticProduct"] = this._trackingService.basicPDPTracking(this.rawProductData);
        this.productInfoPopupInstance.instance["modalData"] =
            oosProductIndex > -1
                ? this.productService.getProductInfo(infoType, oosProductIndex)
                : this.getProductInfo(infoType);
        this.productInfoPopupInstance.instance["openProductInfo"] = true;
        (
            this.productInfoPopupInstance.instance[
            "closePopup$"
            ] as EventEmitter<boolean>
        ).subscribe((data) => {
            this.closeProductInfoPopup();
            this.handleRestoreRoutingForPopups();
        });
        this.backTrackIndex = oosProductIndex;
    }
    private closeProductInfoPopup() {
        this.holdRFQForm = false;
        this.productInfoPopupInstance = null;
        this.productInfoPopupContainerRef.remove();
        this.displayCardCta = false;
    }
    handleRestoreRoutingForPopups() {
        window.history.replaceState('', '', this.commonService.getPreviousUrl);
        window.history.pushState('', '', this.router.url);
    }

    getBrandLink(brandDetails: {}) {
        if (brandDetails == undefined) {
            return [];
        }
        let d = brandDetails["friendlyUrl"];
        return ["/brands/" + d.toLowerCase()];
    }

    private getSecondaryAttributes() {
        return {
            "Manufacturer Details": (this.rawProductData["manufacturerDetails"]) ? [this.rawProductData["manufacturerDetails"]] : [],
            "Packer Details": (this.rawProductData["packerDetails"]) ? [this.rawProductData["packerDetails"]] : [],
            "Importer Details": (this.rawProductData["importerDetails"]) ? [this.rawProductData["importerDetails"]] : [],
            "Common/Generic Name": (this.rawProductData["displayName"]) ? [this.rawProductData["displayName"]] : [],
            "Best Before": (this.rawProductData["bestBefore"]) ? [this.rawProductData["bestBefore"]] : [],
            "Dimensions LxWxH": (this.rawProductData["itemDimension"]) ? [this.rawProductData["itemDimension"]] : [],
            "Weight": (this.rawProductData["itemWeight"]) ? [this.rawProductData["itemWeight"]] : [],
        }
    }

    getProductInfo(infoType) {
        const productInfo = {};
        productInfo["mainInfo"] = {
            productName: this.rawProductData.productName,
            imgURL: this.productAllImages[0]["large"],
            brandName: this.rawProductData.productBrandDetails["brandName"],
            productMrp: this.rawProductData.productMrp,
            productDiscount: this.rawProductData.productDiscount,
            bulkPriceWithoutTax: this.bulkPriceWithoutTax,
            priceWithoutTax: this.rawProductData.priceWithoutTax,
            productPrice: this.rawProductData.productPrice,
            // bulkSellingPrice: this.bulkSellingPrice,
            taxPercentage: this.rawProductData.taxPercentage,
            // bulkDiscount: this.bulkDiscount,
            productOutOfStock: this.rawProductData.productOutOfStock,
        };
        let contentInfo = {};
        if (this.rawProductData.productKeyFeatures && this.rawProductData.productKeyFeatures.length) {
            contentInfo["key features"] = this.rawProductData.productKeyFeatures;
        }
        if (this.rawProductData.productAttributes) {
            const brand = {
                name: this.rawProductData.productBrandDetails["brandName"],
                link: this.getBrandLink(this.rawProductData.productBrandDetails),
                brandId: this.rawProductData.productBrandDetails["idBrand"]
            };
            contentInfo["specifications"] = {
                attributes: this.rawProductData.productAttributes,
                brand: brand,
                secondaryAttributes: this.getSecondaryAttributes()
            };
        }
        // if (this.productVideos && this.productVideos.length) {
        //     contentInfo["videos"] = this.productVideos;
        // }
        const details = {
            description: this.rawProductData.productDescripton,
            category: this.rawProductData.productCategoryDetails,
            brand: this.rawProductData.productBrandDetails,
            brandCategoryURL: this.rawProductData.productBrandCategoryUrl,
            productName: this.rawProductData.productName,
        };
        contentInfo["product details"] = details;
        const IMAGES = (this.productAllImages as any[]).filter(
            (image) => image["contentType"] === "IMAGE"
        );
        if (IMAGES.length) {
            contentInfo["images"] = IMAGES;
        }
        productInfo["contentInfo"] = contentInfo;
        productInfo["infoType"] = infoType;
        const TAXONS = this.taxons;
        let page = {
            pageName: `moglix:${TAXONS[0]}:${TAXONS[1]}:${TAXONS[2]}:pdp`,
            channel: "About This Product",
            subSection: null,
            linkPageName: null,
            linkName: null,
            loginStatus: this.commonService.loginStatusTracking,
        };
        productInfo["analyticsInfo"] = {
            page: page,
            custData: this.commonService.custDataTracking,
            order: this.orderTracking,
        };
        return productInfo;
    }

    get orderTracking() {
        const TAXNONS = this.taxons;
        const TAGS = [];

        // if (this.productTags && this.productTags.length > 0) {
        //     this.productTags.forEach((element) =>
        //     {
        //         TAGS.push(element.name);
        //     });
        // }

        const tagsForAdobe = TAGS.join("|");
        return {
            productID: this.rawProductData.defaultPartNumber,
            productCategoryL1: TAXNONS[0],
            productCategoryL2: TAXNONS[1],
            productCategoryL3: TAXNONS[2],
            brand: this.rawProductData.productBrandDetails["brandName"],
            price: this.rawProductData.productPrice,
            stockStatus: this.rawProductData.productOutOfStock ? "Out of Stock" : "In Stock",
            tags: tagsForAdobe,
        };
    }

    get taxons() {
        const taxon = [];
        if (
            this.rawProductData.productCategoryDetails && this.rawProductData.productCategoryDetails["taxonomyCode"] !== null &&
            this.rawProductData.productCategoryDetails.hasOwnProperty("taxonomyCode")
        ) {
            taxon.push(
                this.rawProductData.productCategoryDetails["taxonomyCode"].split("/")[0] || ""
            );
            taxon.push(
                this.rawProductData.productCategoryDetails["taxonomyCode"].split("/")[1] || ""
            );
            taxon.push(
                this.rawProductData.productCategoryDetails["taxonomyCode"].split("/")[2] || ""
            );
        }
        return taxon;
    }

    sendProductInfotracking(cta) {
        const TAXONS = this.taxons;
        let page = {
            pageName: null,
            channel: "pdp",
            subSection: null,
            linkPageName: `moglix:${TAXONS[0]}:${TAXONS[1]}:${TAXONS[2]}:pdp`,
            linkName: cta,
            loginStatus: this.commonService.loginStatusTracking,
        };
        const custData = this.commonService.custDataTracking;
        const order = this.orderTracking;
        this.analytics.sendAdobeCall({ page, custData, order }, "genericClick");
    }

    async showYTVideo(link) {
        if (!this.youtubeModalInstance) {
            const PRODUCT = this._trackingService.basicPDPTracking(this.rawProductData);
            let analyticsDetails = this._trackingService.getCommonTrackingObject(PRODUCT, "pdp");
            let ytParams = "?autoplay=1&rel=0&controls=1&loop&enablejsapi=1";
            let videoDetails = { url: link, params: ytParams };
            let modalData = { component: YoutubePlayerComponent, inputs: null, outputs: {}, mConfig: { showVideoOverlay: true }, };
            modalData.inputs = { videoDetails: videoDetails, analyticsDetails: analyticsDetails };
            this.modalService.show(modalData);
        }
    }

    async writeReview(index = -1) {
        let user = this.localStorageService.retrieve("user");
        if (user && user.authenticated == "true") {
            this.sendProductInfotracking("write a review");
            if (!this.writeReviewPopupInstance) {
                this.showLoader = true;
                const { PostProductReviewPopupComponent } = await import(
                    "../../components/post-product-review-popup/post-product-review-popup.component"
                ).finally(() => {
                    this.showLoader = false;
                });
                const factory = this.cfr.resolveComponentFactory(
                    PostProductReviewPopupComponent
                );
                this.writeReviewPopupInstance =
                    this.writeReviewPopupContainerRef.createComponent(
                        factory,
                        null,
                        this.injector
                    );

                const productInfo = {};
                productInfo["productName"] = (index > -1) ? this.productService.oosSimilarProductsData.similarData[index].productName : this.rawProductData.productName;
                productInfo["partNumber"] =
                    (index > -1) ? (this.productService.oosSimilarProductsData.similarData[index].productSubPartNumber || this.productService.oosSimilarProductsData.similarData[index].defaultPartNumber) : (this.rawProductData.defaultPartNumber || this.rawProductData.defaultPartNumber);

                this.writeReviewPopupInstance.instance["productInfo"] = productInfo;
                (
                    this.writeReviewPopupInstance.instance[
                    "removed"
                    ] as EventEmitter<boolean>
                ).subscribe((status) => {
                    this.writeReviewPopupInstance = null;
                    this.writeReviewPopupContainerRef.detach();
                });

                (
                    this.writeReviewPopupInstance.instance[
                    "submitted"
                    ] as EventEmitter<boolean>
                ).subscribe((status) => {
                    this.loadAlertBox(
                        "Review Submitted Successfully",
                        `Thankyou for giving us your <br /> valuable time.`
                    );
                });
            }
        } else {
            this.goToLoginPage(this.rawProductData["defaultCanonicalUrl"]);
        }
        this.cdr.detectChanges();
    }

    async loadAlertBox(
        mainText,
        subText = null,
        extraSectionName: string = null
    ) {
        if (!this.alertBoxInstance) {
            this.showLoader = true;
            const { AlertBoxToastComponent } = await import(
                "../../components/alert-box-toast/alert-box-toast.component"
            ).finally(() => {
                this.showLoader = false;
            });
            const factory = this.cfr.resolveComponentFactory(AlertBoxToastComponent);
            this.alertBoxInstance = this.alertBoxContainerRef.createComponent(
                factory,
                null,
                this.injector
            );
            this.alertBoxInstance.instance["mainText"] = mainText;
            this.alertBoxInstance.instance["subText"] = subText;
            if (extraSectionName) {
                this.alertBoxInstance.instance["extraSectionName"] = extraSectionName;
            }
            (
                this.alertBoxInstance.instance["removed"] as EventEmitter<boolean>
            ).subscribe((status) => {
                this.alertBoxInstance = null;
                this.alertBoxContainerRef.detach();
            });
            setTimeout(() => {
                this.alertBoxInstance = null;
                this.alertBoxContainerRef.detach();
            }, 2000);
        }
    }
    async handleReviewRatingPopup(index = -1) {
        this.sendProductInfotracking("view all reviews");
        this.showLoader = true;
        const { ReviewRatingComponent } = await import(
            "./../../components/review-rating/review-rating.component"
        ).finally(() => {
            this.showLoader = false;
        });
        const factory = this.cfr.resolveComponentFactory(ReviewRatingComponent);
        this.reviewRatingPopupInstance =
            this.reviewRatingPopupContainerRef.createComponent(
                factory,
                null,
                this.injector
            );
        this.apiResponse.productReviews['productName'] = this.rawProductData.productName;
        this.reviewRatingPopupInstance.instance["oosSimilarCardNumber"] = index;
        this.reviewRatingPopupInstance.instance["rawReviewsData"] =
            (index > -1) ? this.productService.oosSimilarProductsData.similarData[index].reviewRatingApiData : this.apiResponse.productReviews;

        this.reviewRatingPopupInstance.instance["productUrl"] = (index > -1) ? this.productService.oosSimilarProductsData.similarData[index].productUrl : this.rawProductData.productReviews;
        (
            this.reviewRatingPopupInstance.instance[
            "closePopup$"
            ] as EventEmitter<boolean>
        ).subscribe((data) => {
            this.reviewRatingPopupInstance = null;
            this.reviewRatingPopupContainerRef.remove();
        });
        (
            this.reviewRatingPopupInstance.instance[
            "emitWriteReview$"
            ] as EventEmitter<boolean>
        ).subscribe((data) => {
            this.writeReview(data);
        });
        this.cdr.detectChanges();
    }

    async handleQuestionAnswerPopup() {
        this.showLoader = true;
        const { QuestionAnswerComponent } = await import(
            "./../../components/question-answer/question-answer.component"
        ).finally(() => {
            this.showLoader = false;
        });
        const factory = this.cfr.resolveComponentFactory(QuestionAnswerComponent);
        this.questionAnswerPopupInstance =
            this.questionAnswerPopupContainerRef.createComponent(
                factory,
                null,
                this.injector
            );
        (
            this.questionAnswerPopupInstance.instance[
            "closePopup$"
            ] as EventEmitter<boolean>
        ).subscribe((data) => {
            this.questionAnswerPopupInstance = null;
            this.reviewRatingPopupContainerRef.remove();
        });
    }

    sortedReviewsByDate(reviewList)
    {
        return reviewList.sort((a, b) =>
        {
            let objectDateA = new Date(a.updatedAt).getTime();
            let objectDateB = new Date(b.updatedAt).getTime();
            
            return objectDateB - objectDateA;
        });
    }

    postHelpful(item,i,reviewValue) {
        if (this.localStorageService.retrieve("user")) {
            let user = this.localStorageService.retrieve("user");
            if (user.authenticated == "true") {
                // let obj = {
                //     review_type: "PRODUCT_REVIEW",
                //     item_type: "PRODUCT",
                //     item_id: item.item_id,
                //     review_id: item.review_id.uuid,
                //     user_id: user.userId,
                //     is_review_helpful_count_no: no,
                //     is_review_helpful_count_yes: yes,
                // };
                let obj = {
                    "id":item.id,
                    "reviewType": "PRODUCT_REVIEW",
                    "itemType": "PRODUCT",
                    "msn": item.itemId,
                    "reviewId": item.reviewId,
                    "userId": user.userId,
                    "isReviewHelpfulCountNo": (reviewValue == 'no'?1:0),
                    "isReviewHelpfulCountYes": (reviewValue == 'yes'?1:0)
                }
                this.productService.postHelpful(obj).subscribe((res) => {
                    if (res["code"] === 200) {
                        this._tms.show({
                            type: "success",
                            text: "Your feedback has been taken",
                        });
                        let reviewObj = {
                            reviewType: "PRODUCT_REVIEW",
                            itemType: "PRODUCT",
                            itemId: item.itemId,
                            userId: ""
                          }
                        this.productService.getReviewsRating(reviewObj).subscribe((newRes)=>{
                            if(newRes["code"] === 200){
                                this.sortedReviewsByDate(newRes['data']['reviewList']);
                                this.apiResponse.proudctReviews.reviewList[i]["isReviewHelpfulCountYes"] = newRes['data']['reviewList'][i]["isReviewHelpfulCountYes"];
                                this.apiResponse.proudctReviews.reviewList[i]['like'] = reviewValue == 'yes' ? 1 : 0;
                                this.apiResponse.proudctReviews.reviewList[i]['dislike'] = reviewValue == 'no' ? 1 : 0;
                                this.apiResponse.proudctReviews.reviewList[i]["isReviewHelpfulCountNo"] = newRes['data']['reviewList'][i]["isReviewHelpfulCountNo"];
                            }
                        });
                        
                        // this.rawReviewsData.reviewList[i]["isPost"] = true;
                        // this.rawReviewsData.reviewList[i]["like"] = yes;
                        // this.rawReviewsData.reviewList[i]["dislike"] = no;

                        // if (yes === "1" && this.alreadyLiked) {
                        //     this.alreadyLiked = false;
                        //     this.rawReviewsData.reviewList[i]["yes"] += 1;
                        // } else if (
                        //     no === "1" &&
                        //     this.rawReviewsData.reviewList[i]["no"] > 0 &&
                        //     this.alreadyLiked
                        // ) {
                        //     this.alreadyLiked = false;
                        //     this.rawReviewsData.reviewList[i]["no"] -= 1;
                        // }
                        
                    }
                });
            } else {
                this.goToLoginPage(this.rawProductData['defaultCanonicalUrl']);
            }
        } else {
            this.goToLoginPage(this.rawProductData['defaultCanonicalUrl']);
        }
    }

    handlePostHelpful(args: Array<any>) {
        this.postHelpful(args[0], args[1], args[2]);
    }

    async handleFaqListPopup()
    {
        this.showLoader = true;
        const { FaqListPopoupComponent } = await import(
            "./../../components/faq-list-popup/faq-list-popup.component"
        ).finally(() =>
        {
            this.showLoader = false;
        });
        const factory = this.cfr.resolveComponentFactory(FaqListPopoupComponent);
        this.faqListPopupInstance =
            this.faqListPopupContainerRef.createComponent(
                factory,
                null,
                this.injector
            );
        this.faqListPopupInstance.instance["questionAnswerList"] = this.apiResponse.questionAndAnswer;
        (
            this.faqListPopupInstance.instance[
            "closePopup$"
            ] as EventEmitter<boolean>
        ).subscribe(() =>
        {
            this.faqListPopupInstance = null;
            this.faqListPopupContainerRef.remove();
        });
        (
            this.faqListPopupInstance.instance[
            "emitAskQuestinPopup$"
            ] as EventEmitter<boolean>
        ).subscribe(() =>
        {
            this.askQuestion();
        });
        this.cdr.detectChanges();
    }

    async askQuestion()
    {
        let user = this.localStorageService.retrieve("user");
        if (user && user.authenticated == "true") {
            this.location.replaceState(this.rawProductData.productUrl);
            this.askQuestionPopup();
        } else {
            this.goToLoginPage(this.rawProductData.productUrl, "Continue to ask question", "askQuestion");
        }
        this.cdr.detectChanges();
    }

    async askQuestionPopup()
    {
        this.showLoader = true;
        const { AskQuestionPopoupComponent } = await import(
            "./../../components/ask-question-popup/ask-question-popup.component"
        ).finally(() =>
        {
            this.showLoader = false;
            this.isAskQuestionPopupOpen = true;
        });
        const factory = this.cfr.resolveComponentFactory(AskQuestionPopoupComponent);
        this.askQuestionPopupInstance =
            this.askQuestionPopupContainerRef.createComponent(
                factory,
                null,
                this.injector
            );
        this.askQuestionPopupInstance.instance["productCategoryDetails"] = this.rawProductData.productCategoryDetails;
        this.askQuestionPopupInstance.instance["productSubPartNumber"] = this.rawProductData.defaultPartNumber;
        this.askQuestionPopupInstance.instance["defaultPartNumber"] = this.rawProductData.defaultPartNumber;
        (
            this.askQuestionPopupInstance.instance[
            "closePopup$"
            ] as EventEmitter<boolean>
        ).subscribe(() =>
        {
            this.commonService.setBodyScroll(null, true);
            this.askQuestionPopupInstance = null;
            this.askQuestionPopupContainerRef.remove();
            this.isAskQuestionPopupOpen = false;
        });
        (
            this.askQuestionPopupInstance.instance[
            "showSuccessPopup$"
            ] as EventEmitter<boolean>
        ).subscribe(() =>
        {
            this.handleFaqSuccessPopup();
        });
        (
            this.askQuestionPopupInstance.instance[
            "removed"
            ] as EventEmitter<boolean>
        ).subscribe((status) =>
        {
            this.askQuestionPopupContainerRef.detach();
            this.askQuestionPopupInstance = null;
        });
        this.cdr.detectChanges();
    }

    async handleFaqSuccessPopup()
    {
        this.showLoader = true;
        const { FaqSuccessPopoupComponent } = await import(
            "./../../components/faq-success-popup/faq-success-popup.component"
        ).finally(() =>
        {
            this.showLoader = false;
        });
        const factory = this.cfr.resolveComponentFactory(FaqSuccessPopoupComponent);
        this.faqSuccessPopupInstance =
            this.faqSuccessPopupContainerRef.createComponent(
                factory,
                null,
                this.injector
            );
        this.faqSuccessPopupInstance.instance["rawReviewsData"] = this.apiResponse.questionAndAnswer;
        (
            this.faqSuccessPopupInstance.instance[
            "closePopup$"
            ] as EventEmitter<boolean>
        ).subscribe((section) =>
        {
            this.faqSuccessPopupInstance = null;
            this.faqSuccessPopupContainerRef.remove();
            if (section === 'pdpPage') {
                this.askQuestionPopupInstance = null;
                this.askQuestionPopupContainerRef.remove();
                this.commonService.scrollToTop()
            }
        });
        this.cdr.detectChanges();
    }

    // common functions
    goToLoginPage(link, title?, clickedFrom?: string) {
        const queryParams = { backurl: link };
        if (title) queryParams['title'] = title;
        if (clickedFrom) queryParams['state'] = clickedFrom;
        this.localAuthService.setBackURLTitle(link, title);
        let navigationExtras: NavigationExtras = { queryParams: queryParams };
        this.router.navigate(["/login"], navigationExtras);
    }

    navigateToFAQ() {
        this.router.navigate(["faq", { active: "CRP" }]);
    }

    ngOnDestroy() { }
}