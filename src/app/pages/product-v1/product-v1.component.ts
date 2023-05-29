import { DOCUMENT, Location } from "@angular/common";
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactoryResolver, EventEmitter, Inject, Injector, OnDestroy, OnInit, Optional, Renderer2, ViewChild, ViewContainerRef } from "@angular/core";
import { FormControl } from "@angular/forms";
import { DomSanitizer, Meta, Title } from "@angular/platform-browser";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import { FbtComponent } from "@app/components/fbt/fbt.component";
import { YoutubePlayerComponent } from "@app/components/youtube-player/youtube-player.component";
import CONSTANTS from "@app/config/constants";
import { ModalService } from "@app/modules/modal/modal.service";
import { ToastMessageService } from "@app/modules/toastMessage/toast-message.service";
import { ClientUtility } from "@app/utils/client.utility";
import { ProductsEntity } from "@app/utils/models/product.listing.search";
import { LocalAuthService } from "@app/utils/services/auth.service";
import { CartService } from "@app/utils/services/cart.service";
import { CheckoutService } from "@app/utils/services/checkout.service";
import { CommonService } from "@app/utils/services/common.service";
import { GlobalAnalyticsService } from "@app/utils/services/global-analytics.service";
import { GlobalLoaderService } from "@app/utils/services/global-loader.service";
import { ProductUtilsService } from "@app/utils/services/product-utils.service";
import { ProductService } from "@app/utils/services/product.service";
import { TrackingService } from "@app/utils/services/tracking.service";
import { RESPONSE } from "@nguniversal/express-engine/tokens";
import { LocalStorageService, SessionStorageService } from "ngx-webstorage";
import { Observable, of, Subject, Subscription } from "rxjs";
import { catchError, map, mergeMap } from "rxjs/operators";
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
    showScrollToTopButton: boolean = false;
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
    productRFQInstance = null;
    @ViewChild("productRFQ", { read: ViewContainerRef })
    productRFQContainerRef: ViewContainerRef;
    // ondemand loaded components for product RFQ update popup
    productRFQUpdateInstance = null;
    @ViewChild("productRFQUpdate", { read: ViewContainerRef })
    productRFQUpdateContainerRef: ViewContainerRef;
    // ondemand loaded components for similar products
    similarProductInstance = null;
    @ViewChild("similarProduct", { read: ViewContainerRef })
    similarProductContainerRef: ViewContainerRef;
    // ondemand loaded components for sponsered products
    sponseredProductsInstance = null;
    @ViewChild("sponseredProducts", { read: ViewContainerRef })
    sponseredProductsContainerRef: ViewContainerRef;
    similarProductInstanceOOS = null;
    @ViewChild("similarProductOOS", { read: ViewContainerRef })
    similarProductInstanceOOSContainerRef: ViewContainerRef;
    // ondemand loaded components for app Promo
    appPromoInstance = null;
    @ViewChild("appPromo", { read: ViewContainerRef })
    appPromoContainerRef: ViewContainerRef;
    // ondemand loaded components for recents products
    recentProductsInstance = null;
    @ViewChild("recentProducts", { read: ViewContainerRef })
    recentProductsContainerRef: ViewContainerRef;
    // ondemad loaded components for quick order popUp
    quickOrderInstance = null;
    @ViewChild("quickOrder", { read: ViewContainerRef })
    quickOrderContainerRef: ViewContainerRef;
    // ondemad loaded components add to cart toast
    addToCartToastInstance = null;
    @ViewChild("addToCartToast", { read: ViewContainerRef })
    addToCartToastContainerRef: ViewContainerRef;
    // ondemand loaded components for Frequently bought together
    fbtComponentInstance = null;
    @ViewChild("fbt", { read: ViewContainerRef })
    fbtComponentContainerRef: ViewContainerRef;
    // ondemand loaded components RFQ form modal
    rfqFormInstance = null;
    @ViewChild("rfqForm", { read: ViewContainerRef })
    rfqFormContainerRef: ViewContainerRef;
    // ondemad loaded components for showing duplicate order
    globalToastInstance = null;
    @ViewChild("globalToast", { read: ViewContainerRef })
    globalToastContainerRef: ViewContainerRef;
    fbtFlag: boolean;
    fbtAnalytics: { page: { pageName: string; channel: string; subSection: any; linkPageName: any; linkName: any; loginStatus: string; }; custData: { customerID: string; emailID: string; mobile: string; customerType: any; customerCategory: any; }; order: { productID: any; productCategoryL1: any; productCategoryL2: any; productCategoryL3: any; brand: any; price: number; stockStatus: string; tags: string; }; };
    isAskQuestionPopupOpen: boolean;
    isRFQSuccessfull: boolean;
    rfqQuoteRaised: boolean;
    hasGstin: any;
    rfqTotalValue: number;
    dealsAnalytics: { page: { pageName: any; channel: string; subSection: string; linkPageName: string; linkName: any; loginStatus: string; }; custData: { customerID: string; emailID: string; mobile: string; customerType: any; customerCategory: any; }; order: { productID: any; productCategoryL1: any; productCategoryL2: any; productCategoryL3: any; brand: any; price: any; stockStatus: string; tags: string; }; };
    isCommonProduct: any;
    listOfGroupedCategoriesForCanonicalUrl: any;
    appPromoVisible: any;
    recentProductItems: ProductsEntity[] = null;
    similarProducts = [];

    set showLoader(value: boolean) { this.globalLoader.setLoaderState(value); }

    get getWhatsText() {
        return `Hi, I want to buy ${this.rawProductData.productName} (${this.rawProductData.defaultPartNumber})`;
    }
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
        public productService: ProductService,
        private _tms: ToastMessageService,
        private _trackingService: TrackingService,
        private location: Location,
        private sessionStorageService: SessionStorageService,
        private cdr: ChangeDetectorRef,
        private modalService: ModalService,
        private localAuthService: LocalAuthService,
        private productUtil: ProductUtilsService,
        private cartService: CartService,
        private checkoutService: CheckoutService,
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
                this.originalProductBO = {};
                // this.apiResponse['productGroup']['productAllImages'] = this.rawProductData['productDefaultImage']
                // this.originalProductBO = {
                //     "filterAttributesList": null,
                //     "partNumber": "MSN2R9CFNAUWXD",
                //     "defaultPartNumber": "MSN2R9CFNAUWXD",
                //     "categoryDetails": [
                //         {
                //             "categoryCode": "128111100",
                //             "categoryName": "Centrifugal Pumps",
                //             "taxonomy": "Pumps & Motors/Water Pumps/Centrifugal Pumps",
                //             "taxonomyCode": "128000000/128110000/128111100",
                //             "categoryLink": "pumps-motors/pumps/centrifugal-pumps/128111100"
                //         }
                //     ],
                //     "productName": "Sameer 1 HP i-Flo Water Pump with 1 Year Warranty, Total Head: 100 ft",
                //     "desciption": "The Sameer 1 HP i-Flo Water Pump, is a Single Phase pump that is used for pumping water. This product works at a speed of 2880 rpm. The power rating of this pump is 0.5 kW. Its dimensions are 315x190x250 mm. This pump weighs 8.5 kg. It comes with a warranty of 1 year. With a discharge of 600-2400 LPH, this product can pump water up to 10-30 m head height. This pump has a suction capacity of 25ft. The material used in the motor body is cast iron. It is operated at the voltage of 180-240V single phase energy supply. This range of centrifugal pumps is ideally suited for the supply of water to domestic & industrial places.",
                //     "shortDesc": "Brand: Sameer||Item Code: i-Flo||Colour: Blue||Weight: 7 kg",
                //     "brandDetails": {
                //         "idBrand": "98753730-2bd1-488c-9c7b-74797e2c17b2",
                //         "brandName": "Sameer",
                //         "storedBrandName": "sameer",
                //         "friendlyUrl": "sameer",
                //         "brandTag": "Brand Label"
                //     },
                //     "seoDetails": {
                //         "metaDescription": null,
                //         "title": null,
                //         "metaKeywords": [
                //             ""
                //         ],
                //         "tags": [
                //             ""
                //         ]
                //     },
                //     "productPartDetails": {
                //         "MSN2R9CFNAUWXD": {
                //             "itemCode": "i-Flo",
                //             "images": [
                //                 {
                //                     "links": {
                //                         "small": "p/YiqkejgQ5GTRr-small.jpg",
                //                         "thumbnail": "p/YiqkejgQ5GTRr-thumbnail.jpg",
                //                         "default": "p/YiqkejgQ5GTRr.jpg",
                //                         "large": "p/YiqkejgQ5GTRr-large.jpg",
                //                         "xlarge": "p/YiqkejgQ5GTRr-xlarge.jpg",
                //                         "icon": "p/YiqkejgQ5GTRr-icon.jpg",
                //                         "xxlarge": "p/YiqkejgQ5GTRr-xxlarge.jpg",
                //                         "medium": "p/YiqkejgQ5GTRr-medium.jpg"
                //                     },
                //                     "moglixImageNumber": "YiqkejgQ5GTRr",
                //                     "altTag": null,
                //                     "position": 0
                //                 },
                //                 {
                //                     "links": {
                //                         "small": "p/05rho32V6PYLc-small.jpg",
                //                         "thumbnail": "p/05rho32V6PYLc-thumbnail.jpg",
                //                         "default": "p/05rho32V6PYLc.jpg",
                //                         "large": "p/05rho32V6PYLc-large.jpg",
                //                         "xlarge": "p/05rho32V6PYLc-xlarge.jpg",
                //                         "icon": "p/05rho32V6PYLc-icon.jpg",
                //                         "xxlarge": "p/05rho32V6PYLc-xxlarge.jpg",
                //                         "medium": "p/05rho32V6PYLc-medium.jpg"
                //                     },
                //                     "moglixImageNumber": "05rho32V6PYLc",
                //                     "altTag": null,
                //                     "position": 1
                //                 },
                //                 {
                //                     "links": {
                //                         "small": "p/8YzIKOM2SeBzY-small.jpg",
                //                         "thumbnail": "p/8YzIKOM2SeBzY-thumbnail.jpg",
                //                         "default": "p/8YzIKOM2SeBzY.jpg",
                //                         "large": "p/8YzIKOM2SeBzY-large.jpg",
                //                         "xlarge": "p/8YzIKOM2SeBzY-xlarge.jpg",
                //                         "icon": "p/8YzIKOM2SeBzY-icon.jpg",
                //                         "xxlarge": "p/8YzIKOM2SeBzY-xxlarge.jpg",
                //                         "medium": "p/8YzIKOM2SeBzY-medium.jpg"
                //                     },
                //                     "moglixImageNumber": "8YzIKOM2SeBzY",
                //                     "altTag": null,
                //                     "position": 2
                //                 },
                //                 {
                //                     "links": {
                //                         "small": "p/zFNcoO5tcrmhb-small.jpg",
                //                         "thumbnail": "p/zFNcoO5tcrmhb-thumbnail.jpg",
                //                         "default": "p/zFNcoO5tcrmhb.jpg",
                //                         "large": "p/zFNcoO5tcrmhb-large.jpg",
                //                         "xlarge": "p/zFNcoO5tcrmhb-xlarge.jpg",
                //                         "icon": "p/zFNcoO5tcrmhb-icon.jpg",
                //                         "xxlarge": "p/zFNcoO5tcrmhb-xxlarge.jpg",
                //                         "medium": "p/zFNcoO5tcrmhb-medium.jpg"
                //                     },
                //                     "moglixImageNumber": "zFNcoO5tcrmhb",
                //                     "altTag": null,
                //                     "position": 3
                //                 },
                //                 {
                //                     "links": {
                //                         "small": "p/ATPcxJdbkDHZa-small.jpg",
                //                         "thumbnail": "p/ATPcxJdbkDHZa-thumbnail.jpg",
                //                         "default": "p/ATPcxJdbkDHZa.jpg",
                //                         "large": "p/ATPcxJdbkDHZa-large.jpg",
                //                         "xlarge": "p/ATPcxJdbkDHZa-xlarge.jpg",
                //                         "icon": "p/ATPcxJdbkDHZa-icon.jpg",
                //                         "xxlarge": "p/ATPcxJdbkDHZa-xxlarge.jpg",
                //                         "medium": "p/ATPcxJdbkDHZa-medium.jpg"
                //                     },
                //                     "moglixImageNumber": "ATPcxJdbkDHZa",
                //                     "altTag": null,
                //                     "position": 4
                //                 },
                //                 {
                //                     "links": {
                //                         "small": "p/j3BpOjnvcCEOK-small.jpg",
                //                         "thumbnail": "p/j3BpOjnvcCEOK-thumbnail.jpg",
                //                         "default": "p/j3BpOjnvcCEOK.jpg",
                //                         "large": "p/j3BpOjnvcCEOK-large.jpg",
                //                         "xlarge": "p/j3BpOjnvcCEOK-xlarge.jpg",
                //                         "icon": "p/j3BpOjnvcCEOK-icon.jpg",
                //                         "xxlarge": "p/j3BpOjnvcCEOK-xxlarge.jpg",
                //                         "medium": "p/j3BpOjnvcCEOK-medium.jpg"
                //                     },
                //                     "moglixImageNumber": "j3BpOjnvcCEOK",
                //                     "altTag": null,
                //                     "position": 5
                //                 },
                //                 {
                //                     "links": {
                //                         "small": "p/ejwpbXT1hit8F-small.jpg",
                //                         "thumbnail": "p/ejwpbXT1hit8F-thumbnail.jpg",
                //                         "default": "p/ejwpbXT1hit8F.jpg",
                //                         "large": "p/ejwpbXT1hit8F-large.jpg",
                //                         "xlarge": "p/ejwpbXT1hit8F-xlarge.jpg",
                //                         "icon": "p/ejwpbXT1hit8F-icon.jpg",
                //                         "xxlarge": "p/ejwpbXT1hit8F-xxlarge.jpg",
                //                         "medium": "p/ejwpbXT1hit8F-medium.jpg"
                //                     },
                //                     "moglixImageNumber": "ejwpbXT1hit8F",
                //                     "altTag": null,
                //                     "position": 6
                //                 }
                //             ],
                //             "qualityImage": true,
                //             "attributes": {
                //                 "Delivery Size": [
                //                     "25 mm"
                //                 ],
                //                 "Head Range": [
                //                     "30-10 m"
                //                 ],
                //                 "Motor Power": [
                //                     "1 HP"
                //                 ],
                //                 "Phase": [
                //                     "Single Phase"
                //                 ],
                //                 "Power Rating": [
                //                     "0.75 kW"
                //                 ],
                //                 "Suction Size": [
                //                     "25 mm"
                //                 ],
                //                 "Body Material": [
                //                     "Cast Iron"
                //                 ],
                //                 "Discharge Range": [
                //                     "600-2400 lph"
                //                 ],
                //                 "Impeller Material": [
                //                     "Brass"
                //                 ],
                //                 "Item Code": [
                //                     "i-Flo"
                //                 ],
                //                 "Speed": [
                //                     "2880 rpm"
                //                 ],
                //                 "Voltage": [
                //                     "180-240 V"
                //                 ],
                //                 "Additional Details": [
                //                     "Coating: Chrome Plated"
                //                 ],
                //                 "Applications": [
                //                     "For Domestic & Industrial Use"
                //                 ],
                //                 "Colour": [
                //                     "Blue"
                //                 ],
                //                 "Dimensions": [
                //                     "315x190x250 mm"
                //                 ],
                //                 "Frequency": [
                //                     "50 Hz"
                //                 ],
                //                 "Lifting Height": [
                //                     "25 ft"
                //                 ],
                //                 "Motor Winding": [
                //                     "CCA"
                //                 ],
                //                 "Standards": [
                //                     "ISO 9001 Certified"
                //                 ],
                //                 "Warranty": [
                //                     "1 Year Replacement Warranty against Manufacturing Defects (Accidental Damages, Dry Running Damage not Covered in Warranty)"
                //                 ],
                //                 "Weight": [
                //                     "8.5 kg"
                //                 ],
                //                 "Country of origin": [
                //                     "India"
                //                 ]
                //             },
                //             "shipmentDetails": null,
                //             "countriesSellingIn": [
                //                 "india"
                //             ],
                //             "productPriceQuantity": {
                //                 "india": {
                //                     "mrp": 4600,
                //                     "offeredPriceWithoutTax": 2118,
                //                     "offeredPriceWithTax": 2499,
                //                     "moq": 1,
                //                     "quantityAvailable": 99,
                //                     "incrementUnit": 1,
                //                     "packageUnit": "1 Piece",
                //                     "sellingPrice": 2849,
                //                     "taxRule": {
                //                         "name": null,
                //                         "storedName": null,
                //                         "taxType": null,
                //                         "taxPercentage": 18,
                //                         "status": null,
                //                         "deletedFlag": false,
                //                         "createdOn": 1685081780173,
                //                         "updatedOn": 1685081780173,
                //                         "hsn": "84137010",
                //                         "countryCode": 356,
                //                         "createdBy": null,
                //                         "updatedBy": null
                //                     },
                //                     "estimatedDelivery": "4-5 day",
                //                     "priceQuantityRange": null,
                //                     "outOfStockFlag": false,
                //                     "priceWithoutTax": 2414,
                //                     "discount": 38,
                //                     "bulkPrices": {}
                //                 }
                //             },
                //             "defaultCombination": false,
                //             "variantName": "Sameer 1 HP i-Flo Water Pump with 1 Year Warranty, Total Head: 100 ft",
                //             "productLinks": {
                //                 "canonical": "sameer-1-hp-i-flo-water-pump-with-1-year-warranty/mp/msn2r9cfnauwxd",
                //                 "default": "sameer-1-hp-i-flo-water-pump-with-1-year-warranty/mp/msn2r9cfnauwxd"
                //             },
                //             "productRating": null,
                //             "canonicalUrl": "sameer-1-hp-i-flo-water-pump-with-1-year-warranty/mp/msn2r9cfnauwxd"
                //         }
                //     },
                //     "groupedAttributes": {},
                //     "keyFeatures": [
                //         "Power Saving F Class Insulation Motor",
                //         "Higher Suction Power & Give High Discharge in its Operating Range",
                //         "High Quality Mechanical Seal has Long Life & it Completely Seals & Prevents the Water Entering into the Motor Side also it Works for Longer Period with Lesser Wear & Tear",
                //         "High Grade Pump C.I Castings (FG-200 grade) Ensures Very Slow Rusting of Pump & Pump Life is Increases Due to Less Rusting",
                //         "The Motor is Protected by T.O.P, which Ensures the Motor Stops Automatically when the Temprature of Pump Reaches Beyond the Limit",
                //         "The Pumps is Self Primed, there is no Need to Add any Check Valve or Non Return Valve During Installation",
                //         "The Pump is Painted with High Grade Powder Coats which Ensures no Rusting on the Motor Body",
                //         "There are Plenty of Uses for this Water Pump Such as Residential Use to Transfer Water from Storage Tanks to Our Bathrooms, Kitchen etc, Agricultural Use to Transfer Water from Water Wells, Lakes, Rivers & Streams Towards Farm Lands & Animal Shelters or even Industrial Use to Handle Fire Accidents or to Ensure the Adequate Water Supply to Required Application Departments",
                //         "Energy Efficient Motor: Power Saving F Class Insulation Motor",
                //         "High Suction Lift: Higher Suction Power & Give High Discharge in Its Operating Range",
                //         "Leakage Proof: High Quality Mechanical Seal Has Long Life. it Completely Seals & Prevents the Water Entering Into the Motor Side. it Works for Longer Period with Lesser Wear & Tear",
                //         "Long Life: High Grade Pump C.I Castings (Fg-200 Grade) Ensures Very Slow Rusting of Pump & Pump Life is Increases Due to Less Rusting & Wear & Tear",
                //         "Thermal Overload Protector: the Motor is Protected By T.O.P, Which Ensures the Motor Stops Automatically When the Temprature of Pump Reaches Beyond the Limit",
                //         "Self Priming Pump: the Pumps is Self Primed, There is No Need to Add Any Check Valve Or Non Return Valve During Installation",
                //         "No Rusting: the Pump is Painted with High Grade Powder Coats, Which Ensures No Rusting on the Motor Body"
                //     ],
                //     "friendlyUrl": "sameer-1-hp-i-flo-water-pump-with-1-year-warranty",
                //     "groupId": "MPN1675076889862",
                //     "rating": null,
                //     "quantityAvailable": 99,
                //     "outOfStock": false,
                //     "productTags": null,
                //     "defaultCanonicalUrl": null,
                //     "videosInfo": null,
                //     "documentInfo": null,
                //     "saleType": null,
                //     "packaging": "",
                //     "manufacturerDetails": null,
                //     "packerDetails": null,
                //     "importerDetails": null,
                //     "displayName": null,
                //     "bestBefore": null,
                //     "itemDimension": null,
                //     "itemWeight": null,
                //     "uom": "PCS",
                //     "quantityUom": 1,
                //     "weightInKg": null,
                //     "dimensionInCms": null,
                //     "weightSlabInKg": null,
                //     "categoryConfirmationNeed": null,
                //     "gmPercentOnline": null,
                //     "attributeValueUniverse": null,
                //     "returnable": null
                // }
                if (this.apiResponse && this.apiResponse.tagProducts) {
                    this.onVisiblePopularDeals();
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
        if (this.commonService.isBrowser) {
            this.resetLazyComponents();
            this.getPurchaseList();
            this.productFbtData();
            this.productStatusCount();
            this.checkDuplicateProduct();
            this.backUrlNavigationHandler();
            this.attachBackClickHandler();
            this.getRecents();
        }
    }

    checkDuplicateProduct()
    {
        const userSession = this.localStorageService.retrieve("user");
        if (userSession && userSession.authenticated == "true") {
            this.productService
                .getUserDuplicateOrder(this.rawProductData.defaultPartNumber, userSession["userId"])
                .subscribe((duplicateProductResult) =>
                {
                    this.duplicateOrderCheck(duplicateProductResult);
                });
        }
    }

    private duplicateOrderCheck(duplicateRawResponse)
    {
        if (
            duplicateRawResponse &&
            duplicateRawResponse["data"] &&
            duplicateRawResponse["data"]["date"]
        ) {
            const userSession = this.localStorageService.retrieve("user");
            if (
                this.commonService.isBrowser &&
                userSession &&
                userSession.authenticated == "true" &&
                duplicateRawResponse &&
                duplicateRawResponse.status
            ) {
                const date1: any = new Date(duplicateRawResponse["data"]["date"]);
                const date2: any = new Date();
                const diffTime = Math.abs(date2 - date1);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays < 31) {
                    this.loadGlobalToastMessage(
                        duplicateRawResponse,
                        this.rawProductData
                    );
                }
            }
        }
    }

    async loadGlobalToastMessage(data, rawData)
    {
        if (data["status"] === true) {
            if (!this.globalToastInstance) {
                const { GlobalToastComponent } = await import(
                    "../../components/global-toast/global-toast.component"
                ).finally(() =>
                {
                    this.showLoader = false;
                });
                const factory = this.cfr.resolveComponentFactory(GlobalToastComponent);
                this.globalToastInstance = this.alertBoxContainerRef.createComponent(
                    factory,
                    null,
                    this.injector
                );
                const options: any = { year: "numeric", month: "long", day: "numeric" };
                const a = data.data.time.split(":");
                this.globalToastInstance.instance["text"] =
                    "The same item has been ordered by you on " +
                    new Date(data.data.date).toLocaleDateString("en-IN", options as any) +
                    " at " +
                    (a[0] + ":" + a[1]) +
                    (a[0] < 12 ? " AM" : " PM");
                this.globalToastInstance.instance["btnText"] = "x";
                this.globalToastInstance.instance["showTime"] = 100000;
                this.globalToastInstance.instance["showDuplicateOrderToast"] = true;
                this.globalToastInstance.instance["positionTop"] = true;
                this.globalToastInstance.instance["productMsn"] = rawData.partNumber;
            }
        }
    }

    resetLazyComponents()
    {
        // this function  is useable when user is redirect from PDP to PDP
        if (this.productShareInstance) {
            this.productShareInstance = null;
            this.productShareContainerRef.remove();
        }
        if (this.similarProductInstanceOOS) {
            this.similarProductInstanceOOS = null;
            this.similarProductInstanceOOSContainerRef.remove();
        }
        if (this.fbtComponentInstance) {
            this.fbtComponentInstance = null;
            this.fbtComponentContainerRef.remove();
        }
        if (this.similarProductInstance) {
            this.similarProductInstance = null;
            this.similarProductContainerRef.remove();
            this.onVisibleSimilar(null);
        }
        if (this.similarProductInstanceOOS) {
            this.similarProductInstanceOOS = null;
            this.similarProductInstanceOOSContainerRef.remove();
            this.onVisibleSimilarOOS(null);
        }
        if (this.sponseredProductsInstance) {
            this.sponseredProductsInstance = null;
            if (this.sponseredProductsContainerRef) { this.sponseredProductsContainerRef.remove();}
            this.onVisibleSponsered(null);
        }

        if (this.recentProductsInstance && this.recentProductsContainerRef !=undefined) {
            this.recentProductsInstance = null;
            this.recentProductsContainerRef && this.recentProductsContainerRef.remove();
            this.onVisibleRecentProduct(null);
        }
  
        if (this.rfqFormInstance) {
            this.rfqFormInstance = null;
            this.rfqFormContainerRef.remove();
        }
        if (this.pincodeFormInstance) {
            this.pincodeFormInstance = null;
            if (this.pincodeFormContainerRef) {
                this.pincodeFormContainerRef.remove();
            }
        }
        if (this.offerSectionInstance) {
            this.offerSectionInstance = null;
            if (this.offerSectionContainerRef) {
                this.offerSectionContainerRef.remove();
            }
        }
        if (this.offerPopupInstance) {
            this.offerPopupInstance = null;
            this.offerPopupContainerRef.remove();
        }
        if (this.promoOfferPopupInstance) {
            this.promoOfferPopupInstance = null;
            this.promoOfferPopupContainerRef.remove();
        }
        if (this.offerComparePopupInstance) {
            this.offerComparePopupInstance = null;
            this.offerComparePopupContainerRef.remove();
        }
        if (this.addToCartToastInstance) {
            this.addToCartToastInstance = null;
            this.addToCartToastContainerRef.remove();
        }
        if (this.writeReviewPopupInstance) {
            this.writeReviewPopupInstance = null;
            this.writeReviewPopupContainerRef.remove();
        }
        if (this.popupCrouselInstance) {
            this.popupCrouselInstance = null;
            this.popupCrouselContainerRef.remove();
        }
        if (this.alertBoxInstance) {
            this.alertBoxInstance = null;
            this.alertBoxContainerRef.remove();
        }
        if (this.globalToastInstance) {
            this.globalToastInstance = null;
            this.globalToastContainerRef.remove();
        }
        if (this.productRFQInstance) {
            this.productRFQInstance = null;
            this.productRFQContainerRef.remove();
        }
        if (this.productRFQUpdateInstance) {
            this.productRFQUpdateInstance = null;
            this.productRFQUpdateContainerRef.remove();
        }
        if (this.youtubeModalInstance) {
            this.youtubeModalInstance = null;
        }
        if (this.rawProductData) {
            this.productInfoPopupInstance = null;
            this.productInfoPopupContainerRef.remove();
        }
        if (this.returnInfoInstance) {
            this.returnInfoInstance = null;
            this.returnInfoContainerRef.remove();
        }
    }

    setSimilarProducts(productName, categoryCode, productId, groupId)
    {
        this.similarProducts = [];
        if (this.isBrowser) {
            this.productService
                .getSimilarProducts(productName, categoryCode, productId, groupId)
                .subscribe((response: any) =>
                {
                    let products = response["products"];
                    if (products && (products as []).length > 0) {
                        if (this.rawProductData.productOutOfStock) {
                            this.productService.oosSimilarProductsData.similarData = JSON.parse(
                                JSON.stringify(
                                    products.map(product => this.productService.searchResponseToProductEntity(product)).map(p => {
                                        p.mainImageMediumLink = p.mainImageLink;
                                        return p;
                                    })
                                )
                            );
                        } else {
                            this.similarProducts = products;
                        }
                        if (this.rawProductData.productOutOfStock) {
                            // this.commonService.triggerAttachHotKeysScrollEvent('consider-these-products');
                        }
                    }
                    this.rawProductData.similarForOOSLoaded = false;
                });
        }
    }

    getRecents() {
        let user = this.localStorageService.retrieve('user');
        const userId = (user['userId']) ? user['userId'] : null;
        this.productService.getrecentProduct(userId).subscribe(result => {
            if (result['statusCode'] === 200) {
                this.recentProductItems = (result['data'] as any[]).map(product => this.productService.recentProductResponseToProductEntity(product));
                // if (this.recentProductItems.length === 0) { this.noRecentlyViewed$.emit(true);}
            }
        })
    }

    // Frequently brought togther functions

    productFbtData() {
        this.productService
            .getFBTProducts(this.rawProductData.defaultPartNumber)
            .subscribe((rawProductFbtData) => {
                this.fetchFBTProducts(
                    this.rawProductData,
                    Object.assign({}, rawProductFbtData)
                );
            });
    }

    fetchFBTProducts(productBO, rawProductFbtData) {
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

    processFBTResponse(productResponse, fbtResponse) {
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

    sortedReviewsByDate(reviewList) {
        return reviewList.sort((a, b) => {
            let objectDateA = new Date(a.updatedAt).getTime();
            let objectDateB = new Date(b.updatedAt).getTime();

            return objectDateB - objectDateA;
        });
    }

    postHelpful(item, i, reviewValue) {
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
                    "id": item.id,
                    "reviewType": "PRODUCT_REVIEW",
                    "itemType": "PRODUCT",
                    "msn": item.itemId,
                    "reviewId": item.reviewId,
                    "userId": user.userId,
                    "isReviewHelpfulCountNo": (reviewValue == 'no' ? 1 : 0),
                    "isReviewHelpfulCountYes": (reviewValue == 'yes' ? 1 : 0)
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
                        this.productService.getReviewsRating(reviewObj).subscribe((newRes) => {
                            if (newRes["code"] === 200) {
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

    async handleFaqListPopup() {
        this.showLoader = true;
        const { FaqListPopoupComponent } = await import(
            "./../../components/faq-list-popup/faq-list-popup.component"
        ).finally(() => {
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
        ).subscribe(() => {
            this.faqListPopupInstance = null;
            this.faqListPopupContainerRef.remove();
        });
        (
            this.faqListPopupInstance.instance[
            "emitAskQuestinPopup$"
            ] as EventEmitter<boolean>
        ).subscribe(() => {
            this.askQuestion();
        });
        this.cdr.detectChanges();
    }

    async askQuestion() {
        let user = this.localStorageService.retrieve("user");
        if (user && user.authenticated == "true") {
            this.location.replaceState(this.rawProductData.productUrl);
            this.askQuestionPopup();
        } else {
            this.goToLoginPage(this.rawProductData.productUrl, "Continue to ask question", "askQuestion");
        }
        this.cdr.detectChanges();
    }

    async askQuestionPopup() {
        this.showLoader = true;
        const { AskQuestionPopoupComponent } = await import(
            "./../../components/ask-question-popup/ask-question-popup.component"
        ).finally(() => {
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
        ).subscribe(() => {
            this.commonService.setBodyScroll(null, true);
            this.askQuestionPopupInstance = null;
            this.askQuestionPopupContainerRef.remove();
            this.isAskQuestionPopupOpen = false;
        });
        (
            this.askQuestionPopupInstance.instance[
            "showSuccessPopup$"
            ] as EventEmitter<boolean>
        ).subscribe(() => {
            this.handleFaqSuccessPopup();
        });
        (
            this.askQuestionPopupInstance.instance[
            "removed"
            ] as EventEmitter<boolean>
        ).subscribe((status) => {
            this.askQuestionPopupContainerRef.detach();
            this.askQuestionPopupInstance = null;
        });
        this.cdr.detectChanges();
    }

    async handleFaqSuccessPopup() {
        this.showLoader = true;
        const { FaqSuccessPopoupComponent } = await import(
            "./../../components/faq-success-popup/faq-success-popup.component"
        ).finally(() => {
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
        ).subscribe((section) => {
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

    async onVisibleProductRFQ(htmlElement) {
        if (this.holdRFQForm) return
        this.removeRfqForm();
        if (!this.productRFQInstance) {
            this.intiateRFQQuote(true, false);
        }
    }

    removeRfqForm() {
        if (this.productRFQInstance) {
            this.productRFQInstance = null;
            this.productRFQContainerRef.remove();
        }
    }

    async raiseRFQQuote() {
        let user = this.localStorageService.retrieve("user");
        if (user && user.authenticated == "true") {
            this.location.replaceState(this.rawProductData.mainProductURL);
            !user['phone'].length ? this.intiateRFQQuote(true) : this.raiseRFQGetQuote(user);
        } else {
            this.goToLoginPage(this.rawProductData.productUrl, "Continue to raise RFQ", "raiseRFQQuote");
        }
    }

    closeRFQAlert() {
        this.isRFQSuccessfull = false;
    }

    processRFQGetQuoteData(user) {
        let data = { rfqEnquiryCustomer: null, rfqEnquiryItemsList: null };
        let product = {
            url: this.rawProductData.productUrl,
            price: this.rawProductData.productPrice,
            msn: this.rawProductData.defaultPartNumber,
            productName: (this.isHindiUrl) ? this.originalProductBO['productName'] : this.rawProductData.productName,
            moq: this.rawProductData.productMinimmumQuantity,
            brand: (this.isHindiUrl) ? this.originalProductBO['brandDetails']['brandName'] : this.rawProductData.productBrandDetails["brandName"],
            taxonomyCode: this.rawProductData.productCategoryDetails["taxonomy"],
            adobeTags: "",
        };

        data['rfqEnquiryCustomer'] = {
            'customerId': user['userId'],
            'device': 'mobile',
            'email': user['email'] ? user['email'] : '',
            'firstName': user['userName'],
            'mobile': user['phone'],
            'rfqValue': this.rawProductData.productPrice * this.qunatityFormControl.value,
        }
        data['rfqEnquiryItemsList'] = [{
            brand: product['brand'],
            outOfStock: 'inStock',
            prodReference: product['msn'],
            productName: product['productName'],
            quantity: this.qunatityFormControl.value,
            taxonomyCode: product['taxonomyCode'],
        }];
        return data;
    }

    raiseRFQGetQuoteSubscription: Subscription;
    raiseRFQGetQuote(user) {
        let data = this.processRFQGetQuoteData(user);
        let params = { customerId: user.userId, invoiceType: "retail" };
        let product = {
            url: this.rawProductData.productUrl,
            productName: (this.isHindiUrl) ? this.originalProductBO['productName'] : this.rawProductData.productName,
            moq: this.rawProductData.productMinimmumQuantity,
        };
        this.raiseRFQGetQuoteSubscription = this.commonService.getAddressList(params).subscribe(res => {
            if (res['status'] && res['addressList'].length > 0) {
                data['rfqEnquiryCustomer']['pincode'] = res['addressList'][0]['postCode'];
            }
        });
        this.raiseRFQGetQuoteSubscription.add(() => {
            this.productService.postBulkEnquiry(data).subscribe((response) => {
                if (response['statusCode'] == 200) {
                    let rfqId = response['data'] ?? '';
                    this.intiateRFQQuoteUpdate(product, rfqId);
                    // this._tms.show({ type: 'success', text: response['statusDescription'] });
                    this.rfqQuoteRaised = true;
                    this.location.replaceState(this.rawProductData.mainProductURL);
                } else {
                    this._tms.show({ type: 'error', text: response['message']['statusDescription'] });
                }
            }, err => {
                this.rfqQuoteRaised = false;
            });
        });
    }

    async intiateRFQQuoteUpdate(product, rfqid: any) {
        const { ProductRfqUpdatePopupComponent } = await import(
            "./../../components/product-rfq-update-popup/product-rfq-update-popup.component"
        );

        const factory = this.cfr.resolveComponentFactory(ProductRfqUpdatePopupComponent);
        this.productRFQUpdateInstance = this.productRFQUpdateContainerRef.createComponent(
            factory,
            null,
            this.injector
        );
        this.productRFQUpdateInstance.instance["product"] = product;
        this.productRFQUpdateInstance.instance["productUrl"] = this.productAllImages[0]['large'];
        this.productRFQUpdateInstance.instance["enquiryId"] = rfqid['enquiryId'];
        this.productRFQUpdateInstance.instance["rfqId"] = rfqid.enquiryItemList[0]['id'];
        (
            this.productRFQUpdateInstance.instance["isLoading"] as EventEmitter<boolean>
        ).subscribe((loaderStatus) => {
            this.showLoader = loaderStatus;
        });
        (
            this.productRFQUpdateInstance.instance["onRFQUpdateSuccess"] as EventEmitter<string>
        ).subscribe((status) => {
            this.isRFQSuccessfull = true;
        });
    }

    analyticRFQ(isSubmitted: boolean = false) {
        const user = this.localStorageService.retrieve("user");
        let taxo1 = "";
        let taxo2 = "";
        let taxo3 = "";
        if (this.rawProductData.productCategoryDetails["taxonomyCode"]) {
            taxo1 = this.rawProductData.productCategoryDetails["taxonomyCode"].split("/")[0] || "";
            taxo2 = this.rawProductData.productCategoryDetails["taxonomyCode"].split("/")[1] || "";
            taxo3 = this.rawProductData.productCategoryDetails["taxonomyCode"].split("/")[2] || "";
        }
        let ele = []; // product tags for adobe;
        // this.productTags.forEach((element) =>
        // {
        //     ele.push(element.name);
        // });
        const tagsForAdobe = ele.join("|");

        this.analytics.sendGTMCall({
            event: !this.rawProductData.productOutOfStock ? "rfq_instock" : "rfq_oos",
        });

        if (isSubmitted) {
            this.analytics.sendGTMCall({
                event: !this.rawProductData.productOutOfStock ? "instockformSubmit" : "oosformSubmit",
                customerInfo: {
                    firstName: user["first_name"],
                    lastName: user["last_name"],
                    email: user["email"],
                    mobile: user["phone"],
                },
                productInfo: {
                    productName: this.rawProductData.productName,
                    brand: this.rawProductData.productBrandDetails["brandName"],
                    quantity: this.rawProductData.priceQuantityCountry
                        ? this.rawProductData.priceQuantityCountry["quantityAvailable"]
                        : null,
                },
            });
        }

        /*Start Adobe Analytics Tags */
        let page = null;
        if (!isSubmitted) {
            page = {
                pageName: "moglix:bulk request form",
                channel: "bulk request form",
                subSection: "moglix:bulk request form",
                loginStatus:
                    user && user["authenticated"] == "true" ? "registered user" : "guest",
            };
        } else {
            page = {
                pageName: "moglix:bulk request form",
                channel: "bulk request form",
                subSection: "moglix:bulk request form",
                loginStatus:
                    user && user["authenticated"] == "true" ? "registered user" : "guest",
                linkPageName: "moglix:bulk request form",
                linkName: "Get Quote",
            };
        }

        let custData = this.commonService.custDataTracking;
        let order = {
            productID: this.rawProductData.defaultPartNumber,
            productCategoryL1: taxo1,
            productCategoryL2: taxo2,
            productCategoryL3: taxo3,
            brand: this.rawProductData.productBrandDetails["brandName"],
            tags: tagsForAdobe,
        };
        this.analytics.sendAdobeCall(
            { page, custData, order },
            isSubmitted ? "genericClick" : "genericPageLoad"
        );
    }

    async intiateRFQQuote(inStock, sendAnalyticOnOpen = true) {
        const { ProductRFQComponent } = await import(
            "./../../components/product-rfq/product-rfq.component"
        ).finally(() => {
            if (sendAnalyticOnOpen) {
                this.analyticRFQ(false);
            }
        });
        const factory = this.cfr.resolveComponentFactory(ProductRFQComponent);
        this.productRFQInstance = this.productRFQContainerRef.createComponent(
            factory,
            null,
            this.injector
        );
        this.productRFQInstance.instance["isOutOfStock"] = this.rawProductData.productOutOfStock;
        this.productRFQInstance.instance["isPopup"] = inStock;
        let product = {
            url: this.rawProductData.productUrl,
            price: this.rawProductData.productPrice,
            msn: this.rawProductData.defaultPartNumber,
            productName: this.rawProductData.productName,
            moq: this.rawProductData.productMinimmumQuantity,
            brand: this.rawProductData.productBrandDetails["brandName"],
            taxonomyCode: this.rawProductData.productCategoryDetails["taxonomy"],
            adobeTags: "",
        };
        this.productRFQInstance.instance["product"] = product;
        (
            this.productRFQInstance.instance["isLoading"] as EventEmitter<boolean>
        ).subscribe((loaderStatus) => {
            this.showLoader = loaderStatus;
        });
        (
            this.productRFQInstance.instance["hasGstin"] as EventEmitter<boolean>
        ).subscribe((value) => {
            this.hasGstin = value
        });
        (
            this.productRFQInstance.instance["rfqQuantity"] as EventEmitter<string>
        ).subscribe((rfqQuantity) => {
            this.rfqTotalValue = rfqQuantity * Math.floor(this.rawProductData.productPrice);
        });
        (
            this.productRFQInstance.instance["rfqId"] as EventEmitter<boolean>
        ).subscribe((rfqid) => {
            this.analyticRFQ(true);
            this.intiateRFQQuoteUpdate(product, rfqid);
        });
        this.cdr.detectChanges();
    }

    // dynamically load similar section
    async onVisibleSimilar(htmlElement) {
        if (!this.similarProductInstance && !this.rawProductData.productOutOfStock) {
            const { SimilarProductsComponent } = await import(
                "./../../components/similar-products/similar-products.component"
            );
            const factory = this.cfr.resolveComponentFactory(
                SimilarProductsComponent
            );
            this.similarProductInstance =
                this.similarProductContainerRef.createComponent(
                    factory,
                    null,
                    this.injector
                );

            this.similarProductInstance.instance["partNumber"] = this.rawProductData['partNumber'];
            this.similarProductInstance.instance["groupId"] = this.rawProductData['groupId'];
            this.similarProductInstance.instance["productName"] = this.rawProductData.productName;
            this.similarProductInstance.instance["categoryCode"] =
                this.rawProductData.productCategoryDetails["categoryCode"];

            this.similarProductInstance.instance["outOfStock"] =
                this.rawProductData.productOutOfStock;
            (
                this.similarProductInstance.instance[
                "similarDataLoaded$"
                ] as EventEmitter<any>
            ).subscribe((data) => {
                // this.commonService.triggerAttachHotKeysScrollEvent('similar-products');
            });
            const custData = this.commonService.custDataTracking;
            const orderData = this.orderTracking;
            const TAXONS = this.taxons;
            const page = {
                pageName: null,
                channel: "pdp",
                subSection: "Similar Products",
                linkPageName: `moglix:${TAXONS[0]}:${TAXONS[1]}:${TAXONS[2]}:pdp`,
                linkName: null,
                loginStatus: this.commonService.loginStatusTracking,
            };
            this.similarProductInstance.instance["analytics"] = {
                page: page,
                custData: custData,
                order: orderData,
            };
        }
        this.holdRFQForm = false;
        this.cdr.detectChanges();
    }

    async onVisibleAppPromo(event) {
        const { ProductAppPromoComponent } = await import("../../components/product-app-promo/product-app-promo.component");
        const factory = this.cfr.resolveComponentFactory(ProductAppPromoComponent);
        this.appPromoInstance = this.appPromoContainerRef.createComponent(
            factory,
            null,
            this.injector
        );
        this.appPromoInstance.instance["page"] = "pdp";
        this.appPromoInstance.instance["isOverlayMode"] = false;
        this.appPromoInstance.instance["showPromoCode"] = false;
        this.appPromoInstance.instance["productMsn"] = this.rawProductData.defaultPartNumber;
        this.appPromoInstance.instance["productData"] = this.rawProductData;
        this.appPromoInstance.instance["isLazyLoaded"] = true;
        (
            this.appPromoInstance.instance["appPromoStatus$"] as EventEmitter<boolean>
        ).subscribe((status) => {
            this.appPromoVisible = status;
        });
        this.cdr.detectChanges();
    }

    // dynamically recent products section

    async onVisibleRecentProduct(htmlElement) {
        // console.log('onVisibleRecentProduct', htmlElement);
        if (!this.recentProductsInstance && this.recentProductItems.length > 0) {
            const { RecentViewedProductsComponent } = await import(
                "./../../components/recent-viewed-products/recent-viewed-products.component"
            );
            const factory = this.cfr.resolveComponentFactory(
                RecentViewedProductsComponent
            );
            this.recentProductsInstance =
                this.recentProductsContainerRef.createComponent(
                    factory,
                    null,
                    this.injector
                );
            this.recentProductsInstance.instance["outOfStock"] =
                this.rawProductData.productOutOfStock;
            this.recentProductsInstance.instance["recentProductList"] = this.recentProductItems;
            const custData = this.commonService.custDataTracking;
            const orderData = this.orderTracking;
            const TAXONS = this.taxons;
            const page = {
                pageName: null,
                channel: "pdp",
                subSection: "Recently Viewed",
                linkPageName: `moglix:${TAXONS[0]}:${TAXONS[1]}:${TAXONS[2]}:pdp`,
                linkName: null,
                loginStatus: this.commonService.loginStatusTracking,
            };
            this.recentProductsInstance.instance["analytics"] = {
                page: page,
                custData: custData,
                order: orderData,
            };
            // (
            //     this.recentProductsInstance.instance["noRecentlyViewed$"] as EventEmitter<any>).subscribe((flag) =>
            //     {
            //         this.hasRecentlyView = false;
            //     }
            // );
        }
    }

    // dynamically load similar section
    async onVisibleSponsered(htmlElement) {
        if (!this.sponseredProductsInstance) {
            const { ProductSponsoredListComponent } = await import(
                "./../../components/product-sponsored-list/product-sponsored-list.component"
            );
            const factory = this.cfr.resolveComponentFactory(
                ProductSponsoredListComponent
            );
            this.sponseredProductsInstance =
                this.sponseredProductsContainerRef.createComponent(
                    factory,
                    null,
                    this.injector
                );
            this.sponseredProductsInstance.instance["productName"] = this.rawProductData.productName;
            this.sponseredProductsInstance.instance["productId"] =
                this.rawProductData.defaultPartNumber;
            this.sponseredProductsInstance.instance["categoryCode"] =
                this.rawProductData.productCategoryDetails["categoryCode"];
            this.sponseredProductsInstance.instance["outOfStock"] =
                this.rawProductData.productOutOfStock;
            (this.sponseredProductsInstance.instance[
                "sponseredDataLoaded$"
            ] as EventEmitter<any>
            ).subscribe((data) => {
                // this.commonService.triggerAttachHotKeysScrollEvent('sponsered-products');
            });
            const custData = this.commonService.custDataTracking;
            const orderData = this.orderTracking;
            const TAXONS = this.taxons;
            const page = {
                pageName: null,
                channel: "pdp",
                subSection: "You May Also Like",
                linkPageName: `moglix:${TAXONS[0]}:${TAXONS[1]}:${TAXONS[2]}:pdp`,
                linkName: null,
                loginStatus: this.commonService.loginStatusTracking,
            };
            this.sponseredProductsInstance.instance["analytics"] = {
                page: page,
                custData: custData,
                order: orderData,
            };
        }
    }

    async onVisiblePopularDeals() {
        const custData = this.commonService.custDataTracking;
        const orderData = this.orderTracking;
        const TAXONS = this.taxons;
        const page = {
            pageName: null,
            channel: "pdp",
            subSection: "Our Popular Deals",
            linkPageName: `moglix:${TAXONS[0]}:${TAXONS[1]}:${TAXONS[2]}:pdp`,
            linkName: null,
            loginStatus: this.commonService.loginStatusTracking,
        };
        this.dealsAnalytics = {
            page: page,
            custData: custData,
            order: orderData,
        };
        this.cdr.detectChanges();
    }

    getCategoryBrandDetails() {
        return {
            category: this.rawProductData.productCategoryDetails,
            brand: this.rawProductData.productBrandDetails,
        };
    }

    get pastOrderAnalytics() {
        const TAXONS = this.taxons;
        const page = {
            pageName: null,
            channel: "pdp",
            subSection: "Inspired By Your Purchase",
            linkPageName: `moglix:${TAXONS[0]}:${TAXONS[1]}:${TAXONS[2]}:pdp`,
            linkName: null,
            loginStatus: this.commonService.loginStatusTracking,
        };
        const analytices = { page: page, custData: this.commonService.custDataTracking, order: this.orderTracking }
        return analytices;
    }

    get breadCrumbAnalytics() {
        let analytics = null;
        const TAXONS = this.taxons;
        let page = {
            pageName: null,
            channel: "pdp",
            subSection: null,
            linkPageName: `moglix:${TAXONS[0]}:${TAXONS[1]}:${TAXONS[2]}:pdp`,
            linkName: "breadcrumb",
            loginStatus: this.commonService.loginStatusTracking,
        };
        const custData = this.commonService.custDataTracking;
        const order = this.orderTracking;
        analytics = { page, custData, order };
        return analytics;
    }

    getAnalyticsInfo() {
        const TAXONS = this.taxons;
        let page = {
            pageName: null,
            channel: "pdp",
            subSection: null,
            linkPageName: `moglix:${TAXONS[0]}:${TAXONS[1]}:${TAXONS[2]}:pdp`,
            linkName: null,
            loginStatus: this.commonService.loginStatusTracking,
        };
        return {
            page: page,
            custData: this.commonService.custDataTracking,
            order: this.orderTracking,
        };
    }

    oosCardIndex = -1;
    async onVisibleSimilarOOS(event) {
        if (!this.similarProductInstanceOOS && this.rawProductData.productOutOfStock) {
            this.commonService.oosSimilarCard$.next(false);
            const { ProductOosSimilarComponent } = await import(
                "./../../modules/product-oos-similar/product-oos-similar.component"
            );
            const factory = this.cfr.resolveComponentFactory(
                ProductOosSimilarComponent
            );
            this.similarProductInstanceOOS =
                this.similarProductInstanceOOSContainerRef.createComponent(
                    factory,
                    null,
                    this.injector
                );
            this.similarProductInstanceOOS.instance["productBaseUrl"] = this.rawProductData["defaultCanonicalUrl"];
            if (this.similarProductInstanceOOS) {
                // Image cick Event Handler
                (
                    this.similarProductInstanceOOS.instance[
                    "firstImageClickedEvent"
                    ] as EventEmitter<any>
                ).subscribe((data) => {
                    this.openPopUpcrousel(0, data);
                });
                // Show All click Handler
                (
                    this.similarProductInstanceOOS.instance[
                    "showAllKeyFeatureClickEvent"
                    ] as EventEmitter<any>
                ).subscribe((data) => {
                    this.handleProductInfoPopup(
                        data.section,
                        data.type,
                        data.index
                    );
                });
                // meta update event handler
                (
                    this.similarProductInstanceOOS.instance[
                    "metaUpdateEvent"
                    ] as EventEmitter<any>
                ).subscribe((data) => {
                    this.oosCardIndex = data;
                    this.handlemetaUpdateEvent(data);
                });
                // rating review event handler
                (
                    this.similarProductInstanceOOS.instance[
                    "ratingReviewClickEvent"
                    ] as EventEmitter<any>
                ).subscribe((data) => {
                    this.handleReviewRatingPopup(data);
                });
                // rating review event handler
                (
                    this.similarProductInstanceOOS.instance[
                    "updateScrollToTop"
                    ] as EventEmitter<any>
                ).subscribe((data) => {
                    this.showScrollToTopButton = data;
                });
            }
        }
        this.holdRFQForm = false;
    }

    handlemetaUpdateEvent(index) {
        this.setMetatag(index);
    }

    updateOutOfStockFlagForCards(index = -1) {
        if (this.productService.oosSimilarProductsData.similarData[index]) {
            if (this.productService.oosSimilarProductsData.similarData[index].priceQuantityCountry) {
                // incase outOfStockFlag of is avaliable then set its value
                this.productService.oosSimilarProductsData.similarData[index].productOutOfStock = this.productService.oosSimilarProductsData.similarData[index].priceQuantityCountry["outOfStockFlag"];
                // apart from outOfStockFlag if mrp is exist and is zero set product of OOS
                if (this.productService.oosSimilarProductsData.similarData[index].priceQuantityCountry["mrp"]) {
                    if (parseInt(this.productService.oosSimilarProductsData.similarData[index].priceQuantityCountry["mrp"]) == 0) {
                        this.productService.oosSimilarProductsData.similarData[index].productOutOfStock = true;
                    }
                    if (parseInt(this.productService.oosSimilarProductsData.similarData[index].priceQuantityCountry["quantityAvailable"]) == 0) {
                        this.productService.oosSimilarProductsData.similarData[index].productOutOfStock = true;
                    }
                } else {
                    this.productService.oosSimilarProductsData.similarData[index].productOutOfStock = true;
                }
            } else {
                // incase priceQuantityCountry element not present in API
                this.productService.oosSimilarProductsData.similarData[index].productOutOfStock = true;
            }
        }
    }

    setMetatag(index: number = -1) {
        if (!this.rawProductData) {
            return;
        }


        let metaObj
        if (index > -1) {
            this.updateOutOfStockFlagForCards(index);
            metaObj = {
                title: this.productService.oosSimilarProductsData.similarData[index].productName,
                productName: this.productService.oosSimilarProductsData.similarData[index].productName,
                pageTitleName: this.productService.oosSimilarProductsData.similarData[index].productName,
                pwot: this.productService.oosSimilarProductsData.similarData[index].priceWithoutTax,
                quantityAvailable: this.productService.oosSimilarProductsData.similarData[index].quantityAvailable,
                productPrice: this.productService.oosSimilarProductsData.similarData[index].productPrice,
                productOutOfStock: this.productService.oosSimilarProductsData.similarData[index].productOutOfStock,
                seoDetails: this.productService.oosSimilarProductsData.similarData[index].seoDetails,
                productBrandDetails: this.productService.oosSimilarProductsData.similarData[index].productBrandDetails,
                productCategoryDetails: this.productService.oosSimilarProductsData.similarData[index].productCategoryDetails,
                productDefaultImage: this.productService.oosSimilarProductsData.similarData[index].productDefaultImage,
                productUrl: this.productService.oosSimilarProductsData.similarData[index].productUrl,
                defaultCanonicalUrl: this.productService.oosSimilarProductsData.similarData[index]["defaultCanonicalUrl"],
            };
        } else {
            metaObj = {
                title: this.rawProductData.productName,
                productName: this.rawProductData.productName,
                pageTitleName: this.rawProductData.productName,
                pwot: this.rawProductData.priceWithoutTax,
                quantityAvailable: this.rawProductData.rawProductData["quantityAvailable"],
                productPrice: this.rawProductData.productPrice,
                productOutOfStock: this.rawProductData.productOutOfStock,
                seoDetails: this.rawProductData.rawProductData["seoDetails"],
                productBrandDetails: this.rawProductData.productBrandDetails,
                productCategoryDetails: this.rawProductData.productCategoryDetails,
                productDefaultImage: this.rawProductData.productDefaultImage,
                productUrl: this.rawProductData.productUrl,
                defaultCanonicalUrl: this.rawProductData.rawProductData["defaultCanonicalUrl"]
            };
        }

        let title = metaObj.productName;
        if (metaObj.productPrice && metaObj.productPrice > 0 && metaObj["quantityAvailable"] > 0 && !this.isLanguageHindi) {
            title += " - Buy at Rs." + metaObj.productPrice;
        }
        if (metaObj.productPrice && metaObj.productPrice > 0 && metaObj["quantityAvailable"] > 0 && this.isLanguageHindi) {
            title += metaObj['seoDetails']['title'];
        }

        if (!this.isLanguageHindi) {
            if (metaObj.productOutOfStock == true) {
                this.pageTitle.setTitle(
                    "Buy " + metaObj.productName + " Online At Best Price On Moglix"
                );
            } else {
                this.pageTitle.setTitle(
                    "Buy " + metaObj.productName + " Online At Price ₹" + metaObj.productPrice
                );
            }
        }
        else {
            if (metaObj.productOutOfStock == true) {
                this.pageTitle.setTitle("खरीदें " + metaObj.productName + " ऑनलाइन सबसे अच्छी कीमत पर मोगलिक्स से");
            } else {
                this.pageTitle.setTitle("खरीदें " + metaObj.productName + " ऑनलाइन कीमत ₹" + metaObj.productPrice + " में"
                );
            }
        }

        let metaDescription = "";

        if (
            metaObj["seoDetails"] &&
            metaObj["seoDetails"]["metaDescription"] != undefined &&
            metaObj["seoDetails"]["metaDescription"] != null &&
            metaObj["seoDetails"]["metaDescription"] != ""
        ) {
            metaDescription = metaObj["seoDetails"]["metaDescription"].replace('___productPrice___', '₹' + this.rawProductData.productPrice);
        } else {
            if (metaObj.productOutOfStock == true) {
                metaDescription =
                    "Buy " +
                    metaObj.productName +
                    " Online in India at moglix. Shop from the huge range of " +
                    (metaObj.productBrandDetails ? metaObj.productBrandDetails["brandName"] : '') +
                    " " +
                    (metaObj.productCategoryDetails ? metaObj.productCategoryDetails["categoryName"] : '') +
                    ". ✯ Branded " +
                    (metaObj.productCategoryDetails ? metaObj.productCategoryDetails["categoryName"] : '') +
                    " ✯ Lowest Price ✯ Best Deals ✯ COD";
            } else {
                metaDescription =
                    "Buy " +
                    metaObj.productName +
                    " Online in India at price ₹" +
                    metaObj.productPrice +
                    ". Shop from the huge range of " +
                    (metaObj.productBrandDetails ? metaObj.productBrandDetails["brandName"] : '') +
                    " " +
                    (metaObj.productCategoryDetails ? metaObj.productCategoryDetails["categoryName"] : '') +
                    ". ✯ Branded " +
                    (metaObj.productCategoryDetails ? metaObj.productCategoryDetails["categoryName"] : '') +
                    " ✯ Lowest Price ✯ Best Deals ✯ COD";
            }
        }
        this.meta.addTag({ name: "description", content: metaDescription });

        this.meta.addTag({ name: "og:description", content: metaDescription });
        this.meta.addTag({
            name: "og:url",
            content: (this.hindiUrl) ? CONSTANTS.PROD + this.router.url : CONSTANTS.PROD + "/" + this.rawProductData.productUrl,
        });
        // this.pageTitle.setTitle("खरीदें "+ metaObj.productName + " ऑनलाइन कीमत ₹" + metaObj.productPrice + " में"
        if (!this.isHindiUrl) {
            this.meta.addTag({ name: "og:title", content: title });
        } else {
            this.meta.addTag({ name: "og:title", content: "खरीदें " + metaObj.productName + " ऑनलाइन कीमत ₹" + metaObj.productPrice + " में" });
        }
        this.meta.addTag({ name: "og:image", content: metaObj.productDefaultImage });
        this.meta.addTag({ name: "robots", content: CONSTANTS.META.ROBOT });
        this.meta.addTag({
            name: "keywords",
            content:
                metaObj.productName +
                ", " +
                (metaObj.productCategoryDetails ? metaObj.productCategoryDetails["categoryName"] : '') +
                ", " +
                (metaObj.productBrandDetails ? metaObj.productBrandDetails["brandName"] : ''),
        });
        if (this.isServer) {
            const links = this.renderer2.createElement("link");
            links.rel = "canonical";
            let url = ''
            if (this.isHindiUrl) {
                url = CONSTANTS.PROD + this.hindiUrl;
            }
            else {
                url = CONSTANTS.PROD + '/' + metaObj.productUrl;
            }
            const baseUrl = this.isHindiUrl ? CONSTANTS.PROD + '/hi/' : CONSTANTS.PROD + '/'
            // revisit required
            if (
                !this.isCommonProduct &&
                !this.listOfGroupedCategoriesForCanonicalUrl.includes(
                    metaObj.productCategoryDetails["categoryCode"]
                )
            ) {
                url = baseUrl + (
                    (this.rawProductData.productPartDetails[this.rawProductData["partNumber"]].canonicalUrl) ?
                        (this.rawProductData.productPartDetails[this.rawProductData["partNumber"]].canonicalUrl) :
                        metaObj["defaultCanonicalUrl"]
                );
            }
            else {
                if (!metaObj.productUrl) {
                    url = baseUrl + this.rawProductData;
                }
            }

            if (url && url.substring(url.length - 2, url.length) == "-g") {
                url = url.substring(0, url.length - 2);
            }
            links.href = url;
            if (this.commonService.isServer && this.isAcceptLanguage) {
                const languagelink = this.renderer2.createElement("link");
                languagelink.rel = "alternate";
                languagelink.href = CONSTANTS.PROD + this.hindiUrl;
                languagelink.hreflang = 'hi-in';
                this.renderer2.appendChild(this.document.head, languagelink);

                const elanguagelink = this.renderer2.createElement("link");
                elanguagelink.rel = "alternate";
                elanguagelink.href = CONSTANTS.PROD + this.englishUrl;
                elanguagelink.hreflang = 'en'
                this.renderer2.appendChild(this.document.head, elanguagelink);

            }
            if (this.commonService.isServer) {
                this.renderer2.appendChild(this.document.head, links);
            }
            if (this.commonService.isBrowser) {
                this.isHindiUrl ? document.documentElement.setAttribute("lang", 'hi') : document.documentElement.setAttribute("lang", 'en');
            }
        }
    }

    // Add to cart methods
    async showFBT() {
        if (this.fbtFlag) {
            const TAXONS = this.taxons;
            let page = {
                pageName: `moglix:${TAXONS[0]}:${TAXONS[1]}:${TAXONS[2]}:pdp`,
                channel: "About This Product",
                subSection: null,
                linkPageName: null,
                linkName: null,
                loginStatus: this.commonService.loginStatusTracking,
            };
            let analytics = {
                page: page,
                custData: this.commonService.custDataTracking,
                order: this.orderTracking,
            };
            this.modalService.show({
                inputs: {
                    modalData: {
                        isModal: true,
                        backToCartFlow: this.addToCartFromModal.bind(this),
                        analytics: analytics,
                        productQuantity: this.cartQunatityForProduct
                    },
                },
                component: FbtComponent,
                outputs: {},
                mConfig: { className: "ex" },
            });
        } else {
            this.addToCart(false);
        }
    }

    // cart methods 
    analyticAddToCart(buyNow, quantity, isCod) {
        const user = this.localStorageService.retrieve("user");
        const taxonomy = this.rawProductData.productCategoryDetails["taxonomyCode"];
        let taxo1 = "";
        let taxo2 = "";
        let taxo3 = "";
        if (this.rawProductData.productCategoryDetails["taxonomyCode"]) {
            taxo1 = this.rawProductData.productCategoryDetails["taxonomyCode"].split("/")[0] || "";
            taxo2 = this.rawProductData.productCategoryDetails["taxonomyCode"].split("/")[1] || "";
            taxo3 = this.rawProductData.productCategoryDetails["taxonomyCode"].split("/")[2] || "";
        }

        let ele = []; // product tags for adobe;
        // this.productTags.forEach((element) =>
        // {
        //     ele.push(element.name);
        // });
        const tagsForAdobe = ele.join("|");

        let page = {
            linkPageName: "moglix:" + taxo1 + ":" + taxo2 + ":" + taxo3 + ":pdp",
            linkName: (isCod ? "Quick cod  " : (!buyNow ? "Add to cart" : "Buy Now")),
            channel: "pdp",
        };

        if (this.displayCardCta) {
            page["linkName"] =
                (isCod ? "Quick cod" : (!buyNow ? "Add to cart Overlay" : "Buy Now Overlay"));
            if (this.popupCrouselInstance) {
                page["linkName"] =
                    isCod ? "Quick cod  Main Image Overlay " :
                        (!buyNow
                            ? "Add to cart Main Image Overlay"
                            : "Buy Now Main Image Overlay")
            }
        }

        let custData = this.commonService.custDataTracking;
        let order = {
            productID: this.rawProductData.defaultPartNumber, // TODO: partNumber
            parentID: this.rawProductData.defaultPartNumber,
            productCategoryL1: taxo1,
            productCategoryL2: taxo2,
            productCategoryL3: taxo3,
            price: this.rawProductData.productPrice,
            quantity: quantity,
            brand: this.rawProductData.productBrandDetails["brandName"],
            tags: tagsForAdobe,
        };

        this.analytics.sendAdobeCall({ page, custData, order }, "genericClick");

        const digitalData = {
            event: "addToCart",
            ecommerce: {
                currencyCode: "INR",
                add: {
                    products: [
                        {
                            name: this.rawProductData.productName, // Name or ID of the product is required.
                            id: this.rawProductData.productSubPartNumber, // todo: partnumber
                            price: this.rawProductData.productPrice,
                            brand: this.rawProductData.productBrandDetails["brandName"],
                            brandId: this.rawProductData.productBrandDetails["idBrand"],
                            category:
                                this.rawProductData.productCategoryDetails &&
                                    this.rawProductData.productCategoryDetails["taxonomy"]
                                    ? this.rawProductData.productCategoryDetails["taxonomy"]
                                    : "",
                            variant: "",
                            quantity: quantity,
                            productImg: this.productDefaultImage,
                            CatId: this.rawProductData.productCategoryDetails["taxonomyCode"],
                            MRP: this.rawProductData.product,
                            Discount: this.rawProductData.priceQuantityCountry['mrp'],
                        },
                    ],
                },
            },
        };
        this.analytics.sendGTMCall(digitalData);
    }

    addToCart(buyNow: boolean) {
        if (buyNow) {
            this.globalLoader.setLoaderState(true);
            this.validateQuickCheckout().subscribe((res) => {
                if (res != null) {
                    this.globalLoader.setLoaderState(false);
                    this.quickCheckoutPopUp(res.address);
                    this.commonService.setBodyScroll(null, false);
                    this.analyticAddToCart(buyNow, this.cartQunatityForProduct, true);
                } else {
                    this.addToCartFromModal(buyNow);
                    this.globalLoader.setLoaderState(false);
                }
            });
        } else {
            this.addToCartFromModal(buyNow);
        }
    }

    async quickCheckoutPopUp(address) {
        if (!this.quickOrderInstance) {
            this.globalLoader.setLoaderState(true);
            const { PdpQuickCheckoutComponent } = await import(
                "../../components/pdp-quick-checkout/pdp-quick-checkout.component"
            ).finally(() => {
                this.globalLoader.setLoaderState(false);
            });
            const factory = this.cfr.resolveComponentFactory(PdpQuickCheckoutComponent);
            this.quickOrderInstance = this.quickOrderContainerRef.createComponent(
                factory,
                null,
                this.injector
            );

            this.quickOrderInstance.instance["rawProductData"] = this.rawProductData;
            this.quickOrderInstance.instance["productPrice"] = this.rawProductData.productPrice;
            this.quickOrderInstance.instance["selectedProductBulkPrice"] = this.selectedProductBulkPrice;
            this.quickOrderInstance.instance["cartQunatityForProduct"] = this.cartQunatityForProduct;
            this.quickOrderInstance.instance["address"] = address;
            (
                this.quickOrderInstance.instance["isClose"] as EventEmitter<boolean>
            ).subscribe((status) => {
                this.router.navigate(["/checkout"]);
            });
            this.quickOrderInstance = null;
        }
    }

    validateQuickCheckout(): Observable<any> {
        if (this.localAuthService.isUserLoggedIn()) {
            const userData = this.localAuthService.getUserSession();
            const userId = userData ? userData["userId"] : null;
            return this.productService
                .getCustomerLastOrder({
                    customerId: userId,
                    limit: 1,
                })
                .pipe(
                    map(
                        (res) => {
                            if (!res) {
                                return null;
                            } else {
                                return this.getCustomerLastOrderVerification(res);
                            }
                        },
                        catchError((error) => {
                            return of(null);
                        })
                    ),
                    mergeMap((response) => {
                        if (response) {
                            const postBody = {
                                productId: [this.rawProductData["defaultPartNumber"]],
                                toPincode:
                                    response.addressDetails["shippingAddress"][0]["zipCode"],
                                price: this.rawProductData.productPrice,
                            };
                            return this.productService
                                .getLogisticAvailability(postBody)
                                .pipe(
                                    map(
                                        (ress) => {
                                            if (!ress) {
                                                return null;
                                            } else {
                                                return this.getServiceAvailabilityVerification(
                                                    ress,
                                                    response
                                                );
                                            }
                                        },
                                        catchError((error) => {
                                            return of(null);
                                        })
                                    )
                                );
                        } else {
                            return of(null);
                        }
                    })
                );
        } else {
            return of(null);
        }
    }

    getServiceAvailabilityVerification(ress, address) {
        if (ress && ress["statusCode"] && ress["statusCode"] == 200) {
            let data =
                ress["data"][this.rawProductData["defaultPartNumber"]]["aggregate"];
            if (data["serviceable"] == true && data["codAvailable"] == true) {
                return {
                    address: address
                };
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    getCustomerLastOrderVerification(res) {
        if (res && res["lastOrderDetails"] && res["lastOrderDetails"].length) {
            const len =
                res["lastOrderDetails"].length == 0
                    ? res["lastOrderDetails"].length
                    : res["lastOrderDetails"].length - 1;
            const isValidOrder =
                res["lastOrderDetails"][len].paymentType == "COD" &&
                res["lastOrderDetails"][len].orderStatus == "DELIVERED";
            if (isValidOrder) {
                const isValidShippingAddress = (
                    res["lastOrderDetails"][len].addressType == 'shipping' &&
                    res["lastOrderDetails"][len]["addressDetails"] &&
                    res["lastOrderDetails"][len]["addressDetails"]["shippingAddress"]
                    && res["lastOrderDetails"][len]["addressDetails"]["shippingAddress"].length == 1
                );
                const isValidBillingAddress = (
                    res["lastOrderDetails"][len].addressType == 'billing' &&
                    res["lastOrderDetails"][len]["addressDetails"] &&
                    res["lastOrderDetails"][len]["addressDetails"]["billingAddress"] &&
                    res["lastOrderDetails"][len]["addressDetails"]["billingAddress"].length == 1 &&
                    res["lastOrderDetails"][len]["addressDetails"]["shippingAddress"] &&
                    res["lastOrderDetails"][len]["addressDetails"]["shippingAddress"].length == 1
                );
                if (isValidShippingAddress || isValidBillingAddress) {
                    return {
                        addressDetails: res["lastOrderDetails"][len]["addressDetails"],
                        addressType: res["lastOrderDetails"][len]["addressType"],
                    };
                } else {
                    return null
                }

            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    addToCartFromModal(buyNow: boolean) {
        // console.log('originalProductBO', this.originalProductBO);
        const cartAddToCartProductRequest = this.cartService.getAddToCartProductItemRequest({
            productGroupData: this.rawProductData,
            buyNow: buyNow,
            selectPriceMap: this.selectedProductBulkPrice,
            quantity: this.cartQunatityForProduct,
            languageMode: this.isHindiUrl,
            originalProductBO: this.originalProductBO,
        });
        this.cartService.addToCart({ buyNow, productDetails: cartAddToCartProductRequest }).subscribe(result => {
            // analytic events needs to called here
            this.analyticAddToCart(buyNow, this.cartQunatityForProduct, false);
            this.intialAddtoCartSocketAnalyticEvent(buyNow);
            this.updateAddtoCartSocketAnalyticEvent(buyNow)
            this.fireViewBasketEvent(result);

            if (!result && this.cartService.buyNowSessionDetails) {
                // case: if user is not logged in then buyNowSessionDetails holds temp cartsession request and used after user logged in to called updatecart api
                this.router.navigate(['/checkout/login'], {
                    queryParams: {
                        title: 'Continue to place order',
                    },
                    state: (buyNow ? { buyNow: buyNow } : {})
                });
            } else {

                if (result) {
                    this.checkoutService.setCheckoutTabIndex(1);
                    if (!buyNow) {
                        this.cartService.setGenericCartSession(result);
                        // console.log('cart session', result['noOfItems'] || result.itemsList.length );
                        this.cartService.cart.next({ count: result['noOfItems'] || result.itemsList.length, currentlyAdded: cartAddToCartProductRequest });
                        this.globalLoader.setLoaderState(false);
                        this.showAddToCartToast();
                    } else {
                        this.router.navigateByUrl('/checkout', { state: buyNow ? { buyNow: buyNow } : {} });
                    }
                } else {
                    console.log('PDP null conditon')
                }
            }
        })
    }

    async showAddToCartToast() {
        if (!this.addToCartToastInstance) {
            const { GlobalToastComponent } = await import(
                "../../components/global-toast/global-toast.component"
            );
            const factory = this.cfr.resolveComponentFactory(GlobalToastComponent);
            this.addToCartToastInstance =
                this.addToCartToastContainerRef.createComponent(
                    factory,
                    null,
                    this.injector
                );
            this.addToCartToastInstance.instance["text"] =
                this.rawCartNotificationMessage;
            this.addToCartToastInstance.instance["btnText"] = "VIEW CART";
            this.addToCartToastInstance.instance["btnLink"] = "/quickorder";
            this.addToCartToastInstance.instance["showTime"] = 6000;

            (
                this.addToCartToastInstance.instance["removed"] as EventEmitter<boolean>
            ).subscribe((status) => {
                this.addToCartToastInstance = null;
                this.addToCartToastContainerRef.detach();
            });
        }
    }

    intialAddtoCartSocketAnalyticEvent(buynow: boolean) {
        var trackingData = {
            event_type: "click",
            label: !buynow ? "add_to_cart" : "buy_now",
            product_name: this.rawProductData.productName,
            msn: this.rawProductData.defaultPartNumber,
            brand: this.rawProductData.productBrandDetails["brandName"],
            price: this.rawProductData.productPrice,
            quantity: Number(this.cartQunatityForProduct),
            channel: "PDP",
            category_l1: this.rawProductData.productCategoryDetails["taxonomy"].split("/")[0] ? this.rawProductData.productCategoryDetails["taxonomy"].split("/")[0] : null,
            category_l2: this.rawProductData.productCategoryDetails["taxonomy"].split("/")[1] ? this.rawProductData.productCategoryDetails["taxonomy"].split("/")[1] : null,
            category_l3: this.rawProductData.productCategoryDetails["taxonomy"].split("/")[2] ? this.rawProductData.productCategoryDetails["taxonomy"].split("/")[2] : null,
            page_type: "product_page",
        };
        this.analytics.sendToClicstreamViaSocket(trackingData);
    }

    sendTrackingData() {
        const TAXONS = this.taxons;
        const page = {
            "linkPageName": `moglix:${TAXONS[0]}:${TAXONS[1]}:${TAXONS[2]}:pdp`,
            "linkName": "WhatsApp",
            "loginStatus": this.commonService.loginStatusTracking
        }
        const custData = this.commonService.custDataTracking;
        const order = this.orderTracking;
        this.analytics.sendAdobeCall({ page, custData, order }, "genericClick");
    }

    updateAddtoCartSocketAnalyticEvent(buynow: boolean) {
        const cartSession = Object.assign({}, this.cartService.getCartSession())
        let totQuantity = 0;
        let trackData = {
            event_type: "click",
            page_type: "product_page",
            label: "cart_updated",
            channel: "PDP",
            price: cartSession["cart"]["totalPayableAmount"] ? cartSession["cart"]["totalPayableAmount"].toString() : "",
            quantity: cartSession["itemsList"].map((item) => {
                return (totQuantity = totQuantity + item.productQuantity);
            })[cartSession["itemsList"].length - 1],
            shipping: parseFloat(cartSession["shippingCharges"]),
            itemList: cartSession["itemsList"].map((item) => {
                return {
                    category_l1: item["taxonomyCode"]
                        ? item["taxonomyCode"].split("/")[0]
                        : null,
                    category_l2: item["taxonomyCode"]
                        ? item["taxonomyCode"].split("/")[1]
                        : null,
                    category_l3: item["taxonomyCode"]
                        ? item["taxonomyCode"].split("/")[2]
                        : null,
                    price: item["totalPayableAmount"].toString(),
                    quantity: item["productQuantity"],
                };
            }),
        };
        this.analytics.sendToClicstreamViaSocket(trackData);
    }

    fireViewBasketEvent(cartSession) {
        if (cartSession && cartSession["itemsList"] && cartSession["itemsList"].length > 0) {
            let eventData = {
                prodId: "",
                prodPrice: 0,
                prodQuantity: 0,
                prodImage: "",
                prodName: "",
                prodURL: "",
            };
            let criteoItem = [];
            for (let p = 0; p < cartSession["itemsList"].length; p++) {
                criteoItem.push({
                    name: cartSession["itemsList"][p]["productName"],
                    brandId: this.rawProductData.productBrandDetails["idBrand"],
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
            let user = this.localStorageService.retrieve("user");

            const dataLayerObj = {
                event: "viewBasket",
                email: user && user.email ? user.email : "",
                currency: "INR",
                productBasketProducts: criteoItem,
                eventData: eventData,
            };
            this.analytics.sendGTMCall(dataLayerObj);
            this.analytics.sendMessage(dataLayerObj);
        }
    }

    // product-rfq
    getBestPrice($event)
    {
        this.holdRFQForm = false;
        this.onVisibleProductRFQ($event);
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

    scrollToTop() {
        if (this.isBrowser) {
            ClientUtility.scrollToTop(2000);
        }
    }

    navigateToCategory() {
        if (this.apiResponse.breadcrumb) {
            let lastElement = this.apiResponse.breadcrumb.length - 2;
            let category = this.apiResponse.breadcrumb[lastElement]["categoryLink"];
            this.navigateToUrl(category);
        }
    }

    navigateToUrl(url) {
        this.router.navigateByUrl(url);
    }

    getSanitizedUrl(url) {
        return (url).toLowerCase().split('#')[0].split('?')[0];
    }

    ngOnDestroy() { }
}