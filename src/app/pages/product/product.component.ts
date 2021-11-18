import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, ComponentFactoryResolver, ElementRef, EventEmitter, Inject, Injector, OnInit, Optional, Renderer2, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { YoutubePlayerComponent } from '@app/components/youtube-player/youtube-player.component';
import CONSTANTS from '@app/config/constants';
import { ModalService } from '@app/modules/modal/modal.service';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { ArrayFilterPipe } from '@app/utils/pipes/k-array-filter.pipe';
import { CartService } from '@app/utils/services/cart.service';
import { CheckoutService } from '@app/utils/services/checkout.service';
import { CommonService } from '@app/utils/services/common.service';
import { RESPONSE } from '@nguniversal/express-engine/tokens';
import { LocalStorageService } from 'ngx-webstorage';
import { BehaviorSubject, Subject } from 'rxjs';
import { ClientUtility } from '../../utils/client.utility';
import { ObjectToArray } from '../../utils/pipes/object-to-array.pipe';
import { LocalAuthService } from '../../utils/services/auth.service';
import { DataService } from '../../utils/services/data.service';
import { GlobalAnalyticsService } from '../../utils/services/global-analytics.service';
import { GlobalLoaderService } from '../../utils/services/global-loader.service';
import { ProductUtilsService } from '../../utils/services/product-utils.service';
import { ProductService } from '../../utils/services/product.service';
import { SiemaCrouselService } from '../../utils/services/siema-crousel.service';
import { FbtComponent } from './../../components/fbt/fbt.component';


interface ProductDataArg
{
    productBO: string;
    refreshCrousel?: boolean;
    subGroupMsnId?: string;
}

@Component({
    selector: 'app-product',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.scss'],
})
export class ProductComponent implements OnInit, AfterViewInit
{
    encodeURI = encodeURI;
    readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
    readonly baseDomain = CONSTANTS.PROD;
    readonly DOCUMENT_URL = CONSTANTS.DOCUMENT_URL;
    readonly imagePathAsset = CONSTANTS.IMAGE_ASSET_URL;

    isServer: boolean;
    isBrowser: boolean
    //conditions vars
    rawProductData: any = null;
    rawProductFbtData: any = null;
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
    productTags: any[] = null
    isCommonProduct: boolean = true;
    // productAttributesExtra: any[] = null;
    productName: string = null;
    isProductPriceValid: boolean;
    productOutOfStock: boolean = false;
    priceQuantityCountry: any;
    productAttributes: any = null;
    productMrp: number;
    priceWithoutTax: number;
    productDiscount: number = 0;
    taxPercentage: number;
    bulkSellingPrice: number = null;
    productPrice: number;
    bulkPriceWithoutTax: number = null;//bulk price without tax
    isPurcahseListProduct: boolean = false;
    productDescripton: string = null;
    productBrandDetails: any;
    productCategoryDetails: any;
    productUrl: string;
    productTax: number = 0;
    productCartThumb: string = '';
    productMinimmumQuantity: any = 1
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
    productBulkPrices: any[];
    isProductReturnAble: boolean = false
    //Product Question answer
    questionAnswerForm: FormGroup;
    //review and rating 
    rawReviewsData = null;
    reviews: any = null
    reviewLength: number;
    selectedReviewType: string = "helpful";
    starsCount: number = null;
    //breadcrumm related data
    breadcrumpUpdated: BehaviorSubject<any> = new BehaviorSubject<any>(0);
    breadcrumbData = null;
    // product image crousel settings
    productAllImages: any[] = null
    refreshSiemaItems$ = new Subject<{ items: Array<{}>, type: string, currentSlide: number }>();
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

    // Q&A vars
    questionMessage: string;
    listOfGroupedCategoriesForCanonicalUrl = ['116111700'];

    // ondemand loaded components for PDP accordians
    pdpAccordianInstance = null;
    @ViewChild('pdpAccordian', { read: ViewContainerRef }) pdpAccordianContainerRef: ViewContainerRef;
    // ondemand loaded components for share module
    productShareInstance = null;
    @ViewChild('productShare', { read: ViewContainerRef }) productShareContainerRef: ViewContainerRef;
    // ondemand loaded components for Frequently bought together
    fbtComponentInstance = null;
    @ViewChild('fbt', { read: ViewContainerRef }) fbtComponentContainerRef: ViewContainerRef;
    // ondemand loaded components for similar products
    similarProductInstance = null;
    @ViewChild('similarProduct', { read: ViewContainerRef }) similarProductContainerRef: ViewContainerRef;
    // ondemand loaded components for sponsered products
    sponseredProductsInstance = null;
    @ViewChild('sponseredProducts', { read: ViewContainerRef }) sponseredProductsContainerRef: ViewContainerRef;
    // ondemand loaded components for recents products
    recentProductsInstance = null;
    @ViewChild('recentProducts', { read: ViewContainerRef }) recentProductsContainerRef: ViewContainerRef;
    // ondemand loaded components RFQ form modal
    rfqFormInstance = null;
    @ViewChild('rfqForm', { read: ViewContainerRef }) rfqFormContainerRef: ViewContainerRef;
    // ondemad loaded components for pincode servicibility check
    pincodeFormInstance = null;
    @ViewChild('pincodeForm', { read: ViewContainerRef }) pincodeFormContainerRef: ViewContainerRef;
    // ondemad loaded components offer section
    offerSectionInstance = null;
    @ViewChild('offerSection', { read: ViewContainerRef }) offerSectionContainerRef: ViewContainerRef;
    // ondemad loaded components offer section popup
    offerPopupInstance = null;
    @ViewChild('offerPopup', { read: ViewContainerRef }) offerPopupContainerRef: ViewContainerRef;
    // ondemad loaded components offer compare section popup
    offerComparePopupInstance = null;
    @ViewChild('offerComparePopup', { read: ViewContainerRef }) offerComparePopupContainerRef: ViewContainerRef;
    // ondemad loaded components add to cart toast
    addToCartToastInstance = null;
    @ViewChild('addToCartToast', { read: ViewContainerRef }) addToCartToastContainerRef: ViewContainerRef;
    // ondemad loaded components similat prodict all pop up
    similarAllInstance = null;
    @ViewChild('similarAll', { read: ViewContainerRef }) similarAllContainerRef: ViewContainerRef;
    // ondemad loaded components recent viewd products all pop up
    recentAllInstance = null;
    @ViewChild('recentAll', { read: ViewContainerRef }) recentAllContainerRef: ViewContainerRef;
    // ondemad loaded components for showing duplicate order
    globalToastInstance = null;
    @ViewChild('globalToast', { read: ViewContainerRef }) globalToastContainerRef: ViewContainerRef;
    // ondemad loaded components for post a product review
    writeReviewPopupInstance = null;
    @ViewChild('writeReviewPopup', { read: ViewContainerRef }) writeReviewPopupContainerRef: ViewContainerRef;
    // ondemad loaded components for popup crousel
    popupCrouselInstance = null;
    @ViewChild('popupCrousel', { read: ViewContainerRef }) popupCrouselContainerRef: ViewContainerRef;
    // ondemad loaded components for green aleart box as success messge
    alertBoxInstance = null;
    @ViewChild('alertBox', { read: ViewContainerRef }) alertBoxContainerRef: ViewContainerRef;
    // ondemand load of youtube video player in modal
    youtubeModalInstance = null;
    // ondemand loaded components for product RFQ
    productRFQInstance = null;
    @ViewChild('productRFQ', { read: ViewContainerRef }) productRFQContainerRef: ViewContainerRef;
    // ondemand loaded components for app Promo 
    appPromoInstance = null;
    @ViewChild('appPromo', { read: ViewContainerRef }) appPromoContainerRef: ViewContainerRef;
    // ondemad loaded components for emi infromation
    emiPopupInstance = null;
    @ViewChild('emiPopup', { read: ViewContainerRef }) emiPopupContainerRef: ViewContainerRef;
    // ondemad loaded components for review & rating
    reviewRatingPopupInstance = null;
    @ViewChild('reviewRatingPopup', { read: ViewContainerRef }) reviewRatingPopupContainerRef: ViewContainerRef;
    // ondemad loaded components for question & answer
    questionAnswerPopupInstance = null;
    @ViewChild('questionAnswersPopup', { read: ViewContainerRef }) questionAnswerPopupContainerRef: ViewContainerRef;
    // ondemad loaded components for features & specification
    productInfoPopupInstance = null;
    @ViewChild('productInfoPopup', { read: ViewContainerRef }) productInfoPopupContainerRef: ViewContainerRef;
    // ondemand product crousel  
    productCrouselInstance = null;
    @ViewChild('productCrousel', { read: ViewContainerRef }) productCrouselContainerRef: ViewContainerRef;
    @ViewChild('productCrouselPseudo', { read: ElementRef }) productCrouselPseudoContainerRef: ElementRef;


    iOptions: any = null;

    featuresMap = {
        "Antiskid": "antiskid",
        "Oil Resistant": "oil-resistant",
        "Heat Resistant": "heat-resistant",
        "Puncture Resistant": "puncture-resistant",
        "Impact Resistant": "impact-resistant",
        "Chemical Resistant": "chemical-resistant",
        "Toe Type": "steel-toe",
        "Waterproof": "waterproof"
    };

    appPromoVisible: boolean = true;
    productInfo = null;

    set showLoader(value: boolean)
    {
        this.globalLoader.setLoaderState(value);
    }

