import { LocalStorageService } from "ngx-webstorage";
import { filter, map } from "rxjs/operators";
import { mergeMap } from "rxjs/operators";
import { BehaviorSubject, Observer, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { HttpErrorResponse } from "@angular/common/http";
import { NavigationEnd, NavigationExtras, NavigationStart, Router } from "@angular/router";
import { Inject, Injectable, PLATFORM_ID, Renderer2, RendererFactory2 } from "@angular/core";
import { ClientUtility } from "@app/utils/client.utility";
import { DataService } from "./data.service";
import { CheckoutService } from "./checkout.service";
import { isPlatformServer, isPlatformBrowser, DOCUMENT } from "@angular/common";
import { Observable } from "rxjs";
import { Subject } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import CONSTANTS from "../../config/constants";
import { GlobalLoaderService } from "./global-loader.service";
import { ENDPOINTS } from "@app/config/endpoints";
import { GLOBAL_CONSTANT } from "@app/config/global.constant";
import IdleTimer from "../idleTimeDetect";
import { GlobalAnalyticsService } from "./global-analytics.service";
import { ServerLogSchema } from "../models/log.modal";
import { LocalAuthService } from "./auth.service";
import { abort } from "process";
import * as localization_en from '../../config/static-en';
import * as localization_hi from '../../config/static-hi';
import * as CryptoJS from 'crypto-js';

@Injectable({
    providedIn: "root",
})
export class CommonService
{
    private _itemsValidationMessage: Array<{}>;
    private windowLoaded: boolean;
    public cashOnDeliveryStatus = { isEnable: true, message: "" };
    public myRfqParameters = { productName: null, brandName: null };
    private searchResultsTrackingData: {
        "search-query": string;
        "search-results": string;
    };
    limitTrendingCategoryNumber: number = GLOBAL_CONSTANT.trendingCategoryLimit;
    enableNudge: boolean = false;

    set showLoader(status: boolean)
    {
        this._loaderService.setLoaderState(status);
    }
    public isBrowser: boolean;
    public isServer: boolean;
    public isAppInstalled: boolean = false;
    private _bodyScollFlag: boolean = true;
    // public defaultParams = {queryParams: {}, orderBy: "popularity", orderWay: "desc", pageIndex:0, pageSize:32, taxonomy: "", operation:"", filter: {}};
    private defaultParams = { queryParams: {}, filter: {} };

    public refreshProducts$: Subject<any> = new Subject<any>();

    public oosSimilarCard$: Subject<any> = new Subject<any>();
    private loginPerformed$: Subject<any> = new Subject<any>();
    public attachScrollEvent$: Subject<any> = new Subject<any>();
    isProductCrouselLoaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    showWhatsappToolTip=true
    isHomeHeader = false;
    isPLPHeader = false;
    isScrolledHeader = false;
    loadNav: Subject<boolean> = new Subject<false>();
    stopSearchNudge = false;

    currentRequest: any;
    cmsData: any;
    replaceHeading: boolean = false;
    abTesting: any;
    updateSortBy: Subject<string> = new Subject();
    bulk_rfq_categoryList: Subject<string> = new Subject();
    bharatcraftUserSessionArrived: Subject<boolean> = new Subject<boolean>();
    scrolledViewPort: number = 0;
    private _networkSpeed: Number = null;
    private _webpSupport: boolean = false;
    private networkSpeedState: Subject<number> = new Subject<number>();
    private webpSupportState: Subject<number> = new Subject<number>();
    private _loadSearchPopup: Subject<string> = new Subject<string>();
    private _copiedCoupon: Subject<string> = new Subject<string>();
    public searchNudgeOpened: Subject<boolean> = new Subject<boolean>();
    public searchNudgeClicked: Subject<boolean> = new Subject<boolean>();
    public initiateLoginPopUp: Subject<string> = new Subject<string>();
    public _initiateBulkRfq: Subject<boolean> = new Subject<boolean>();
    public similarProductsLoaded: Subject<boolean> = new Subject<boolean>();

    public _sideNavToggle: Subject<boolean> = new Subject<boolean>();
    public addLottieScriptSubject: Subject<any> = new Subject<any>();
    public addLottieScriptGoToCartSubject: Subject<any> = new Subject<any>();
    public changeStaticJson: Subject<any> = new Subject<any>();
    private gaGtmData: { pageFrom?: string; pageTo?: string; list?: string };

    private routeData: { currentUrl: string; previousUrl: string };
    userSession ;
    idleNudgeTimer: IdleTimer;
    private _renderer2: Renderer2
    ;
    public previousUrl: string = "/";
    public currentUrl: string = null;
    public enableAppPromoInHeader = false;
    feedBackPosted = new Subject()
    goldMemberPopupOpened = new Subject();
    public defaultLocaleValue = localization_en.product;
    private copiedCouponInternal: string = '';
    public open360popup$: Subject<any> = new Subject<any>();
    public open360popup1$: Subject<any> = new Subject<any>();
    private lottieScriptUrl = 'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js';
    private _displayAddToCartAnimation = new Subject<boolean>();
    displayAddToCartAnimation$ = this._displayAddToCartAnimation.asObservable();

    constructor(
        @Inject(PLATFORM_ID) platformId,
        private checkoutService: CheckoutService,
        private _localStorageService: LocalStorageService,
        private _activatedRoute: ActivatedRoute,
        private _dataService: DataService,
        private _analytics: GlobalAnalyticsService,
        private _loaderService: GlobalLoaderService,
        private rendererFactory: RendererFactory2,
        private _router: Router,
        private _route: ActivatedRoute,
        @Inject(DOCUMENT) private _document: Document,
        private _authService: LocalAuthService
    )
    {
        this.windowLoaded = false;
        let gaGtmData = this._localStorageService.retrieve("gaGtmData");
        this.gaGtmData = gaGtmData ? gaGtmData : {};
        this.routeData = { currentUrl: "", previousUrl: "" };
        this.itemsValidationMessage = [];
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
        this.userSession = this._localStorageService.retrieve("user");
        this._renderer2 = this.rendererFactory.createRenderer(null, null);
  
        // this.abTesting = this._dataService.getCookie('AB_TESTING');
    }

    getLocalizationData(isEnglish) {
        return isEnglish ? localization_en.product : localization_hi.product
    }

    updateUserSession() {
        this.userSession = this._localStorageService.retrieve("user");
    }

    private setRoutingInfo() {
        this.currentUrl = this._router.url;
        this._router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.previousUrl = this.currentUrl;
                this.currentUrl = event.url;
            };
        });
    }

    get getPreviousUrl(): string {
        return this.previousUrl;
    } 

    get bodyScrollStatus() {
        return this._bodyScollFlag;
    }

    setNetworkSpeedState(speed)
    {
        this._networkSpeed = speed;
        this.networkSpeedState.next(speed);
    }

    getNetworkSpeedState(): Observable<number>
    {
        return this.networkSpeedState.asObservable();
    }

    setLoginNotify(user){
        this.loginPerformed$.next(user);
    }

    loginPerformedNotify(): Observable<number>
    {
        return this.loginPerformed$.asObservable();
    }

    setInitaiteLoginPopUp(redirectUrl = null)
    {
        this.initiateLoginPopUp.next(redirectUrl);
    }
    

    getInitaiteLoginPopUp(): Observable<string>
    {
        return this.initiateLoginPopUp.asObservable();
    }

    setSideNavToggle(enable: boolean){
        // console.log("setSideNavToggle", enable);
        this._sideNavToggle.next(enable);
    }

    getSideNavToggleStatus(): Observable<boolean>{
        return this._sideNavToggle.asObservable();
    }

    getNetworkSpeed(): Number
    {
        return this._networkSpeed;
    }

    setWebpSupportState(status)
    {
        this._webpSupport = status;
        this.webpSupportState.next(status);
    }

    getWebpSupportState(): Observable<number>
    {
        return this.webpSupportState.asObservable();
    }

    get networkSpeed()
    {
        return this._networkSpeed;
    }

    get webpSupport()
    {
        return this._webpSupport;
    }

    get itemsValidationMessage()
    {
        return this._itemsValidationMessage;
    }

    set itemsValidationMessage(ivm)
    {
        this._itemsValidationMessage = ivm;
    }

    updateSearchPopup(searchKeyword)
    {
        this._loadSearchPopup.next(searchKeyword);
    }

    getSearchPopupStatus()
    {
        return this._loadSearchPopup.asObservable();
    }

    updateCopiedCoupon(coupon) {
        this.copiedCouponInternal = coupon;
        this._copiedCoupon.next(coupon);
    }

    getCopiedCoupon() {
        return this._copiedCoupon.asObservable();
    }

    get copiedCoupon(): string{
        return this.copiedCouponInternal;
    }

    initiateBulkRfq(status: boolean)
    {
        this._initiateBulkRfq.next(status);
    }

    initiateBulkRfqStatus()
    {
        return this._initiateBulkRfq.asObservable();
    }

    resetLimitTrendingCategoryNumber()
    {
        this.limitTrendingCategoryNumber = GLOBAL_CONSTANT.trendingCategoryLimit;
    }

    scrollToTop()
    {
        if (this.isBrowser) {
            window.scrollTo(0, 0);
        }
    }

    setWindowLoaded()
    {
        this.windowLoaded = true;
    }

    getWindowLoaded()
    {
        return this.windowLoaded;
    }

    setRouteData(data)
    {
        Object.assign(this.routeData, data);
    }

    getRouteData()
    {
        return JSON.parse(JSON.stringify(this.routeData));
    }

    checkPincodeApi(data)
    {
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.VALIDATE_PRODUCT_SER;
        return this._dataService.callRestful("POST", url, { body: data });
    }

    setSearchResultsTrackingData(data)
    {
        this.searchResultsTrackingData = data;
    }

    getSearchResultsTrackingData()
    {
        return this.searchResultsTrackingData;
    }

    setGaGtmData(data: {})
    {
        if (Object.keys(data).length === 0) this.gaGtmData = {};
        else Object.assign(this.gaGtmData, data);
        this._localStorageService.store("gaGtmData", this.gaGtmData);
    }

    getGaGtmData()
    {
        return this._localStorageService.retrieve("gaGtmData");
    }

    setMyRfqParameters()
    {
        this.myRfqParameters = { productName: null, brandName: null };
    }

    getDefaultParams()
    {
        return this.defaultParams;
    }

    updateDefaultParamsNew(updatedParams?: {})
    {
        if (
            this.defaultParams["queryParams"] &&
            this.defaultParams["queryParams"]["str"]
        ) {
            updatedParams["queryParams"]["str"] =
                this.defaultParams["queryParams"]["str"];
        }
        if (updatedParams != undefined && Object.keys(updatedParams).length > 0) {
            for (let key in updatedParams) {
                this.defaultParams[key] = updatedParams[key];
            }
        }

        return this.defaultParams;
    }

    deleteDefaultQueryParams(queryParams: Array<string>)
    {
        for (let i = 0; i < queryParams.length; i++) {
            delete this.defaultParams.queryParams[queryParams[i]];
        }
    }

    deleteDefaultParam(key)
    {
        delete this.defaultParams[key];
    }

    private getCategoryData(type, curl, params, requestOptions: any = {}) {
        const formattedParams = this.formatParams(params);
        const headerData = {}
        if (requestOptions && requestOptions.headers.has('language')) {
            headerData['language'] = 'hi'
        }
        return this._dataService
            .callRestful(type, curl, { params: formattedParams, headerData: headerData })
            .pipe(
                catchError((res: HttpErrorResponse) =>
                {
                    return of({
                        productSearchResult: { totalCount: 0 },
                        buckets: [],
                        httpStatus: res.status,
                    });
                })
            );
    }

    // brandName: string;

    private getBrandData(type, curl, params)
    {
        const formattedParams = this.formatParams(params);

        return this._dataService
            .callRestful(type, CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_BRAND_NAME, {
                params: { name: formattedParams["brand"] },
            })
            .pipe(
                map((res: any) => res),
                mergeMap((data) =>
                {
                    // alert(JSON.stringify(data));
                    // this.brandName = data["brandName"];
                    formattedParams["brand"] = data["brandName"].toLowerCase();
                    return this._dataService
                        .callRestful(type, curl, { params: formattedParams })
                        .pipe(
                            map((res: any) =>
                            {
                                const result = res;
                                result["brandDetails"] = data;
                                return result;
                            }),
                            catchError((res: HttpErrorResponse) =>
                            {
                                return of({
                                    brandDetails: data,
                                    productSearchResult: { totalCount: 0, products: [] },
                                    buckets: [],
                                    httpStatus: res.status,
                                });
                            })
                        );
                }),
                catchError((res: HttpErrorResponse) =>
                {
                    return of({
                        brandDetails: { active: false },
                        productSearchResult: { totalCount: 0, products: [] },
                        buckets: [],
                        httpStatus: res.status,
                    });
                })
            );

        // return this._dataService.callRestful(type, curl, {params: formattedParams});
    }

    private getPopularSeachData(type, curl, params)
    {
        let formattedParams = this.formatParams(params);
        return this._dataService.callRestful(type, curl, {
            params: formattedParams,
        });
    }

    private getSearchData(type, curl, params): Observable<any>
    {
        const formattedParams = this.formatParams(params);
        return this._dataService
            .callRestful(type, curl, { params: formattedParams })
            .pipe(
                catchError((res: HttpErrorResponse) =>
                {
                    return of({
                        productSearchResult: { totalCount: 0, products: [] },
                        buckets: [],
                        httpStatus: res.status,
                    });
                })
            );
    }
    
    getCurrentRoute(fullUrl)
    {
        let fullUrlArray = fullUrl.split("?");
        //If length is greater than 1 means there were some query params in url
        if (fullUrlArray.length > 1) {
            return fullUrlArray[0];
        } else {
            //if length is equal to 1 than there is no query params in url. Now try to split the url with #
            fullUrlArray = fullUrlArray[0].split("#");
            return fullUrlArray[0];
        }
    }

    generateQueryParams()
    {
        // debugger;
        const url = location.search.substring(1);
        const queryParams = url
            ? JSON.parse(
                '{"' +
                decodeURI(url)
                    .replace(/"/g, '\\"')
                    .replace(/&/g, '","')
                    .replace(/=/g, '":"') +
                '"}'
            )
            : {};
        if (this.selectedFilterData.sortBy === "popularity") {
            delete queryParams["orderBy"];
            delete queryParams["orderWay"];
        } else if (this.selectedFilterData.sortBy === "lowPrice") {
            queryParams["orderBy"] = "price";
            queryParams["orderWay"] = "asc";
        } else if (this.selectedFilterData.sortBy === "highPrice") {
            queryParams["orderBy"] = "price";
            queryParams["orderWay"] = "desc";
        }
        return queryParams;
    }

    updateSelectedFilterDataFilterFromFragment(fragment) {
        let obj = {};

        if (fragment && JSON.stringify(fragment).includes('/auth')) {
            this.setInitaiteLoginPopUp(true);
        }
        
        if (fragment && fragment !== 'auth') {
            let filtersList = fragment.split("/");
            if (filtersList) {
                for (let i = 0; i < filtersList.length; i++) {
                    let a = filtersList[i].split(/-(.+)/);
                    obj[a[0]] = a[1].split("||");
                }
            }
        }
        return obj;
    }

    generateFragmentString(productFilterData)
    {
        // debugger;
        let fragment = "";
        // console.log("productFilterData",productFilterData)
        if (Object.keys(productFilterData).length > 0) {
            let filter = productFilterData;
            let keys = Object.keys(filter);

            for (let i = 0; i < keys.length; i++) {
                if (filter[keys[i]].length > 0) {
                    if (fragment.length == 0) {
                        fragment = fragment + keys[i] + "-" + filter[keys[i]].join("||");
                    } else {
                        fragment =
                            fragment + "/" + keys[i] + "-" + filter[keys[i]].join("||");
                    }
                } else {
                    delete filter[keys[i]];
                }
            }
        }

        return fragment.length > 0 ? fragment : null;
    }

    refreshProducts(flagFromResolver?: boolean, requestOptions = {}): Observable<any>
    {
        return new Observable((observer) =>
        {
            const defaultParams = this.defaultParams;
            if (defaultParams["pageName"] === "CATEGORY") {
                if (this.currentRequest !== undefined)
                    this.currentRequest.unsubscribe();

                this.currentRequest = this.getCategoryData(
                    "GET",
                    CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_CATEGORY,
                    defaultParams
                )
                    .pipe(
                        map((res) =>
                        {
                            res["buckets"].map((bucket) =>
                            {
                                bucket["collFilter"] = true;
                            });
                            return res;
                        })
                    )
                    .subscribe((response) =>
                    {
                        observer.next(response);
                        observer.complete();
                    });
            } else if (defaultParams["pageName"] == "BRAND") {
                if (this.currentRequest != undefined) {
                    this.currentRequest.unsubscribe();
                }
                this.currentRequest = this.getBrandData(
                    "GET",
                    CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_BRANDS,
                    defaultParams
                )
                    .pipe(
                        map((res) =>
                        {
                            res.buckets.map((bucket) =>
                            {
                                bucket["collFilter"] = true;
                            });
                            res["flag"] = !!flagFromResolver;
                            return res;
                        })
                    )
                    .subscribe((response) =>
                    {
                        if (this._router.url.search("#") < 0) {
                            this.getCmsDynamicDataForCategoryAndBrand(
                                defaultParams["category"],
                                defaultParams["brand"]
                            ).subscribe(
                                (res) =>
                                {
                                    if (res["status"]) {
                                        response.cmsData = res["data"]["data"];
                                        observer.next(response);
                                        observer.complete();
                                    } else {
                                        observer.next(response);
                                        observer.complete();
                                    }
                                },
                                (err) =>
                                {
                                    observer.next(response);
                                    observer.complete();
                                }
                            );
                        } else {
                            this.replaceHeading = false;
                            observer.next(response);
                            observer.complete();
                        }
                    });
            } else if (defaultParams["pageName"] == "SEARCH") {
                if (this.currentRequest != undefined) {
                    this.currentRequest.unsubscribe();
                }
                this.currentRequest = this.getSearchData(
                    "GET",
                    CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.SEARCH_V1,
                    defaultParams
                )
                    .pipe(
                        map((res) =>
                        {
                            res["buckets"].map((bucket) =>
                            {
                                bucket["collFilter"] = true;
                            });

                            return res;
                        })
                    )
                    .subscribe((response) =>
                    {
                        observer.next(response);
                        observer.complete();
                    });
            } else if (defaultParams["pageName"] == "POPULAR SEARCH") {
                if (this.currentRequest != undefined) this.currentRequest.unsubscribe();
                this.currentRequest = this.getPopularSeachData(
                    "GET",
                    CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.SEARCH_V1,
                    defaultParams
                )
                    .pipe(
                        map((res) =>
                        {
                            res["buckets"].map((bucket) =>
                            {
                                bucket["collFilter"] = true;
                            });

                            return res;
                        })
                    )
                    .subscribe((response) =>
                    {
                        observer.next(response);
                        observer.complete();
                    });
            } else if (defaultParams["pageName"] == "ATTRIBUTE") {
                if (this.currentRequest != undefined) this.currentRequest.unsubscribe();
                let _observerable: Observable<any> = null;
                if (defaultParams['searchTerm']) {
                    _observerable = this.getSearchData("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.SEARCH_V1, defaultParams);
                } else {
                    _observerable = this.getCategoryData("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_CATEGORY, defaultParams, requestOptions);
                }
                this.currentRequest = _observerable.pipe(
                    map((res) =>
                    {
                        res["buckets"].map((bucket) =>
                        {
                            bucket["collFilter"] = true;
                        });
                        return res;
                    })
                )
                    .subscribe((response) =>
                    {
                        observer.next(response);
                        observer.complete();
                    });
            }

            if (this.isBrowser && sessionStorage.getItem("listing-page")) {
                this.setSectionClick(sessionStorage.getItem("listing-page"));
            }
        });
    }

    getCmsDynamicDataForCategoryAndBrand(categoryCode?, brandName?)
    {
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_CMS_CONTROLLED_PAGES;
        if (brandName) {
            url += "&brandName=" + brandName;
        }
        if (categoryCode) {
            url += "&categoryCode=" + categoryCode;
        }
        return this._dataService.callRestful("GET", url);
    }

    public formatParams(params)
    {
        let currentQueryParams = this._activatedRoute.snapshot.queryParams;

        let queryParams: {} = {};
        const actualParams = {};

        if (params.queryParams != undefined) queryParams = params.queryParams;

        actualParams["type"] = "m";
        //actualParams["abt"] = CONSTANTS.SEARCH_ABT_FLAG;
        //actualParams["onlineab"] = CONSTANTS.SEARCH_ONLINE_ABT_FLAG;

        if (queryParams["preProcessRequired"]) {
            actualParams["preProcessRequired"] = queryParams["preProcessRequired"];
        }

        /**
         *  Below code is added to maintain the state of sortBy : STARTS
         */
        actualParams["orderBy"] =
            queryParams["orderBy"] != undefined
                ? queryParams["orderBy"]
                : "popularity";
        actualParams["orderWay"] =
            queryParams["orderWay"] != undefined ? queryParams["orderWay"] : "desc";
        /**
         *  maintain the state of sortBy : ENDS
         */

        actualParams["pageIndex"] =
            queryParams["page"] != undefined ? queryParams["page"] - 1 : "0";
        actualParams["pageSize"] =
            queryParams["pageSize"] != undefined
                ? queryParams["pageSize"]
                : CONSTANTS.GLOBAL.default.pageSize + "";

        if (params.pageName == "CATEGORY") {
            if (params["category"] != undefined)
                actualParams["category"] = params["category"];
                actualParams['pageSize'] = CONSTANTS.GLOBAL.default.categoryListingPageSize + '';
            //10766
            if (queryParams["str"] != undefined)
                actualParams["str"] = queryParams["str"];
        } else if (params.pageName == "BRAND") {
            if (params["category"]) {
                actualParams["category"] = params["category"];
            }
            actualParams["brand"] = params.brand ? params.brand.toLowerCase() : "";
        } else if (params.pageName == "SEARCH") {
            /**
             * Below first if is only appending didYouMean when calling api and not appending for further routes on page
             */
            if (
                currentQueryParams["didYouMean"] != undefined &&
                currentQueryParams["didYouMean"] == "false"
            )
                actualParams["didYouMean"] = "false";
            if (
                queryParams["operation"] != undefined &&
                queryParams["operation"] == "or"
            )
                actualParams["operation"] = "or";
            if (queryParams["category"] != undefined)
                actualParams["category"] = encodeURIComponent(queryParams["category"]);
            actualParams["str"] = queryParams["search_query"];
        } else if (params.pageName == "POPULAR SEARCH") {
            actualParams["str"] = params["searchString"];
        } else if (params.pageName == "ATTRIBUTE") {
            if (params["category"] != undefined) {
                actualParams["category"] = params["category"];
            }
            if (queryParams["str"]) {
                actualParams["str"] = queryParams["str"];
            }
            if (queryParams["pageIndex"]) {
                actualParams["pageIndex"] = queryParams["pageIndex"];
            }
        }
        if (params.filter != undefined && Object.keys(params.filter).length > 0) {
            actualParams["filter"] = params.filter;
            for (let key in actualParams["filter"]) {
                if (actualParams["filter"][key].length == 0)
                    delete actualParams["filter"][key];
            }
            actualParams["filter"] = encodeURIComponent(
                JSON.stringify(actualParams["filter"])
            );
        }
        return actualParams;
    }

    getUserSession(): Observable<{}>
    {
        let user = this._localStorageService.retrieve("user");
        // return user from localstorage OR call API
        if (user) {
            return of(user);
        }
        return this._dataService
            .callRestful("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_SESSION)
            .pipe(map((res) => res));
    }

    getToken()
    {
        return this._dataService.callRestful(
            "GET",
            CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_TOKKEN
        );
    }

    logout()
    {
        return this._dataService.callRestful(
            "GET",
            CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.LOGOUT
        );
    }

    getAddressList(params)
    {
        return this._dataService
            .callRestful("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_ADD_LIST, {
                params: params,
                headerData: { "If-None-Match": 'W/"2-4KoCHiHd29bYzs7HHpz1ZA"' },
            })
            .pipe(
                catchError((res: HttpErrorResponse) =>
                {
                    return of({ status: false, statusCode: res.status, addressList: [] });
                })
            );
    }

    getStateList(countryId)
    {
        return this._dataService.callRestful(
            "GET",
            CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_StateList,
            { params: { countryId: countryId } }
        );
    }

    getCountryList()
    {
        return this._dataService
            .callRestful("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_CountryList)
            .pipe(
                catchError((res: HttpErrorResponse) =>
                {
                    return of({ status: false, statusCode: res.status, dataList: [] });
                })
            );
    }

    subscribeEmail(email)
    {
        return this._dataService.callRestful(
            "POST",
            CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.LOGIN_SUBSCRIPTION,
            { body: { email: email, active: true } }
        );
    }

    subscribeCredit(data)
    {
        return this._dataService.callRestful(
            "POST",
            CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.EPAY_LATER,
            { body: data }
        );
    }

    getBusinessDetail(data)
    {
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CBD;
        return this._dataService.callRestful("GET", url, { params: data }).pipe(
            catchError((res: HttpErrorResponse) =>
            {
                return of({ status: false, statusCode: res.status });
            })
        );
    }

    // obj={};

    getBusinessDetails()
    {
        let user = this._localStorageService.retrieve("user");
        return new Observable((observer: Observer<any>) =>
        {
            this.getBusinessDetail(user.userId).subscribe((data) =>
            {
                let businessDeatils = data;
                if (businessDeatils) {
                    /* this.obj = {
                                  "company": businessDeatils[0].company_name,
                                  "gstn": businessDeatils[0].gstin,
                                  "is_gstin": businessDeatils[0].is_gst_invoice
                              } */
                    observer.next(businessDeatils);
                } else {
                    /* this.obj = {
                                  "company": null,
                                  "gstn": null,
                                  "is_gstin": null
                              } */
                    observer.next(null);
                }
                observer.complete();
            });
        });
    }

    pay(pdata) {
        const userSession = this._localStorageService.retrieve("user");
        return this.getBusinessDetail({ customerId: userSession.userId }).pipe(
            map((res: any) => res),
            mergeMap((d) => {
                let bd: any = null;
                if (d && d.status && d.statusCode == 200) {
                    bd = {
                        company: d["data"]["companyName"],
                        gstin: d["data"]["gstin"],
                        is_gstin: d["data"]["isGstInvoice"],
                    };
                }
                pdata["validatorRequest"]["shoppingCartDto"]["businessDetails"] = bd;
                return this._dataService.callRestful("POST", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.PAYMENT, {})
                    .pipe(
                        catchError((res: HttpErrorResponse) => {
                            return of({ status: false, statusCode: res.status });
                        }),
                        map((res: any) => {
                            return res;
                        })
                    );
            })
        );
    }

    createValidatorRequest(cartSession, userSession, extra) {
        let cart = cartSession["cart"];
        let cartItems = cartSession["itemsList"];
        let billingAddress: any = this.checkoutService.getBillingAddress();

        let offersList: Array<{}> = [];

        Object.assign(offersList, cartSession["offersList"]);

        if (offersList != undefined && offersList.length > 0) {
            for (let key in offersList) {
                delete offersList[key]["createdAt"];
                delete offersList[key]["updatedAt"];
            }
        }

        let obj = {
            shoppingCartDto: {
                cart: {
                    cartId: cart["cartId"],
                    sessionId: cart["sessionId"],
                    userId: userSession["userId"],
                    agentId: cart["agentId"] ? cart["agentId"] : null,
                    isPersistant: true,
                    createdAt: null,
                    updatedAt: null,
                    closedAt: null,
                    orderId: null,
                    totalAmount: cart["totalAmount"] == null ? 0 : cart["totalAmount"],
                    totalOffer: cart["totalOffer"] == null ? 0 : cart["totalOffer"],
                    totalAmountWithOffer:
                        cart["totalAmountWithOffer"] == null
                            ? 0
                            : cart["totalAmountWithOffer"],
                    taxes: cart["taxes"] == null ? 0 : cart["taxes"],
                    totalAmountWithTaxes: cart["totalAmountWithTax"],
                    shippingCharges:
                        cart["shippingCharges"] == null ? 0 : cart["shippingCharges"],
                    currency: cart["currency"] == null ? "INR" : cart["currency"],
                    isGift: cart["gift"] == null ? false : cart["gift"],
                    giftMessage: cart["giftMessage"],
                    giftPackingCharges:
                        cart["giftPackingCharges"] == null ? 0 : cart["giftPackingCharges"],
                    totalPayableAmount:
                        cart["totalAmount"] == null ? 0 : cart["totalAmount"],
                    noCostEmiDiscount:
                        extra.noCostEmiDiscount == 0 ? 0 : extra.noCostEmiDiscount,
                },
                itemsList: this.getItemsList(cartItems),
                addressList: [
                    {
                        addressId: extra.addressList.idAddress,
                        type: "shipping",
                        invoiceType: this.checkoutService.getInvoiceType(),
                    },
                ],
                payment: {
                    paymentMethodId: extra.paymentId,
                    type: extra.mode,
                    bankName: extra.bankname,
                    bankEmi: extra.bankcode,
                    emiFlag: extra.emitenure,
                    gateway: extra.gateway,
                },
                deliveryMethod: {
                    deliveryMethodId: 77,
                    type: "kjhlh",
                },
                prepaidDiscounts: cartSession.prepaidDiscountList || null,
                offersList:
                    offersList != undefined && offersList.length > 0 ? offersList : null,
                extraOffer: cartSession["extraOffer"]
                    ? cartSession["extraOffer"]
                    : null,
                device: CONSTANTS.DEVICE.device,
            },
        };

        if (cart["buyNow"]) {
            obj["shoppingCartDto"]["cart"]["buyNow"] = cart["buyNow"];
        }

        //console.log('billingAddress', billingAddress);
        if (billingAddress !== undefined && billingAddress !== null) {
            obj.shoppingCartDto.addressList.push({
                addressId: billingAddress.idAddress,
                type: "billing",
                invoiceType: this.checkoutService.getInvoiceType(),
            });
        }
        // console.log('createValidatorRequest', obj);
        return obj;
    }

    getItemsList(cartItems)
    {
        let itemsList = [];
        if (cartItems != undefined && cartItems != null && cartItems.length > 0) {
            for (let i = 0; i < cartItems.length; i++) {
                let item = {
                    productId: cartItems[i]["productId"],
                    productName: cartItems[i]["productName"],
                    brandName: cartItems[i]["brandName"],
                    productImg: cartItems[i]["productImg"],
                    amount: cartItems[i]["amount"],
                    offer: cartItems[i]["offer"],
                    amountWithOffer: cartItems[i]["amountWithOffer"],
                    taxes: cartItems[i]["taxes"],
                    amountWithTaxes: cartItems[i]["amountWithTaxes"],
                    totalPayableAmount: cartItems[i]["totalPayableAmount"],
                    isPersistant: true,
                    productQuantity: cartItems[i]["productQuantity"],
                    productUnitPrice: cartItems[i]["productUnitPrice"],
                    expireAt: cartItems[i]["expireAt"],
                    bulkPriceMap: cartItems[i]["bulkPriceMap"],
                    bulkPrice: cartItems[i]["bulkPrice"],
                    priceWithoutTax: cartItems[i]["priceWithoutTax"],
                    bulkPriceWithoutTax: cartItems[i]["bulkPriceWithoutTax"],
                    taxPercentage: cartItems[i]["taxPercentage"],
                    categoryCode: cartItems[i]["categoryCode"],
                    taxonomyCode: cartItems[i]["taxonomyCode"],
                };
                if (cartItems[i]["buyNow"]) {
                    item["buyNow"] = true;
                }
                itemsList.push(item);
            }
        }

        return itemsList;
    }

    getAll(body)
    {
        return this._dataService.callRestful(
            "POST",
            CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_ALL_PAYMENT,
            { body: body }
        );
    }

    validateCartBeforePayment(obj)
    {
        let userSession = this._localStorageService.retrieve("user");
        return this.getBusinessDetail({ customerId: userSession.userId }).pipe(
            map((res: any) => res),
            mergeMap((d) =>
            {
                let bd: any = null;
                if (d && d.status && d.statusCode == 200) {
                    bd = {
                        company: d["data"]["companyName"],
                        gstin: d["data"]["gstin"],
                        is_gstin: d["data"]["isGstInvoice"],
                    };
                }

                obj["shoppingCartDto"]["businessDetails"] = bd;
                return this._dataService
                    .callRestful(
                        "POST",
                        CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.VALIDATE_BD,
                        { body: obj }
                    )
                    .pipe(
                        catchError((res: HttpErrorResponse) =>
                        {
                            return of({ status: false, statusCode: res.status });
                        }),
                        map((res: any) =>
                        {
                            return res;
                        })
                    );
            })
        );
    }

    testApi()
    {
        return this._dataService.callRestful("GET", CONSTANTS.TEST_API);
    }

    getFooter()
    {
        return this._dataService.callRestful(
            "GET",
            CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.HOMEPAGE_FOOTER
        );
    }
    getTrendingCategories()
    {
        return this._dataService.callRestful(
            "GET",
            CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.TRENDING_CATEGORY
        );
    }

    sectionClicked: string = "";
    setSectionClick(section)
    {
        this.sectionClicked = section;
    }

    getSectionClick()
    {
        return this.sectionClicked ? this.sectionClicked : "";
    }

    resetSectionClick()
    {
        this.sectionClicked = "";
    }


    get loginStatusTracking() {
        if (this.isBrowser) {
            const user = this._localStorageService.retrieve("user");
            return user && user["authenticated"] == "true"
                ? "registered user"
                : "guest";
        } else {
            return '';
        }
    }

    get custDataTracking() {
        if (this.isBrowser) {
            const user = this._localStorageService.retrieve("user");
            return {
                customerID: user && user["userId"] ? btoa(user["userId"]) : "",
                emailID: user && user["email"] ? btoa(user["email"]) : "",
                mobile: user && user["phone"] ? btoa(user["phone"]) : "",
                customerType: user && user["userType"] ? user["userType"] : "",
                customerCategory: user && user["customerCategory"]
            };
        } else {
            return {
                customerID: "",
                emailID: "",
                mobile: "",
                customerType: "",
                customerCategory: ""
            }
        }
    }


    setSectionClickInformation(sectionName, identifier)
    {
        if (this.isBrowser && sectionName && identifier) {
            sessionStorage.removeItem(identifier + "page");
            sessionStorage.setItem(identifier + "-page", sectionName);
        }
    }

    scrollTo(event)
    {
        if (this.isBrowser){
            if (event.target){
                ClientUtility.scrollToTop(500, event.target.offsetTop - 50);
            }
             else {
                ClientUtility.scrollToTop(500, event.offsetTop - 50);
            }
        }
    }
    getBreadcrumpData(link, type, pageTitle?): Observable<any>
    {
        let curl =
            CONSTANTS.NEW_MOGLIX_API +
            ENDPOINTS.BREADCRUMB +
            "?source=" +
            link +
            "&type=" +
            type;
        if (pageTitle) {
            curl += "&pagetitle=" + pageTitle;
        }
        return this._dataService.callRestful("GET", curl);
    }

    calculateFilterCount(data)
    {
        let count = 0;
        data.forEach((el) =>
        {
            for (let i = 0; i < el.terms.length; i++) {
                if (el.terms[i].selected) {
                    count++;
                    break;
                }
            }
        });
        return count;
    }

    removeLoader()
    {
        setTimeout(() =>
        {
            this.showLoader = false;
        }, 0);
    }

    /**
     * This funtion is used to create fragment & queryparams and navigate to the specific routes
     */
    public selectedFilterData: any = {
        filter: {},
        filterChip: {},
        sortBy: "popularity",
        pages: [],
        page: this._activatedRoute.snapshot.params.page || 1,
        totalCount: 0,
        pageSize: GLOBAL_CONSTANT.default.pageSize,
    };

    resetSelectedFilterData()
    {
        this.selectedFilterData = {
            filter: {},
            sortBy: "popularity",
            pages: [],
            page: 1,
            pageSize: GLOBAL_CONSTANT.default.pageSize,
        };
    }

    setBodyScroll(e = null, status: boolean, appPopUpConfig = true) {
        if (e != null && e.hasOwnProperty('preventDefault') ){
            e.preventDefault();
            e.stopPropagation();
        }
        if (this.isBrowser) {
            this._bodyScollFlag = status;
            if (status) {
                //enable
                (<HTMLElement>document.getElementById('body')).classList.remove('stop-scroll');
                if(appPopUpConfig && document.querySelector('app-pop-up')){
                    document.querySelector('app-pop-up').classList.remove('open');
                }
                if (e != null && e.hasOwnProperty('preventDefault')) {
                    document.getElementById('body').removeEventListener('touchmove', () => { e && e.preventDefault() })
                } else {
                    document.getElementById('body').removeEventListener('touchmove', () => { })
                }
            } else {
                // disabled
                (<HTMLElement>document.getElementById('body')).classList.add('stop-scroll');
                if (e != null && e.hasOwnProperty('preventDefault')) {
                    document.getElementById('body').addEventListener('touchmove', () => { e && e.preventDefault() }, { passive: true });
                } else {
                    document.getElementById('body').addEventListener('touchmove', () => { }, { passive: true });
                }
            }
        }
    }

    genricApplyFilter(key, item)
    {
        // debugger;
        if (this.selectedFilterData.filter.hasOwnProperty(key)) {
            const indexInSelectedFilterDataFilterArray =
                this.selectedFilterData.filter[key].findIndex((x) => x === item.term);
            if (!(indexInSelectedFilterDataFilterArray > -1)) {
                this.selectedFilterData.filter[key].push(item.term);
            } else {
                this.selectedFilterData.filter[key].splice(
                    indexInSelectedFilterDataFilterArray,
                    1
                );
            }
        } else {
            this.selectedFilterData.filter[key] = [];
            this.selectedFilterData.filter[key].push(item.term);
        }
        this.applyFilter();
    }

    applyFilter(currentRouteFromCategoryFilter?: number, page?: number)
    {
        const currentRoute = !currentRouteFromCategoryFilter
            ? this.getCurrentRoute(this._router.url)
            : currentRouteFromCategoryFilter;
        // console.log("currentRoute",currentRoute);

        const extras: NavigationExtras = { queryParams: {} };
        // console.log("")
        const fragmentString = this.generateFragmentString(
            this.selectedFilterData.filter
        );
        // console.log("fragmentString",fragmentString);
        const queryParams = this.generateQueryParams();

        extras.queryParams = queryParams;

        if (fragmentString != null) {
            extras.fragment = fragmentString;
        }

        this.selectedFilterData.page = 1;
        if (extras.queryParams["page"]) {
            this.selectedFilterData.pageSize = GLOBAL_CONSTANT.default.pageSize;
            delete extras.queryParams["page"];
        }
        if (page > 1) {
            this.selectedFilterData.page = page;
            extras.queryParams["page"] = page;
            // console.log("extras", extras);
        }
        this.toggleFilter(true);
        this._router.navigate([currentRoute],extras);
    }

    toggleFilter(forceFillyRemove?: boolean)
    {
        const mob_filter = document.querySelector(".mob_filter");
        if (mob_filter) {
            forceFillyRemove
                ? mob_filter.classList.remove("upTrans")
                : mob_filter.classList.toggle("upTrans");
        }
    }

    navigateTo(link, addBracket?: boolean)
    {
        if (addBracket) {
            this._router.navigate([link]);
            return;
        }
        this._router.navigate(link);
    }

    sendOtp(data): Observable<{}>
    {
        data["device"] = CONSTANTS.DEVICE.device;
        const accessKey = this.generateAuthKey(CONSTANTS.SEND_OTP_PRIVATE_KEY, data.phone ? data.phone: data.email)
        return this._dataService.callRestful(
            "POST",
            CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.LOGIN_URL,
            { body: data, headerData: { 'accessKey': accessKey }  }
        );
    }

    validateOTP(data)
    {
        return this._dataService.callRestful(
            "POST",
            CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.LOGIN_OTP,
            { body: data }
        );
    }

    getUniqueGAId()
    {
        return this._dataService.getCookie("_ga");
    }

    redirectPostAuth(redirectURL: string)
    {
        let routeData = this.getRouteData();
        if (redirectURL) {
            this.redirectCheck(redirectURL);
        }
        else if (routeData['previousUrl'] && routeData['previousUrl'] == '/') {
            this.redirectCheck('/');
        } else if (routeData['previousUrl'] && routeData['previousUrl'] != '' && routeData['previousUrl'] != '/login') {
            this.redirectCheck(routeData['previousUrl']);
        } else if (routeData['currentUrl'] && routeData['currentUrl'] != '' && routeData['currentUrl'] != '/login') {
            this.redirectCheck(routeData['currentUrl']);
        } else {
            this.redirectCheck('/');
        }
    }

    checkDefaultUserAndReplace(username: string) {
        if (username.toLocaleLowerCase() == CONSTANTS.DEFAULT_USER_NAME_PLACE_HOLDER.toLocaleLowerCase()) {
            return ''
        }
        return username;
    }

    redirectCheck(url: string)
    {
        const exceptUrl = ['login', 'otp', 'forgot-password', 'sign-up']
        let contains = false;
        exceptUrl.forEach(element =>
        {
            if (url.indexOf(element) !== -1) {
                contains = true;
            }
        });
        if (contains) {
            this._router.navigateByUrl('/');
        } else {
            this._router.navigateByUrl(url);
        }
    }

    debounceFunctionAndEvents(func, timeout = 100){
        // console.log('called : ' + timeout);
        let timer;
        return (...args) => {
          clearTimeout(timer);
          timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    }

    resetSearchNudgeTimer()
    {
        this.idleNudgeTimer = new IdleTimer({
            timeout: GLOBAL_CONSTANT.searchNudgeTimer,
            onTimeout: () =>
            {
                this.enableNudge = true;
                this.searchNudgeOpened.next(true);
            }
        }, this._renderer2, this);
    }


    attachHotKeysScrollEvent()
    {
        this.attachScrollEvent$.subscribe(className =>
        {
            const element = document.getElementsByClassName(className)[0];
            if (element) {
                element.addEventListener('scroll', this.idleNudgeTimer.eventHandler);
            }
        });
    }

    createGenricAdobeData(linkPagename, channel, linkName)
    {
        const user = this._localStorageService.retrieve('user');
        let page = {getUniqueGAId()
            {
                return this._dataService.getCookie("_ga");
            }
        
        }
        let custData = {
            'customerID': (user && user["userId"]) ? btoa(user["userId"]) : '',
            'emailID': (user && user["email"]) ? btoa(user["email"]) : '',
            'mobile': (user && user["phone"]) ? btoa(user["phone"]) : '',
            'customerType': (user && user["userType"]) ? user["userType"] : '',
        }
        let order = {};

        return { page, custData, order };
    }

    createAndSendGenricAdobeData(linkPagename, channel, linkName)
    {
        const data = this.createGenricAdobeData(linkPagename, channel, linkName);
        this._analytics.sendAdobeCall(data, "genericClick");
    }

    triggerAttachHotKeysScrollEvent(className)
    {
        setTimeout(() =>
        {
            this.attachScrollEvent$.next(className);
        }, 1000);
    }

    extractQueryParamsManually (url) {
        const queryParams = url
            ? JSON.parse(
            '{"' +
            decodeURI(url)
                .replace(/"/g, '\\"')
                .replace(/&/g, '","')
                .replace(/=/g, '":"') +
            '"}'
            )
            : {};
            return queryParams;
    }

    getRoutingData(_aRoute): Observable<any>{
        return of(_aRoute)
        .pipe(
          map((route) => {
            while (route.firstChild) {
              route = route.firstChild;
            }
            return route;
          }),
          filter((route) => route.outlet === "primary"),
          mergeMap((route) => route.data)
        )
    }

    /**
     * 
     * @param discountIfExist : If discount is given then it will make sure it has 0 places after decimal & is floor value
     * @param mrp : used if discountIfExist does not exist
     * @param SellingPrice  used if discountIfExist does not exist
     * @returns discount or 0
     */
    calculcateDiscount(discountIfExist, mrp, SellingPrice): number {
        if (discountIfExist && !Number.isNaN(discountIfExist)) {
            return +Math.floor(+(discountIfExist)).toFixed(0)
        } else if (mrp && SellingPrice && !Number.isNaN(mrp) && !Number.isNaN(SellingPrice)) {
            return +(Math.floor(+(((mrp - SellingPrice) / mrp) * 100)).toFixed(0))
        } else {
            return 0;
        }
    }

    openLoader() {
        return this.loadNav.asObservable();
    }
    
    isAbsoluteUrl(url: string) {
        return (url.indexOf('://') > 0 || url.indexOf('//') === 0)
    }

    getLoggerObj(url: string, method: string = null, startTime?, endTime?) {
        const logInfo: ServerLogSchema = { apiURL: url, method: method, payload: null, endDateTime: null, responseStatus: null, startDateTime: startTime, sessionId: null };
        if (this.isBrowser) {
            logInfo.sessionId = this.userSession ? this.userSession.sessionId : null;
        }
        return logInfo;
    }

    sortProductTagsOnPriority(productTags) {
        if(productTags){
            var res = Math.min.apply(Math, productTags.map((item) => {
              return item['priority'];
            }));
            productTags.forEach(element => {
              if (element['priority'] === res) {
                productTags.push(element);
              }
            });
            return productTags
        }
    }
    slicingHref(image) {
        const invalidURL = `${CONSTANTS.IMAGE_BASE_URL}${CONSTANTS.IMAGE_BASE_URL}`
        if (image.includes(invalidURL)) {
            return image.replace(invalidURL, CONSTANTS.IMAGE_BASE_URL);
        } else if (!image.includes(CONSTANTS.IMAGE_BASE_URL)) {
            return (CONSTANTS.IMAGE_BASE_URL + image);
        }
        return image;
    }

    callLottieScript(){
        try {
            if(this._authService.IsUserGoldMember()){
                let script = this._renderer2.createElement('script');
                script.src = CONSTANTS.CDN_LOTTIE_PATH;
                script.id = 'lottieScript';
                let scripts = this._document.getElementsByTagName('script');
                for (var i = scripts.length; i--;) {
                    if (scripts[i].src == CONSTANTS.CDN_LOTTIE_PATH){
                        return;
                    }
                    else{
                        this._renderer2.appendChild(this._document.body,script);
                        script.onload = ()=>{
                            console.log("lottie loaded");
                        };
                    }
                 }
            }
        } catch (error) {
            console.log('callLottieScript', error);
        }
    } 

    loadLottieScript(callback: Function) {
        try {
            if (!this._document.getElementById('lottieScript')) {
                const script = this._renderer2.createElement('script');
                script.src = this.lottieScriptUrl;
                script.id = 'lottieScript';
                this._renderer2.appendChild(this._document.body, script);
    
                script.onload = () => {
                    console.log("Lottie loaded");
                    callback();
                };
            } else {
                callback(); // If script already loaded, play the animation.
            }
        } catch (error) {
            console.log('callLottieScript', error);
        }
    }
    
    
  
    showgoldMembershipPopup(){
        this.goldMemberPopupOpened.next();
    }

    getGoldMembershipPopup(){
        return this.goldMemberPopupOpened.asObservable();
    }

    getPurchaseList(data) {
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.PRC_LIST;
        return this._dataService.callRestful("GET", url, { params: data }).pipe(
            map((res) => {
                if (res["status"] && res["statusCode"] == 200) {
                    return res["data"];
                } else {
                    return [];
                }
            })
        );
    }

    getRfqList(obj) {
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.RFQ_LIST;
        return this._dataService.callRestful("POST", url, { body: obj });
    }

    adobe_tracking_proceed_to_checkout(trackingname){
        const page = {
            'linkPageName': "moglix:cart summary",
            'linkName': trackingname,
        }
        let data = {}
        data["page"] = page;
        data["custData"] = this.custDataTracking;
        this._analytics.sendAdobeCall(data, trackingname); 
    }

    postUserLanguagePrefrence(params){
        return this._dataService.callRestful(
            "POST",
            CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.UPDATE_CUSTOMER_LANGUAGE_PREFRENCE + params
        );
    }

    get isHindiUrl() {
        return (this._router.url).toLowerCase().indexOf('/hi') !== -1
    }

    isHindiPage(detailsObj) {
        let userLangPreference = this._localStorageService.retrieve("languagePrefrence") || 'en';
        let hindiPageAvailable = false;
        if(userLangPreference == 'en') {
            return false;
        } 
        if(detailsObj && detailsObj.acceptLanguage && detailsObj.acceptLanguage.length) {
            hindiPageAvailable = true;
        }
        return ((userLangPreference == 'hi' && hindiPageAvailable) || (this.isHindiUrl && hindiPageAvailable)) ? true : false;
    }
    loadFreshChat(time = 1000) {
        if(this.isBrowser) {
            setTimeout(async () => {            
                const { FreshChat } = await import('../../modules/fresh-chat/fresh-chat.component');
                const freshchat = new FreshChat(this._router, this._localStorageService);
                freshchat.ngAfterViewInit();
            }, time);
        }
    }

    isScriptLoaded(url: string): boolean {
        const scripts = document.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
            if (scripts[i].src === url) {
                return true;
            }
        }
        return false;
    }

    toTitleCase(str) {
        if (str && str.length) {
            return str
                .toLowerCase()
                .replaceAll('-', ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        } else {
            return '';
        }
    }
    setDisplayAddToCartAnimation(value: boolean) {
        this._displayAddToCartAnimation.next(value);
      }
    
    isSearchPage(params) {
        return (params['search_query'] && params['search_query'].length) || (params['tS']) ? true : false;
    }

    generateAuthKey(privateKey, identifier) {
        const salt = CryptoJS.lib.WordArray.random(16).toString();
        const data = salt + privateKey + identifier;
        const hash = CryptoJS.SHA256(data).toString();
        return `${salt}.${hash}`;
    }
    
}