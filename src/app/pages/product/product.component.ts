import { NavigationService } from '@app/utils/services/navigation.service';
import { DatePipe, DOCUMENT } from "@angular/common";
import
{
    AfterViewInit,
    Component,
    ComponentFactoryResolver,
    ElementRef,
    EventEmitter,
    HostListener,
    Inject,
    Injector,
    OnInit,
    Optional,
    Renderer2,
    ViewChild,
    ViewContainerRef,
} from "@angular/core";
import { Location } from "@angular/common";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { DomSanitizer, Meta, Title } from "@angular/platform-browser";
import { ActivatedRoute, NavigationEnd, NavigationExtras, NavigationStart, PRIMARY_OUTLET, Router, UrlSegment, UrlSegmentGroup, UrlTree } from "@angular/router";
import { YoutubePlayerComponent } from "@app/components/youtube-player/youtube-player.component";
import CONSTANTS from "@app/config/constants";
import { GLOBAL_CONSTANT } from "@app/config/global.constant";
import { ModalService } from "@app/modules/modal/modal.service";
import { ToastMessageService } from "@app/modules/toastMessage/toast-message.service";
import { ProductCardFeature, ProductsEntity } from "@app/utils/models/product.listing.search";
import { ArrayFilterPipe } from "@app/utils/pipes/k-array-filter.pipe";
import { CartService } from "@app/utils/services/cart.service";
import { CheckoutService } from "@app/utils/services/checkout.service";
import { CommonService } from "@app/utils/services/common.service";
import { RESPONSE } from "@nguniversal/express-engine/tokens";
import { LocalStorageService, SessionStorageService } from "ngx-webstorage";
import { BehaviorSubject, Observable, of, Subject, Subscription } from "rxjs";
import { ClientUtility } from "../../utils/client.utility";
import { ObjectToArray } from "../../utils/pipes/object-to-array.pipe";
import { LocalAuthService } from "../../utils/services/auth.service";
import { DataService } from "../../utils/services/data.service";
import { GlobalAnalyticsService } from "../../utils/services/global-analytics.service";
import { GlobalLoaderService } from "../../utils/services/global-loader.service";
import { ProductUtilsService } from "../../utils/services/product-utils.service";
import { ProductService } from "../../utils/services/product.service";
import { SiemaCrouselService } from "../../utils/services/siema-crousel.service";
import { FbtComponent } from "./../../components/fbt/fbt.component";
import * as $ from 'jquery';
import { catchError, delay, filter, map, mergeMap } from "rxjs/operators";
import { TrackingService } from "@app/utils/services/tracking.service";
import * as localization_en from '../../config/static-en';
import * as localization_hi from '../../config/static-hi';
import { product } from '../../config/static-hi';
import { distinctUntilChanged } from 'rxjs/operators';
import { YTThumbnailPipe } from '@app/utils/pipes/ytthumbnail.pipe';
import { AdsenseService } from '@app/utils/services/adsense.service';


interface ProductDataArg
{
    productBO: string;
    refreshCrousel?: boolean;
    subGroupMsnId?: string;
}

@Component({
    selector: "app-product",
    templateUrl: "./product.component.html",
    styleUrls: ["./product.component.scss"],
})
export class ProductComponent implements OnInit, AfterViewInit,AfterViewInit
{
    
    switchLanguage: boolean = false;  
    encodeURI = encodeURI;
    readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
    readonly baseDomain = CONSTANTS.PROD;
    readonly DOCUMENT_URL = CONSTANTS.DOCUMENT_URL;
    readonly imagePathAsset = CONSTANTS.IMAGE_ASSET_URL;
    productStaticData:any = this.commonService.defaultLocaleValue;

    showScrollToTopButton: boolean = false;
    isServer: boolean;
    isBrowser: boolean;
    //conditions vars
    rawProductData: any = null;
    rawProductCountData: any = null;
    rawProductCountMessage = null;
    rawCartNotificationMessage = null;
    uniqueRequestNo: number = 0;
    currentAddedProduct: any;
    cartSession: any;
    bulkPriceSelctedQuatity: number;
    bulkDiscount: any;
    selectedBulkQuantityIndex: any;
    productNotFound: boolean = false;
    //general product info
    defaultPartNumber: string = null;
    productTags: any[] = null;
    isCommonProduct: boolean = true;
    // productAttributesExtra: any[] = null;
    productName: string = null;
    isProductPriceValid: boolean;
    productOutOfStock: boolean = false;
    priceQuantityCountry: any;
    productAttributes: any = null;
    productMrp: number = 0;
    priceWithoutTax: number;
    productDiscount: number = 0;
    taxPercentage: number;
    bulkSellingPrice: number = null;
    productPrice: number;//selling price
    bulkPriceWithoutTax: number = null; //bulk price without tax
    isPurcahseListProduct: boolean = false;
    productDescripton: string = null;
    productBrandDetails: any;
    productCategoryDetails: any;
    productUrl: string;
    productTax: number = 0;
    productCartThumb: string = "";
    productMinimmumQuantity: any = 1;
    productFilterAttributesList: any;
    productKeyFeatures: any[] = [];
    productVideos: any[] = [];
    productDocumentInfo: any[] = [];
    questionAnswerList: any = null;
    productDefaultImage: string;
    productMediumImage: string;
    productBrandCategoryUrl: string;
    productRating: number;
    productSubPartNumber: string;
    // Bulk product related vars
    productBulkPrices: any[];
    isBulkPricesProduct: boolean = false;
    selectedProductBulkPrice: any;
    // product returns
    isProductReturnAble: boolean = false;
    //Product Question answer
    questionAnswerForm: FormGroup;
    //review and rating
    rawReviewsData = null;
    reviews: any = null;
    reviewLength: number;
    selectedReviewType: string = "helpful";
    starsCount: number = null;
    //breadcrumm related data
    breadcrumpUpdated: BehaviorSubject<any> = new BehaviorSubject<any>(0);
    breadcrumbData = null;
    // product image crousel settings
    productAllImages: any[] = null;
    refreshSiemaItems$ = new Subject<{
        items: Array<{}>;
        type: string;
        currentSlide: number;
    }>();
    moveToSlide$ = new Subject<number>();
    carouselInitialized: boolean = false;
    //frequently bought together
    fbtFlag = false;
    isRFQSuccessfull = false;
    similarProducts = [];
    displayCardCta = false;
    questionAnswerPopup = false;
    productInfoPopup = false;
    isProductCrouselLoaded: boolean = false;
    productImages = null;
    refinedProdTags = [];

    similarForOOSContainer = [];
    similarForOOSLoaded = true;
    // Q&A vars
    questionMessage: string;
    listOfGroupedCategoriesForCanonicalUrl = ["116111700"];
    alreadyLiked: boolean = true;
    //recently view
    hasRecentlyView = true;
    msn:string;
    compareProductsData:Array<object> = [];

    productShareInstance = null;
    @ViewChild("productShare", { read: ViewContainerRef })
    productShareContainerRef: ViewContainerRef;
    // ondemand loaded components for Frequently bought together
    fbtComponentInstance = null;
    @ViewChild("fbt", { read: ViewContainerRef })
    fbtComponentContainerRef: ViewContainerRef;
    // ondemand loaded components for similar products
    similarProductInstance = null;
    @ViewChild("similarProduct", { read: ViewContainerRef })
    similarProductContainerRef: ViewContainerRef;
    // ondemand loaded components for product price compare products
    productPriceCompareInstance = null;
    @ViewChild("productPriceCompare", { read: ViewContainerRef })
    productPriceCompareContainerRef: ViewContainerRef;
    // similarProductInstanceOOS for out of stock
    similarProductInstanceOOS = null;
    @ViewChild("similarProductOOS", { read: ViewContainerRef })
    similarProductInstanceOOSContainerRef: ViewContainerRef;
    // ondemand loaded components for recents products
    recentProductsInstance = null;
    @ViewChild("recentProducts", { read: ViewContainerRef })
    recentProductsContainerRef: ViewContainerRef;
    // ondemand loaded components RFQ form modal
    rfqFormInstance = null;
    @ViewChild("rfqForm", { read: ViewContainerRef })
    rfqFormContainerRef: ViewContainerRef;
    // ondemad loaded components for pincode servicibility check
    pincodeFormInstance = null;
    @ViewChild("pincodeForm", { read: ViewContainerRef })
    pincodeFormContainerRef: ViewContainerRef;
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
    // ondemad loaded components add to cart toast
    addToCartToastInstance = null;
    @ViewChild("addToCartToast", { read: ViewContainerRef })
    addToCartToastContainerRef: ViewContainerRef;
    // ondemad loaded components similat prodict all pop up
    similarAllInstance = null;
    @ViewChild("similarAll", { read: ViewContainerRef })
    similarAllContainerRef: ViewContainerRef;
    // ondemad loaded components recent viewd products all pop up
    recentAllInstance = null;
    @ViewChild("recentAll", { read: ViewContainerRef })
    recentAllContainerRef: ViewContainerRef;
    // ondemad loaded components for showing duplicate order
    globalToastInstance = null;
    @ViewChild("globalToast", { read: ViewContainerRef })
    globalToastContainerRef: ViewContainerRef;
    // ondemad loaded components for post a product review
    writeReviewPopupInstance = null;
    @ViewChild("writeReviewPopup", { read: ViewContainerRef })
    writeReviewPopupContainerRef: ViewContainerRef;
    // ondemad loaded components for popup crousel
    popupCrouselInstance = null;
    @ViewChild("popupCrousel", { read: ViewContainerRef })
    popupCrouselContainerRef: ViewContainerRef;
    // ondemad loaded components for green aleart box as success messge
    alertBoxInstance = null;
    @ViewChild("alertBox", { read: ViewContainerRef })
    alertBoxContainerRef: ViewContainerRef;
    // ondemand load of youtube video player in modal
    youtubeModalInstance = null;
    // ondemand loaded components for product RFQ
    productRFQInstance = null;
    @ViewChild("productRFQ", { read: ViewContainerRef })
    productRFQContainerRef: ViewContainerRef;
    // ondemand loaded components for product RFQ update popup
    productRFQUpdateInstance = null;
    @ViewChild("productRFQUpdate", { read: ViewContainerRef })
    productRFQUpdateContainerRef: ViewContainerRef;
    // ondemand loaded components for app Promo
    appPromoInstance = null;
    @ViewChild("appPromo", { read: ViewContainerRef })
    appPromoContainerRef: ViewContainerRef;
    // ondemad loaded components for emi infromation
    emiPopupInstance = null;
    @ViewChild("emiPopup", { read: ViewContainerRef })
    emiPopupContainerRef: ViewContainerRef;
    // ondemad loaded components for review & rating
    reviewRatingPopupInstance = null;
    @ViewChild("reviewRatingPopup", { read: ViewContainerRef })
    reviewRatingPopupContainerRef: ViewContainerRef;
    // ondemad loaded components for question & answer
    questionAnswerPopupInstance = null;
    @ViewChild("questionAnswersPopup", { read: ViewContainerRef })
    questionAnswerPopupContainerRef: ViewContainerRef;
    // ondemad loaded components for features & specification
    productInfoPopupInstance = null;
    @ViewChild("productInfoPopup", { read: ViewContainerRef })
    productInfoPopupContainerRef: ViewContainerRef;
    // ondemand product crousel
    productCrouselInstance = null;
    @ViewChild("productCrousel", { read: ViewContainerRef })
    productCrouselContainerRef: ViewContainerRef;
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
    pdpAccordianInstance = null;
    @ViewChild("pdpAccordian", { read: ViewContainerRef })
    pdpAccordianContainerRef: ViewContainerRef;
    // ondemad loaded components for quick order popUp
    quickOrderInstance = null;
    @ViewChild("quickOrder", { read: ViewContainerRef })
    quickOrderContainerRef: ViewContainerRef;
    // ondemand loaded component for return info
    returnInfoInstance = null;
    @ViewChild("returnInfo", { read: ViewContainerRef })
    returnInfoContainerRef: ViewContainerRef;

    iscloseproductDiscInfoComponent:boolean=true;
    showproductDiscInfoComponent: boolean=false;
    @HostListener('window:scroll', ['$event'])
    onScroll(event: Event) {
      const scrollPosition = window.pageYOffset;
      const renderCondition = scrollPosition > 600;
      if (renderCondition) {
        this.showproductDiscInfoComponent=true
      } else {
        this.showproductDiscInfoComponent=false
      }
    }

    iOptions: any = null;
    isAcceptLanguage:boolean = false;
    

    featuresMap = {
        Antiskid: "antiskid",
        "Oil Resistant": "oil-resistant",
        "Heat Resistant": "heat-resistant",
        "Puncture Resistant": "puncture-resistant",
        "Impact Resistant": "impact-resistant",
        "Chemical Resistant": "chemical-resistant",
        "Toe Type": "steel-toe",
        Waterproof: "waterproof",
    };
    prod_json:any = './static-en.json';

    appPromoVisible: boolean = true;
    productInfo = null;
    holdRFQForm = false;//this flag is to resolve RFQ pop-up issue on click of similar products icon
    rfqQuoteRaised: boolean = false;

    // quntity && bulk prices related
    qunatityFormControl: FormControl = new FormControl(1, []); // setting a default quantity to 1
    rfqTotalValue: any;
    hasGstin: boolean;
    GLOBAL_CONSTANT = GLOBAL_CONSTANT;
    isAskQuestionPopupOpen: boolean;
    mainProductURL: string;
    isLanguageHindi: boolean;
    originalProductBO: any = null;
    englishUrl: string;
    hindiUrl: string;
    ProductStatusCount: Observable<Object>;

    // footer accordian vars
    relatedLinkRes: any = null
    categoryBucketRes: any = null
    similarCategoryRes: any = null 
    moglixInightData: any;
    showMoglixInsight: boolean=false;

    fbtAnalytics: { page: { pageName: string; channel: string; subSection: any; linkPageName: any; linkName: any; loginStatus: string; }; custData: { customerID: string; emailID: string; mobile: string; customerType: any; customerCategory: any; } | null; order: { productID: string; productCategoryL1: any; productCategoryL2: any; productCategoryL3: any; brand: any; price: number; stockStatus: string; tags: string; }; };
    dealsAnalytics: any;
    bestProductsRes: any;
    isBrandMsn = false;
    pageUrl: string;
    recentProductItems: ProductsEntity[] = null;
    promoCodes: any[];
    allofferData: any[];
    couponForbrandCategory: any;
    fragment = '';
    adsenseData: any = null;
    set showLoader(value: boolean)
    {
    this.globalLoader.setLoaderState(value);
    }

