import { DOCUMENT, Location } from "@angular/common";
import { AfterViewInit, ChangeDetectionStrategy, Component, ComponentFactoryResolver, EventEmitter, Inject, Injector, OnDestroy, OnInit, Optional, Renderer2, ViewChild, ViewContainerRef } from "@angular/core";
import { DomSanitizer, Meta, Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import CONSTANTS from "@app/config/constants";
import { ToastMessageService } from "@app/modules/toastMessage/toast-message.service";
import { CommonService } from "@app/utils/services/common.service";
import { GlobalAnalyticsService } from "@app/utils/services/global-analytics.service";
import { GlobalLoaderService } from "@app/utils/services/global-loader.service";
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
    isServer: boolean;
    isBrowser: boolean;
    productNotFound:boolean;
    apiResponse: any;
    productStaticData:any = this.commonService.defaultLocaleValue;
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
    defaultPartNumber: string = null;
    productSubPartNumber: any;
    moveToSlide$ = new Subject<number>();
    displayCardCta: boolean;
    pageUrl: string;
    backTrackIndex = -1;

    // lazy loaded component refs
    productShareInstance = null;
    @ViewChild("productShare", { read: ViewContainerRef })
    productShareContainerRef: ViewContainerRef;

    popupCrouselInstance = null;
    @ViewChild("popupCrousel", { read: ViewContainerRef })
    popupCrouselContainerRef: ViewContainerRef;



    set showLoader(value: boolean) {this.globalLoader.setLoaderState(value);}

    // get getWhatsText()
    // {
    //     return `Hi, I want to buy ${this.productName} (${this.defaultPartNumber})`;
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
        @Inject(DOCUMENT) private document,
        @Optional() @Inject(RESPONSE) private _response: any,
    ) {
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

    ngOnInit() {
        this.createSiemaOption();
        this.user = this.localStorageService.retrieve('user');
        this.pageUrl = this.router.url;
        this.route.data.subscribe((rawData) => {
            console.log(rawData);
            if(!rawData["product"][0]["error"] && rawData["product"][0]['data']['data']['getProductGroup']["active"]) {
                this.apiResponse = rawData.product[0].data.data;
                this.rawProductData = this.apiResponse.getProductGroup.productBO;
                console.log(this.rawProductData);
                if (
                    this.apiResponse['getProductGroup']["productBO"] &&
                    Object.values(this.rawProductData["productPartDetails"])[0]["images"] !== null
                ) {
                    this.commonService.enableNudge = false;
                    this.isAcceptLanguage = (rawData["product"]['data']['data']['getProductGroup']["acceptLanguage"] != null && rawData["product"][0]["acceptLanguage"] != undefined) ? true : false;
                    this.rawProductData = rawData['product']
                } else {
                    this.setProductNotFound();
                }
            } else {
                this.setProductNotFound();
            }
        })
    }

    ngAfterViewInit() {
        this.getPurchaseList();
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

        // Wishlist related functionality
        getPurchaseList()
        {
            if (!this.rawProductData) {
                return;
            }
            this.isPurcahseListProduct = false;
            if (this.user) {
                if (this.user.authenticated == "true") {
                    const request = { idUser: this.user.userId, userType: "business" };
    
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
            if (this.user) {
                if (this.user && this.user.authenticated == "true") {
                    this.isPurcahseListProduct = true;
                    let obj = {
                        idUser: this.user.userId,
                        userType: "business",
                        idProduct: this.productSubPartNumber || this.defaultPartNumber,
                        productName: this.rawProductData.productName,
                        description: this.rawProductData.desciption,
                        brand: this.rawProductData.brandDetails["brandName"],
                        category: this.rawProductData.categoryDetails["categoryCode"],
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
                    // this.goToLoginPage(this.productUrl);
                }
            } else {
                // this.goToLoginPage(this.productUrl);
            }
        }
    }

    removeItemFromPurchaseList()
    {
        this.showLoader = true;
        let obj = {
            idUser: this.user.userId,
            userType: "business",
            idProduct: this.productSubPartNumber || this.defaultPartNumber,
            productName: this.rawProductData.productName,
            description: this.rawProductData.productDescripton,
            brand: this.rawProductData.brandDetails["brandName"],
            category: this.rawProductData.categoryDetails[0]["categoryCode"],
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
        }else{
            this.commonService.defaultLocaleValue = localization_en.product;
            this.productStaticData = localization_en.product;
            this.commonService.changeStaticJson.next(this.productStaticData);
        }
        this.commonService.changeStaticJson.asObservable().subscribe(localization_content => {
            this.productStaticData = localization_content;
        })
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
            imageAlt: this.rawProductData.productName,
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

    // lazy loaded modules
    async loadProductShare()
    {
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
            this.popupCrouselInstance.instance["productAllImages"] = oosProductIndex < 0 ? this.rawProductData : this.productService.oosSimilarProductsData.similarData[oosProductIndex].productAllImages;
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
    backUrlNavigationHandler()
    {
        // make sure no browser history is present
        if (this.location.getState() && this.location.getState()['navigationId'] == 1) {
            this.sessionStorageService.store('NO_HISTROY_PDP', 'NO_HISTROY_PDP');
            if (this.rawProductData.categoryDetails && this.rawProductData.categoryDetails['categoryLink']) {
                window.history.replaceState('', '', this.rawProductData.categoryDetails['categoryLink'] + '?back=1');
                window.history.pushState('', '', this.router.url);
            }
        }
    }
    attachBackClickHandler()
    {
        window.addEventListener('popstate', (event) =>
        {
            //Your code here
            let url = this.backTrackIndex < 0 ? this.rawProductData.defaultCanonicalUrl : this.productService.oosSimilarProductsData.similarData[this.backTrackIndex]["productUrl"];
            window.history.replaceState('', '', url);
        });
    }
    updateBackHandling() {
        window.history.replaceState('', '', this.pageUrl);
        window.history.pushState('', '', this.pageUrl);
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

    ngOnDestroy() {}
}