    get getWhatsText()
    {
        return `Hi, I want to buy ${this.productName} (${this.defaultPartNumber})`
    }

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private cfr: ComponentFactoryResolver,
        public objectToArray: ObjectToArray,
        private injector: Injector,
        private sanitizer: DomSanitizer,
        public localStorageService: LocalStorageService,
        private productService: ProductService,
        private localAuthService: LocalAuthService,
        private _tms: ToastMessageService,
        private productUtil: ProductUtilsService,
        private modalService: ModalService,
        private cartService: CartService,
        public commonService: CommonService,
        private dataService: DataService,
        public formBuilder: FormBuilder,
        private globalLoader: GlobalLoaderService,
        private siemaCrouselService: SiemaCrouselService,
        public pageTitle: Title,
        public meta: Meta,
        private renderer2: Renderer2,
        private analytics: GlobalAnalyticsService,
        private checkoutService: CheckoutService,
        @Inject(DOCUMENT) private document,
        @Optional() @Inject(RESPONSE) private _response: any)
    {
        this.isServer = commonService.isServer;
        this.isBrowser = commonService.isBrowser;
    }

    ngOnInit(): void
    {
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        if (this.isBrowser) {
            ClientUtility.scrollToTop(100);
        }
        this.intializeForm();
        this.getProductApiData();
        this.addSubcriber();
        this.createSiemaOption();
        this.setProductSeoSchema();
        this.setQuestionAnswerSchema();
    }

    ngAfterViewInit()
    {
        this.getPurchaseList();
        this.resetLazyComponents();
    }

    createSiemaOption()
    {
        if (!this.rawProductData) {
            return;
        }
        this.iOptions = {
            selector: '.img-siema',
            perPage: 1,
            productNew: true,
            pager: true,
            imageAlt: this.productName,
            onInit: () =>
            {
                setTimeout(() =>
                {
                    this.carouselInitialized = true;
                }, 0);
            }
        };
    }

    addSubcriber()
    {
        if (this.isBrowser) {
            this.siemaCrouselService.getProductScrouselPopup().subscribe(result =>
            {
                if (result.active) {
                    this.openPopUpcrousel(result['slideNumber']);
                }
            })
        }
    }

    intializeForm()
    {
        this.questionAnswerForm = this.formBuilder.group({
            question: ['', [Validators.required]]
        });
    }

    getProductApiData()
    {
        // data received by product resolver
        this.route.data.subscribe((rawData) =>
        {
            if (!rawData['product']['error']) {

                if (rawData['product'][0]['productBO'] && Object.values(rawData['product'][0]['productBO']['productPartDetails'])[0]['images'] !== null) {
                    const rawReviews = Object.assign({}, rawData['product'][1]['data']);
                    const rawProductFbtData = Object.assign({}, rawData['product'][4]);
                    const rawProductCountData = Object.assign({}, rawData['product'][5]);
                    this.rawReviewsData = Object.assign({}, rawReviews);
                    this.rawProductFbtData = Object.assign({}, rawProductFbtData);
                    this.rawProductCountData = Object.assign({}, rawProductCountData);
                    rawReviews['reviewList'] = (rawReviews['reviewList'] as []);

                    this.processProductData({
                        productBO: rawData['product'][0]['productBO'],
                        refreshCrousel: true,
                        subGroupMsnId: null,
                    }, rawData['product'][0]);

                    this.setReviewsRatingData(rawReviews);
                    this.setProductaBreadcrum(rawData['product'][2]);
                    this.setQuestionsAnswerData(rawData['product'][3]);
                    this.duplicateOrderCheck(rawData);
                } else {
                    this.showLoader = false;
                    this.globalLoader.setLoaderState(false);
                    this.productNotFound = true;
                    if (this.isServer && this.productNotFound) {
                        this._response.status(404);
                    }
                }
            } else {
                this.productNotFound = true;
                if (this.isServer && this.productNotFound) {
                    this._response.status(404);
                }
            }
            this.showLoader = false;
            this.globalLoader.setLoaderState(false);
        }, error =>
        {
            this.showLoader = false;
            this.globalLoader.setLoaderState(false);
        });
    }

    private duplicateOrderCheck(rawData)
    {
        if (rawData && rawData['product'][6] && rawData['product'][6]['data'] && rawData['product'][6]['data']['date']) {
            const userSession = this.localStorageService.retrieve('user');
            if (this.commonService.isBrowser && userSession && userSession.authenticated == "true" && rawData['product'][6] && rawData['product'][6].status) {
                const date1: any = new Date(rawData['product'][6]['data']['date']);
                const date2: any = new Date();
                const diffTime = Math.abs(date2 - date1);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays < 31) {
                    this.loadGlobalToastMessage(rawData['product'][6], rawData['product'][0]['productBO']);
                }
            }
        }
    }

    updateAttr(productId)
    {
        this.removeRfqForm();
        this.showLoader = true;
        this.productService.getGroupProductObj(productId).subscribe(productData =>
        {
            if (productData['status'] == true) {
                this.processProductData({
                    productBO: productData['productBO'],
                    refreshCrousel: true,
                    subGroupMsnId: productId,
                }, productData);
                this.showLoader = false;
            }
        })
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
            this.rawReviewsData.reviewList.forEach(element =>
            {
                element['isPost'] = false;
                element['yes'] = 0;
                element['no'] = 0;
                if (element.is_review_helpful_count_yes)
                    element['yes'] = Number(element.is_review_helpful_count_yes['value']);
                if (element.is_review_helpful_count_no)
                    element['no'] = Number(element.is_review_helpful_count_no['value']);
                element['totalReview'] = element['yes'] + element['no']
            });
            console.log(this.rawReviewsData)
        }
        this.sortReviewsList("date");
        this.setProductRating(this.rawReviewsData.summaryData.final_average_rating);
    }

    sortReviewsList(sortType)
    {
        this.selectedReviewType = sortType;
        if (sortType === "helpful") {
            this.rawReviewsData.reviewList = this.sortedReviewByRating(this.rawReviewsData.reviewList);
        } else {
            this.rawReviewsData.reviewList = this.sortedReviewsByDate(this.rawReviewsData.reviewList);
        }
    }

    setProductRating(rating)
    {
        if (rating == 0 || rating == null) {
            this.starsCount = 0;
            //this.productResult['rating'] = 0;
        }
        else if (rating < 3.5) {
            this.starsCount = 3.5;
            //this.productResult['rating'] = 3.5;
        }
        else {
            this.starsCount = rating;
            //this.productResult['rating'] = rating;
        }
    }

    async onVisibleProductAccordians($event)
    {
        if (!this.pdpAccordianInstance) {
            const { ProductAccordiansComponent } = await import('./../../components/product-accordians/product-accordians.component');
            const factory = this.cfr.resolveComponentFactory(ProductAccordiansComponent);
            this.pdpAccordianInstance = this.pdpAccordianContainerRef.createComponent(factory, null, this.injector);
            this.pdpAccordianInstance.instance['categoryBrandDetails'] = {
                category: this.rawProductData.categoryDetails[0],
                brand: this.rawProductData.brandDetails
            };
            const TAXONS = this.taxons;
            let page = {
                pageName: null,
                channel: "pdp", subSection: null,
                linkPageName: `moglix:${TAXONS[0]}:${TAXONS[1]}:${TAXONS[2]}:pdp`, linkName: null, loginStatus: this.loginStatusTracking
            }
            this.pdpAccordianInstance.instance['analyticsInfo'] = { page: page, custData: this.custDataTracking, order: this.orderTracking };;
        }
    }

    onVisibleReviews($event)
    {
        this.setReviewsRatingData(this.rawReviewsData);
    }

    setProductaBreadcrum(breadcrumbData)
    {
        this.breadcrumbData = breadcrumbData;

    }
    navigateToCategory()
    {
        if (this.breadcrumbData) {
            let lastElement = this.breadcrumbData.length - 2;
            let category = this.breadcrumbData[lastElement]['categoryLink'];
            this.navigateToUrl(category);
        }
    }

    processProductData(args: ProductDataArg, rawData)
    {
        this.rawProductData = args.productBO;
        // required for goruped products
        this.defaultPartNumber = (args.subGroupMsnId != null) ? args.subGroupMsnId : this.rawProductData['defaultPartNumber'];
        const partNumber = (args.subGroupMsnId != null) ? args.subGroupMsnId : this.rawProductData['partNumber'];
        this.productSubPartNumber = partNumber;

        // mapping general information 
        this.productName = this.rawProductData['productName'];
        this.isProductReturnAble = this.rawProductData['returnable'] || false;
        this.productDescripton = this.rawProductData['desciption'];
        this.productBrandDetails = this.rawProductData['brandDetails'];
        this.productCategoryDetails = this.rawProductData['categoryDetails'][0];
        this.productUrl = this.rawProductData['defaultCanonicalUrl'];
        this.productFilterAttributesList = this.rawProductData['filterAttributesList'];
        this.productKeyFeatures = this.rawProductData['keyFeatures'];
        this.productVideos = this.rawProductData['videosInfo'];
        this.productDocumentInfo = this.rawProductData['documentInfo'];
        this.productTags = this.rawProductData['productTags'];
        this.getRefinedProductTags();
        this.productAttributes = this.rawProductData['productPartDetails'][partNumber]['attributes'] || [];
        this.productRating = this.rawProductData['productPartDetails'][partNumber]['productRating'];
        this.productBrandCategoryUrl = 'brands/' + this.productBrandDetails['friendlyUrl'] + "/" + this.productCategoryDetails['categoryLink'];

        this.isProductPriceValid = this.rawProductData['productPartDetails'][partNumber]['productPriceQuantity'] != null;
        this.priceQuantityCountry = (this.isProductPriceValid) ? Object.assign({}, this.rawProductData['productPartDetails'][partNumber]['productPriceQuantity']['india']) : null;
        this.productMrp = (this.isProductPriceValid && this.priceQuantityCountry) ? this.priceQuantityCountry['mrp'] : null;

        if (this.priceQuantityCountry) {
            this.priceQuantityCountry['bulkPricesIndia'] = (this.isProductPriceValid) ? Object.assign({}, this.rawProductData['productPartDetails'][partNumber]['productPriceQuantity']['india']['bulkPrices']) : null;
            this.priceQuantityCountry['bulkPricesModified'] = (this.isProductPriceValid && this.rawProductData['productPartDetails'][partNumber]['productPriceQuantity']['india']['bulkPrices']['india']) ? [...this.rawProductData['productPartDetails'][partNumber]['productPriceQuantity']['india']['bulkPrices']['india']] : null;
        }

        this.priceWithoutTax = (this.priceQuantityCountry) ? this.priceQuantityCountry['priceWithoutTax'] : null;
        if (this.priceQuantityCountry && this.priceQuantityCountry['mrp'] > 0 && this.priceQuantityCountry['priceWithoutTax'] > 0) {
            this.productDiscount = (((this.priceQuantityCountry['mrp'] - this.priceQuantityCountry['priceWithoutTax']) / this.priceQuantityCountry['mrp']) * 100)
        }
        this.taxPercentage = (this.priceQuantityCountry) ? this.priceQuantityCountry['taxRule']['taxPercentage'] : null;
        this.productPrice = (this.priceQuantityCountry && !isNaN(this.priceQuantityCountry['sellingPrice'])) ? Number(this.priceQuantityCountry['sellingPrice']) : 0;

        this.productTax = (this.priceQuantityCountry && !isNaN(this.priceQuantityCountry['sellingPrice']) && !isNaN(this.priceQuantityCountry['sellingPrice'])) ?
            (Number(this.priceQuantityCountry['sellingPrice']) - Number(this.priceQuantityCountry['sellingPrice'])) : 0;
        this.productMinimmumQuantity = (this.priceQuantityCountry && this.priceQuantityCountry['moq']) ? this.priceQuantityCountry['moq'] : 1;

        this.setOutOfStockFlag();

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

        if (this.productOutOfStock) {
            this.onVisibleProductRFQ(null);
        }

        // product media processing
        this.setProductImages(this.rawProductData['productPartDetails'][partNumber]['images']);
        this.setProductVideo(this.rawProductData['videosInfo']);
        if (args.refreshCrousel) {
            this.refreshProductCrousel()
        }

        this.setProductCommonType(this.rawProductData['filterAttributesList']);
        // this.setAttributesExtra(this.rawProductData['productPartDetails']);
        // this.setSimilarProducts(this.productName, this.productCategoryDetails['categoryCode']);
        this.fetchFBTProducts(rawData);
        this.updateBulkPriceDiscount();
        this.showLoader = false;
        this.remoteApiCallRecentlyBought();

        // analytics calls moved to this function incase PDP is redirecte to PDP
        this.callAnalyticForVisit();
        this.setMetatag();

    }

    updateBulkPriceDiscount()
    {
        if (this.priceQuantityCountry && this.priceQuantityCountry['bulkPricesModified'] && this.priceQuantityCountry['bulkPricesModified'].length > 0) {
            this.priceQuantityCountry['bulkPricesModified'].forEach(element =>
            {
                if (this.productMrp > 0) {
                    element.discount = ((this.productMrp - element.bulkSPWithoutTax) / this.productMrp) * 100;
                } else {
                    element.discount = element.discount;
                }
            });
        }
    }

    resetLazyComponents()
    {
        // this function  is useable when user is redirect from PDP to PDP
        if (this.productShareInstance) {
            this.productShareInstance = null;
            this.productShareContainerRef.remove();
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
        if (this.sponseredProductsInstance) {
            this.sponseredProductsInstance = null;
            this.sponseredProductsContainerRef.remove();
            this.onVisibleSponsered(null);
        }
        // console.log('similarProductInstance 2', this.similarProductInstance);
        if (this.recentProductsInstance) {
            this.recentProductsInstance = null;
            this.recentProductsContainerRef.remove();
            this.onVisibleRecentProduct(null);
        }
        if (this.rfqFormInstance) {
            this.rfqFormInstance = null;
            this.rfqFormContainerRef.remove();
        }
        if (this.pincodeFormInstance) {
            this.pincodeFormInstance = null;
            this.pincodeFormContainerRef.remove();
        }
        if (this.offerSectionInstance) {
            this.offerSectionInstance = null;
            this.offerSectionContainerRef.remove();
        }
        if (this.offerPopupInstance) {
            this.offerPopupInstance = null;
            this.offerPopupContainerRef.remove();
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
        if (this.youtubeModalInstance) {
            this.youtubeModalInstance = null;
        }
        if (this.productInfo) {
            this.productInfoPopupInstance = null;
            this.productInfoPopupContainerRef.remove();
        }
    }

    setSimilarProducts(productName, categoryCode)
    {
        this.similarProducts = [];
        if (this.isBrowser) {
            this.productService.getSimilarProducts(productName, categoryCode).subscribe((response: any) =>
            {
                let products = response['products'];
                if (products && (products as []).length > 0) {
                    this.similarProducts = products;
                }
            })
        }
    }

    setOutOfStockFlag()
    {
        if (this.priceQuantityCountry) {
            // incase outOfStockFlag of is avaliable then set its value
            this.productOutOfStock = this.priceQuantityCountry['outOfStockFlag'];
            // apart from outOfStockFlag if mrp is exist and is zero set product of OOS
            if (this.priceQuantityCountry['mrp']) {
                if (parseInt(this.priceQuantityCountry['mrp']) == 0) {
                    this.productOutOfStock = true;
                }
                if (parseInt(this.priceQuantityCountry['quantityAvailable']) == 0) {
                    this.productOutOfStock = true;
                }
            } else {
                this.productOutOfStock = true;
            }
        } else {
            // incase priceQuantityCountry element not present in API
            this.productOutOfStock = true;
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
        const filterAttributesListData = filterAttributesList ? filterAttributesList : []
        let isCommonProduct = true;
        if (filterAttributesListData.length > 0) {
            isCommonProduct = false;
        }
        this.isCommonProduct = isCommonProduct;
    }

    setProductImages(imagesArr: any[])
    {
        this.productDefaultImage = (imagesArr.length > 0) ? this.imagePath + "" + imagesArr[0]['links']['default'] : '';
        this.productMediumImage = (imagesArr.length > 0) ? imagesArr[0]['links']['medium'] : '';
        this.productAllImages = [];
        imagesArr.forEach(element =>
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
                video: '',
                title: '',
                contentType: 'IMAGE',
            });
        });
        if (this.productAllImages.length > 0) {
            this.productCartThumb = this.productAllImages[0]['thumb'];
        }
    }

    setProductVideo(videoArr)
    {
        if (this.productAllImages.length > 0 && videoArr && (videoArr as any[]).length > 0) {
            (videoArr as any[]).reverse().forEach(element =>
            {
                // append all video after first image and atleast has one image
                this.productAllImages.splice(1, 0, {
                    src: '',
                    default: '',
                    caption: '',
                    thumb: '',
                    medium: '',
                    xxlarge: '',
                    title: element['title'],
                    video: element['link'],
                    contentType: 'YOUTUBE_VIDEO'
                });
            });
        }
    }

    refreshProductCrousel()
    {
        this.refreshSiemaItems$.next({ items: this.productAllImages, type: "refresh", currentSlide: 0 });
    }

    // showRating()
    // {
    //     ClientUtility.scrollToTop(
    //         2000,
    //         ClientUtility.offset(<HTMLElement>document.querySelector('#reviewsAll')).top - document.querySelector('header').offsetHeight
    //     );
    // }

    async loadProductShare()
    {
        if (!this.productShareInstance) {
            const shareURL = this.baseDomain + this.router.url
            const { ProductShareComponent } = await import('./../../components/product-share/product-share.component');
            const factory = this.cfr.resolveComponentFactory(ProductShareComponent);
            this.productShareInstance = this.productShareContainerRef.createComponent(factory, null, this.injector);
            const productResult = {
                productName: this.productName,
                canonicalUrl: this.productUrl
            };
            this.productShareInstance.instance['btmMenu'] = true;
            this.productShareInstance.instance['productResult'] = productResult;
            this.productShareInstance.instance['shareFbUrl'] = CONSTANTS.FB_URL + shareURL + "&redirect_uri=" + CONSTANTS.PROD;;
            this.productShareInstance.instance['shareTwitterUrl'] = CONSTANTS.TWITTER_URL + shareURL;
            this.productShareInstance.instance['shareLinkedInUrl'] = CONSTANTS.LINKEDIN_URL + shareURL;
            this.productShareInstance.instance['shareWhatsappUrl'] = this.sanitizer.bypassSecurityTrustUrl("whatsapp://send?text=" + encodeURIComponent(shareURL));
            (this.productShareInstance.instance['removed'] as EventEmitter<boolean>).subscribe(status =>
            {
                this.productShareInstance = null;
                this.productShareContainerRef.detach();
            });
        } else {
            //toggle side menu
            this.productShareInstance.instance['btmMenu'] = true
        }
    }

    // Wishlist related functionality
    getPurchaseList()
    {
        if (!this.rawProductData) {
            return;
        }
        this.isPurcahseListProduct = false;
        if (this.localStorageService.retrieve('user')) {
            const user = this.localStorageService.retrieve('user');
            if (user.authenticated == "true") {
                const request = { idUser: user.userId, userType: "business" };

                this.productService.getPurchaseList(request).subscribe((res) =>
                {
                    this.showLoader = false;
                    if (res['status'] && res['statusCode'] == 200) {
                        let purchaseLists: Array<any> = []
                        purchaseLists = res['data'];
                        purchaseLists.forEach(element =>
                        {
                            if (
                                (element.productDetail.productBO && element.productDetail.productBO.partNumber == this.defaultPartNumber) ||
                                (element.productDetail.productBO && element.productDetail.productBO.partNumber == this.productSubPartNumber)
                            ) {
                                this.isPurcahseListProduct = true;
                            }
                        });
                    }
                })
            }
        }
    }

    addToPurchaseList()
    {
        if (this.isPurcahseListProduct) {
            this.removeItemFromPurchaseList();
        } else {
            if (this.localStorageService.retrieve('user')) {
                let user = this.localStorageService.retrieve('user');
                if (user && user.authenticated == "true") {
                    let userSession = this.localAuthService.getUserSession();
                    this.isPurcahseListProduct = true;
                    let obj = {
                        "idUser": userSession.userId,
                        "userType": "business",
                        "idProduct": this.productSubPartNumber || this.defaultPartNumber,
                        "productName": this.productName,
                        "description": this.productDescripton,
                        "brand": this.productBrandDetails['brandName'],
                        "category": this.productCategoryDetails['categoryCode'],
                    };
                    this.showLoader = true;
                    this.productService.addToPurchaseList(obj).subscribe((res) =>
                    {
                        this.showLoader = false;
                        if (res["status"]) {
                            this._tms.show({ type: 'success', text: 'Successfully added to WishList' });
                        }
                    })
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
            "idUser": userSession.userId,
            "userType": "business",
            "idProduct": this.productSubPartNumber || this.defaultPartNumber,
            "productName": this.productName,
            "description": this.productDescripton,
            "brand": this.productBrandDetails['brandName'],
            "category": this.productCategoryDetails['categoryCode'],
        }

        this.productService.removePurchaseList(obj).subscribe(
            res =>
            {
                if (res["status"]) {
                    this._tms.show({ type: 'success', text: 'Successfully removed from WishList' });
                    this.showLoader = false;
                    this.getPurchaseList();
                }
                else {
                    this.showLoader = false;
                }
            },
            err =>
            {
                this.showLoader = false;
            }
        )
    }

    // Frequently brought togther functions
    fetchFBTProducts(rootProduct)
    {
        if (this.productOutOfStock) {
            this.productUtil.resetFBTSource();
        } else {
            this.fbtFlag = false;
            let rootvalidation = this.productUtil.validateProduct(rootProduct['productBO']);
            if (rootProduct['status'] && rootvalidation) {
                let productId = rootProduct['productBO']['partNumber'];
                this.processFBTResponse(rootProduct, this.rawProductFbtData);
                // this.productService.getFBTProducts(productId).subscribe((response) => {
                //   this.showLoader = false;

                // }, error => {
                //   this.showLoader = false;
                //   this.fbtFlag = false;
                // });
            }
        }
    }

    processFBTResponse(productResponse, fbtResponse)
    {
        //console.log('processFBTResponse', 'called');
        if (fbtResponse['status'] && fbtResponse['data']) {
            //console.log('processFBTResponse', 'in');
            let validFbts: any[] = this.productUtil.validateFBTProducts(fbtResponse['data']);
            if (validFbts.length > 0) {
                this.productUtil.changeFBTSource(productResponse, validFbts);
                this.fbtFlag = true;
            } else {
                this.fbtFlag = false;
            }
        } else {
            //console.log('processFBTResponse', 'else');
            this.productUtil.resetFBTSource();
        }
    }

    sendProductImageClickTracking() {
        let page = {
          'channel': "pdp image carausel",
          'pageName': "moglix:image carausel:pdp",
          'linkName': "moglix:productmainimageclick_0",
          'subSection': "moglix:pdp carausel main image:pdp",
          'linkPageName': "moglix:" + this.router.url,
        }
        this.analytics.sendAdobeCall({ page }, "genericPageLoad");
      }

    async showFBT()
    {
        if (this.fbtFlag) {
            const TAXONS = this.taxons;
            let page = {
                pageName: `moglix:${TAXONS[0]}:${TAXONS[1]}:${TAXONS[2]}:pdp`,
                channel: "About This Product", subSection: null,
                linkPageName: null, linkName: null, loginStatus: this.loginStatusTracking
            }
            let analytics = { page: page, custData: this.custDataTracking, order: this.orderTracking };
            this.modalService.show({
                inputs: { modalData: { isModal: true, backToCartFlow: this.addToCartFromModal.bind(this), analytics: analytics } },
                component: FbtComponent,
                outputs: {},
                mConfig: { className: 'ex' }
            });
        } else {
            this.addToCart('/quickorder');
        }
    }

    // cart methods 
    buyNow(routerlink)
    {
        const buyNow = true;
        const user = this.localStorageService.retrieve('user');
        if (!user || !user.authenticated || user.authenticated === "false") {
            this.addToCart(routerlink, true);
            return;
        }
        this.addToCart(routerlink, buyNow);
    }

    addToCartFromModal(routerLink)
    {
        this.addToCart(routerLink);
    }

    addToCart(routerlink, buyNow = false)
    {
        //  to be called on client side only.
        let quantity = Number((<HTMLInputElement>document.querySelector("#product_quantity")).value);;

        this.analyticAddToCart(routerlink, quantity); // since legacy buy  now analytic code is used 

        if (this.uniqueRequestNo == 0) {
            this.uniqueRequestNo = 1;

            let sessionDetails = this.cartService.getCartSession();

            if (sessionDetails['cart']) {
                this.addProductInCart(routerlink, sessionDetails['cart'], quantity, buyNow);
            } else {
                this.localStorageService.clear('user');
                this.commonService.getSession().subscribe((res) =>
                {
                    if (res['statusCode'] != undefined && res['statusCode'] == 500) {
                    } else {
                        this.localAuthService.setUserSession(res);
                        let userSession = this.localAuthService.getUserSession();
                        let params = { "sessionid": userSession.sessionId };
                        this.cartService.getCartBySession(params).subscribe((cartSession) =>
                        {
                            if (cartSession['statusCode'] != undefined && cartSession['statusCode'] == 200) {
                                this.cartService.orderSummary.next(cartSession);
                                this.cartService.cart.next({ count: cartSession["cart"] != undefined ? cartSession['noOfItems'] : 0, currentlyAdded: this.currentAddedProduct });
                                this.addProductInCart(routerlink, cartSession['cart'], quantity);
                            }
                        });
                    }
                });
            }
        }

    }

    addProductInCart(routerLink, sessionCartObject, quantity, buyNow?)
    {

        this.checkoutService.setCheckoutTabIndex(1);

        const userSession = this.localStorageService.retrieve('user');
        let sessionItemList: Array<any> = [];
        let sessionDetails = this.cartService.getCartSession();

        if (sessionDetails['itemsList'] == null) {
            sessionItemList = [];
        } else {
            sessionItemList = sessionDetails['itemsList'];
        }

        if (sessionDetails && sessionDetails['itemsList']) {
            sessionDetails['itemsList'].forEach(ele =>
            {
                if ((ele.productId == this.productSubPartNumber) || (ele.productId == this.defaultPartNumber)) {
                    return;
                }
            });
        }

        let singleProductItem = {
            "cartId": sessionCartObject.cartId,
            "productId": this.productSubPartNumber || this.defaultPartNumber,
            "createdAt": new Date(),
            "updatedAt": new Date(),
            "amount": Number(this.productMrp),
            "offer": null,
            "amountWithOffer": null,
            "taxes": this.productTax,
            "amountWithTaxes": null,
            "totalPayableAmount": this.productPrice,
            "productName": this.productName,
            "brandName": this.productBrandDetails['brandName'],
            "productMRP": this.productMrp,
            "priceWithoutTax": this.priceWithoutTax,
            "tpawot": this.priceWithoutTax,
            "taxPercentage": this.priceQuantityCountry['taxRule']['taxPercentage'],
            "productSelling": this.productPrice,
            "discount": this.productDiscount,
            "productImg": this.productCartThumb,
            "isPersistant": true,
            "productQuantity": Number(quantity),
            "productUnitPrice": this.productPrice,
            "expireAt": null,
            "productUrl": this.productUrl,
            "bulkPriceMap": this.priceQuantityCountry['bulkPricesIndia'],
            "bulkPrice": this.bulkSellingPrice,
            "bulkPriceWithoutTax": this.bulkPriceWithoutTax,
            "categoryCode": this.productCategoryDetails['categoryCode'],
            "taxonomyCode": this.productCategoryDetails['taxonomyCode']
        };

        // console.log('singleProductItem', singleProductItem);

        if (buyNow) {
            singleProductItem['buyNow'] = buyNow;
            sessionItemList = [];
        }
        const checkAddToCartData = this.checkAddToCart(sessionItemList, singleProductItem);

        if (checkAddToCartData.isvalid) {
            var taxonomy = this.productCategoryDetails['taxonomyCode'];
            var trackingData = {
                event_type: "click",
                label: routerLink == "/quickorder" ? (this.displayCardCta ? "add_to_cart_overlay" : "add_to_cart") : ( this.displayCardCta ? "buy_now_overlay" : "buy_now"),
                product_name: this.productName,
                msn: this.productSubPartNumber || this.defaultPartNumber,
                brand: this.productBrandDetails['brandName'],
                price: this.productPrice,
                quantity: Number(quantity),
                channel: "PDP",
                category_l1: taxonomy.split("/")[0] ? taxonomy.split("/")[0] : null,
                category_l2: taxonomy.split("/")[1] ? taxonomy.split("/")[1] : null,
                category_l3: taxonomy.split("/")[2] ? taxonomy.split("/")[2] : null,
                page_type: "product_page"
            }

            this.dataService.sendMessage(trackingData);

            this.showLoader = true;

            sessionDetails["cart"]["buyNow"] = buyNow;
            sessionDetails["itemsList"] = checkAddToCartData.itemlist;
            sessionDetails = this.cartService.updateCart(sessionDetails);


            this.currentAddedProduct = Object.assign({}, singleProductItem);
            if (!buyNow) {
                this.cartService.setCartSession(sessionDetails);
            }
            this.cartSession = this.cartService.getCartSession();
            this.productUtil.checkRootItemInCart(this.currentAddedProduct['productId']);
            this.fireViewBasketEvent();
            let user = this.localStorageService.retrieve('user');
            if (buyNow) {
                const cartSession = this.removePromoCode(sessionDetails);
                sessionDetails = cartSession;
            }
            /**
             * Below case is only when user is not loggedin or usersession is set to undefined or null.
             */
            if (buyNow && (!userSession || userSession['authenticated'] != "true")) {
                this.cartService.buyNowSessionDetails = sessionDetails;
                this.router.navigateByUrl('/checkout', { state: buyNow ? { buyNow: buyNow } : {} });   //this redirect to quick order page
                return;
            }

            this.showLoader = true;

            this.cartService.updateCartSessions(routerLink, sessionDetails, buyNow).subscribe(data =>
            {
                this.showLoader = false;
                this.updateCartSessions(data, routerLink, buyNow);
            }, err =>
            {
                this.showLoader = false;
                this.updateCartSessions(null, routerLink);
            });

            if (this.cartSession['itemsList'] !== null && this.cartSession['itemsList']) {
                var totQuantity = 0;
                var trackData = {
                    event_type: "click",
                    page_type: "product_page",
                    label: "cart_updated",
                    channel: "PDP",
                    price: this.cartSession["cart"]["totalPayableAmount"] ? this.cartSession["cart"]["totalPayableAmount"].toString() : "",
                    quantity: this.cartSession["itemsList"].map(item =>
                    {
                        return totQuantity = totQuantity + item.productQuantity;
                    })[this.cartSession["itemsList"].length - 1],
                    shipping: parseFloat(this.cartSession["shippingCharges"]),
                    itemList: this.cartSession["itemsList"].map(item =>
                    {
                        return {
                            category_l1: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[0] : null,
                            category_l2: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[1] : null,
                            category_l3: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[2] : null,
                            price: item["totalPayableAmount"].toString(),
                            quantity: item["productQuantity"]
                        }
                    })
                }
                this.dataService.sendMessage(trackData);
            }
        }
    }

    fireViewBasketEvent()
    {
        let eventData = {
            'prodId': '',
            'prodPrice': 0,
            'prodQuantity': 0,
            'prodImage': '',
            'prodName': '',
            'prodURL': ''
        };
        let criteoItem = [];
        for (let p = 0; p < this.cartSession["itemsList"].length; p++) {
            criteoItem.push({ name: this.cartSession["itemsList"][p]['productName'], brandId: this.productBrandDetails['idBrand'], id: this.cartSession["itemsList"][p]['productId'], price: this.cartSession["itemsList"][p]['productUnitPrice'], quantity: this.cartSession["itemsList"][p]['productQuantity'], image: this.cartSession["itemsList"][p]['productImg'], url: CONSTANTS.PROD + '/' + this.cartSession["itemsList"][p]['productUrl'] });
            eventData['prodId'] = this.cartSession["itemsList"][p]['productId'] + ', ' + eventData['prodId'];
            eventData['prodPrice'] = this.cartSession["itemsList"][p]['productUnitPrice'] * this.cartSession["itemsList"][p]['productQuantity'] + eventData['prodPrice'];
            eventData['prodQuantity'] = this.cartSession["itemsList"][p]['productQuantity'] + eventData['prodQuantity'];
            eventData['prodImage'] = this.cartSession["itemsList"][p]['productImg'] + ', ' + eventData['prodImage'];
            eventData['prodName'] = this.cartSession["itemsList"][p]['productName'] + ', ' + eventData['prodName'];
            eventData['prodURL'] = this.cartSession["itemsList"][p]['productUrl'] + ', ' + eventData['prodURL'];
        }
        let user = this.localStorageService.retrieve('user');

        const dataLayerObj = {
            'event': 'viewBasket',
            'email': (user && user.email) ? user.email : '',
            'currency': 'INR',
            'productBasketProducts': criteoItem,
            'eventData': eventData
        }
        this.analytics.sendGTMCall(dataLayerObj);
        this.dataService.sendMessage(dataLayerObj);

    }

    updateCartSessions(data, routerLink, buyNow?)
    {
        if (data && data.status) {
            // this.sessionDetails = data;
            this.uniqueRequestNo = 0;
            this.cartService.setCartSession(data);
            //  ;
            this.cartService.cart.next({ count: data['noOfItems'], currentlyAdded: this.currentAddedProduct });
            this.showAddToCartToast();

            let td: any = new Date();
            td.setHours(21, 0, 0);
            td = td.getTime() / 1000;
            let nd: any = new Date();
            nd.setHours(8, 0, 0);
            nd.setDate(nd.getDate() + 1);
            nd = nd.getTime() / 1000;
            let cd: any = new Date();
            cd.setHours(cd.getHours() + 2);
            cd = cd.getTime() / 1000;

            let NIGHTFLAG = false;
            if (cd > td && cd < nd)
                NIGHTFLAG = true;

            if (this.isBrowser && this.priceQuantityCountry['bulkPricesModified'] == null)
                (<HTMLInputElement>document.querySelector("#product_quantity")).value = this.productMinimmumQuantity;
            else {
                // alert(this.productMinimmumQuantity);
                (<HTMLInputElement>document.querySelector("#product_quantity")).value = this.bulkPriceSelctedQuatity != 0 ? this.bulkPriceSelctedQuatity : this.productMinimmumQuantity;
            }
            if (routerLink == "/checkout") {
                this.router.navigateByUrl(routerLink, { state: buyNow ? { buyNow: buyNow } : {} });   //this redirect to quick order page
            }
            // else {
            //     this._tms.show({ type: 'success', text: this.addCartMessage });
            // }
        }
        else {
            if (this.isBrowser && this.priceQuantityCountry['bulkPricesModified'] == null) {
                (<HTMLInputElement>document.querySelector("#product_quantity")).value = this.productMinimmumQuantity;
            } else {
                // alert(this.bulkPriceSelctedQuatity);
                // alert(this.productMinimmumQuantity);
                (<HTMLInputElement>document.querySelector("#product_quantity")).value = this.bulkPriceSelctedQuatity != 0 ? this.bulkPriceSelctedQuatity : this.productMinimmumQuantity;
            }
            this.uniqueRequestNo = 0;
        }
    }

    checkAddToCart(itemsList, addToCartItem): { itemlist: any, isvalid: boolean }
    {
        let isOrderValid: boolean = true;
        let addToCartItemIsExist: boolean = false;
        itemsList.forEach(element =>
        {
            if (addToCartItem.productId === element.productId) {
                addToCartItemIsExist = true;
                let checkProductQuantity = element.productQuantity + addToCartItem.productQuantity;
                if (checkProductQuantity > Number(this.priceQuantityCountry['quantityAvailable'])) {
                    element.productQuantity = element.productQuantity;
                    this.uniqueRequestNo = 0;
                    this._tms.show({ type: 'error', text: this.priceQuantityCountry['quantityAvailable'] + ' is the maximum quantity available.' });
                    isOrderValid = false;
                }
                else {
                    this.changeBulkPriceQuantity(element.productQuantity);
                    element.productQuantity = element.productQuantity + addToCartItem.productQuantity;
                    element.taxes = element.productQuantity * this.productTax;
                    element.bulkPrice = this.bulkSellingPrice;
                    element.bulkPriceWithoutTax = this.bulkPriceWithoutTax;
                    element.bulkPriceMap = this.priceQuantityCountry['bulkPricesIndia'];

                }
                element.productUrl = addToCartItem.productUrl;
                element.totalPayableAmount = element.totalPayableAmount + addToCartItem.totalPayableAmount;
                element.tpawot = element.priceWithoutTax + addToCartItem.priceWithoutTax;
            }
        });
        if (!addToCartItemIsExist) {
            let quantity = Number((<HTMLInputElement>document.querySelector("#product_quantity")).value);
            if (addToCartItem.productQuantity > Number(this.priceQuantityCountry['quantityAvailable'])) {
                this.uniqueRequestNo = 0;
                this._tms.show({ type: 'error', text: this.priceQuantityCountry['quantityAvailable'] + ' is the maximum quantity available.' });
                isOrderValid = false;
            }
            else if (!isNaN(quantity) && quantity < this.productMinimmumQuantity) {
                this._tms.show({ type: 'error', text: "Quantity cannot  be less than " + this.productMinimmumQuantity });
                isOrderValid = false;
                this.uniqueRequestNo = 0;
            }
            else if (!isNaN(quantity) && quantity >= this.productMinimmumQuantity) {
                this.changeBulkPriceQuantity(0);
                addToCartItem.bulkPrice = this.bulkSellingPrice;
                addToCartItem.bulkPriceWithoutTax = this.bulkPriceWithoutTax;
                addToCartItem.bulkPriceMap = this.priceQuantityCountry['bulkPricesIndia'];
                itemsList.push(addToCartItem);
            } else {
                this.changeBulkPriceQuantity(0);
                addToCartItem.bulkPrice = this.bulkSellingPrice;
                addToCartItem.bulkPriceWithoutTax = this.bulkPriceWithoutTax;
                addToCartItem.bulkPriceMap = this.priceQuantityCountry['bulkPricesIndia'];
                itemsList.push(addToCartItem);
            }

        }
        return { itemlist: itemsList, isvalid: isOrderValid };
    }


    changeBulkPriceQuantity(input, eventFrom?: string)
    {
        this.bulkPriceSelctedQuatity = 0;
        let value = Number((<HTMLInputElement>document.querySelector("#product_quantity")).value) + input;
        if (value >= 1) {
            if (this.priceQuantityCountry['bulkPricesModified'] && this.priceQuantityCountry['bulkPricesModified'] !== null && this.priceQuantityCountry['bulkPricesModified'].length > 0) {

                this.bulkSellingPrice = null;
                this.bulkPriceWithoutTax = null;
                if (isNaN(value)) {
                    value = input;
                }
                let isBulkPriceValid: boolean = false;

                this.priceQuantityCountry['bulkPricesModified'].forEach((element, index) =>
                {
                    if (element.minQty <= value && value <= element.maxQty) {

                        isBulkPriceValid = true
                        this.bulkPriceSelctedQuatity = element.minQty;
                        this.bulkSellingPrice = element.bulkSellingPrice;
                        this.bulkPriceWithoutTax = element.bulkSPWithoutTax;
                        this.bulkDiscount = element.discount;

                        let disc = 0;
                        if (this.productMrp > 0 && this.productPrice > 0) {
                            disc = (((this.productMrp - this.bulkSellingPrice) / this.productMrp) * 100)
                            this.productDiscount = disc;
                        }
                        // Update quantity in input box only when bulk price is selected from bulk price table 
                        if (eventFrom && (eventFrom == 'bulkTableClick' || eventFrom == 'incrementButton' || eventFrom == 'decrementButton'))
                            (<HTMLInputElement>document.querySelector("#product_quantity")).value = Number((<HTMLInputElement>document.querySelector("#product_quantity")).value) + input;

                    }
                    if (this.priceQuantityCountry['bulkPricesModified'].length - 1 == index && value >= element.maxQty) {

                        isBulkPriceValid = true
                        this.bulkPriceSelctedQuatity = element.minQty;
                        this.bulkSellingPrice = element.bulkSellingPrice;
                        this.bulkPriceWithoutTax = element.bulkSPWithoutTax;
                        this.bulkDiscount = element.discount;

                        let disc = 0;
                        if (this.productMrp > 0 && this.productPrice > 0) {
                            disc = (((this.productMrp - this.bulkSellingPrice) / this.productMrp) * 100)
                            this.productDiscount = disc;
                        }
                        // Update quantity in input box only when bulk price is selected from bulk price table 
                        if (eventFrom && (eventFrom == 'bulkTableClick' || eventFrom == 'incrementButton' || eventFrom == 'decrementButton'))
                            (<HTMLInputElement>document.querySelector("#product_quantity")).value = Number((<HTMLInputElement>document.querySelector("#product_quantity")).value) + input;
                    }
                });
                if (!isBulkPriceValid && (eventFrom == 'incrementButton' || value >= this.productMinimmumQuantity)) {
                    (<HTMLInputElement>document.querySelector("#product_quantity")).value = Number((<HTMLInputElement>document.querySelector("#product_quantity")).value) + input;
                }
            } else {
                if (eventFrom && (eventFrom == 'bulkTableClick' || eventFrom == 'incrementButton' || (eventFrom == 'decrementButton' && value >= this.productMinimmumQuantity))) {
                    (<HTMLInputElement>document.querySelector("#product_quantity")).value = Number((<HTMLInputElement>document.querySelector("#product_quantity")).value) + input;
                }
            }
        } else {
            if ((eventFrom == "decrementButton" && value >= this.productMinimmumQuantity)) {
                (<HTMLInputElement>document.querySelector("#product_quantity")).value = this.productMinimmumQuantity;
            }
        }

        if (Number((<HTMLInputElement>document.querySelector("#product_quantity")).value) > this.priceQuantityCountry['quantityAvailable']) {
            this._tms.show({ type: 'error', text: this.priceQuantityCountry['quantityAvailable'] + ' is the maximum quantity available.' });
        }
    }

    removePromoCode(cartSession)
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

    changeBulkQty(value, index)
    {
        if (this.isBrowser) {
            (<HTMLInputElement>document.querySelector("#product_quantity")).value = "0";
        }
        this.selectedBulkQuantityIndex = index;
        this.changeBulkPriceQuantity(value, 'bulkTableClick');
    }

    // common functions 
    goToLoginPage(link)
    {
        let navigationExtras: NavigationExtras = {
            queryParams: { 'backurl': link },
        };
        this.router.navigate(['/login'], navigationExtras);
    }

    navigateToFAQ()
    {
        this.router.navigate(['faq', { active: 'CRP' }]);
    }

    // dynamically load similar section 
    async onVisibleSimilar(htmlElement)
    {
        if (!this.similarProductInstance) {
            const { SimilarProductsComponent } = await import('./../../components/similar-products/similar-products.component')
            const factory = this.cfr.resolveComponentFactory(SimilarProductsComponent);
            this.similarProductInstance = this.similarProductContainerRef.createComponent(factory, null, this.injector);

            this.similarProductInstance.instance['productName'] = this.productName;
            this.similarProductInstance.instance['categoryCode'] = this.productCategoryDetails['categoryCode'];

            this.similarProductInstance.instance['outOfStock'] = this.productOutOfStock;
            const custData = this.custDataTracking;
            const orderData = this.orderTracking;
            const TAXONS = this.taxons;
            const page = {
                pageName: null,
                channel: "pdp", subSection: "Similar Products",
                linkPageName: `moglix:${TAXONS[0]}:${TAXONS[1]}:${TAXONS[2]}:pdp`, linkName: null, loginStatus: this.loginStatusTracking
            }
            this.similarProductInstance.instance['analytics'] = { page: page, custData: custData, order: orderData };
        }
    }

    // dynamically load similar section 
    async onVisibleSponsered(htmlElement)
    {
        if (!this.sponseredProductsInstance) {
            const { ProductSponsoredListComponent } = await import('./../../components/product-sponsored-list/product-sponsored-list.component');
            const factory = this.cfr.resolveComponentFactory(ProductSponsoredListComponent);
            this.sponseredProductsInstance = this.sponseredProductsContainerRef.createComponent(factory, null, this.injector);
            this.sponseredProductsInstance.instance['productName'] = this.productName;
            this.sponseredProductsInstance.instance['productId'] = this.defaultPartNumber;
            this.sponseredProductsInstance.instance['categoryCode'] = this.productCategoryDetails['categoryCode'];
            this.sponseredProductsInstance.instance['outOfStock'] = this.productOutOfStock;
            const custData = this.custDataTracking;
            const orderData = this.orderTracking;
            const TAXONS = this.taxons;
            const page = {
                pageName: null,
                channel: "pdp", subSection: "You May Also Like",
                linkPageName: `moglix:${TAXONS[0]}:${TAXONS[1]}:${TAXONS[2]}:pdp`, linkName: null, loginStatus: this.loginStatusTracking
            }
            this.sponseredProductsInstance.instance['analytics'] = { page: page, custData: custData, order: orderData };
        }
    }


    // dynamically recent products section 
    async onVisibleRecentProduct(htmlElement)
    {
        // console.log('onVisibleRecentProduct', htmlElement);
        if (!this.recentProductsInstance) {
            const { RecentViewedProductsComponent } = await import('./../../components/recent-viewed-products/recent-viewed-products.component')
            const factory = this.cfr.resolveComponentFactory(RecentViewedProductsComponent);
            this.recentProductsInstance = this.recentProductsContainerRef.createComponent(factory, null, this.injector);
            this.recentProductsInstance.instance['outOfStock'] = this.productOutOfStock;
            const custData = this.custDataTracking;
            const orderData = this.orderTracking;
            const TAXONS = this.taxons;
            const page = {
                pageName: null,
                channel: "pdp", subSection: "Recently Viewed",
                linkPageName: `moglix:${TAXONS[0]}:${TAXONS[1]}:${TAXONS[2]}:pdp`, linkName: null, loginStatus: this.loginStatusTracking
            }
            this.recentProductsInstance.instance['analytics'] = { page: page, custData: custData, order: orderData};
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
        if (this.localStorageService.retrieve('user')) {
            let user = this.localStorageService.retrieve('user')
            if (user.authenticated == "true") {
                let obj = {
                    // new obj for post user question
                    "categoryCode": this.productCategoryDetails['categoryCode'],
                    "categoryName": this.productCategoryDetails['categoryName'],
                    "customerId": user.userId,
                    "productMsn": this.productSubPartNumber || this.defaultPartNumber,
                    "questionText": this.questionAnswerForm.controls['question'].value,
                    "taxonomy": this.productCategoryDetails['taxonomy'],
                    "taxonomyCode": this.productCategoryDetails['taxonomyCode']
                }
                this.productService.postQuestion(obj).subscribe(res =>
                {
                    if (res['code'] == 200) {
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
        // console.log('toggleLoader called', status);
        this.showLoader = status;
    }

    // product-rfq 
    async onVisibleProductRFQ(htmlElement)
    {
        this.removeRfqForm();
        if (!this.productRFQInstance) {
            this.intiateRFQQuote(false, false);
        }
    }

    async raiseRFQQuote()
    {
        let user = this.localStorageService.retrieve('user');
        if (user && user.authenticated == "true") {
            this.intiateRFQQuote(true);
        } else {
            let navigationExtras: NavigationExtras = { queryParams: { 'backurl': this.productUrl } };
            this.router.navigate(['/login'], navigationExtras);
        }
    }

    closeRFQAlert() { this.isRFQSuccessfull = false }

    async intiateRFQQuote(inStock, sendAnalyticOnOpen = true)
    {
        const { ProductRFQComponent } = await import('./../../components/product-rfq/product-rfq.component').finally(() =>
        {
            if (sendAnalyticOnOpen) { this.analyticRFQ(false) }
        });
        const factory = this.cfr.resolveComponentFactory(ProductRFQComponent);
        this.productRFQInstance = this.productRFQContainerRef.createComponent(factory, null, this.injector);
        this.productRFQInstance.instance['isOutOfStock'] = this.productOutOfStock;
        this.productRFQInstance.instance['isPopup'] = inStock;
        let product = {
            url: this.productUrl,
            price: this.productPrice,
            msn: (this.productSubPartNumber || this.defaultPartNumber),
            productName: this.productName,
            moq: this.productMinimmumQuantity,
            brand: this.productBrandDetails['brandName'],
            taxonomyCode: this.productCategoryDetails['taxonomy'],
            adobeTags: ''
        }
        this.productRFQInstance.instance['product'] = product;
        (this.productRFQInstance.instance['isLoading'] as EventEmitter<boolean>).subscribe(loaderStatus =>
        {
            this.toggleLoader(loaderStatus);
        });
        (this.productRFQInstance.instance['onRFQSuccess'] as EventEmitter<boolean>).subscribe((status) =>
        {
            this.analyticRFQ(true);
            this.isRFQSuccessfull = true;
        });
    }

    async onVisiblePincodeSection($event)
    {
        this.showLoader = true;
        const { ProductCheckPincodeComponent } = await import('./../../components/product-check-pincode/product-check-pincode.component').finally(() =>
        {
            this.showLoader = false;
        });
        const factory = this.cfr.resolveComponentFactory(ProductCheckPincodeComponent);
        this.pincodeFormInstance = this.pincodeFormContainerRef.createComponent(factory, null, this.injector);
        const quantity = Number((<HTMLInputElement>document.querySelector("#product_quantity")).value);
        const productInfo = {};
        productInfo['partNumber'] = this.productSubPartNumber || this.defaultPartNumber;
        productInfo['estimatedDelivery'] = this.priceQuantityCountry['estimatedDelivery'];
        productInfo['categoryDetails'] = this.productCategoryDetails;
        productInfo['productPrice'] = this.productPrice;
        productInfo['quantity'] = quantity;
        this.pincodeFormInstance.instance['pageData'] = productInfo;
        if (this.pincodeFormInstance) {
            (this.pincodeFormInstance.instance['sendAnalyticsCall'] as EventEmitter<any>).subscribe(data =>
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

    async onVisibleOffer(htmlElement)
    {
        if (!this.productOutOfStock && this.productMrp > 0) {
            const { ProductOffersComponent } = await import('./../../components/product-offers/product-offers.component')
            const factory = this.cfr.resolveComponentFactory(ProductOffersComponent);
            this.offerSectionInstance = this.offerSectionContainerRef.createComponent(factory, null, this.injector);
            let price = 0;
            if (this.priceWithoutTax > 0 && this.bulkPriceWithoutTax == null) {
                price = this.priceWithoutTax;
            } else if (this.bulkPriceWithoutTax !== null) {
                price = this.priceWithoutTax;
            }
            this.offerSectionInstance.instance['price'] = price;
            (this.offerSectionInstance.instance['viewPopUpHandler'] as EventEmitter<boolean>).subscribe(data =>
            {
                this.viewPopUpOpen(data);
            });
            (this.offerSectionInstance.instance['emaiComparePopUpHandler'] as EventEmitter<boolean>).subscribe(status =>
            {
                this.emiComparePopUpOpen(status);
            });
        }
    }

    async viewPopUpOpen(data)
    {
        if (!this.offerPopupInstance) {
            this.showLoader = true;
            const { ProductOfferPopupComponent } = await import('./../../components/product-offer-popup/product-offer-popup.component').finally(() =>
            {
                this.showLoader = false;
            });
            const factory = this.cfr.resolveComponentFactory(ProductOfferPopupComponent);
            this.offerPopupInstance = this.offerPopupContainerRef.createComponent(factory, null, this.injector);
            this.offerPopupInstance.instance['data'] = data['block_data'];
            this.offerPopupInstance.instance['openMobikwikPopup'] = true;
            (this.offerPopupInstance.instance['out'] as EventEmitter<boolean>).subscribe(data =>
            {
                // create a new component after component is closed
                // this is required, to refresh input data
                this.offerPopupInstance = null;
                this.offerPopupContainerRef.remove();
            });
            (this.offerComparePopupInstance.instance['isLoading'] as EventEmitter<boolean>).subscribe(loaderStatus =>
            {
                this.toggleLoader(loaderStatus);
            });
        }
    }

    async emiComparePopUpOpen(status)
    {
        if (!this.offerComparePopupInstance && status) {
            this.showLoader = true;
            const quantity = Number((<HTMLInputElement>document.querySelector("#product_quantity")).value);
            const { EmiPlansComponent } = await import('./../../modules/emi-plans/emi-plans.component').finally(() =>
            {
                this.showLoader = false;
            });
            const factory = this.cfr.resolveComponentFactory(EmiPlansComponent);
            this.offerComparePopupInstance = this.offerComparePopupContainerRef.createComponent(factory, null, this.injector);
            const productInfo = {};
            productInfo['productName'] = this.productName;
            productInfo['minimal_quantity'] = this.productMinimmumQuantity;
            productInfo['priceWithoutTax'] = this.priceWithoutTax;
            this.offerComparePopupInstance.instance['productInfo'] = productInfo;
            this.offerComparePopupInstance.instance['quantity'] = quantity;
            this.offerComparePopupInstance.instance['openEMIPopup'] = true;
            (this.offerComparePopupInstance.instance['out'] as EventEmitter<boolean>).subscribe(data =>
            {
                // create a new component after component is closed
                // this is required, to refresh input data
                this.offerComparePopupInstance = null;
                this.offerComparePopupContainerRef.detach();
            });
            (this.offerComparePopupInstance.instance['isLoading'] as EventEmitter<boolean>).subscribe(loaderStatus =>
            {
                this.toggleLoader(loaderStatus);
            });
        }
    }


    async getFbtIntance(htmlElement)
    {
        if (!this.fbtComponentInstance) {
            const { FbtComponent } = await import('./../../components/fbt/fbt.component')
            const factory = this.cfr.resolveComponentFactory(FbtComponent);
            this.fbtComponentInstance = this.fbtComponentContainerRef.createComponent(factory, null, this.injector);
            //this.fbtComponentInstance.instance['addToCartFromModal'] = this.addToCartFromModal.bind(this);
            this.fbtComponentInstance.instance['isModal'] = false;
            const TAXONS = this.taxons;
            let page = {
                pageName: `moglix:${TAXONS[0]}:${TAXONS[1]}:${TAXONS[2]}:pdp`,
                channel: "About This Product", subSection: null,
                linkPageName: null, linkName: null, loginStatus: this.loginStatusTracking
            }
            this.fbtComponentInstance.instance['analytics'] = { page: page, custData: this.custDataTracking, order: this.orderTracking };;

        }
    }

    async showAddToCartToast()
    {
        if (!this.addToCartToastInstance) {
            const { GlobalToastComponent } = await import('../../components/global-toast/global-toast.component');
            const factory = this.cfr.resolveComponentFactory(GlobalToastComponent);
            this.addToCartToastInstance = this.addToCartToastContainerRef.createComponent(factory, null, this.injector);
            this.addToCartToastInstance.instance['text'] = this.rawCartNotificationMessage;
            this.addToCartToastInstance.instance['btnText'] = 'VIEW CART';
            this.addToCartToastInstance.instance['btnLink'] = '/quickorder';
            this.addToCartToastInstance.instance['showTime'] = 6000;

            (this.addToCartToastInstance.instance['removed'] as EventEmitter<boolean>).subscribe(status =>
            {
                this.addToCartToastInstance = null;
                this.addToCartToastContainerRef.detach();
            });
        }
    }

    async writeReview()
    {
        let user = this.localStorageService.retrieve('user');
        if (user && user.authenticated == "true") {
            this.sendProductInfotracking("write a review");
            if (!this.writeReviewPopupInstance) {
                this.showLoader = true;
                const { PostProductReviewPopupComponent } = await import('../../components/post-product-review-popup/post-product-review-popup.component').finally(() =>
                {
                    this.showLoader = false;
                });
                const factory = this.cfr.resolveComponentFactory(PostProductReviewPopupComponent);
                this.writeReviewPopupInstance = this.writeReviewPopupContainerRef.createComponent(factory, null, this.injector);

                const productInfo = {};
                productInfo['productName'] = this.productName;
                productInfo['partNumber'] = this.productSubPartNumber || this.defaultPartNumber;

                this.writeReviewPopupInstance.instance['productInfo'] = productInfo;
                (this.writeReviewPopupInstance.instance['removed'] as EventEmitter<boolean>).subscribe(status =>
                {
                    // console.log('writeReview removed', status);
                    this.writeReviewPopupInstance = null;
                    this.writeReviewPopupContainerRef.detach();
                });

                (this.writeReviewPopupInstance.instance['submitted'] as EventEmitter<boolean>).subscribe(status =>
                {
                    this.loadAlertBox(
                        'Review Submitted Successfully',
                        `Thankyou for giving us your <br /> valuable time.`
                    );
                });

            }

        } else {
            this.router.navigateByUrl('/login');
        }
    }

    async openPopUpcrousel(slideNumber: number = 1)
    {
        if (!this.popupCrouselInstance) {
            this.showLoader = true;
            this.displayCardCta = true;
            const { ProductCrouselPopupComponent } = await import('../../components/product-crousel-popup/product-crousel-popup.component').finally(() =>
            {
                this.showLoader = false;
            });
            const factory = this.cfr.resolveComponentFactory(ProductCrouselPopupComponent);
            this.popupCrouselInstance = this.popupCrouselContainerRef.createComponent(factory, null, this.injector);

            const options = Object.assign({}, this.iOptions);
            options.pager = false
            this.popupCrouselInstance.instance['options'] = options;
            this.popupCrouselInstance.instance['productAllImages'] = this.productAllImages;
            this.popupCrouselInstance.instance['slideNumber'] = slideNumber;

            (this.popupCrouselInstance.instance['out'] as EventEmitter<boolean>).subscribe(status =>
            {
                this.displayCardCta = false;
                this.popupCrouselInstance = null;
                this.popupCrouselContainerRef.remove();
            });
            (this.popupCrouselInstance.instance['currentSlide'] as EventEmitter<boolean>).subscribe(slideData =>
            {
                if (slideData) {
                    this.moveToSlide$.next(slideData.currentSlide);
                }
            });
        }
    }

    async loadProductCrousel(slideIndex)
    {
        if (!this.productCrouselInstance) {
            this.isProductCrouselLoaded = true;
            const { ProductCrouselComponent } = await import('../../modules/product-crousel/ProductCrousel.component').finally(() =>
            {
                this.clearPseudoImageCrousel();
            });
            const factory = this.cfr.resolveComponentFactory(ProductCrouselComponent);
            this.productCrouselInstance = this.productCrouselContainerRef.createComponent(factory, null, this.injector);
            this.productCrouselInstance.instance['options'] = this.iOptions;
            this.productCrouselInstance.instance['items'] = this.productAllImages;
            this.productCrouselInstance.instance['moveToSlide$'] = this.moveToSlide$;
            this.productCrouselInstance.instance['refreshSiemaItems$'] = this.refreshSiemaItems$;
            this.productCrouselInstance.instance['productName'] = this.productName;
            setTimeout(() =>
            {
                (this.productCrouselInstance.instance['moveToSlide$'] as Subject<number>).next(slideIndex)
            }, 100);
        };
    }

    clearPseudoImageCrousel()
    {
        this.isProductCrouselLoaded = false;
        this.productCrouselPseudoContainerRef.nativeElement.remove();
    }

    onRotatePrevious()
    {
        this.loadProductCrousel(1);
    }

    onRotateNext()
    {
        this.loadProductCrousel(1);
    }


    async loadGlobalToastMessage(data, rawData)
    {
        if (data['status'] === true) {
            if (!this.globalToastInstance) {
                const { GlobalToastComponent } = await import('../../components/global-toast/global-toast.component').finally(() =>
                {
                    this.showLoader = false;
                });
                const factory = this.cfr.resolveComponentFactory(GlobalToastComponent);
                this.globalToastInstance = this.alertBoxContainerRef.createComponent(factory, null, this.injector);
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                const a = data.data.time.split(':');
                this.globalToastInstance.instance['text'] = 'The same item has been ordered by you on ' + (new Date(data.data.date).toLocaleDateString("en-IN", options)) + ' at ' + (a[0] + ':' + a[1]) + (a[0] < 12 ? ' AM' : ' PM');
                this.globalToastInstance.instance['btnText'] = 'x';
                this.globalToastInstance.instance['showTime'] = 100000;
                this.globalToastInstance.instance['showDuplicateOrderToast'] = true;
                this.globalToastInstance.instance['positionTop'] = true;
                this.globalToastInstance.instance['productMsn'] = rawData.partNumber;
            }
        }
    }

    async loadAlertBox(mainText, subText = null, extraSectionName: string = null)
    {
        if (!this.alertBoxInstance) {
            this.showLoader = true;
            const { AlertBoxToastComponent } = await import('../../components/alert-box-toast/alert-box-toast.component').finally(() =>
            {
                this.showLoader = false;
            });
            const factory = this.cfr.resolveComponentFactory(AlertBoxToastComponent);
            this.alertBoxInstance = this.alertBoxContainerRef.createComponent(factory, null, this.injector);
            this.alertBoxInstance.instance['mainText'] = mainText;
            this.alertBoxInstance.instance['subText'] = subText;
            if (extraSectionName) {
                this.alertBoxInstance.instance['extraSectionName'] = extraSectionName;
            }
            (this.alertBoxInstance.instance['removed'] as EventEmitter<boolean>).subscribe(status =>
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
        this.showLoader = true;
        const { ProductAppPromoComponent } = await import('../../components/product-app-promo/product-app-promo.component').finally(() =>
        {
            this.showLoader = false;
        });
        const factory = this.cfr.resolveComponentFactory(ProductAppPromoComponent);
        this.appPromoInstance = this.appPromoContainerRef.createComponent(factory, null, this.injector);
        this.appPromoInstance.instance['page'] = 'pdp';
        this.appPromoInstance.instance['isOverlayMode'] = false;
        this.appPromoInstance.instance['showPromoCode'] = false;
        this.appPromoInstance.instance['productMsn'] = this.defaultPartNumber;
        this.appPromoInstance.instance['productData'] = this.rawProductData;
        this.appPromoInstance.instance['isLazyLoaded'] = true;
        (this.appPromoInstance.instance['appPromoStatus$'] as EventEmitter<boolean>).subscribe((status) =>
        {
            this.appPromoVisible = status;
        });
    }

    alreadyLiked: boolean = true; 
    postHelpful(item, yes, no, i)
    {
        if (this.localStorageService.retrieve('user')) {
            let user = this.localStorageService.retrieve('user');
            if (user.authenticated == "true") {
                let obj = {
                    "review_type": "PRODUCT_REVIEW",
                    "item_type": "PRODUCT",
                    "item_id": item.item_id,
                    "review_id": item.review_id.uuid,
                    "user_id": user.userId,
                    "is_review_helpful_count_no": no,
                    "is_review_helpful_count_yes": yes
                }
                this.productService.postHelpful(obj).subscribe((res) =>
                {
                    if (res['code'] === '200') {
                        this._tms.show({ type: 'success', text: 'Your feedback has been taken' });
                        this.rawReviewsData.reviewList[i]['isPost'] = true;
                        this.rawReviewsData.reviewList[i]['like'] = yes;
                        this.rawReviewsData.reviewList[i]['dislike'] = no;

                        if (yes === '1' && this.alreadyLiked) {
                            this.alreadyLiked = false;
                            this.rawReviewsData.reviewList[i]['yes'] += 1;
                        } else if (no === '1' && this.rawReviewsData.reviewList[i]['no'] > 0 && this.alreadyLiked) {
                            this.alreadyLiked = false;
                            this.rawReviewsData.reviewList[i]['no'] -= 1;
                        }
                    }
                });
            } else {
                this.goToLoginPage(this.productUrl);
            }
        } else {
            this.goToLoginPage(this.productUrl);
        }
    }

    async showYTVideo(link)
    {
        if (!this.youtubeModalInstance) {
            let ytParams = '?autoplay=1&rel=0&controls=1&loop&enablejsapi=1';
            let videoDetails = { url: link, params: ytParams };
            let modalData = { component: YoutubePlayerComponent, inputs: null, outputs: {}, mConfig: { showVideoOverlay: true } };
            modalData.inputs = { videoDetails: videoDetails };
            this.modalService.show(modalData);
        }
    }


    // SEO SECTION STARTS
    /** 
     * Please place all functional code above this section
     */
    setMetatag()
    {
        if (!this.rawProductData) {
            return;
        }
        let title = this.productName;
        let pageTitleName = this.productName;
        const pwot = this.priceWithoutTax;

        if (pwot && pwot > 0 && this.rawProductData['quantityAvailable'] > 0) {
            title += " - Buy at Rs." + this.productPrice
        }

        if (this.productOutOfStock == true) {
            this.pageTitle.setTitle("Buy " + pageTitleName + " Online At Best Price On Moglix");
        } else {
            this.pageTitle.setTitle("Buy " + pageTitleName + " Online At Price ₹" + this.productPrice);
        }

        let metaDescription = '';

        if (
            this.rawProductData["seoDetails"] &&
            this.rawProductData["seoDetails"]["metaDescription"] != undefined &&
            this.rawProductData["seoDetails"]["metaDescription"] != null &&
            this.rawProductData["seoDetails"]["metaDescription"] != ""
        )
            metaDescription = this.rawProductData["seoDetails"]["metaDescription"]
        else {
            if (this.productOutOfStock == true) {
                metaDescription = "Buy " + this.productName + " Online in India at moglix. Shop from the huge range of " + this.productBrandDetails['brandName'] + " " + this.productCategoryDetails['categoryName'] + ". ✯ Branded " + this.productCategoryDetails['categoryName'] + " ✯ Lowest Price ✯ Best Deals ✯ COD";
            } else {
                metaDescription = "Buy " + this.productName + " Online in India at price ₹" + this.productPrice + ". Shop from the huge range of " + this.productBrandDetails['brandName'] + " " + this.productCategoryDetails['categoryName'] + ". ✯ Branded " + this.productCategoryDetails['categoryName'] + " ✯ Lowest Price ✯ Best Deals ✯ COD";
            }
        }
        this.meta.addTag({ "name": "description", "content": metaDescription });

        this.meta.addTag({ "name": "og:description", "content": metaDescription })
        this.meta.addTag({ "name": "og:url", "content": CONSTANTS.PROD + "/" + this.getProductURL() })
        this.meta.addTag({ "name": "og:title", "content": title })
        this.meta.addTag({ "name": "og:image", "content": this.productDefaultImage })
        this.meta.addTag({ "name": "robots", "content": CONSTANTS.META.ROBOT });
        this.meta.addTag({ "name": "keywords", "content": this.productName + ", " + this.productCategoryDetails['categoryName'] + ", " + this.productBrandDetails['brandName'] });
        if (this.isServer) {
            const links = this.renderer2.createElement('link');

            links.rel = "canonical";
            let url = this.productUrl;
            if (!this.isCommonProduct && !this.listOfGroupedCategoriesForCanonicalUrl.includes(this.productCategoryDetails['categoryCode'])) {
                url = this.rawProductData.productPartDetails[this.rawProductData['partNumber']].canonicalUrl ? this.rawProductData.productPartDetails[this.rawProductData['partNumber']].canonicalUrl : this.rawProductData['defaultCanonicalUrl'];
            }

            if (url && url.substring(url.length - 2, url.length) == "-g") {
                url = url.substring(0, url.length - 2);
            }

            links.href = CONSTANTS.PROD + "/" + url;
            this.renderer2.appendChild(this.document.head, links);
        }

    }

    getProductURL()
    {
        const productURL = this.rawProductData.productPartDetails[this.productSubPartNumber]['canonicalUrl'];
        const finalURL = productURL ? productURL : this.productUrl;
        return finalURL;
    }

    setQuestionAnswerSchema()
    {
        if (this.isServer && this.rawProductData) {
            // console.log('setQuestionAnswerSchema rawProductData', this.rawProductData);
            const qaSchema: Array<any> = [];
            if (this.isServer) {

                const questionAnswerList = this.questionAnswerList['data']
                // console.log('questionAnswerList', questionAnswerList);
                if (questionAnswerList['totalCount'] > 0) {
                    (questionAnswerList['qlist'] as []).forEach((element, index) =>
                    {
                        qaSchema.push({
                            "@type": "Question",
                            "name": element['questionText'],
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": element['answerText']
                            }
                        })
                    })
                    let qna = this.renderer2.createElement('script');
                    qna.type = "application/ld+json";
                    qna.text = JSON.stringify({ "@context": CONSTANTS.SCHEMA, "@type": "FAQPage", "mainEntity": qaSchema });
                    this.renderer2.appendChild(this.document.head, qna);
                }
            }
        }
    }

    setProductSeoSchema()
    {

        if (this.isServer && this.rawProductData) {
            let inStock = (!this.productOutOfStock) ? "http://schema.org/InStock" : "http://schema.org/OutOfStock";
            let reviewCount = this.rawReviewsData.summaryData.review_count > 0 ? this.rawReviewsData.summaryData.review_count : 1;
            let ratingValue = this.rawReviewsData.summaryData.final_average_rating > 0 ? this.rawReviewsData.summaryData.final_average_rating : 3.5;
            let imageSchema = this.renderer2.createElement('script');
            imageSchema.type = "application/ld+json";

            imageSchema.text = JSON.stringify({
                "@context": CONSTANTS.SCHEMA,
                "@type": "ImageObject",
                "url": this.productDefaultImage,
                "name": this.productName,
            })

            // console.log('schema not 2 1', 'called');

            this.renderer2.appendChild(this.document.head, imageSchema);

            if (this.productPrice > 0) {
                let s = this.renderer2.createElement('script');
                s.type = "application/ld+json";
                let desc = this.productDescripton;
                if (!desc) {
                    desc = `${this.productName} is a premium quality ${this.productCategoryDetails['categoryName']} from ${this.productBrandDetails['brandName']}. Moglix is a well-known ecommerce platform for qualitative range of ${this.productCategoryDetails['categoryName']}. All ${this.productName} are manufactured by using quality assured material and advanced techniques, which make them up to the standard in this highly challenging field. The materials utilized to manufacture ${this.productName}, are sourced from the most reliable and official ${this.productCategoryDetails['categoryName']} vendors, chosen after performing detailed market surveys. Thus, ${this.productBrandDetails['brandName']} products are widely acknowledged in the market for their high quality. We are dedicatedly involved in providing an excellent quality array of ${this.productBrandDetails['brandName']} ${this.productCategoryDetails['categoryName']}.`;
                }
                let schema = {
                    "@context": CONSTANTS.SCHEMA,
                    "@type": "Product",
                    "name": this.productName,
                    "image": [this.productDefaultImage],
                    "description": desc,
                    "sku": this.productSubPartNumber,
                    "mpn": this.productSubPartNumber,
                    "brand": {
                        "@type": "Thing",
                        "name": this.productBrandDetails['brandName'],
                    },
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": ratingValue,
                        "ratingCount": reviewCount,
                        "bestRating": "5",
                        "worstRating": "1"
                    },
                    "offers": {
                        "@type": "Offer",
                        "url": CONSTANTS.PROD + '/' + this.getProductURL(),
                        "priceCurrency": "INR",
                        "price": (this.productPrice * this.productMinimmumQuantity).toString(),
                        "itemCondition": CONSTANTS.SCHEMA + "/NewCondition",
                        "availability": inStock,
                        "seller": {
                            "@type": "Organization",
                            "name": "Moglix"
                        },
                        "acceptedPaymentMethod": [
                            {
                                "@type": "PaymentMethod",
                                "@id": CONSTANTS.ByBankTransferInAdvance
                            },
                            {
                                "@type": "PaymentMethod",
                                "@id": CONSTANTS.ByCOD
                            },
                            {
                                "@type": "PaymentMethod",
                                "@id": CONSTANTS.ByPaymentMethodCreditCard
                            },
                            {
                                "@type": "PaymentMethod",
                                "@id": CONSTANTS.ByMasterCard
                            },
                            {
                                "@type": "PaymentMethod",
                                "@id": CONSTANTS.ByVISA
                            }
                        ]
                    }
                }

                // console.log('schema', schema);

                if (!this.priceQuantityCountry) {
                    delete schema['offers']['availability'];
                } else if (!this.priceQuantityCountry['quantityAvailable']) {
                    delete schema['offers']['availability'];
                } else if (this.priceQuantityCountry['quantityAvailable'] == 0) {
                    delete schema['offers']['availability'];
                }

                s.text = JSON.stringify(schema);
                this.renderer2.appendChild(this.document.head, s);
            } else {
                console.log('product schema not created due to price zero');
            }

            // console.log('schema not 2 2', 'called');

        } else {
            console.log('product schema not created');
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
        if (this.isBrowser && sessionStorage.getItem('pdp-page')) {
            this.commonService.setSectionClick(sessionStorage.getItem('pdp-page'));
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
            brand: this.productBrandDetails['brandName'],
            category_l1: this.productCategoryDetails['taxonomy'].split("/")[0] ? this.productCategoryDetails['taxonomy'].split("/")[0] : null,
            category_l2: this.productCategoryDetails['taxonomy'].split("/")[1] ? this.productCategoryDetails['taxonomy'].split("/")[1] : null,
            category_l3: this.productCategoryDetails['taxonomy'].split("/")[2] ? this.productCategoryDetails['taxonomy'].split("/")[2] : null,
            oos: this.productOutOfStock.toString(),
            channel: "PDP",
            search_query: null,
            active_promo_codes: "",
            url_complete_load_time: null,
            time_to_interactive: null,
            page_type: "product page"
        }
        if (this.priceQuantityCountry != null) {
            dataTracking['price'] = this.priceQuantityCountry.sellingPrice;
        }
        this.analytics.sendToClicstreamViaSocket(dataTracking);
    }

    productVisitViaAPI()
    {
        var clickStreamData = {
            msn: this.productSubPartNumber,
            url_link: this.productUrl,
            availability_for_order: !this.productOutOfStock == true ? 1 : 0,
            session_id: this.localStorageService.retrieve('user') ? this.localStorageService.retrieve('user').sessionId : '',
            created_by_source: 'Mobile',
            category_id: this.productCategoryDetails['categoryCode'],
            category_name: this.productCategoryDetails['categoryName'],
            id_brand: this.productBrandDetails['idBrand'],
            brand_name: this.productBrandDetails['brandName'],
            product_name: this.productName,
            user_id: this.localStorageService.retrieve('user') ? this.localStorageService.retrieve('user').userId : null,
            // this data is  used for recently viewed API and we use medium image for same
            product_image: this.productMediumImage,
            status: this.rawProductData['status'],
            product_url: this.productUrl,
        };
        if (this.priceQuantityCountry != null) {
            clickStreamData['mrp'] = this.productMrp;
            clickStreamData['price_without_tax'] = this.priceWithoutTax;
            clickStreamData['price_with_tax'] = this.productPrice;
            clickStreamData['out_of_stock'] = this.productOutOfStock;
        }
        this.analytics.sendToClicstreamViaAPI(clickStreamData);
    }

    productVisitGTM()
    {
        let gtmDataObj = [];
        const gaGtmData = this.localStorageService.retrieve('gaGtmData');
        if (this.productOutOfStock) {
            gtmDataObj.push({
                'event': 'rqnProductPage',
                'ecommerce': {
                    "rqn_product_name": this.productName
                }
            });
        }
        gtmDataObj.push({
            'event': 'productView',
            'ecommerce': {
                'detail': {
                    'actionField': { 'list': (gaGtmData && gaGtmData['list']) ? gaGtmData['list'] : "" },
                    'products': [
                        {
                            'name': this.productName,
                            'id': this.productSubPartNumber,
                            'price': this.productPrice,
                            'brand': this.productBrandDetails['brandName'],
                            'category': (gaGtmData && gaGtmData['category']) ? gaGtmData['category'] : this.productCategoryDetails['categoryName'],
                            'variant': '',
                            'stockStatus': this.productOutOfStock ? "Out of Stock" : "In Stock",
                        }]
                }
            },
        });
        const google_tag_params = {
            ecomm_prodid: this.productSubPartNumber,
            ecomm_pagetype: 'product',
            ecomm_totalvalue: this.productPrice
        };
        gtmDataObj.push({
            'event': 'dyn_remk',
            'ecomm_prodid': google_tag_params.ecomm_prodid,
            'ecomm_pagetype': google_tag_params.ecomm_pagetype,
            'ecomm_totalvalue': google_tag_params.ecomm_totalvalue,
            'google_tag_params': google_tag_params
        });
        const user = this.localStorageService.retrieve('user');

        gtmDataObj.push({
            'event': 'viewItem',
            'email': (user && user["email"]) ? user["email"] : '',
            'ProductID': this.productSubPartNumber,
            'Category': this.productCategoryDetails['taxonomy'],
            'CatID': this.productCategoryDetails['taxonomyCode'],
            'MRP': this.productMrp,
            'brandId': this.productBrandDetails['idBrand'],
            'Discount': Math.floor(this.productDiscount),
            'ImageURL': this.productDefaultImage
        });

        gtmDataObj.forEach(data =>
        {
            this.analytics.sendGTMCall(data);
        });
    }

    productVisitAdobe() {
        const user = this.localStorageService.retrieve('user');

        let taxo1 = '';
        let taxo2 = '';
        let taxo3 = '';
        if (this.productCategoryDetails['taxonomyCode']) {
            taxo1 = this.productCategoryDetails['taxonomyCode'].split("/")[0] || '';
            taxo2 = this.productCategoryDetails['taxonomyCode'].split("/")[1] || '';
            taxo3 = this.productCategoryDetails['taxonomyCode'].split("/")[2] || '';
        }

        let ele = []; // product tags for adobe;
        this.productTags.forEach((element) => {
            ele.push(element.name);
        });
        const tagsForAdobe = ele.join("|");

        let page = {
            'pageName': "moglix:" + taxo1 + ":" + taxo2 + ":" + taxo3 + ":pdp",
            'channel': "pdp",
            'subSection': "moglix:" + taxo1 + ":" + taxo2 + ":" + taxo3 + ":pdp " + this.commonService.getSectionClick().toLowerCase(),
            'loginStatus': this.loginStatusTracking,
        }
        let custData = this.custDataTracking;
        
        let order = {
            'productID': this.productSubPartNumber,
            'productCategoryL1': taxo1,
            'productCategoryL2': taxo2,
            'productCategoryL3': taxo3,
            'brand': this.productBrandDetails['brandName'],
            'price': this.productPrice,
            'stockStatus': this.productOutOfStock ? "Out of Stock" : "In Stock",
            'tags': tagsForAdobe,
            'pdpMessage': this.rawProductCountMessage || '',
            'pdpToastMessage': this.rawCartNotificationMessage || ''
        }

        const anlyticData = { page, custData, order }
        this.analytics.sendAdobeCall(anlyticData);
    }

    analyticAddToCart(routerlink, quantity)
    {
        const user = this.localStorageService.retrieve('user');
        const taxonomy = this.productCategoryDetails['taxonomyCode'];
        let taxo1 = '';
        let taxo2 = '';
        let taxo3 = '';
        if (this.productCategoryDetails['taxonomyCode']) {
            taxo1 = this.productCategoryDetails['taxonomyCode'].split("/")[0] || '';
            taxo2 = this.productCategoryDetails['taxonomyCode'].split("/")[1] || '';
            taxo3 = this.productCategoryDetails['taxonomyCode'].split("/")[2] || '';
        }

        let ele = []; // product tags for adobe;
        this.productTags.forEach((element) =>
        {
            ele.push(element.name);
        });
        const tagsForAdobe = ele.join("|");

        let page = {
            'linkPageName': "moglix:" + taxo1 + ":" + taxo2 + ":" + taxo3 + ":pdp",
            'linkName': routerlink == "/quickorder" ? "Add to cart" : "Buy Now",
            'channel': 'pdp'
        }
        let custData = this.custDataTracking
        let order = {
            'productID': this.productSubPartNumber || this.defaultPartNumber, // TODO: partNumber
            'parentID': this.productSubPartNumber,
            'productCategoryL1': taxo1,
            'productCategoryL2': taxo2,
            'productCategoryL3': taxo3,
            'price': this.productPrice,
            'quantity': quantity,
            'brand': this.productBrandDetails['brandName'],
            'tags': tagsForAdobe
        }
        this.analytics.sendAdobeCall({ page, custData, order }, "genericClick");

        this.analytics.sendGTMCall({
            'event': 'addToCart',
            'ecommerce': {
                'currencyCode': 'INR',
                'add': {
                    'products': [{
                        'name': this.productName,     // Name or ID of the product is required.
                        'id': this.productSubPartNumber, // todo: partnumber
                        'price': this.productPrice,
                        'brand': this.productBrandDetails['brandName'],
                        'brandId': this.productBrandDetails['idBrand'],
                        'category': (this.productCategoryDetails && this.productCategoryDetails['taxonomy']) ? this.productCategoryDetails['taxonomy'] : '',
                        'variant': '',
                        'quantity': quantity,
                        'productImg': this.productDefaultImage,
                        'CatId': this.productCategoryDetails['taxonomyCode'],
                        'MRP': this.productMrp['amount'],
                        'Discount': this.productDiscount
                    }]
                }
            },
        })

        /**
         * /**
         * this is commented as socket calls are already made directly in addtocart followes function
         * TODO: need to refactor this 
         * /
         */
        // var trackingData = {
        //   event_type: "click",
        //   label: routerlink == "/quickorder" ? "add_to_cart" : "buy_now",
        //   product_name: this.productName,
        //   msn: this.productSubPartNumber,
        //   brand: this.productBrandDetails['brandName'],
        //   price: this.productPrice,
        //   quantity: Number(this.priceQuantityCountry['quantityAvailable']),
        //   channel: "PDP",
        //   category_l1: taxonomy.split("/")[0] ? taxonomy.split("/")[0] : null,
        //   category_l2: taxonomy.split("/")[1] ? taxonomy.split("/")[1] : null,
        //   category_l3: taxonomy.split("/")[2] ? taxonomy.split("/")[2] : null,
        //   page_type: "product_page"
        // }
        // this.analytics.sendToClicstreamViaSocket(trackingData);

    }

    analyticRFQ(isSubmitted: boolean = false)
    {
        const user = this.localStorageService.retrieve('user');
        let taxo1 = '';
        let taxo2 = '';
        let taxo3 = '';
        if (this.productCategoryDetails['taxonomyCode']) {
            taxo1 = this.productCategoryDetails['taxonomyCode'].split("/")[0] || '';
            taxo2 = this.productCategoryDetails['taxonomyCode'].split("/")[1] || '';
            taxo3 = this.productCategoryDetails['taxonomyCode'].split("/")[2] || '';
        }
        let ele = []; // product tags for adobe;
        this.productTags.forEach((element) =>
        {
            ele.push(element.name);
        });
        const tagsForAdobe = ele.join("|");

        this.analytics.sendGTMCall({
            'event': !this.productOutOfStock ? 'rfq_instock' : 'rfq_oos'
        })

        if (isSubmitted) {
            this.analytics.sendGTMCall({
                'event': !this.productOutOfStock ? 'instockformSubmit' : 'oosformSubmit',
                'customerInfo': {
                    "firstName": user['first_name'],
                    "lastName": user['last_name'],
                    "email": user['email'],
                    "mobile": user['phone']
                },
                'productInfo': {
                    'productName': this.productName,
                    'brand': this.productBrandDetails['brandName'],
                    'quantity': (this.priceQuantityCountry) ? this.priceQuantityCountry['quantityAvailable'] : null
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

        let custData = this.custDataTracking;
        let order = {
            'productID': this.productSubPartNumber,
            'productCategoryL1': taxo1,
            'productCategoryL2': taxo2,
            'productCategoryL3': taxo3,
            'brand': this.productBrandDetails['brandName'],
            'tags': tagsForAdobe
        }
        this.analytics.sendAdobeCall({ page, custData, order }, (isSubmitted) ? "genericClick" : "genericPageLoad");
    }

    analyticPincodeAvaliabilty(analytics)
    {

        const taxonomy = this.productCategoryDetails['taxonomy'];
        let taxo1 = '';
        let taxo2 = '';
        let taxo3 = '';
        if (this.productCategoryDetails['taxonomyCode']) {
            taxo1 = this.productCategoryDetails['taxonomyCode'].split("/")[0] || '';
            taxo2 = this.productCategoryDetails['taxonomyCode'].split("/")[1] || '';
            taxo3 = this.productCategoryDetails['taxonomyCode'].split("/")[2] || '';
        }
        const user = this.localStorageService.retrieve('user');
        let page = {
            'linkPageName': "moglix: " + taxo1 + ":" + taxo2 + ":" + taxo3 + ": pdp",
            'linkName': 'check now',
            'channel': 'pdp',
            'loginStatus': (user.userId) ? 'registered' : 'guest',
        }
        let custData = this.custDataTracking;
        let order = {
            'productID': this.productSubPartNumber,
            'productCategoryL1': taxo1,
            'productCategoryL2': taxo2,
            'productCategoryL3': taxo3,
            'brand': this.productBrandDetails['brandName'],
            'productPrice': this.productPrice,
            'serviceability': (analytics.serviceability) ? 'yes' : 'no',
            'codserviceability': (analytics.codserviceability) ? 'yes' : 'no',
            'pincode': analytics.pincode,
            'deliveryTAT': analytics.deliveryDays ? analytics.deliveryDays : 'NA',
            'deliveryAnalytics': analytics.deliveryAnalytics
        }
        this.analytics.sendAdobeCall({ page, custData, order }, "genericClick");
    }

    remoteApiCallRecentlyBought() {
        let MSG = null;
        let CART_NOTIFICATION_MSG = null;
        if (this.rawProductData && this.rawProductCountData && !this.productOutOfStock) {
            if (this.rawProductCountData['status'] && this.rawProductCountData['statusCode'] && this.rawProductCountData['statusCode'] == 200 && this.rawProductCountData['data']) {
                MSG = this.rawProductCountData['data']['message'] || null;
                CART_NOTIFICATION_MSG = this.rawProductCountData['data']['toastMessage'] || 'Product added successfully';
            }
        }
        this.rawProductCountMessage = MSG;
        this.rawCartNotificationMessage = CART_NOTIFICATION_MSG;
    }

    scrollToResults(id: string)
    {
        let footerOffset = document.getElementById('.id').offsetTop;
        ClientUtility.scrollToTop(1000, footerOffset - 30);
    }

    scrollToId(id: string)
    {
        let footerOffset = document.getElementById(id).offsetTop;
        ClientUtility.scrollToTop(1000, footerOffset - 30);
    }

    pseudoFnc()
    {
    }

    sortedReviewsByDate(reviewList)
    {
        return reviewList.sort((a, b) =>
        {
            return parseInt(b.date_unix) - parseInt(a.date_unix)
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

    async handleReviewRatingPopup()
    {
        this.sendProductInfotracking("view all reviews");
        this.showLoader = true;
        const { ReviewRatingComponent } = await import('./../../components/review-rating/review-rating.component').finally(() =>
        {
            this.showLoader = false;
        });
        const factory = this.cfr.resolveComponentFactory(ReviewRatingComponent);
        this.reviewRatingPopupInstance = this.reviewRatingPopupContainerRef.createComponent(factory, null, this.injector);
        this.rawReviewsData.productName = this.productName;
        this.reviewRatingPopupInstance.instance['rawReviewsData'] = this.rawReviewsData;
        console.log('----------------------');
        console.log(this.rawReviewsData);
        this.reviewRatingPopupInstance.instance['productUrl'] = this.productUrl;
        (this.reviewRatingPopupInstance.instance['closePopup$'] as EventEmitter<boolean>).subscribe(data =>
        {
            this.reviewRatingPopupInstance = null;
            this.reviewRatingPopupContainerRef.remove();
        });
        (this.reviewRatingPopupInstance.instance['emitWriteReview$'] as EventEmitter<boolean>).subscribe(data =>
        {
            this.writeReview();
        });
    }

    async handleQuestionAnswerPopup()
    {
        this.showLoader = true;
        const { QuestionAnswerComponent } = await import('./../../components/question-answer/question-answer.component').finally(() =>
        {
            this.showLoader = false;
        });
        const factory = this.cfr.resolveComponentFactory(QuestionAnswerComponent);
        this.questionAnswerPopupInstance = this.questionAnswerPopupContainerRef.createComponent(factory, null, this.injector);
        (this.questionAnswerPopupInstance.instance['closePopup$'] as EventEmitter<boolean>).subscribe(data =>
        {
            this.questionAnswerPopupInstance = null;
            this.reviewRatingPopupContainerRef.remove();
        });
    }

    async handleProductInfoPopup(infoType, cta)
    {
        this.sendProductInfotracking(cta);
        this.showLoader = true;
        this.displayCardCta = true;
        const { ProductInfoComponent } = await import('./../../modules/product-info/product-info.component').finally(() =>
        {
            this.showLoader = false;
        });
        const factory = this.cfr.resolveComponentFactory(ProductInfoComponent);
        this.productInfoPopupInstance = this.productInfoPopupContainerRef.createComponent(factory, null, this.injector);
        this.productInfoPopupInstance.instance['modalData'] = this.getProductInfo(infoType);
        this.productInfoPopupInstance.instance['openProductInfo'] = true;
        (this.productInfoPopupInstance.instance['closePopup$'] as EventEmitter<boolean>).subscribe(data =>
        {
            // document.getElementById('infoTabs').scrollLeft = 0;
            this.productInfoPopupInstance = null;
            this.productInfoPopupContainerRef.remove();
            this.displayCardCta = false;
        });
    }

    getProductInfo(infoType)
    {
        const productInfo = {};
        productInfo['mainInfo'] = {
            productName: this.productName,
            imgURL: this.productAllImages[0]['large'], brandName: this.productBrandDetails['brandName'],
            productMrp: this.productMrp, productDiscount: this.productDiscount, bulkPriceWithoutTax: this.bulkPriceWithoutTax,
            priceWithoutTax: this.priceWithoutTax, taxPercentage: this.taxPercentage, bulkDiscount: this.bulkDiscount,
            productOutOfStock: this.productOutOfStock
        }
        let contentInfo = {};
        if (this.productKeyFeatures && this.productKeyFeatures.length) {
            contentInfo['key features'] = this.productKeyFeatures;
        }
        if (this.productAttributes) {
            const brand = { name: this.productBrandDetails['brandName'], link: this.getBrandLink(this.productBrandDetails), };
            contentInfo['specifications'] = { attributes: this.productAttributes, brand: brand };
        }
        if (this.productVideos && this.productVideos.length) {
            contentInfo['videos'] = this.productVideos;
        }
        const details = {
            description: this.productDescripton, category: this.productCategoryDetails, brand: this.productBrandDetails
            , brandCategoryURL: this.productBrandCategoryUrl, productName: this.productName
        };
        contentInfo['product details'] = details;
        if (this.productAllImages && this.productAllImages.length) {
            contentInfo['images'] = this.productAllImages;
        }
        productInfo['contentInfo'] = contentInfo;
        productInfo['infoType'] = infoType;
        const TAXONS = this.taxons;
        let page = {
            pageName: `moglix:${TAXONS[0]}:${TAXONS[1]}:${TAXONS[2]}:pdp`,
            channel: "About This Product", subSection: null,
            linkPageName: null, linkName: null, loginStatus: this.loginStatusTracking
        }
        productInfo['analyticsInfo'] = { page: page, custData: this.custDataTracking, order: this.orderTracking };
        return productInfo;
    }

    sendProductInfotracking(cta)
    {
        const TAXONS = this.taxons;
        let page = {
            pageName: null,
            channel: "pdp", subSection: null,
            linkPageName: `moglix:${TAXONS[0]}:${TAXONS[1]}:${TAXONS[2]}:pdp`, linkName: cta, loginStatus: this.loginStatusTracking
        }
        const custData = this.custDataTracking;
        const order = this.orderTracking;
        this.analytics.sendAdobeCall({ page, custData, order }, "genericClick");
    }

    sendWidgetTracking(widgetType)
    {
        const TAXONS = this.taxons;
        let page = {
            pageName: null,
            channel: "pdp", subSection: null,
            linkPageName: `moglix:${TAXONS[0]}:${TAXONS[1]}:${TAXONS[2]}:pdp`, linkName: `More from ${widgetType}`, loginStatus: this.loginStatusTracking
        }
        const custData = this.custDataTracking;
        const order = this.orderTracking;
        this.analytics.sendAdobeCall({ page, custData, order }, "genericClick");
        this.commonService.setSectionClickInformation('pdp_widget', 'listing')
    }

    getRefinedProductTags()
    {
        const pipe = new ArrayFilterPipe();
        this.refinedProdTags = pipe.transform(this.productTags, 'type', 'text', 'object');
        this.refinedProdTags = (this.refinedProdTags as []).slice(0, 3);
    }

    get overallRating()
    {
        if (this.rawReviewsData && this.rawReviewsData['summaryData']) {
            return this.rawReviewsData['summaryData']['final_average_rating'];
        }
        return 0;
    }

    get custDataTracking()
    {
        const user = this.localStorageService.retrieve('user');
        return {
            'customerID': (user && user["userId"]) ? btoa(user["userId"]) : '',
            'emailID': (user && user["email"]) ? btoa(user["email"]) : '',
            'mobile': (user && user["phone"]) ? btoa(user["phone"]) : '',
            'customerType': (user && user["userType"]) ? user["userType"] : '',
        }
    }

    get loginStatusTracking() 
    {
        const user = this.localStorageService.retrieve('user');
        return (user && user["authenticated"] == 'true') ? "registered user" : "guest";
    }

    get orderTracking()
    {
        const TAXNONS = this.taxons;
        const TAGS = [];
        this.productTags.forEach((element) => { TAGS.push(element.name); });
        const tagsForAdobe = TAGS.join("|");
        return {
            'productID': this.productSubPartNumber,
            'productCategoryL1': TAXNONS[0],
            'productCategoryL2': TAXNONS[1],
            'productCategoryL3': TAXNONS[2],
            'brand': this.productBrandDetails['brandName'],
            'price': this.productPrice,
            'stockStatus': this.productOutOfStock ? "Out of Stock" : "In Stock",
            'tags': tagsForAdobe
        }
    }

    get taxons()
    {
        const taxon = [];
        if (this.productCategoryDetails['taxonomyCode']) {
            taxon.push(this.productCategoryDetails['taxonomyCode'].split("/")[0] || '');
            taxon.push(this.productCategoryDetails['taxonomyCode'].split("/")[1] || '');
            taxon.push(this.productCategoryDetails['taxonomyCode'].split("/")[2] || '');

        }
        return taxon;
    }

    get breadCrumbAnalytics()
    {
        let analytics = null
        const TAXONS = this.taxons;
        let page = {
            pageName: null,
            channel: "pdp", subSection: null,
            linkPageName: `moglix:${TAXONS[0]}:${TAXONS[1]}:${TAXONS[2]}:pdp`, linkName: 'breadcrumb', loginStatus: this.loginStatusTracking
        }
        const custData = this.custDataTracking;
        const order = this.orderTracking;
        analytics = {page,custData,order};
        return analytics;
    }

    navigateLink(link) { this.router.navigate([link]); }

    ngOnDestroy()
    {
        if (this.isBrowser) {
            sessionStorage.removeItem('pdp-page');
        }
        this.resetLazyComponents();
    }
}