    get getWhatsText()
    {
        return `Hi, I want to buy ${this.productName} (${this.defaultPartNumber})`;
    }

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private cfr: ComponentFactoryResolver,
        public objectToArray: ObjectToArray,
        private injector: Injector,
        private sanitizer: DomSanitizer,
        private location: Location,
        public localStorageService: LocalStorageService,
        private sessionStorageService: SessionStorageService,
        public productService: ProductService,
        private localAuthService: LocalAuthService,
        private _tms: ToastMessageService,
        private productUtil: ProductUtilsService,
        private modalService: ModalService,
        private cartService: CartService,
        public commonService: CommonService,
        public formBuilder: FormBuilder,
        private globalLoader: GlobalLoaderService,
        private siemaCrouselService: SiemaCrouselService,
        public pageTitle: Title,
        public meta: Meta,
        private renderer2: Renderer2,
        private analytics: GlobalAnalyticsService,
        private checkoutService: CheckoutService,
        private _trackingService: TrackingService,
        private _navigationService:NavigationService,
        private _ytThumbnail: YTThumbnailPipe,
        private datePipe: DatePipe,
        @Inject(DOCUMENT) private document,
        @Optional() @Inject(RESPONSE) private _response: any,
        private globalAnalyticsService: GlobalAnalyticsService,
        private _adsenseService: AdsenseService,
    )
    {
        this.isServer = commonService.isServer;
        this.isBrowser = commonService.isBrowser;
        this.isLanguageHindi =((this.router.url).toLowerCase().indexOf('/hi/') !== -1) || false;
        if(((this.router.url).toLowerCase().indexOf('/hi/') !== -1)){
            this.englishUrl = this.router.url.toLowerCase().split("/hi/").join('/');;
            this.hindiUrl =  this.router.url;
        }
        else {
            this.hindiUrl = "/hi" + this.router.url;
            this.englishUrl = (this.router.url).toLowerCase().split("/hi/").join('/');
        }
    }

    ngOnInit(): void
    {
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        // this.scrollToTop();
        this.intializeForm();
        this.getProductApiData();
        this.addSubcriber();
        this.createSiemaOption();
        // this.setProductSeoSchema();
        // this.setQuestionAnswerSchema();
        this.productService.resetOOOSimilarProductsData();
        
        if ((this.router.url).includes("/hi/")) {
            this.commonService.defaultLocaleValue = localization_hi.product;
            this.productStaticData = localization_hi.product;
            this.commonService.changeStaticJson.next(this.productStaticData);
        }else{
            this.commonService.defaultLocaleValue = localization_en.product;
            this.productStaticData = localization_en.product;
            this.commonService.changeStaticJson.next(this.productStaticData);
        }
        this.commonService.changeStaticJson.asObservable().subscribe(localization_content => {
            this.productStaticData = localization_content;
        })
    }

    scrollToTop()
    {
        if (this.isBrowser) {
            ClientUtility.scrollToTop(2000);
        }
    }

    ngAfterViewInit()
    {
        if (this.commonService.isBrowser) {
            this.resetLazyComponents();
            this.getPurchaseList();
            this.productFbtData();
            this.productStatusCount();
            this.checkDuplicateProduct();
            this.backUrlNavigationHandler();
            this.attachBackClickHandler();
            this.getRecents();
            if(!this.productOutOfStock && this.defaultPartNumber != null){ this.getCompareProductsData(this.defaultPartNumber);}
            this.getAdsenseData();
            this.route.fragment.subscribe((fragment: string) => {
                this.fragment = fragment;
            })
        }
        
    }

    private getAdsenseData() {
        if (
          this.msn &&
          this.productCategoryDetails &&
          this.productBrandDetails &&
          this.productCategoryDetails["categoryCode"] &&
          this.productBrandDetails["idBrand"]
        ) {
          const categoryId = this.productCategoryDetails["categoryCode"];
          const brandUrl = this.productBrandDetails["idBrand"];
          const msn = this.msn;
          this._adsenseService
            .getAdsense(categoryId, brandUrl, msn)
            .subscribe((adsenseData) => (this.adsenseData = adsenseData));
        }
    }

    getProductTag(){
        // this.globalLoader.setLoaderState(true);
        // this.productService.getProductTag(this.msn).subscribe(response => {
        //     if (response['statusCode'] == 200 && response['data'] != null) {
        //         this.productTags=response['data']
        //         this.getRefinedProductTags();
        //     } else {
        //         this.productTags=null;
        //     }
        //     // this.globalLoader.setLoaderState(false)
        // })

    }

    /**
     * This is feature is still in development, please dont uncomment this code
     */
    // navigationOnFragmentChange() {
    //     this.route.fragment.pipe(delay(300)).subscribe(fragment => {
    //         switch (fragment) {
    //             case CONSTANTS.PDP_POPUP_FRAGMENT.PRODUCT_EMIS :
    //                 this.emiComparePopUpOpen(true);
    //                 break;
    //             case CONSTANTS.PDP_POPUP_FRAGMENT.PRODUCT_OFFERS:
    //                 this.viewPopUpOpen(this.productService.productCouponItem);
    //                 break;    
    //             default:
    //                 break;
    //         }
    //     })
    // }

    backUrlNavigationHandler()
    {
        // make sure no browser history is present
        if (this.location.getState() && this.location.getState()['navigationId'] == 1) {
            this.sessionStorageService.store('NO_HISTROY_PDP', 'NO_HISTROY_PDP');
            if (this.productCategoryDetails && this.productCategoryDetails['categoryLink']) {
                window.history.replaceState('', '', this.productCategoryDetails['categoryLink'] + '?back=1');
                window.history.pushState('', '', this.router.url);
            }
        }
    }

    onScrollOOOSimilar(event)
    {
    }

    createSiemaOption()
    {
        if (!this.rawProductData) {
            return;
        }
        this.iOptions = {
            selector: ".img-siema",
            perPage: 1,
            productNew: true,
            pager: true,
            imageAlt: this.productName,
            loop: true,
            onInit: () =>
            {
                setTimeout(() =>
                {
                    this.carouselInitialized = true;
                }, 0);
            },
        };
    }

    addSubcriber()
    {
        if (this.isBrowser) {
            this.siemaCrouselService.getProductScrouselPopup().subscribe((result) =>
            {
                if (result.active) {
                    this.openPopUpcrousel(
                        result["slideNumber"],
                        result["oosProductCardIndex"]
                    );
                }
            });

            this.commonService.searchNudgeClicked.asObservable().subscribe(status =>
            {
                this.nudgeOpenedClicked();
            })

            this.commonService.searchNudgeOpened.asObservable().subscribe(status =>
            {
                this.nudgeOpened();
            })

        }
    }

    intializeForm()
    {
        this.questionAnswerForm = this.formBuilder.group({
            question: ["", [Validators.required]],
        });
    }

    updateUserSession()
    {
        this.commonService.userSession = this.localStorageService.retrieve('user');
    }

    getProductApiData()
    {
        // data received by product resolver
        this.route.data.subscribe(
            (rawData) =>
            {
                // console.log(rawData["product"]);
                if (!rawData["product"]["error"] && rawData["product"][0]["active"]==true) {
                    if (
                        rawData["product"][0]["productBO"] &&
                        Object.values(
                            rawData["product"][0]["productBO"]["productPartDetails"]
                        )[0]["images"] !== null
                    ) {
                        this.commonService.enableNudge = false;
                        this.isAcceptLanguage = (rawData["product"][0]["acceptLanguage"] != null && rawData["product"][0]["acceptLanguage"] != undefined) ? true : false;
                        this.processProductData(
                            {
                                productBO: rawData["product"][0]["productBO"],
                                refreshCrousel: true,
                                subGroupMsnId: null,
                            },
                            rawData["product"][0]
                        );
                         
                        this.originalProductBO = rawData["product"][0]["original_productBO"] || null;
                        // console.log('originalProductBO log', this.originalProductBO);
                        // Load secondary APIs data from resolver only when product data is received
                       
                        this.getSecondaryApiData(rawData["product"][1], rawData["product"][2], rawData["product"][3], rawData["product"][4], rawData["product"][5], rawData["product"][6], rawData['product'][7], rawData['product'][8], rawData['product'][10], rawData['product'][11], rawData['product'][12]);
                        if (rawData["product"][9]['status'] = true && rawData["product"][9]['statusCode'] == 200 && rawData["product"][9]['data']) {
                            this.showMoglixInsight = true;
                            this.moglixInightData = rawData["product"][9]['data']
                        } else {
                            this.showMoglixInsight = false;
                        }

                    } else {
                        this.showLoader = false;
                        this.globalLoader.setLoaderState(false);
                        this.productNotFound = true;
                        this.pageTitle.setTitle("Page Not Found");
                        if (this.isServer && this.productNotFound) {
                            this._response.status(404);
                        }
                    }
                } else {
                    this.productNotFound = true;
                    this.pageTitle.setTitle("Page Not Found");
                    if (this.isServer && this.productNotFound) {
                        this._response.status(404);
                    }
                }
                this.showLoader = false;
                this.globalLoader.setLoaderState(false); 
                this.checkForRfqGetQuote();
                this.checkForAskQuestion();
                this.updateUserSession();
            },
            (error) =>
            {
                this.showLoader = false;
                this.globalLoader.setLoaderState(false);
            }
        );
    }


    checkForRfqGetQuote()
    {
        if (!this.productOutOfStock && this.route.snapshot.queryParams.hasOwnProperty('state') && this.route.snapshot.queryParams['state'] === 'raiseRFQQuote') {
            this.raiseRFQQuote();
            setTimeout(() =>
            {
                this.scrollToResults('get-quote-section', -30);
            }, 1000);
        }
    }

    checkForAskQuestion()
    {
        if (this.route.snapshot.queryParams.hasOwnProperty('state') && this.route.snapshot.queryParams['state'] === 'askQuestion') {
            this.askQuestion();
            setTimeout(() =>
            {
                this.scrollToResults('ask-question-section', 166);
            }, 1000);
        }
    }

    getSecondaryApiData(
        reviewsDataApiData, breadcrumbApiData, 
        questAnsApiData, relatedLinkRes, 
        similarCategoryRes, categoryBucketRes, 
        productTagRes, bestproductsRes,
        promoCodeRes, mobikwikOffersRes,
        couponForbrandCategoryRes) {
        // console.log({
        //     promoCodeRes, mobikwikOffersRes
        // });
        if (reviewsDataApiData && reviewsDataApiData["data"]) {
            const rawReviews = Object.assign({}, reviewsDataApiData["data"]);
            rawReviews["reviewList"] = rawReviews["reviewList"] as [];
            this.setReviewsRatingData(rawReviews);
            // console.log('rawReviews', rawReviews);
            this.rawReviewsData = Object.assign({}, rawReviews);
            this.setProductSeoSchema();
        }

        if (breadcrumbApiData && Array.isArray(breadcrumbApiData)) {
            this.setProductaBreadcrum(breadcrumbApiData);
        }
        if (questAnsApiData && questAnsApiData["data"]) {
            this.setQuestionsAnswerData(questAnsApiData);
            this.setQuestionAnswerSchema();
        }

        if (productTagRes['statusCode'] == 200 && productTagRes['data'] != null) {
            this.productTags = productTagRes['data']
            this.getRefinedProductTags();
        } else {
            this.productTags = null;
        }

        if(bestproductsRes && bestproductsRes['totalCount'] > 0) {
            this.onVisiblePopularDeals();
            this.bestProductsRes = bestproductsRes;
        }

        if(promoCodeRes && promoCodeRes['statusCode'] == 200) {
            this.promoCodes = (promoCodeRes.data.applicablePromoCodeList as any[]).map((item: any, index) => Object.assign({}, item, { index }));
        }

        if(mobikwikOffersRes && mobikwikOffersRes['statusCode'] == 200) {
            this.allofferData = (mobikwikOffersRes.data as any[]).map((item: any, index) => Object.assign({}, item, { index }));
        }
        if (couponForbrandCategoryRes['statusCode'] == 200 && couponForbrandCategoryRes['data'] != null) {
            this.couponForbrandCategory = couponForbrandCategoryRes['data'];
        }
        this.relatedLinkRes = relatedLinkRes;
        this.categoryBucketRes = categoryBucketRes;
        this.similarCategoryRes = similarCategoryRes;

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

    updateAttr(productId)
    {
        this.removeRfqForm(); 
        this.showLoader = true;
        this.productService
            .getGroupProductObj(productId)
            .subscribe((productData) =>
            {
                if (productData["status"] == true && productData["active"] == true ) {
                    this.processProductData(
                        {
                            productBO: productData["productBO"],
                            refreshCrousel: true,
                            subGroupMsnId: productId,
                        },
                        productData
                    );
                    this.productFbtData();
                    if(this.productOutOfStock){
                        this.clearOfferInstance();
                    }else{
                        this.clearOfferInstance();
                        // this.onVisibleOffer();
                    }
                    this.showLoader = false;
                }
            });
    }

    private clearOfferInstance() {
        if (this.offerSectionInstance) {
            this.offerSectionInstance = null;
            if (this.offerSectionContainerRef) {
                this.offerSectionContainerRef.remove();
            }
        }
    }

    removeRfqForm()
    {
        if (this.productRFQInstance) {
            this.productRFQInstance = null;
            this.productRFQContainerRef.remove();
        }
    }

    setQuestionsAnswerData(data)
    {
        this.questionAnswerList = data;
    }

    setReviewsRatingData(reviews)
    {
        this.rawReviewsData = reviews;
        if (this.rawReviewsData && this.rawReviewsData.reviewList) {
            this.reviewLength = this.rawReviewsData.reviewList.length;
            this.rawReviewsData.reviewList.forEach((element) =>
            {
                element["isPost"] = false;
                element["yes"] = 0;
                element["no"] = 0;
                if (element.isReviewHelpfulCountYes)
                    element["yes"] = Number(element.isReviewHelpfulCountYes);
                if (element.isReviewHelpfulCountNo)
                    element["no"] = Number(element.isReviewHelpfulCountNo);
                element["totalReview"] = element["yes"] + element["no"];
            });
        }
        this.sortReviewsList("date");
        if (
            this.rawReviewsData.summaryData &&
            this.rawReviewsData.summaryData.hasOwnProperty("finalAverageRating")
        ) {
            this.setProductRating(
                this.rawReviewsData.summaryData.finalAverageRating
            );
        }
    }

    sortReviewsList(sortType)
    {
        this.selectedReviewType = sortType;
        if (sortType === "helpful") {
            this.rawReviewsData.reviewList = this.sortedReviewByRating(
                this.rawReviewsData.reviewList
            );
        } else {
            this.rawReviewsData.reviewList =
                this.rawReviewsData.reviewList &&
                    this.rawReviewsData.reviewList.length > 0
                    ? this.sortedReviewsByDate(this.rawReviewsData.reviewList)
                    : [];
        }
    }

    setProductRating(rating)
    {
        if (rating == 0 || rating == null) {
            this.starsCount = 0;
            //this.productResult['rating'] = 0;
        } else if (rating < 3.5) {
            this.starsCount = 3.5;
            //this.productResult['rating'] = 3.5;
        } else {
            this.starsCount = rating;
            //this.productResult['rating'] = rating;
        }
    }

    onVisibleReviews($event)
    {
        this.setReviewsRatingData(this.rawReviewsData);
    }

    setProductaBreadcrum(breadcrumbData)
    {
        this.breadcrumbData = breadcrumbData;
        if (this.breadcrumbData.length > 0) {
            this._navigationService.setPDPBreadCrumbData(breadcrumbData);
            // this.commonService.triggerAttachHotKeysScrollEvent('bread-head');
        }
    }

    navigateToCategory()
    {
        if (this.breadcrumbData) {
            let lastElement = this.breadcrumbData.length - 2;
            let category = this.breadcrumbData[lastElement]["categoryLink"];
            this.navigateToUrl(category);
        }
    }

    processProductData(args: ProductDataArg, rawData)
    {
        this.rawProductData = args.productBO;
        // required for goruped products
        this.defaultPartNumber =
            args.subGroupMsnId != null
                ? args.subGroupMsnId
                : this.rawProductData["defaultPartNumber"];
        const partNumber =
            args.subGroupMsnId != null
                ? args.subGroupMsnId
                : this.rawProductData["partNumber"];
        this.productSubPartNumber = partNumber;

        this.msn=partNumber;
        // mapping general information
        this.productName = this.rawProductData["productName"];
        this.isProductReturnAble = this.rawProductData["returnable"] || false;
        this.productDescripton = this.rawProductData["desciption"];
        this.productBrandDetails = this.rawProductData["brandDetails"];
        this.isBrandMsn = this.productBrandDetails['brandTag'] == 'Brand' ? true : false;
        this.productCategoryDetails = this.rawProductData["categoryDetails"][0];
        this.productUrl = this.rawProductData["defaultCanonicalUrl"];
        this.mainProductURL = this.rawProductData["productPartDetails"][partNumber]["productLinks"]['default'];
        this.productFilterAttributesList =
            this.rawProductData["filterAttributesList"];
        this.productKeyFeatures = this.rawProductData["keyFeatures"];
        this.productVideos = this.rawProductData["videosInfo"];
        this.productDocumentInfo = this.rawProductData["documentInfo"];
        // this.productTags = this.rawProductData["productTags"];
        // this.getRefinedProductTags();
        this.productAttributes =
            this.rawProductData["productPartDetails"][partNumber]["attributes"] || [];
        this.productRating =
            this.rawProductData["productPartDetails"][partNumber]["productRating"];
        this.productBrandCategoryUrl =
            "brands/" +
            this.productBrandDetails["friendlyUrl"] +
            "/" +
            this.productCategoryDetails["categoryLink"];

        this.isProductPriceValid =
            this.rawProductData["productPartDetails"][partNumber][
            "productPriceQuantity"
            ] != null;
        this.priceQuantityCountry = this.isProductPriceValid
            ? Object.assign(
                {},
                this.rawProductData["productPartDetails"][partNumber][
                "productPriceQuantity"
                ]["india"]
            )
            : null;
        this.productMrp =
            this.isProductPriceValid && this.priceQuantityCountry
                ? this.priceQuantityCountry["mrp"]
                : null;

        if (this.priceQuantityCountry) {
            this.priceQuantityCountry["bulkPricesIndia"] = this.isProductPriceValid
                ? Object.assign(
                    {},
                    this.rawProductData["productPartDetails"][partNumber][
                    "productPriceQuantity"
                    ]["india"]["bulkPrices"]
                )
                : null;
            this.priceQuantityCountry["bulkPricesModified"] =
                this.isProductPriceValid &&
                    this.rawProductData["productPartDetails"][partNumber][
                    "productPriceQuantity"
                    ]["india"]["bulkPrices"]["india"]
                    ? [
                        ...this.rawProductData["productPartDetails"][partNumber][
                        "productPriceQuantity"
                        ]["india"]["bulkPrices"]["india"],
                    ]
                    : null;
        }

        this.priceWithoutTax = this.priceQuantityCountry ? this.priceQuantityCountry["priceWithoutTax"] : null;
        this.productPrice = this.priceQuantityCountry && !isNaN(this.priceQuantityCountry["sellingPrice"]) ? Number(this.priceQuantityCountry["sellingPrice"]) : 0;
        if (this.priceQuantityCountry && this.priceQuantityCountry["mrp"] > 0 && this.priceQuantityCountry["sellingPrice"] > 0) {
            this.productDiscount = this.commonService.calculcateDiscount(this.priceQuantityCountry["discount"], this.priceQuantityCountry["mrp"], this.priceQuantityCountry["sellingPrice"]);
        }
        this.taxPercentage = this.priceQuantityCountry ? this.priceQuantityCountry["taxRule"]["taxPercentage"] : null;

        this.productTax = this.priceQuantityCountry && !isNaN(this.priceQuantityCountry["sellingPrice"]) && !isNaN(this.priceQuantityCountry["sellingPrice"]) ? Number(this.priceQuantityCountry["sellingPrice"]) - Number(this.priceQuantityCountry["sellingPrice"]) : 0;
        this.productMinimmumQuantity = this.priceQuantityCountry && this.priceQuantityCountry["moq"] ? this.priceQuantityCountry["moq"] : 1;

        this.getFirstAttributeValue();
        this.setOutOfStockFlag();
        this.pageUrl = this.router.url;
        this.checkForBulkPricesProduct();

        this.removeSimilarProductInstanceOOS();
        if (this.productOutOfStock) {
            this.productService.resetOOOSimilarProductsData();
            this.similarForOOSLoaded = true;
            this.similarForOOSContainer = new Array<any>(GLOBAL_CONSTANT.oosSimilarCardCountTop).fill(true);
            this.setSimilarProducts(this.productName, this.productCategoryDetails["categoryCode"], this.rawProductData['partNumber'], this.rawProductData['groupId']);
        }

        /**
         * Incase user lands on PDP page of outofstock variant and nextAvailableMsn in present in product group,
         * then redirect to inStock MSN of same grouped product
         * check for filterAttributesList for grouped to make sure it is grouped product and check of outofstock and
         * then redirect to next inStock msn avaliable in args.nextAvailableMsn
         * Make sure this condition is called after this.setOutOfStockFlag();
         *
         * Commented: as per request in Sprint-14 (Support)
         */

        // if (this.productFilterAttributesList && this.productOutOfStock) {
        //   this.getProductGroupData(args.nextAvailableMsn);
        // }

        // set qunatity to minQuantity that can be purchased
        this.qunatityFormControl.setValue(this.productMinimmumQuantity);

        // product media processing
        this.setProductImages(
            this.rawProductData["productPartDetails"][partNumber]["images"]
        );
        this.setProductVideo(this.rawProductData["videosInfo"]);
        if (args.refreshCrousel) {
            this.refreshProductCrousel();
        }

        this.setProductCommonType(this.rawProductData["filterAttributesList"]);

        this.updateBulkPriceDiscount();
        this.showLoader = false;
        // analytics calls moved to this function incase PDP is redirecte to PDP
        this.callAnalyticForVisit();
        this.setMetatag();
    }

    getCategoryBrandDetails(){
        return {
            category: this.rawProductData.categoryDetails[0],
            brand: this.rawProductData.brandDetails,
        };
    }

    getAnalyticsInfo(){
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

    updateBulkPriceDiscount()
    {
        if (
            this.priceQuantityCountry &&
            this.priceQuantityCountry["bulkPricesModified"] &&
            this.priceQuantityCountry["bulkPricesModified"].length > 0
        ) {
            this.priceQuantityCountry["bulkPricesModified"].forEach((element) =>
            {
                if (this.productMrp > 0) {
                    element.discount =
                        ((this.productMrp - element.bulkSellingPrice) / this.productMrp) *
                        100;
                } else {
                    element.discount = element.discount;
                }
            });
        }
    }
    getFirstAttributeValue()
    {
        let selectedValue;
        if (this.productFilterAttributesList && this.productFilterAttributesList.length > 0) {
            this.productFilterAttributesList.forEach((singleAttrList, index) =>
            {
                if (singleAttrList["items"] && singleAttrList["items"].length > 0) {
                    singleAttrList["items"] = singleAttrList["items"].filter((item) =>
                    {
                        if (item.selected == 0) {
                            return true;
                        }
                        selectedValue = item;
                        return false;
                    });
                    singleAttrList["items"] = [selectedValue].concat(singleAttrList["items"]);
                }
            });
        }
    }
    removeSimilarProductInstanceOOS()
    {
        if (this.similarProductInstanceOOS) {
            this.similarProductInstanceOOS = null;
            this.similarProductInstanceOOSContainerRef.remove();
        }
    }

    removeOosSimilarSection()
    {
        if (this.isBrowser) {
            ClientUtility.scrollToTop(100);
        }
        if (this.similarProductInstanceOOS) {
            this.similarProductInstanceOOS = null;
            this.similarProductInstanceOOSContainerRef.remove();
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
        if (this.similarProductInstance) {
            this.similarProductInstance = null;
            this.productPriceCompareContainerRef.remove();
            this.onVisibleproductPriceCompare(null);
        }
        if (this.similarProductInstanceOOS) {
            this.similarProductInstanceOOS = null;
            this.similarProductInstanceOOSContainerRef.remove();
            this.onVisibleSimilarOOS(null);
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
        if (this.productInfo) {
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
                        if (this.productOutOfStock) {
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
                        if (this.productOutOfStock) {
                            // this.commonService.triggerAttachHotKeysScrollEvent('consider-these-products');
                        }
                    }
                    this.similarForOOSLoaded = false;
                });
        }
    }

    updateOutOfStockFlagForCards(index = -1)
    {
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

    setOutOfStockFlag() {
        if (this.priceQuantityCountry) {
            // incase outOfStockFlag of is avaliable then set its value
            this.productOutOfStock = this.priceQuantityCountry["outOfStockFlag"];
            // apart from outOfStockFlag if mrp is exist and is zero set product of OOS
            if (this.priceQuantityCountry["mrp"]) {
                if (parseInt(this.priceQuantityCountry["mrp"]) == 0) {
                    this.productOutOfStock = true;
                }
                if (parseInt(this.priceQuantityCountry["quantityAvailable"]) == 0) {
                    this.productOutOfStock = true;
                }

            } else {
                this.productOutOfStock = true;
            }
        } else {
            // incase priceQuantityCountry element not present in API
            this.productOutOfStock = true;
        }
        if (this.productOutOfStock) {
            this.commonService.enableAppPromoInHeader = true;
        }else{
            this.commonService.enableAppPromoInHeader = false;
        }
    }

    // setAttributesExtra(productPartDetails) {
    //   if(productPartDetails){
    //     const productDetailArg = (productPartDetails) ? this.objectToArray.transform(productPartDetails, 'associative') : [];
    //     console.log('productDetailArg', productDetailArg);
    //     let productDetail = productDetailArg[0]['value'];
    //     const extra = [];
    //     if (productDetail.attributes) {
    //       for (const key in productDetail.attributes) {
    //         if (productDetail.attributes.hasOwnProperty(key)) {
    //           const element = productDetail.attributes[key];
    //           if (
    //             key == "Antiskid" || key == "Oil Resistant" ||
    //             key == "Heat Resistant" || key == "Puncture Resistant" ||
    //             key == "Impact Resistant" || key == "Chemical Resistant" ||
    //             key == "Steel Toe" || key == "Waterproof") {
    //             extra.push(key);
    //           }
    //         }
    //       }
    //     }
    //     this.productAttributesExtra = extra;
    //   }
    // }

    setProductCommonType(filterAttributesList)
    {
        const filterAttributesListData = filterAttributesList
            ? filterAttributesList
            : [];
        let isCommonProduct = true;
        if (filterAttributesListData.length > 0) {
            isCommonProduct = false;
        }
        this.isCommonProduct = isCommonProduct;
    }

    setProductImages(imagesArr: any[])
    {
        this.productDefaultImage =
            imagesArr.length > 0
                ? this.imagePath + "" + imagesArr[0]["links"]["default"]
                : "";
        this.productMediumImage =
            imagesArr.length > 0 ? imagesArr[0]["links"]["medium"] : "";
        this.productAllImages = [];
        imagesArr.forEach((element) =>
        {
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

    setProductVideo(videoArr)
    {
        if (
            this.productAllImages.length > 0 &&
            videoArr &&
            (videoArr as any[]).length > 0
        ) {
            this.setVideoSeoSchema(videoArr);
            (videoArr as any[]).reverse().forEach((element) =>
            {
                // append all video after first image and atleast has one image
                this.productAllImages.splice(1, 0, {
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

    refreshProductCrousel()
    {
        this.refreshSiemaItems$.next({
            items: this.productAllImages,
            type: "refresh",
            currentSlide: 0,
        });
    }

    // PDP Cart revamp : product quantity handle START HERE

    get cartQunatityForProduct()
    {
        return parseInt(this.qunatityFormControl.value) || 1;
    }

    onChangeCartQuanityValue()
    {
        this.checkCartQuantityAndUpdate(this.qunatityFormControl.value);
    }

    checkCartQuantityAndUpdate(value): void
    {
        if (!value) {
            this._tms.show({
                type: 'error',
                text: (value == 0) ? 'Minimum qty can be ordered is: 1' : 'Please enter a value quantity',
            })
            this.qunatityFormControl.setValue(this.productMinimmumQuantity);
        } else {
            if (parseInt(value) < parseInt(this.productMinimmumQuantity)) {
                this._tms.show({
                    type: 'error',
                    text: 'Minimum qty can be ordered is: ' + this.productMinimmumQuantity
                })
                this.qunatityFormControl.setValue(this.productMinimmumQuantity);
            } else if (parseInt(value) > parseInt(this.priceQuantityCountry['quantityAvailable'])) {
                this._tms.show({
                    type: 'error',
                    text: 'Maximum qty can be ordered is: ' + this.priceQuantityCountry['quantityAvailable']
                })
                this.qunatityFormControl.setValue(this.priceQuantityCountry['quantityAvailable']);
            } else if (isNaN(parseInt(value))) {
                this.qunatityFormControl.setValue(this.productMinimmumQuantity);
                this.checkBulkPriceMode();
            } else {
                this.qunatityFormControl.setValue(value);
                this.checkBulkPriceMode();
            }
        }
    }

    updateProductQunatity(type: 'INCREMENT' | 'DECREMENT')
    {
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

    checkForBulkPricesProduct()
    {
        if (this.rawProductData['productPartDetails'][this.productSubPartNumber]['productPriceQuantity']) {
            const productBulkPrices = this.rawProductData['productPartDetails'][this.productSubPartNumber]['productPriceQuantity']['india']['bulkPrices']['india'] || {};
            this.productBulkPrices = (Object.keys(productBulkPrices).length > 0) ? Object.assign([], productBulkPrices) : null;
            this.isBulkPricesProduct = this.productBulkPrices ? true : false;
            if (this.isBulkPricesProduct) {
                this.productBulkPrices = this.productBulkPrices.map(priceMap =>
                {
                    const discount = this.commonService.calculcateDiscount(null, this.productMrp, priceMap.bulkSellingPrice);
                    return { ...priceMap, discount }
                })
                //filtering Data to show the 
                this.productBulkPrices = this.productBulkPrices.filter((bulkPrice) =>
                {
                    return this.rawProductData['quantityAvailable'] >= bulkPrice['minQty'] && bulkPrice['minQty'] >= this.productMinimmumQuantity;

                });
                this.checkBulkPriceMode();
            }
        }
    }

    checkBulkPriceMode()
    {
        if (this.isBulkPricesProduct) {
            const selectedProductBulkPrice = this.productBulkPrices.filter(prices => (this.cartQunatityForProduct >= prices.minQty && this.cartQunatityForProduct <= prices.maxQty));
            this.selectedProductBulkPrice = (selectedProductBulkPrice.length > 0) ? selectedProductBulkPrice[0] : null;
            if(this.selectedProductBulkPrice){
                this.bulkPriceWithoutTax = this.selectedProductBulkPrice['bulkSPWithoutTax'];
            }
        }
    }

    selectProductBulkPrice(qunatity)
    {
        if (qunatity > this.priceQuantityCountry['quantityAvailable']) {
            this._tms.show({
                type: 'error',
                text: 'Maximum qty can be ordered is: ' + this.priceQuantityCountry['quantityAvailable']
            })
            return;
        }
        this.checkBulkPriceMode();
    }

    // PDP Cart revamp : product quantity handle END HERE

    async loadProductShare()
    {
        if (!this.productShareInstance) {
            const shareURL = this.baseDomain + this.router.url;
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
                productName: this.productName,
                canonicalUrl: this.productUrl,
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
            ).subscribe((status) =>
            {
                this.productShareInstance = null;
                this.productShareContainerRef.detach();
            });
        } else {
            //toggle side menu
            this.productShareInstance.instance["btmMenu"] = true;
        }
    }
    // return, replacement, warranty info popup
    async loadReturnInfo()
    {
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
            this.returnInfoInstance.instance['isBrandMsn'] = this.isBrandMsn;
            this.returnInfoInstance.instance['show'] = true;
            (
                this.returnInfoInstance.instance["removed"] as EventEmitter<boolean>
            ).subscribe((status) =>
            {
                this.returnInfoInstance = null;
                this.returnInfoContainerRef.detach();
            });
            (
                this.returnInfoInstance.instance["navigateToFAQ$"] as EventEmitter<boolean>
            ).subscribe((status) =>
            {
                this.navigateToFAQ();
            });
        } else {
            //toggle side menu
            this.returnInfoInstance.instance["show"] = true;
        }
    }

    // Wishlist related functionality
    getPurchaseList()
    {
        if (!this.rawProductData) {
            return;
        }
        this.isPurcahseListProduct = false;
        if (this.localStorageService.retrieve("user")) {
            const user = this.localStorageService.retrieve("user");
            if (user.authenticated == "true") {
                const request = { idUser: user.userId, userType: "business" };

                this.productService.getPurchaseList(request).subscribe((res) =>
                {
                    this.showLoader = false;
                    if (res["status"] && res["statusCode"] == 200) {
                        let purchaseLists: Array<any> = [];
                        purchaseLists = res["data"];
                        purchaseLists.forEach((element) =>
                        {
                            if (
                                (element.productDetail.productBO &&
                                    element.productDetail.productBO.partNumber ==
                                    this.defaultPartNumber) ||
                                (element.productDetail.productBO &&
                                    element.productDetail.productBO.partNumber ==
                                    this.productSubPartNumber)
                            ) {
                                this.isPurcahseListProduct = true;
                            }
                        });
                    }
                });
            }
        }
    }

    addToPurchaseList()
    {
        if (this.isPurcahseListProduct) {
            this.removeItemFromPurchaseList();
        } else {
            if (this.localStorageService.retrieve("user")) {
                let user = this.localStorageService.retrieve("user");
                if (user && user.authenticated == "true") {
                    let userSession = this.localAuthService.getUserSession();
                    this.isPurcahseListProduct = true;
                    let obj = {
                        idUser: userSession.userId,
                        userType: "business",
                        idProduct: this.productSubPartNumber || this.defaultPartNumber,
                        productName: this.productName,
                        description: this.productDescripton,
                        brand: this.productBrandDetails["brandName"],
                        category: this.productCategoryDetails["categoryCode"],
                    };
                    this.showLoader = true;
                    this.productService.addToPurchaseList(obj).subscribe((res) =>
                    {
                        this.showLoader = false;
                        if (res["status"]) {
                            this._tms.show({
                                type: "success",
                                text: this.productStaticData.successfully_added_to_wishlist,
                            });
                        }
                    });
                } else {
                    this.goToLoginPage(this.productUrl);
                }
            } else {
                this.goToLoginPage(this.productUrl);
            }
        }
    }
    // TODO : these function is not used in PWA,remove after confirming with team
    removeItemFromPurchaseList()
    {
        this.showLoader = true;
        let userSession = this.localAuthService.getUserSession();
        let obj = {
            idUser: userSession.userId,
            userType: "business",
            idProduct: this.productSubPartNumber || this.defaultPartNumber,
            productName: this.productName,
            description: this.productDescripton,
            brand: this.productBrandDetails["brandName"],
            category: this.productCategoryDetails["categoryCode"],
        };

        this.productService.removePurchaseList(obj).subscribe(
            (res) =>
            {
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
            (err) =>
            {
                this.showLoader = false;
            }
        );
    }

    // Frequently brought togther functions

    productFbtData()
    {
        let msn: string = this.route.snapshot.params['msnid'] || '';
        if(msn == null || msn.length == 0 || msn == undefined) {
            msn = this.msn; // takes the msn from the API response if router snapshot is not present
        }
        if(msn && msn.length) {
            this.productService
                .getFBTProducts(msn)
                .subscribe((rawProductFbtData) =>
                {
                    this.fetchFBTProducts(
                        this.rawProductData,
                        Object.assign({}, rawProductFbtData)
                    );
                });
        }
    }

    fetchFBTProducts(productBO, rawProductFbtData)
    {
        if (this.productOutOfStock) {
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
            } else {
                this.fbtFlag = false;
            }
        } else {
            this.productUtil.resetFBTSource();
        }
    }

    sendProductImageClickTracking(infoStr = "")
    {
        let page = {
            channel: "pdp image carausel" + infoStr,
            pageName: "moglix:image carausel:pdp" + infoStr,
            linkName: "moglix:productmainimageclick_0",
            subSection: "moglix:pdp carausel main image:pdp",
            linkPageName: "moglix:" + this.router.url,
        };
        this.analytics.sendAdobeCall({ page }, "genericPageLoad");
    }

    async showFBT()
    {
        // if (this.fbtFlag) {
        //     const TAXONS = this.taxons;
        //     let page = {
        //         pageName: `moglix:${TAXONS[0]}:${TAXONS[1]}:${TAXONS[2]}:pdp`,
        //         channel: "About This Product",
        //         subSection: null,
        //         linkPageName: null,
        //         linkName: null,
        //         loginStatus: this.commonService.loginStatusTracking,
        //     };
        //     let analytics = {
        //         page: page,
        //         custData: this.commonService.custDataTracking,
        //         order: this.orderTracking,
        //     };
        //     this.modalService.show({
        //         inputs: {
        //             modalData: {
        //                 isModal: true,
        //                 backToCartFlow: this.addToCartFromModal.bind(this),
        //                 analytics: analytics,
        //                 productQuantity :this.cartQunatityForProduct
        //             },
        //         },
        //         component: FbtComponent,
        //         outputs: {},
        //         mConfig: { className: "ex" },
        //     });
        // } else {
            this.addToCart(false);
        // }
    }

    // cart methods 
    addToCart(buyNow: boolean) {
        if(buyNow){
            this.globalLoader.setLoaderState(true);
            this.validateQuickCheckout().subscribe((res) => {
              if (res != null) {
                this.globalLoader.setLoaderState(false);
                this.quickCheckoutPopUp(res.address);
                this.commonService.setBodyScroll(null, false); 
                this.analyticAddToCart(buyNow, this.cartQunatityForProduct , true);
              } else {
                this.addToCartFromModal(buyNow);
                this.globalLoader.setLoaderState(false);
              }
            });
        }else{
            this.addToCartFromModal(buyNow);
        }
    }
    
    async quickCheckoutPopUp( address) {
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
        this.quickOrderInstance.instance["productPrice"] = this.productPrice;
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
                const cartSession = Object.assign({}, this.cartService.getCartSession())
                const postBody = {
                  productId: [this.rawProductData["defaultPartNumber"]],
                  toPincode:
                    response.addressDetails["shippingAddress"][0]["zipCode"],
                  price: this.productPrice,
                  orderPlatform :CONSTANTS.DEVICE.device,
                addressId : response.addressDetails["shippingAddress"][0]["idAddress"],
                cartId : cartSession['cart']['cartId'],
                userId : cartSession['cart']['userId'],
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
  
    getServiceAvailabilityVerification(ress , address) {
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
                res["lastOrderDetails"][len].addressType == 'shipping'  && 
                res["lastOrderDetails"][len]["addressDetails"] && 
                res["lastOrderDetails"][len]["addressDetails"]["shippingAddress"] 
                && res["lastOrderDetails"][len]["addressDetails"]["shippingAddress"].length == 1
                );
            const isValidBillingAddress = (
                res["lastOrderDetails"][len].addressType == 'billing'  && 
                res["lastOrderDetails"][len]["addressDetails"] && 
                res["lastOrderDetails"][len]["addressDetails"]["billingAddress"] &&
                res["lastOrderDetails"][len]["addressDetails"]["billingAddress"].length == 1 &&
                res["lastOrderDetails"][len]["addressDetails"]["shippingAddress"] &&
                res["lastOrderDetails"][len]["addressDetails"]["shippingAddress"].length == 1
                );    
            if(isValidShippingAddress || isValidBillingAddress){
                return {
                    addressDetails: res["lastOrderDetails"][len]["addressDetails"],
                    addressType: res["lastOrderDetails"][len]["addressType"],
                  };
            }else{
                return null
            }
          
        } else {
          return null;
        }
      } else {
        return null;
      }
    }

    addToCartFromModal(buyNow: boolean)
    {
        // console.log('originalProductBO', this.originalProductBO);
        const cartAddToCartProductRequest = this.cartService.getAddToCartProductItemRequest({
            productGroupData: this.rawProductData,
            buyNow: buyNow,
            selectPriceMap: this.selectedProductBulkPrice,
            quantity: this.cartQunatityForProduct,
            languageMode: this.isHindiUrl,
            originalProductBO: this.originalProductBO,
        });
        this.cartService.addToCart({ buyNow, productDetails: cartAddToCartProductRequest }).subscribe(result =>
        {
            // analytic events needs to called here
            this.analyticAddToCart(buyNow, this.cartQunatityForProduct , false);
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

    intialAddtoCartSocketAnalyticEvent(buynow: boolean)
    {
        var trackingData = {
            event_type: "click",
            label: !buynow ? "add_to_cart" : "buy_now",
            product_name: this.productName,
            msn: this.productSubPartNumber || this.defaultPartNumber,
            brand: this.productBrandDetails["brandName"],
            price: this.productPrice,
            quantity: Number(this.cartQunatityForProduct),
            channel: "PDP",
            category_l1: this.productCategoryDetails["taxonomy"].split("/")[0] ? this.productCategoryDetails["taxonomy"].split("/")[0] : null,
            category_l2: this.productCategoryDetails["taxonomy"].split("/")[1] ? this.productCategoryDetails["taxonomy"].split("/")[1] : null,
            category_l3: this.productCategoryDetails["taxonomy"].split("/")[2] ? this.productCategoryDetails["taxonomy"].split("/")[2] : null,
            page_type: "product_page",
        };
        this.analytics.sendToClicstreamViaSocket(trackingData);
    }

    updateAddtoCartSocketAnalyticEvent(buynow: boolean)
    {
        const cartSession = Object.assign({}, this.cartService.getCartSession())
        let totQuantity = 0;
        let trackData = {
            event_type: "click",
            page_type: "product_page",
            label: "cart_updated",
            channel: "PDP",
            price: cartSession["cart"]["totalPayableAmount"] ? cartSession["cart"]["totalPayableAmount"].toString() : "",
            quantity: cartSession["itemsList"].map((item) =>
            {
                return (totQuantity = totQuantity + item.productQuantity);
            })[cartSession["itemsList"].length - 1],
            shipping: parseFloat(cartSession["shippingCharges"]),
            itemList: cartSession["itemsList"].map((item) =>
            {
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

    fireViewBasketEvent(cartSession)
    {
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
                    brandId: this.productBrandDetails["idBrand"],
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
            if(criteoItem && criteoItem.length) {
                this.analytics.sendGTMCall(dataLayerObj);
            }
            this.globalAnalyticsService.sendMessage(dataLayerObj);
        }
    }

    // common functions
    goToLoginPage(link, title?, clickedFrom?: string)
    {
        const queryParams = { backurl: link };
        if (title) queryParams['title'] = title;
        if (clickedFrom) queryParams['state'] = clickedFrom;
        this.localAuthService.setBackURLTitle(link, title);
        let navigationExtras: NavigationExtras = { queryParams: queryParams };
        this.router.navigate(["/login"], navigationExtras);
    }

    navigateToFAQ()
    {
        this.router.navigate(["faq", { active: "CRP" }]);
    }

    // dynamically load similar section
    async onVisibleSimilar(htmlElement)
    {
        if (!this.similarProductInstance && !this.productOutOfStock) {
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
            this.similarProductInstance.instance["productName"] = this.productName;
            this.similarProductInstance.instance["categoryCode"] =
                this.productCategoryDetails["categoryCode"];

            this.similarProductInstance.instance["outOfStock"] =
                this.productOutOfStock;
            (
                this.similarProductInstance.instance[
                "similarDataLoaded$"
                ] as EventEmitter<any>
            ).subscribe((data) =>
            {
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
    }


    async onVisibleproductPriceCompare(htmlElement)
    {
        if (!this.productPriceCompareInstance && !this.productOutOfStock && this.compareProductsData.length > 0) {
            const { ProductPriceCompareComponent } = await import(
                "./../../components/product-price-compare/product-price-compare.component"
            );
            const factory = this.cfr.resolveComponentFactory(
                ProductPriceCompareComponent
            );
            this.productPriceCompareInstance =
                this.productPriceCompareContainerRef.createComponent(
                    factory,
                    null,
                    this.injector
                );

            this.productPriceCompareInstance.instance["compareProductsData"] = this.compareProductsData;
            
           
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
    }

    readonly oosSimilarcardFeaturesConfig: ProductCardFeature = {
        // feature config
        enableAddToCart: true,
        enableBuyNow: true,
        enableFeatures: false,
        enableRating: true,
        enableVideo: false,
        // design config
        enableCard: true,
        verticalOrientation: false,
        horizontalOrientation: true,
        lazyLoadImage: true
    }

    oosCardIndex = -1;
    async onVisibleSimilarOOS(event)
    {
        if (!this.similarProductInstanceOOS && this.productOutOfStock) {
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
                ).subscribe((data) =>
                {
                    this.openPopUpcrousel(0, data);
                });
                // Show All click Handler
                (
                    this.similarProductInstanceOOS.instance[
                    "showAllKeyFeatureClickEvent"
                    ] as EventEmitter<any>
                ).subscribe((data) =>
                {
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
                ).subscribe((data) =>
                {
                    this.oosCardIndex = data;
                    this.handlemetaUpdateEvent(data);
                });
                // rating review event handler
                (
                    this.similarProductInstanceOOS.instance[
                    "ratingReviewClickEvent"
                    ] as EventEmitter<any>
                ).subscribe((data) =>
                {
                    this.handleReviewRatingPopup(data);
                });
                // rating review event handler
                (
                    this.similarProductInstanceOOS.instance[
                    "updateScrollToTop"
                    ] as EventEmitter<any>
                ).subscribe((data) =>
                {
                    this.showScrollToTopButton = data;
                });
            }
        }
        this.holdRFQForm = false;
    }

    handlemetaUpdateEvent(index)
    {
        this.setMetatag(index);
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

    // dynamically recent products section
    
    async onVisibleRecentProduct(htmlElement)
    {
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
                this.productOutOfStock;
            this.recentProductsInstance.instance["recentProductList"] = this.recentProductItems;    
            this.recentProductsInstance.instance["moduleUsedIn"] = this.productNotFound ? "PRODUCT_RECENT_PRODUCT_PDP_PAGE_NOT_FOUND" : "PRODUCT_RECENT_PRODUCT";
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

    getBrandLink(brandDetails: {})
    {
        if (brandDetails == undefined) {
            return [];
        }
        let d = brandDetails["friendlyUrl"];
        return ["/brands/" + d.toLowerCase()];
    }

    postUserQuestion()
    {
        this.questionMessage = "";
        if (this.localStorageService.retrieve("user")) {
            let user = this.localStorageService.retrieve("user");
            if (user.authenticated == "true") {
                let obj = {
                    // new obj for post user question
                    categoryCode: this.productCategoryDetails["categoryCode"],
                    categoryName: this.productCategoryDetails["categoryName"],
                    customerId: user.userId,
                    productMsn: this.productSubPartNumber || this.defaultPartNumber,
                    questionText: this.questionAnswerForm.controls["question"].value,
                    taxonomy: this.productCategoryDetails["taxonomy"],
                    taxonomyCode: this.productCategoryDetails["taxonomyCode"],
                };
                this.productService.postQuestion(obj).subscribe((res) =>
                {
                    if (res["code"] == 200) {
                        this.questionAnswerForm.reset();
                        this.loadAlertBox("Your question is successfully submitted");
                    }
                });
            } else {
                this.goToLoginPage(this.productUrl);
            }
        } else {
            this.goToLoginPage(this.productUrl);
        }
    }

    toggleLoader(status)
    {
        this.showLoader = status;
    }

    // product-rfq
    getBestPrice($event)
    {
        this.holdRFQForm = false;
        this.onVisibleProductRFQ($event);
    }

    toggleLanguageFile(){
        
    }

    async onVisibleProductRFQ(htmlElement, isFromScroll = false)
    {
        isFromScroll && this.onVisibleSimilarOOS(null);
        if (this.holdRFQForm) return
        this.removeRfqForm();
        if (!this.productRFQInstance) {
            this.intiateRFQQuote(true, false);
        }
    }

    async raiseRFQQuote()
    {
        let user = this.localStorageService.retrieve("user");
        if (user && user.authenticated == "true") {
            this.location.replaceState(this.mainProductURL);
            !user['phone'].length ? this.intiateRFQQuote(true) : this.raiseRFQGetQuote(user);
        } else {
            this.goToLoginPage(this.productUrl, "Continue to raise RFQ", "raiseRFQQuote");
        }
    }

    closeRFQAlert()
    {
        this.isRFQSuccessfull = false;
    }

    processRFQGetQuoteData(user)
    {
        let data = { rfqEnquiryCustomer: null, rfqEnquiryItemsList: null };
        let product = {
            url: this.productUrl,
            price: this.productPrice,
            msn: this.productSubPartNumber || this.defaultPartNumber,
            productName: (this.isHindiUrl) ? this.originalProductBO['productName'] : this.productName,
            moq: this.productMinimmumQuantity,
            brand: (this.isHindiUrl) ? this.originalProductBO['brandDetails']['brandName'] : this.productBrandDetails["brandName"],
            taxonomyCode: this.productCategoryDetails["taxonomy"],
            adobeTags: "",
        };

        data['rfqEnquiryCustomer'] = {
            'customerId': user['userId'],
            'device': 'mobile',
            'email': user['email'] ? user['email'] : '',
            'firstName': user['userName'],
            'mobile': user['phone'],
            'rfqValue': this.productPrice * this.qunatityFormControl.value,
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
    raiseRFQGetQuote(user)
    {
        let data = this.processRFQGetQuoteData(user);
        let params = { customerId: user.userId, invoiceType: "retail" };
        let product = {
            url: this.productUrl,
            productName: (this.isHindiUrl)? this.originalProductBO['productName']  : this.productName,
            moq: this.productMinimmumQuantity,
        };
        this.raiseRFQGetQuoteSubscription = this.commonService.getAddressList(params).subscribe(res =>
        {
            if (res['status'] && res['addressList'].length > 0) {
                data['rfqEnquiryCustomer']['pincode'] = res['addressList'][0]['postCode'];
            }
        });
        this.raiseRFQGetQuoteSubscription.add(() =>
        {
            this.productService.postBulkEnquiry(data).subscribe((response) =>
            {
                if (response['statusCode'] == 200) {
                    let rfqId = response['data'] ?? '';
                    this.intiateRFQQuoteUpdate(product , rfqId);
                   // this._tms.show({ type: 'success', text: response['statusDescription'] });
                    this.rfqQuoteRaised = true;
                    this.location.replaceState(this.mainProductURL);
                } else {
                    this._tms.show({ type: 'error', text: response['message']['statusDescription'] });
                }
            }, err =>
            {
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
        ).subscribe((loaderStatus) =>
        {
            this.toggleLoader(loaderStatus);
        });
        (
            this.productRFQUpdateInstance.instance["onRFQUpdateSuccess"] as EventEmitter<string>
        ).subscribe((status) => {
            this.isRFQSuccessfull = true;
        });
    }

    async intiateRFQQuote(inStock, sendAnalyticOnOpen = true)
    {
        const { ProductRFQComponent } = await import(
            "./../../components/product-rfq/product-rfq.component"
        ).finally(() =>
        {
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
        this.productRFQInstance.instance["isOutOfStock"] = this.productOutOfStock;
        this.productRFQInstance.instance["isPopup"] = inStock;
        let product = {
            url: this.productUrl,
            price: this.productPrice,
            msn: this.productSubPartNumber || this.defaultPartNumber,
            productName: this.productName,
            moq: this.productMinimmumQuantity,
            brand: this.productBrandDetails["brandName"],
            taxonomyCode: this.productCategoryDetails["taxonomy"],
            adobeTags: "",
        };
        this.productRFQInstance.instance["product"] = product;
        (
            this.productRFQInstance.instance["isLoading"] as EventEmitter<boolean>
        ).subscribe((loaderStatus) =>
        {
            this.toggleLoader(loaderStatus);
        });
        (
            this.productRFQInstance.instance["hasGstin"] as EventEmitter<boolean>
        ).subscribe((value) =>
        {
            this.hasGstin = value
        });
        (
            this.productRFQInstance.instance["rfqQuantity"] as EventEmitter<string>
        ).subscribe((rfqQuantity) =>
        {
            this.rfqTotalValue = rfqQuantity * Math.floor(this.productPrice);
        });
        (
            this.productRFQInstance.instance["rfqId"] as EventEmitter<boolean>
        ).subscribe((rfqid) =>
        {
            this.analyticRFQ(true);
            this.intiateRFQQuoteUpdate(product, rfqid);
        });
    }

    async onVisiblePincodeSection($event)
    {
        this.showLoader = true;
        const { ProductCheckPincodeComponent } = await import(
            "./../../components/product-check-pincode/product-check-pincode.component"
        ).finally(() =>
        {
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
            this.productSubPartNumber || this.defaultPartNumber;
        productInfo["estimatedDelivery"] =
            this.priceQuantityCountry["estimatedDelivery"];
        productInfo["categoryDetails"] = this.productCategoryDetails;
        productInfo["productPrice"] = this.productPrice;
        productInfo["quantity"] = quantity;
        productInfo["isHindiMode"] = this.isHindiUrl;
        this.pincodeFormInstance.instance["pageData"] = productInfo;
        if (this.pincodeFormInstance) {
            (
                this.pincodeFormInstance.instance[
                "sendAnalyticsCall"
                ] as EventEmitter<any>
            ).subscribe((data) =>
            {
                this.analyticPincodeAvaliabilty(data);
            });
        }
        //TODO 1705:check RFQ functionality after the changes
        // if (this.rfqFormInstance) {
        //     (this.rfqFormInstance.instance['isLoading'] as EventEmitter<boolean>).subscribe(loaderStatus =>
        //     {
        //         this.toggleLoader(loaderStatus);
        //     });
        // }
    }

    async onVisibleOffer()
    {
        if (!this.productOutOfStock && this.productMrp > 0) {
            const { ProductOffersComponent } = await import(
                "./../../components/product-offers/product-offers.component"
            );
            const factory = this.cfr.resolveComponentFactory(ProductOffersComponent);
            this.offerSectionInstance = this.offerSectionContainerRef.createComponent(
                factory,
                null,
                this.injector
            );
            let price = 0;
            let gstPercentage = this.taxPercentage;
            if (this.productPrice > 0 && this.bulkSellingPrice == null) {
                price = this.productPrice;
            } else if (this.bulkSellingPrice !== null) {
                price = this.productPrice;
            }
            this.offerSectionInstance.instance["price"] = price;
            this.offerSectionInstance.instance['gstPercentage'] = gstPercentage;
            this.offerSectionInstance.instance['productmsn'] = this.productSubPartNumber || this.defaultPartNumber;
            this.offerSectionInstance.instance['brandName'] = this.rawProductData["brandDetails"]['brandName'];
            this.offerSectionInstance.instance['categoryId'] = this.rawProductData["categoryDetails"][0]["categoryCode"];
            this.offerSectionInstance.instance['categoryName'] = this.rawProductData["categoryDetails"][0]["categoryName"];
            this.offerSectionInstance.instance['isHindiMode'] = this.isHindiUrl;
            (
                this.offerSectionInstance.instance[
                "viewPopUpHandler"
                ] as EventEmitter<boolean>
            ).subscribe((data) =>
            {
                this.viewPopUpOpen(data);
            });
            (
                this.offerSectionInstance.instance[
                "emaiComparePopUpHandler"
                ] as EventEmitter<boolean>
            ).subscribe((status) =>
            {
                this.emiComparePopUpOpen(status);
            });
            (
                this.offerSectionInstance.instance[
                "promoCodePopUpHandler"
                ] as EventEmitter<boolean>
            ).subscribe((data) =>
            {
                this.promoCodePopUpOpen(data);
            });
        }else{

        }
    }

    async promoCodePopUpOpen(data){
        if (!this.promoOfferPopupInstance) {
            this.showLoader = true;
            const { ProductMoreOffersComponent } = await import(
                "./../../components/product-more-offers/product-more-offers.component"
            ).finally(() =>
            {
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
            ).subscribe((data) =>
            {
                // create a new component after component is closed
                // this is required, to refresh input data
                this.promoOfferPopupInstance = null;
                this.promoOfferPopupContainerRef.remove();
            });
            (
                this.promoOfferPopupInstance.instance[
                "isLoading"
                ] as EventEmitter<boolean>
            ).subscribe((loaderStatus) =>
            {
                this.toggleLoader(loaderStatus);
            });
        }
    }

    async viewPopUpOpen(data)
    {
        if (!this.offerPopupInstance) {
            this.showLoader = true;
            const { ProductOfferPopupComponent } = await import(
                "./../../components/product-offer-popup/product-offer-popup.component"
            ).finally(() =>
            {
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
            let gstPercentage = this.taxPercentage;
            this.offerPopupInstance.instance['gstPercentage'] = gstPercentage;
            this.offerPopupInstance.instance["openMobikwikPopup"] = true;
            (
                this.offerPopupInstance.instance["out"] as EventEmitter<boolean>
            ).subscribe((data) =>
            {
                // create a new component after component is closed
                // this is required, to refresh input data
                this.offerPopupInstance = null;
                this.offerPopupContainerRef.remove();
            });
            (
                this.offerPopupInstance.instance[
                "isLoading"
                ] as EventEmitter<boolean>
            ).subscribe((loaderStatus) =>
            {
                this.toggleLoader(loaderStatus);
            });
        }
    }

    async emiComparePopUpOpen(status)
    {
        if (!this.offerComparePopupInstance && status) {
            this.showLoader = true;
            const quantity = this.cartQunatityForProduct;
            const { EmiPlansComponent } = await import(
                "./../../modules/emi-plans/emi-plans.component"
            ).finally(() =>
            {
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
            productInfo["productName"] = this.productName;
            productInfo["minimal_quantity"] = this.productMinimmumQuantity;
            productInfo["priceWithoutTax"] = this.priceWithoutTax;
            productInfo["productPrice"] = this.productPrice;
            this.offerComparePopupInstance.instance["productInfo"] = productInfo;
            this.offerComparePopupInstance.instance["quantity"] = quantity;
            this.offerComparePopupInstance.instance["openEMIPopup"] = true;
            (
                this.offerComparePopupInstance.instance["out"] as EventEmitter<boolean>
            ).subscribe((data) =>
            {
                // create a new component after component is closed
                // this is required, to refresh input data
                this.offerComparePopupInstance = null;
                this.offerComparePopupContainerRef.detach();
            });
            (
                this.offerComparePopupInstance.instance[
                "isLoading"
                ] as EventEmitter<boolean>
            ).subscribe((loaderStatus) =>
            {
                this.toggleLoader(loaderStatus);
            });
        }
    }

    getFbtIntance()
    {
        // if (!this.fbtComponentInstance) {
            // const { FbtComponent } = await import(
            //     "./../../components/fbt/fbt.component"
            // );
            // const factory = this.cfr.resolveComponentFactory(FbtComponent);
            // this.fbtComponentInstance = this.fbtComponentContainerRef.createComponent(
            //     factory,
            //     null,
            //     this.injector
            // );
            //this.fbtComponentInstance.instance['addToCartFromModal'] = this.addToCartFromModal.bind(this);
            // this.fbtComponentInstance.instance["isModal"] = false;
            // this.fbtComponentInstance.instance["originalProductBO"] = this.originalProductBO;
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
        // }
    }

    async showAddToCartToast()
    {
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
            ).subscribe((status) =>
            {
                this.addToCartToastInstance = null;
                this.addToCartToastContainerRef.detach();
            });
        }
    }

    async writeReview(index = -1)
    {
        let user = this.localStorageService.retrieve("user");
        if (user && user.authenticated == "true") {
            this.sendProductInfotracking("write a review");
            if (!this.writeReviewPopupInstance) {
                this.showLoader = true;
                const { PostProductReviewPopupComponent } = await import(
                    "../../components/post-product-review-popup/post-product-review-popup.component"
                ).finally(() =>
                {
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
                productInfo["productName"] = (index > -1) ? this.productService.oosSimilarProductsData.similarData[index].productName : this.productName;
                productInfo["partNumber"] =
                    (index > -1) ? (this.productService.oosSimilarProductsData.similarData[index].productSubPartNumber || this.productService.oosSimilarProductsData.similarData[index].defaultPartNumber) : (this.productSubPartNumber || this.defaultPartNumber);

                this.writeReviewPopupInstance.instance["productInfo"] = productInfo;
                (
                    this.writeReviewPopupInstance.instance[
                    "removed"
                    ] as EventEmitter<boolean>
                ).subscribe((status) =>
                {
                    this.writeReviewPopupInstance = null;
                    this.writeReviewPopupContainerRef.detach();
                });

                (
                    this.writeReviewPopupInstance.instance[
                    "submitted"
                    ] as EventEmitter<boolean>
                ).subscribe((status) =>
                {
                    this.loadAlertBox(
                        "Review Submitted Successfully",
                        `Thankyou for giving us your <br /> valuable time.`
                    );
                });
            }
        } else {
            this.goToLoginPage(this.productUrl + ((this.fragment && this.fragment.length) ? `#${this.fragment}` : ''));
        }
    }

    backTrackIndex = -1;
    attachBackClickHandler()
    {
        window.addEventListener('popstate', (event) =>
        {
            //Your code here
            let url = this.backTrackIndex < 0 ? this.rawProductData.defaultCanonicalUrl : this.productService.oosSimilarProductsData.similarData[this.backTrackIndex]["productUrl"];
            window.history.replaceState('', '', url);
        });
    }

    handleRestoreRoutingForPopups()
    {
        window.history.replaceState('', '', this.commonService.getPreviousUrl);
        window.history.pushState('', '', this.router.url);
    }

    updateBackHandling() {
        window.history.replaceState('', '', this.pageUrl);
        window.history.pushState('', '', this.pageUrl);
    }

    async openPopUpcrousel(slideNumber: number = 0, oosProductIndex: number = -1)
    {
        if (!this.popupCrouselInstance) {
            this.showLoader = true;
            this.displayCardCta = true;
            const { ProductCrouselPopupComponent } = await import("../../components/product-crousel-popup/product-crousel-popup.component").finally(() =>
            {
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
            (this.popupCrouselInstance.instance["out"] as EventEmitter<boolean>).subscribe((status) =>
            {
                // this.productService.notifyImagePopupState.next(false);
                this.clearImageCrouselPopup()
            });
            (this.popupCrouselInstance.instance["currentSlide"] as EventEmitter<boolean>).subscribe((slideData) =>
            {
                if (slideData) {
                    this.moveToSlide$.next(slideData.currentSlide);
                }
            });
            this.backTrackIndex = oosProductIndex;
        }
    }

    private clearImageCrouselPopup()
    {
        this.displayCardCta = false;
        if(this.popupCrouselInstance) {
            this.popupCrouselInstance = null;
            this.popupCrouselContainerRef.remove();
        }
        this.backUrlNavigationHandler();
        this.commonService.setBodyScroll(null, true);
    }

    // async loadProductCrousel(slideIndex)
    // {
    //     if (!this.productCrouselInstance) {
    //         this.isProductCrouselLoaded = true;
    //         const { ProductCrouselComponent } = await import(
    //             "../../modules/product-crousel/ProductCrousel.component"
    //         ).finally(() =>
    //         {
    //             this.clearPseudoImageCrousel();
    //         });
    //         const factory = this.cfr.resolveComponentFactory(ProductCrouselComponent);
    //         this.productCrouselInstance =
    //             this.productCrouselContainerRef.createComponent(
    //                 factory,
    //                 null,
    //                 this.injector
    //             );
    //         this.productCrouselInstance.instance["options"] = this.iOptions;
    //         this.productCrouselInstance.instance["items"] = this.productAllImages;
    //         this.productCrouselInstance.instance["productBo"] = this.rawProductData;
    //         this.productCrouselInstance.instance["moveToSlide$"] = this.moveToSlide$;
    //         this.productCrouselInstance.instance["refreshSiemaItems$"] =
    //             this.refreshSiemaItems$;
    //         this.productCrouselInstance.instance["productName"] = this.productName;
    //         this.productCrouselInstance.instance["productOutOfStock"] = this.productOutOfStock;
    //         setTimeout(() =>
    //         {
    //             (
    //                 this.productCrouselInstance.instance[
    //                 "moveToSlide$"
    //                 ] as Subject<number>
    //             ).next(slideIndex);
    //         }, 100);
    //     } else {
    //         this.productCrouselInstance.instance["productOutOfStock"] = this.productOutOfStock;
    //     }
    // }

    // clearPseudoImageCrousel()
    // {
    //     this.isProductCrouselLoaded = false;
    // }

    // onRotatePrevious()
    // {
    //     this.loadProductCrousel(this.productAllImages.length - 1);
    // }

    // onRotateNext()
    // {
    //     this.loadProductCrousel(1);
    // }

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

    async loadAlertBox(
        mainText,
        subText = null,
        extraSectionName: string = null
    )
    {
        if (!this.alertBoxInstance) {
            this.showLoader = true;
            const { AlertBoxToastComponent } = await import(
                "../../components/alert-box-toast/alert-box-toast.component"
            ).finally(() =>
            {
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
            ).subscribe((status) =>
            {
                this.alertBoxInstance = null;
                this.alertBoxContainerRef.detach();
            });
            setTimeout(() =>
            {
                this.alertBoxInstance = null;
                this.alertBoxContainerRef.detach();
            }, 2000);
        }
    }

    async onVisibleAppPromo(event)
    {
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
        this.appPromoInstance.instance["productMsn"] = this.defaultPartNumber;
        this.appPromoInstance.instance["productData"] = this.rawProductData;
        this.appPromoInstance.instance["isLazyLoaded"] = true;
        (
            this.appPromoInstance.instance["appPromoStatus$"] as EventEmitter<boolean>
        ).subscribe((status) =>
        {
            this.appPromoVisible = status;
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
                                this.rawReviewsData.reviewList[i]["isReviewHelpfulCountYes"] = newRes['data']['reviewList'][i]["isReviewHelpfulCountYes"];
                                this.rawReviewsData.reviewList[i]['like'] = reviewValue == 'yes' ? 1 : 0;
                                this.rawReviewsData.reviewList[i]['dislike'] = reviewValue == 'no' ? 1 : 0;
                                this.rawReviewsData.reviewList[i]["isReviewHelpfulCountNo"] = newRes['data']['reviewList'][i]["isReviewHelpfulCountNo"];
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
                this.goToLoginPage(this.productUrl);
            }
        } else {
            this.goToLoginPage(this.productUrl);
        }
    }
    
    handlePostHelpful(args: Array<any>) {
        this.postHelpful(args[0], args[1], args[2]);
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

    showYTVideo1(link) {
        this.showYTVideo(link)
    }

    // SEO SECTION STARTS
    /**
     * Please place all functional code above this section
     */

    getProductURL()
    {
        const productURL =
            this.rawProductData.productPartDetails[this.productSubPartNumber][
            "canonicalUrl"
            ];
        const finalURL = productURL ? productURL : this.productUrl;
        return finalURL;
    }
    
    setMetatag(index: number = -1)
    {
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
                title: this.productName,
                productName: this.productName,
                pageTitleName: this.productName,
                pwot: this.priceWithoutTax,
                quantityAvailable: this.rawProductData["quantityAvailable"],
                productPrice: this.productPrice,
                productOutOfStock: this.productOutOfStock,
                seoDetails: this.rawProductData["seoDetails"],
                productBrandDetails: this.productBrandDetails,
                productCategoryDetails: this.productCategoryDetails,
                productDefaultImage: this.productDefaultImage,
                productUrl: this.productUrl,
                defaultCanonicalUrl: this.rawProductData["defaultCanonicalUrl"]
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
                this.pageTitle.setTitle("खरीदें "+ metaObj.productName + " ऑनलाइन सबसे अच्छी कीमत पर मोगलिक्स से" );
            } else {
                this.pageTitle.setTitle("खरीदें "+ metaObj.productName + " ऑनलाइन कीमत ₹" + metaObj.productPrice + " में"
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
            metaDescription = metaObj["seoDetails"]["metaDescription"].replace('___productPrice___', '₹'+this.productPrice);
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
            content: (this.hindiUrl)? CONSTANTS.PROD + this.router.url : CONSTANTS.PROD + "/" + this.getProductURL(),
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
            if (this.isHindiUrl){
                url = CONSTANTS.PROD + this.hindiUrl;
            }
            else{
                url = CONSTANTS.PROD + '/' + metaObj.productUrl;
            }
            const baseUrl = this.isHindiUrl ? CONSTANTS.PROD + '/hi/' : CONSTANTS.PROD + '/'
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
            else{
                if(!metaObj.productUrl){
                    url = baseUrl + this.getProductURL();
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

    setQuestionAnswerSchema()
    {
        if (this.isServer && this.rawProductData) {
            const qaSchema: Array<any> = [];
            if (this.isServer) {
                const questionAnswerList = this.questionAnswerList["data"];
                if (questionAnswerList["totalCount"] > 0) {
                    (questionAnswerList["qlist"] as []).forEach((element, index) =>
                    {
                        qaSchema.push({
                            "@type": "Question",
                            name: 
                            element["questionText"],
                            acceptedAnswer: {
                                "@type": "Answer",
                                text: element["answerText"],
                            },
                        });
                    });
                    let qna = this.renderer2.createElement("script");
                    qna.type = "application/ld+json";
                    qna.text = JSON.stringify({
                        "@context": CONSTANTS.SCHEMA,
                        "@type": "FAQPage",
                        mainEntity: qaSchema,
                    });
                    this.renderer2.appendChild(this.document.head, qna);
                }
            }
        }
    }

    setProductSeoSchema()
    {
        if (this.isServer && this.rawProductData) {
            let inStock = !this.productOutOfStock
                ? "http://schema.org/InStock"
                : "http://schema.org/OutOfStock";
            let reviewCount =
                this.rawReviewsData.summaryData.reviewCount > 0
                    ? this.rawReviewsData.summaryData.reviewCount
                    : 1;
            let ratingValue =
                this.rawReviewsData.summaryData.finalAverageRating > 0
                    ? this.rawReviewsData.summaryData.finalAverageRating
                    : 3.5;
            let imageSchema = this.renderer2.createElement("script");
            imageSchema.type = "application/ld+json";

            imageSchema.text = JSON.stringify({
                "@context": CONSTANTS.SCHEMA,
                "@type": "ImageObject",
                url: this.productDefaultImage,
                name: this.productName,
            });

            this.renderer2.appendChild(this.document.head, imageSchema);

            if (this.productPrice > 0) {
                let s = this.renderer2.createElement("script");
                s.type = "application/ld+json";
                let desc = this.productDescripton;
                if (!desc) {
                    desc = `${this.productName} is a premium quality ${this.productCategoryDetails["categoryName"]} from ${this.productBrandDetails["brandName"]}. Moglix is a well-known ecommerce platform for qualitative range of ${this.productCategoryDetails["categoryName"]}. All ${this.productName} are manufactured by using quality assured material and advanced techniques, which make them up to the standard in this highly challenging field. The materials utilized to manufacture ${this.productName}, are sourced from the most reliable and official ${this.productCategoryDetails["categoryName"]} vendors, chosen after performing detailed market surveys. Thus, ${this.productBrandDetails["brandName"]} products are widely acknowledged in the market for their high quality. We are dedicatedly involved in providing an excellent quality array of ${this.productBrandDetails["brandName"]} ${this.productCategoryDetails["categoryName"]}.`;
                }
                let schema = {
                    "@context": CONSTANTS.SCHEMA,
                    "@type": "Product",
                    name: this.productName,
                    image: [this.productDefaultImage],
                    description: desc,
                    sku: this.productSubPartNumber,
                    mpn: this.productSubPartNumber,
                    brand: {
                        "@type": "Brand",
                        name: this.productBrandDetails["brandName"],
                    },
                    aggregateRating: {
                        "@type": "AggregateRating",
                        ratingValue: ratingValue,
                        reviewCount: reviewCount,
                        bestRating: "5",
                        worstRating: "1",
                    },
                    offers: {
                        "@type": "Offer",
                        url: CONSTANTS.PROD + this.router.url,
                        priceCurrency: "INR",
                        price: (
                            this.productPrice * this.productMinimmumQuantity
                        ).toString(),
                        itemCondition: CONSTANTS.SCHEMA + "/NewCondition",
                        availability: inStock,
                        seller: {
                            "@type": "Organization",
                            name: "Moglix",
                        },
                        acceptedPaymentMethod: [
                            {
                                "@type": "PaymentMethod",
                                "@id": CONSTANTS.ByBankTransferInAdvance,
                            },
                            {
                                "@type": "PaymentMethod",
                                "@id": CONSTANTS.ByCOD,
                            },
                            {
                                "@type": "PaymentMethod",
                                "@id": CONSTANTS.ByPaymentMethodCreditCard,
                            },
                            {
                                "@type": "PaymentMethod",
                                "@id": CONSTANTS.ByMasterCard,
                            },
                            {
                                "@type": "PaymentMethod",
                                "@id": CONSTANTS.ByVISA,
                            },
                        ],
                    },
                };

                if (!this.priceQuantityCountry) {
                    delete schema["offers"]["availability"];
                } else if (!this.priceQuantityCountry["quantityAvailable"]) {
                    delete schema["offers"]["availability"];
                } else if (this.priceQuantityCountry["quantityAvailable"] == 0) {
                    delete schema["offers"]["availability"];
                }
                if (
                    this.rawReviewsData?.summaryData?.finalAverageRating === 0 ||
                    null ||
                    ""
                ) {
                    delete schema["aggregateRating"];
                }

                s.text = JSON.stringify(schema);
                this.renderer2.appendChild(this.document.head, s);
            } else {
                console.log("product schema not created due to price zero");
            }
        } else {
            console.log("product schema not created");
        }
    }

    setVideoSeoSchema(videoArr)
    {
        if (this.isServer && this.rawProductData && videoArr[0] && videoArr[0]['title'] && videoArr[0]['description'] && videoArr[0]['link'] && videoArr[0]['publishedDate']) {        
            let firstVideoData=videoArr[0];
            let videoSchema = this.renderer2.createElement("script");
            videoSchema.type = "application/ld+json";
            videoSchema.text = JSON.stringify({
                "@context": CONSTANTS.SCHEMA,
                "@type": "VideoObject",
                name:(firstVideoData['title']) ? firstVideoData['title'] : null,
                description:(firstVideoData['description']) ? firstVideoData['description'] : null,
                thumbnailUrl:(firstVideoData['link']) ?  this._ytThumbnail.transform(firstVideoData['link'],'hqdefault') : null,
                uploadDate:(firstVideoData['publishedDate']) ?  this.datePipe.transform(firstVideoData['publishedDate'], 'yyyy-MM-dd')  : null,
                embedUrl:(firstVideoData['link']) ? firstVideoData['link'] : null
               
            });
            this.renderer2.appendChild(this.document.head, videoSchema);        
            }
        
    }
    // ANALYTIC CODE SECTION STARTS
    /**
     * Please place all functional code above this section
     */
    callAnalyticForVisit()
    {
        if (this.isBrowser && this.rawProductData) {
            this.setSessionForClickSection();
            this.productVisitAdobe();
            this.productVisitGTM();
            this.productVisitViaSocket();
            this.productVisitViaAPI();
        }
    }

    setSessionForClickSection()
    {
        if (this.isBrowser && sessionStorage.getItem("pdp-page")) {
            this.commonService.setSectionClick(sessionStorage.getItem("pdp-page"));
        }
    }

    productVisitViaSocket()
    {
        const dataTracking = {
            active_tags: null,
            event_type: "page_load",
            label: "view",
            rating: this.productRating,
            product_name: this.productName,
            msn: this.productSubPartNumber,
            brand: this.productBrandDetails["brandName"],
            category_l1: this.productCategoryDetails["taxonomy"]?.split("/")[0]
                ? this.productCategoryDetails["taxonomy"].split("/")[0]
                : null,
            category_l2: this.productCategoryDetails["taxonomy"]?.split("/")[1]
                ? this.productCategoryDetails["taxonomy"].split("/")[1]
                : null,
            category_l3: this.productCategoryDetails["taxonomy"]?.split("/")[2]
                ? this.productCategoryDetails["taxonomy"].split("/")[2]
                : null,
            oos: this.productOutOfStock.toString(),
            channel: "PDP",
            search_query: null,
            active_promo_codes: "",
            url_complete_load_time: null,
            time_to_interactive: null,
            page_type: "product page",
        };
        if (this.priceQuantityCountry != null) {
            dataTracking["price"] = this.priceQuantityCountry.sellingPrice;
        }
        this.analytics.sendToClicstreamViaSocket(dataTracking);
    }

    productVisitViaAPI()
    {
        var clickStreamData = {
            msn: this.productSubPartNumber,
            url_link: this.productUrl,
            availability_for_order: !this.productOutOfStock == true ? 1 : 0,
            session_id: this.localStorageService.retrieve("user")
                ? this.localStorageService.retrieve("user").sessionId
                : "",
            created_by_source: "Mobile",
            category_id: this.productCategoryDetails["categoryCode"],
            category_name: this.productCategoryDetails["categoryName"],
            id_brand: this.productBrandDetails["idBrand"],
            brand_name: (this.isHindiUrl) ? this.originalProductBO['brandDetails']['brandName'] : this.productBrandDetails['brandName'],
            // brand_name: this.productBrandDetails["brandName"],
            // product_name:  (this.isHindiUrl) ?this.productName,
            product_name:(this.isHindiUrl) ?this.originalProductBO['productName']:this.productName,
            user_id: this.localStorageService.retrieve("user")
                ? this.localStorageService.retrieve("user").userId
                : null,
            // this data is  used for recently viewed API and we use medium image for same
            product_image: this.productMediumImage,
            status: this.rawProductData["status"],
            product_url: this.productUrl,
        };
        //console.log(clickStreamData.product_name,"ppp");
        //TODO:Yogender for click stream to set selling price
        if (this.priceQuantityCountry != null) {
            clickStreamData["mrp"] = this.productMrp;
            clickStreamData["price_without_tax"] = this.priceWithoutTax;
            clickStreamData["price_with_tax"] = this.productPrice;
            clickStreamData["out_of_stock"] = this.productOutOfStock;
        }
        // console.log('clickStreamData ==>', clickStreamData);
        this.analytics.sendToClicstreamViaAPI(clickStreamData);
    }

    productVisitGTM()
    {
        let gtmDataObj = [];
        const gaGtmData = this.localStorageService.retrieve("gaGtmData");
        if (this.productOutOfStock) {
            if(this.productName) {
                gtmDataObj.push({
                    event: "rqnProductPage",
                    ecommerce: {
                        rqn_product_name: this.productName,
                    },
                });
            }
        }
        if(this.productName && this.productSubPartNumber && this.productPrice) {
            gtmDataObj.push({
                event: "productView",
                ecommerce: {
                    detail: {
                        actionField: {
                            list: gaGtmData && gaGtmData["list"] ? gaGtmData["list"] : "",
                        },
                        products: [
                            {
                                name: this.productName,
                                id: this.productSubPartNumber,
                                price: this.productPrice,
                                brand: this.productBrandDetails["brandName"],
                                category:
                                    gaGtmData && gaGtmData["category"]
                                        ? gaGtmData["category"]
                                        : this.productCategoryDetails["categoryName"],
                                variant: "",
                                stockStatus: this.productOutOfStock ? "Out of Stock" : "In Stock",
                            },
                        ],
                    },
                },
            });
        } 
        const google_tag_params = {
            ecomm_prodid: this.productSubPartNumber,
            ecomm_pagetype: "product",
            ecomm_totalvalue: this.productPrice,
        };
        gtmDataObj.push({
            event: "dyn_remk",
            ecomm_prodid: google_tag_params.ecomm_prodid,
            ecomm_pagetype: google_tag_params.ecomm_pagetype,
            ecomm_totalvalue: google_tag_params.ecomm_totalvalue,
            google_tag_params: google_tag_params,
        });
        const user = this.localStorageService.retrieve("user");
        if(this.productSubPartNumber && this.productCategoryDetails["taxonomy"] && 
            this.productCategoryDetails["taxonomyCode"] && this.productMrp && 
            this.productBrandDetails["idBrand"]) 
        {
            gtmDataObj.push({
                event: "viewItem",
                email: user && user["email"] ? user["email"] : "",
                ProductID: this.productSubPartNumber,
                Category: this.productCategoryDetails["taxonomy"],
                CatID: this.productCategoryDetails["taxonomyCode"],
                MRP: this.productMrp,
                brandId: this.productBrandDetails["idBrand"],
                Discount: Math.floor(this.productDiscount),
                ImageURL: this.productDefaultImage,
            });
        }

        gtmDataObj.forEach((data) =>
        {
            this.analytics.sendGTMCall(data);
        });
    }

    getAdobeAnalyticsObjectData(identifier = 'pdp')
    {

        let taxo1 = "";
        let taxo2 = "";
        let taxo3 = "";
        if (this.productCategoryDetails["taxonomyCode"]) {
            taxo1 = this.productCategoryDetails["taxonomyCode"].split("/")[0] || "";
            taxo2 = this.productCategoryDetails["taxonomyCode"].split("/")[1] || "";
            taxo3 = this.productCategoryDetails["taxonomyCode"].split("/")[2] || "";
        }

        let ele = []; // product tags for adobe;
        // this.productTags.forEach((element) =>
        // {
        //     ele.push(element.name);
        // });
        // this.productTags = this.commonService.sortProductTagsOnPriority(this.productTags);
        const tagsForAdobe = ele.join("|");

        let page = {
            pageName: "moglix:" + taxo1 + ":" + taxo2 + ":" + taxo3 + ":" + identifier,
            channel: "pdp",
            subSection: "moglix:" + taxo1 + ":" + taxo2 + ":" + taxo3 + ":" + identifier + ":" + this.commonService.getSectionClick().toLowerCase(),
            loginStatus: this.commonService.loginStatusTracking,
        };
        let custData = this.commonService.custDataTracking;

        let order = {
            productID: this.productSubPartNumber,
            productCategoryL1: taxo1,
            productCategoryL2: taxo2,
            productCategoryL3: taxo3,
            brand: this.productBrandDetails["brandName"],
            price: this.productPrice,
            stockStatus: this.productOutOfStock ? "Out of Stock" : "In Stock",
            tags: tagsForAdobe,
            pdpMessage: this.rawProductCountMessage || "",
            pdpToastMessage: this.rawCartNotificationMessage || "",
        };

        return { page, custData, order }
    }

    productVisitAdobe()
    {
        this.analytics.sendAdobeCall(this.getAdobeAnalyticsObjectData());
    }

    outOfStockUpBtnClicked()
    {
        this.analytics.sendAdobeCall(this.getAdobeAnalyticsObjectData('outOfStockUpBtn'), 'genericPageLoad');
    }

    analyticAddToCart(buyNow, quantity, isCod)
    {
        const user = this.localStorageService.retrieve("user");
        const taxonomy = this.productCategoryDetails["taxonomyCode"];
        let taxo1 = "";
        let taxo2 = "";
        let taxo3 = "";
        if (this.productCategoryDetails["taxonomyCode"]) {
            taxo1 = this.productCategoryDetails["taxonomyCode"].split("/")[0] || "";
            taxo2 = this.productCategoryDetails["taxonomyCode"].split("/")[1] || "";
            taxo3 = this.productCategoryDetails["taxonomyCode"].split("/")[2] || "";
        }

        let ele = []; // product tags for adobe;
        // this.productTags.forEach((element) =>
        // {
        //     ele.push(element.name);
        // });
        const tagsForAdobe = ele.join("|");

        let page = {
            linkPageName: "moglix:" + taxo1 + ":" + taxo2 + ":" + taxo3 + ":pdp",
            linkName: (isCod ?"Quick cod  " : (!buyNow ? "Add to cart" : "Buy Now")),
            channel: "pdp",
        };

        if (this.displayCardCta) {
            page["linkName"] =
                (isCod ? "Quick cod": (!buyNow ? "Add to cart Overlay" : "Buy Now Overlay"));
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
            productID: this.productSubPartNumber || this.defaultPartNumber, // TODO: partNumber
            parentID: this.productSubPartNumber,
            productCategoryL1: taxo1,
            productCategoryL2: taxo2,
            productCategoryL3: taxo3,
            price: this.productPrice,
            quantity: quantity,
            brand: this.productBrandDetails["brandName"],
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
                            name: this.productName, // Name or ID of the product is required.
                            id: this.productSubPartNumber, // todo: partnumber
                            price: this.productPrice,
                            brand: this.productBrandDetails["brandName"],
                            brandId: this.productBrandDetails["idBrand"],
                            category:
                                this.productCategoryDetails &&
                                    this.productCategoryDetails["taxonomy"]
                                    ? this.productCategoryDetails["taxonomy"]
                                    : "",
                            variant: "",
                            quantity: quantity,
                            productImg: this.productDefaultImage,
                            CatId: this.productCategoryDetails["taxonomyCode"],
                            MRP: this.productMrp["amount"],
                            Discount: this.productDiscount,
                        },
                    ],
                },
            },
        };
        if(
            this.productName && this.productSubPartNumber && 
            this.productBrandDetails['brandName'] && this.productPrice &&
            this.productCategoryDetails["taxonomyCode"] ) 
            {
                this.analytics.sendGTMCall(digitalData);
            }
    }

    analyticRFQ(isSubmitted: boolean = false)
    {
        const user = this.localStorageService.retrieve("user");
        let taxo1 = "";
        let taxo2 = "";
        let taxo3 = "";
        if (this.productCategoryDetails["taxonomyCode"]) {
            taxo1 = this.productCategoryDetails["taxonomyCode"].split("/")[0] || "";
            taxo2 = this.productCategoryDetails["taxonomyCode"].split("/")[1] || "";
            taxo3 = this.productCategoryDetails["taxonomyCode"].split("/")[2] || "";
        }
        let ele = []; // product tags for adobe;
        // this.productTags.forEach((element) =>
        // {
        //     ele.push(element.name);
        // });
        const tagsForAdobe = ele.join("|");

        this.analytics.sendGTMCall({
            event: !this.productOutOfStock ? "rfq_instock" : "rfq_oos",
        });

        if (isSubmitted && this.productName && this.productBrandDetails['brandName']) {
            this.analytics.sendGTMCall({
                event: !this.productOutOfStock ? "instockformSubmit" : "oosformSubmit",
                customerInfo: {
                    firstName: user["first_name"],
                    lastName: user["last_name"],
                    email: user["email"],
                    mobile: user["phone"],
                },
                productInfo: {
                    productName: this.productName,
                    brand: this.productBrandDetails["brandName"],
                    quantity: this.priceQuantityCountry
                        ? this.priceQuantityCountry["quantityAvailable"]
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
            productID: this.productSubPartNumber,
            productCategoryL1: taxo1,
            productCategoryL2: taxo2,
            productCategoryL3: taxo3,
            brand: this.productBrandDetails["brandName"],
            tags: tagsForAdobe,
        };
        this.analytics.sendAdobeCall(
            { page, custData, order },
            isSubmitted ? "genericClick" : "genericPageLoad"
        );
    }

    analyticPincodeAvaliabilty(analytics)
    {
        const taxonomy = this.productCategoryDetails["taxonomy"];
        let taxo1 = "";
        let taxo2 = "";
        let taxo3 = "";
        if (this.productCategoryDetails["taxonomyCode"]) {
            taxo1 = this.productCategoryDetails["taxonomyCode"].split("/")[0] || "";
            taxo2 = this.productCategoryDetails["taxonomyCode"].split("/")[1] || "";
            taxo3 = this.productCategoryDetails["taxonomyCode"].split("/")[2] || "";
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
            productID: this.productSubPartNumber,
            productCategoryL1: taxo1,
            productCategoryL2: taxo2,
            productCategoryL3: taxo3,
            brand: this.productBrandDetails["brandName"],
            productPrice: this.productPrice,
            serviceability: analytics.serviceability ? "yes" : "no",
            codserviceability: analytics.codserviceability ? "yes" : "no",
            pincode: analytics.pincode,
            deliveryTAT: analytics.deliveryDays ? analytics.deliveryDays : "NA",
            deliveryAnalytics: analytics.deliveryAnalytics,
        };
        this.analytics.sendAdobeCall({ page, custData, order }, "genericClick");
    }

    remoteApiCallRecentlyBought()
    {
        let MSG = null;
        let CART_NOTIFICATION_MSG = null;
        if (
            this.rawProductData &&
            this.rawProductCountData &&
            !this.productOutOfStock
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

    scrollToResults(id: string, offset)
    {
        if (document.getElementById(id)) {
            let footerOffset = document.getElementById(id).offsetTop;
            ClientUtility.scrollToTop(1000, footerOffset + offset);
        }
    }

    scrollToId(id: string)
    {
        this.holdRFQForm = true;
        if (document.getElementById(id)) {
            let footerOffset = document.getElementById(id).offsetTop;
            ClientUtility.scrollToTop(1000, footerOffset + 190);
        }
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

    sortedReviewByRating(reviewList)
    {
        return reviewList.sort((a, b) =>
        {
            return b.yes - a.yes;
        });
    }

    navigateToUrl(url)
    {
        this.router.navigateByUrl(url);
    }

    async handleReviewRatingPopup(index = -1)
    {
        this.sendProductInfotracking("view all reviews");
        this.showLoader = true;
        const { ReviewRatingComponent } = await import(
            "./../../components/review-rating/review-rating.component"
        ).finally(() =>
        {
            this.showLoader = false;
        });
        const factory = this.cfr.resolveComponentFactory(ReviewRatingComponent);
        this.reviewRatingPopupInstance =
            this.reviewRatingPopupContainerRef.createComponent(
                factory,
                null,
                this.injector
            );
        this.rawReviewsData.productName = this.productName;
        this.reviewRatingPopupInstance.instance["oosSimilarCardNumber"] = index;
        this.reviewRatingPopupInstance.instance["rawReviewsData"] =
            (index > -1) ? this.productService.oosSimilarProductsData.similarData[index].reviewRatingApiData : this.rawReviewsData;

        this.reviewRatingPopupInstance.instance["productUrl"] = (index > -1) ? this.productService.oosSimilarProductsData.similarData[index].productUrl : this.productUrl;
        (
            this.reviewRatingPopupInstance.instance[
            "closePopup$"
            ] as EventEmitter<boolean>
        ).subscribe((data) =>
        {
            this.reviewRatingPopupInstance = null;
            this.reviewRatingPopupContainerRef.remove();
        });
        (
            this.reviewRatingPopupInstance.instance[
            "emitWriteReview$"
            ] as EventEmitter<boolean>
        ).subscribe((data) =>
        {
            this.writeReview(data);
        });
    }

    async handleQuestionAnswerPopup()
    {
        this.showLoader = true;
        const { QuestionAnswerComponent } = await import(
            "./../../components/question-answer/question-answer.component"
        ).finally(() =>
        {
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
        ).subscribe((data) =>
        {
            this.questionAnswerPopupInstance = null;
            this.reviewRatingPopupContainerRef.remove();
        });
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

    async handleProductInfoPopup1(event) {
        this.handleProductInfoPopup(event.infoType, event.cta)
    }

    private closeProductInfoPopup()
    {
        this.holdRFQForm = false;
        this.productInfoPopupInstance = null;
        this.productInfoPopupContainerRef.remove();
        this.displayCardCta = false;
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
        this.faqListPopupInstance.instance["questionAnswerList"] = this.questionAnswerList;
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
    }

    async askQuestion()
    {
        let user = this.localStorageService.retrieve("user");
        if (user && user.authenticated == "true") {
            this.location.replaceState(this.mainProductURL);
            this.askQuestionPopup();
        } else {
            this.goToLoginPage(this.productUrl + ((this.fragment && this.fragment.length) ? `#${this.fragment}` : ''), "Continue to ask question");
        }
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
        this.askQuestionPopupInstance.instance["productCategoryDetails"] = this.productCategoryDetails;
        this.askQuestionPopupInstance.instance["productSubPartNumber"] = this.productSubPartNumber;
        this.askQuestionPopupInstance.instance["defaultPartNumber"] = this.defaultPartNumber;
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
        this.faqSuccessPopupInstance.instance["rawReviewsData"] = this.questionAnswerList;
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
    }

    getProductInfo(infoType)
    {
        const productInfo = {};
        productInfo["mainInfo"] = {
            productName: this.productName,
            imgURL: this.productAllImages[0]["large"],
            brandName: this.productBrandDetails["brandName"],
            productMrp: this.productMrp,
            productDiscount: this.productDiscount,
            bulkPriceWithoutTax: this.bulkPriceWithoutTax,
            priceWithoutTax: this.priceWithoutTax,
            productPrice:this.productPrice,
            bulkSellingPrice: this.bulkSellingPrice,
            taxPercentage: this.taxPercentage,
            bulkDiscount: this.bulkDiscount,
            productOutOfStock: this.productOutOfStock,
        };
        let contentInfo = {};
        if (this.productKeyFeatures && this.productKeyFeatures.length) {
            contentInfo["key features"] = this.productKeyFeatures;
        }
        if (this.productAttributes) {
            const brand = {
                name: this.productBrandDetails["brandName"],
                link: this.getBrandLink(this.productBrandDetails),
                brandId:this.productBrandDetails["idBrand"]                
            };
            contentInfo["specifications"] = {
                attributes: this.productAttributes,
                brand: brand,
                secondaryAttributes: this.getSecondaryAttributes()
            };
        }
        if (this.productVideos && this.productVideos.length) {
            contentInfo["videos"] = this.productVideos;
        }
        const details = {
            description: this.productDescripton,
            category: this.productCategoryDetails,
            brand: this.productBrandDetails,
            brandCategoryURL: this.productBrandCategoryUrl,
            productName: this.productName,
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

    private getSecondaryAttributes() {
        return {
            "Manufacturer Details": (this.rawProductData["manufacturerDetails"])? [this.rawProductData["manufacturerDetails"]]:[],
            "Packer Details": (this.rawProductData["packerDetails"])? [this.rawProductData["packerDetails"]]:[],
            "Importer Details": (this.rawProductData["importerDetails"])? [this.rawProductData["importerDetails"]]:[],
            "Common/Generic Name": (this.rawProductData["displayName"])? [this.rawProductData["displayName"]]:[],
            "Best Before": (this.rawProductData["bestBefore"])? [this.rawProductData["bestBefore"]]:[],
            "Dimensions LxWxH": (this.rawProductData["itemDimension"])? [this.rawProductData["itemDimension"]]:[],
            "Weight": (this.rawProductData["itemWeight"])? [this.rawProductData["itemWeight"]]:[],
        }
    }

    sendProductInfotracking(cta)
    {
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

    sendWidgetTracking(widgetType)
    {
        const TAXONS = this.taxons;
        let page = {
            pageName: null,
            channel: "pdp",
            subSection: null,
            linkPageName: `moglix:${TAXONS[0]}:${TAXONS[1]}:${TAXONS[2]}:pdp`,
            linkName: `More from ${widgetType}`,
            loginStatus: this.commonService.loginStatusTracking,
        };
        const custData = this.commonService.custDataTracking;
        const order = this.orderTracking;
        this.analytics.sendAdobeCall({ page, custData, order }, "genericClick");
        this.commonService.setSectionClickInformation("pdp_widget", "listing");
    }

    getRefinedProductTags()
    {
        const pipe = new ArrayFilterPipe();
        this.refinedProdTags = pipe.transform(
            this.productTags,
            "type",
            "text",
            "object"
        );
        if (this.refinedProdTags !==null) {
            this.refinedProdTags = (this.refinedProdTags as []).slice(0, 3);
        }
    }

    get overallRating()
    {
        if (this.rawReviewsData && this.rawReviewsData["summaryData"]) {
            return this.rawReviewsData["summaryData"]["finalAverageRating"];
        }
        return 0;
    }


    get orderTracking()
    {
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
            productID: this.productSubPartNumber,
            productCategoryL1: TAXNONS[0],
            productCategoryL2: TAXNONS[1],
            productCategoryL3: TAXNONS[2],
            brand: this.productBrandDetails["brandName"],
            price: this.productPrice,
            stockStatus: this.productOutOfStock ? "Out of Stock" : "In Stock",
            tags: tagsForAdobe,
        };
    }

    get taxons()
    {
        const taxon = [];
        if (
            this.productCategoryDetails && this.productCategoryDetails["taxonomyCode"]!==null &&
            this.productCategoryDetails.hasOwnProperty("taxonomyCode") 
        ) {
            taxon.push(
                this.productCategoryDetails["taxonomyCode"].split("/")[0] || ""
            );
            taxon.push(
                this.productCategoryDetails["taxonomyCode"].split("/")[1] || ""
            );
            taxon.push(
                this.productCategoryDetails["taxonomyCode"].split("/")[2] || ""
            );
        }
        return taxon;
    }

    get breadCrumbAnalytics()
    {
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

    getQuoteCurrentRange: number = 0;
    debouncedUpdatePositionOfGetQuoteRageSlider = this.commonService.debounceFunctionAndEvents(((range) => this.updatePositionOfGetQuoteRageSlider(range)));

    updatePositionOfGetQuoteRageSlider(range)
    {
        this.getQuoteCurrentRange = range;
    }


    productStatusCount()
    {
        if(this.isHindiUrl){
        this.ProductStatusCount = this.productService.getProductStatusCount(this.defaultPartNumber,{ headerData: { 'language': 'hi' }})
        }
        else{ 
            this.ProductStatusCount = this.productService.getProductStatusCount(this.defaultPartNumber)
        }
        this.ProductStatusCount.subscribe((productStatusCountResult) =>
            {
                this.rawProductCountData = Object.assign({}, productStatusCountResult);
                this.remoteApiCallRecentlyBought();
            });
    }

    checkDuplicateProduct()
    {
        const userSession = this.localStorageService.retrieve("user");
        if (userSession && userSession.authenticated == "true") {
            this.productService
                .getUserDuplicateOrder(this.defaultPartNumber, userSession["userId"])
                .subscribe((duplicateProductResult) =>
                {
                    this.duplicateOrderCheck(duplicateProductResult);
                });
        }
    }

    nudgeOpened()
    {
        this.analytics.sendAdobeCall(this.getAdobeAnalyticsObjectData('search:nudge'), 'genericClick');
    }

    nudgeOpenedClicked()
    {
        this.analytics.sendAdobeCall(this.getAdobeAnalyticsObjectData('search:nudge:clicked'), 'genericClick');
    }

    navigateLink(link)
    {
        this.router.navigate([link]);
    }

    get categoryName()
    {
        if (this.productCategoryDetails && this.productCategoryDetails['categoryName']) {
            return this.productCategoryDetails['categoryName'];
        }
        return "Something!!!";
    }

    openDialer()
    {
        if (this.commonService.isBrowser) {
            window.location.href = "tel:+91 99996 44044";
        }
    }


    navigateToWhatsapp()
    {
        if (this.isBrowser) {
            window.location.href = CONSTANTS.WHATS_APP_API + GLOBAL_CONSTANT.whatsapp_number + '&text=' + encodeURIComponent(this.getWhatsText);
        }
    }

    get pastOrderAnalytics()
    {
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

    sendTrackingData()
    {
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

    get isLoggedIn() { let user = this.localStorageService.retrieve("user"); return user && user.authenticated == "true" }

    ngOnDestroy()
    {
        if (this.isBrowser) {
            sessionStorage.removeItem("pdp-page");
        }
        if (this.raiseRFQGetQuoteSubscription) {
            this.raiseRFQGetQuoteSubscription.unsubscribe();
        }
        this.resetLazyComponents();
        // this.productService.notifyImagePopupState.unsubscribe();
        // this.productService.notifyImagePopupState.next(false);
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

    getSanitizedUrl(url){
        return (url).toLowerCase().split('#')[0].split('?')[0];
    }


    get isHindiUrl() {
        return (this.router.url).toLowerCase().indexOf('/hi/') !== -1
    }

    closeproductDiscInfoComponent(){
        this.iscloseproductDiscInfoComponent=false
    }
    
    getCompareProductsData(msn: string) {
        this.productService.getCompareProducts(msn).subscribe(result=>{
            if(result && result['totalCount'] && result['totalCount'] > 0 && result['products']){
                this.compareProductsData = result['products'] as Array<object>;
            }
        },(error)=>{
            this.compareProductsData = [];
        })
    }

}
