import { Title, Meta, makeStateKey, TransferState } from '@angular/platform-browser';
import { isPlatformServer, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Component, ViewChild, ViewEncapsulation, PLATFORM_ID, Inject, Renderer2, OnInit, AfterViewInit, Optional } from '@angular/core';
import { CategoryService } from './alp.service';
import { LocalStorageService } from 'ngx-webstorage';
import { ActivatedRoute, Router, NavigationExtras, Params } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE } from '@nguniversal/express-engine/tokens';
import { NgxSiemaOptions } from 'ngx-siema';
import { CommonService } from '@utils/services/common.service';
import { FooterService } from '@utils/services/footer.service';
import { SortByComponent } from '@modules/sortBy/sortBy.component';
import CONSTANTS from '@config/constants';
import { DataService } from '@utils/services/data.service';
import { GlobalLoaderService } from '@utils/services/global-loader.service';
import { ClientUtility } from '@app/utils/client.utility';

declare let dataLayer;
declare var digitalData: {};
declare let _satellite;
const slpPagesExtrasIdMap = { "116111700": "116111700", "114160000": "114160000", "211521500": "211521500", "114132500": "114132500" };
const ALPARK: any = makeStateKey<{}>("ALPARK");         //ALP Attrtibute Listing Result Key
const GRCRK: any = makeStateKey<{}>('GRCRK');           // GRCRK: Get Related Category Result Key
const RPRK: any = makeStateKey<{}>('RPRK');             // RPRK: Refresh Product Result Key
const EDK: any = makeStateKey<{}>('EDK');               //EDK:Extra Data Key
const GFAQK: any = makeStateKey<{}>("GFAQK")            // GFAQK: Get Frequently Asked Question Key

@Component({
    selector: "alp",
    templateUrl: "./alp.component.html",
    styleUrls: ["./alp.scss"],
    encapsulation: ViewEncapsulation.None,
})
export class CategoryComponent implements OnInit, AfterViewInit {
    @ViewChild(SortByComponent) sortByComponent: SortByComponent;
    productsUpdated: Subject<any> = new Subject<any>();
    paginationUpdated: Subject<any> = new Subject<any>();
    sortByUpdated: Subject<any> = new Subject<any>();
    pageSizeUpdated: Subject<any> = new Subject<any>();
    bucketsUpdated: Subject<any> = new Subject<any>();
    breadcrumpUpdated: Subject<any> = new Subject<any>();
    relatedCatgoryListUpdated: Subject<any> = new Subject<any>();
    categoryDataName: Subject<any> = new Subject<any>();
    sortByComponentUpdated: Subject<SortByComponent> = new Subject<SortByComponent>();
    pageName: string;
    buckets = [];
    subCategoryCount: number;
    session: {};
    getRelatedCatgory: any;
    productListLength: number;
    showSubcategoty: boolean;
    currentRequestGetRelatedCategories: any;
    isServer: boolean;
    isBrowser: boolean;
    productSearchResult: {};
    productSearchResultSEO: Array<any> = [];
    sortByOpt = false;
    filterCounts;
    todayDate: number;
    spl_subCategory_Dt: any;
    refreshProductsUnsub$: any;
    refreshProductsUnsub: any;
    _activatedRouteUnsub: any;
    forkJoinUnsub: any;
    combineLatestUnsub: any;
    pageNo;
    showAmpLink;
    extrasBlock: any = {};
    isSLPPage: boolean = false;
    API = CONSTANTS;
    openPopup: boolean;
    imagePath = CONSTANTS.IMG_URL;
    firstPageContent: boolean = false;
    page_title;
    taxo1: any;
    taxo2: any;
    taxo3: any;
    trendingSearchData;
    faqData;
    excludeAttributes: string[] = [];
    attributeListingData = null;
    titleHeading = "";
    titleDescription = "";
    pageDescription = "";
    metaTitle = "";
    metaDescription = "";
    groupedProductNames = [];
    groupedProducts = {};
    displayGroupBy = false;
    bestSellerProducts: any[] = [];
    groupedBrandSiema: NgxSiemaOptions = {
        selector: ".group-brand-siema",
        duration: 200,
        threshold: 10,
        startIndex: 0,
        perPage: 1.2,
    };
    bestSellerTitle = "";
    set showLoader(value) {
        this.loaderService.setLoaderState(value);
    } 

    constructor(
        @Optional() @Inject(RESPONSE) private _response,
        private _tState: TransferState,
        private _renderer2: Renderer2,
        @Inject(DOCUMENT) private _document,
        public dataService: DataService,
        public pageTitle: Title,
        private meta: Meta,
        @Inject(PLATFORM_ID) platformId,
        public footerService: FooterService,
        public _router: Router,
        public _activatedRoute: ActivatedRoute,
        private localStorageService: LocalStorageService,
        private _commonService: CommonService,
        private _categoryService: CategoryService,
        private loaderService:GlobalLoaderService) {

        this.showLoader=false;
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
        this.showSubcategoty = true;
        this.showLoader = false;
    }

    ngOnInit() {
        this._activatedRoute.queryParams.subscribe((queryParams) => {
            this.trendingSearchData = queryParams;
        });
        this.getRelatedCatgory = {};
        this.todayDate = Date.now();
        this.pageName = "ATTRIBUTE";
        this.subCategoryCount = 0;
        this._activatedRoute.params.subscribe((data) => {
            if (data && data.id && slpPagesExtrasIdMap.hasOwnProperty(data.id)) {
                this.isSLPPage = true;
                this.getExtraCategoryData(data).subscribe((data) => {
                    if (data && data["status"] && data["data"] && data["data"].length) {
                        if (this.isServer) {
                            this._tState.set(EDK, data);
                        }
                        this.parseData(data["data"]);
                    }
                    this.page_title = data["pageTitle"];
                });
            } else {
                this.isSLPPage = false;
            }
        });
        this.refreshProductsUnsub$ = this._commonService.refreshProducts$.subscribe(
            () => {
                this.showLoader = true;
                this.refreshProductsUnsub = this._commonService
                    .refreshProducts()
                    .subscribe((response) => {
                        this.showLoader = false;
                        this.productListLength =
                            response.productSearchResult["products"].length;
                        this.paginationUpdated.next({
                            itemCount: response.productSearchResult["totalCount"],
                        });
                        this.sortByUpdated.next();
                        this.pageSizeUpdated.next({
                            productSearchResult: response.productSearchResult,
                        });
                        let buckets = this.filterBuckets(response.buckets);
                        this.bucketsUpdated.next(buckets);
                        this.productsUpdated.next(response.productSearchResult.products);
                        this.productSearchResult = response.productSearchResult;
                    });
            }
        );

        this._activatedRouteUnsub = this._activatedRoute.queryParams.subscribe(
            (params: Params) => {
                this.pageNo = params["page"];
                this.displayGroupBy = params["page"] == 1;
            }
        );
        this.footerService.setMobileFoooters();
        this.combineLatestUnsub = combineLatest(
            this._activatedRoute.params,
            this._activatedRoute.queryParams,
            this._activatedRoute.fragment
        ).subscribe((data) => {
            if (this.isBrowser) {
                this.showLoader = true;
            }
            if (this._tState.hasKey(ALPARK)) {
                this.setAttributeListingInfo(this._tState.get(ALPARK, {}));
            } else {
                this._categoryService
                    .getCIMSAttributeListingInfo(data[0]["attribute"])
                    .subscribe((response) => {
                        this.setAttributeListingInfo(response["data"]);
                    });
            }
        });
        this._activatedRoute.queryParams.subscribe((data) => {
            if (data["page"] == undefined || data["page"] == 1) {
                this.firstPageContent = true;
            } else {
                this.firstPageContent = false;
            }
        });
    }

    setAttributeListingInfo(data) {
        this.attributeListingData = data;
        let defaultParams = this.attributeListingData["defaultParams"];
        let categoryCode = defaultParams["category"];
        let attributeListing = this.attributeListingData["attributesListing"];
        this.titleHeading = attributeListing["title"];
        this.titleDescription = attributeListing["titleDescription"];
        this.pageDescription = attributeListing["pageDescription"];
        this.metaTitle = attributeListing["metaTitle"];
        this.metaDescription = attributeListing["metaDescription"];
        this.excludeAttributes = attributeListing["attributes"];
        this.bestSellerProducts = this.attributeListingData["bestSellersProducts"];
        this.bestSellerTitle = attributeListing["categoryName"];
        if (this.isServer) {
            this._tState.set(ALPARK, data);
        }
        this.fetchCIMSRelatedData(categoryCode, defaultParams);
    }

    fetchCIMSRelatedData(categoryCode, defaultParams) {
        this.forkJoinUnsub = forkJoin([
            this.getRelatedCategories(categoryCode).pipe(map((res) => res)),
            this.refreshProducts(defaultParams).pipe(map((res) => res)),
        ]).subscribe((res) => {
            const ict = res[0]["categoryDetails"]["active"]; // ict : isCategoryActive
            let productSearchResult = res[1]["productSearchResult"];
            this.groupByBrandName(productSearchResult["products"]);
            if (!ict || res[1]["productSearchResult"]["totalCount"] === 0) {
                if (this.isServer) {
                    let httpStatus = 404;
                    if (res[0]["httpStatus"]) {
                        httpStatus = res[0]["httpStatus"];
                    } else if (res[1]["httpStatus"]) {
                        httpStatus = res[1]["httpStatus"];
                    }
                    this._response.status(httpStatus);
                }
                res[1] = {
                    buckets: [],
                    productSearchResult: { products: [], totalCount: 0 },
                };
            }
            if (this.isBrowser) {
                this.showLoader = false;
            }
            if (this._tState.hasKey(GRCRK)) {
                this.initiallizeRelatedCategories(res, false);
            } else {
                if (this.isServer) {
                    this._tState.set(GRCRK, res[0]);
                }
                this.initiallizeRelatedCategories(res, true);
            }
            const fragment = this._activatedRoute.snapshot.fragment;

            if (this._tState.hasKey(RPRK) && !fragment) {
                this.initiallizeData(res[1], false);
            } else {
                if (this.isServer) {
                    res[1]["buckets"] = this.filterBuckets(res[1]["buckets"]);
                    this._tState.set(RPRK, res[1]);
                }
                this.initiallizeData(res[1], true);
            }
            if (this.isBrowser) {
                this.setTrackingData(res);
            }
            if (
                this.isBrowser &&
                ict &&
                res[1]["productSearchResult"]["totalCount"] > 0
            ) {
                this.fireTags(res[1]);
            }
        });
    }

    setTrackingData(res) {
        var taxonomy = res[0]["categoryDetails"]["taxonomy"];
        var trackData = {
            event_type: "page_load",
            label: "view",
            product_count: res[1]["productSearchResult"]["totalCount"],
            category_l1: taxonomy.split("/")[0] ? taxonomy.split("/")[0] : null,
            category_l2: taxonomy.split("/")[1] ? taxonomy.split("/")[1] : null,
            category_l3: taxonomy.split("/")[2] ? taxonomy.split("/")[2] : null,
            channel: "Listing",
            search_query: null,
            suggestion_click: null,
            filter_added: !!window.location.hash.substr(1) ? "true" : "false",
            url_complete_load_time: null,
            page_type: "Category",
        };
        this.dataService.sendMessage(trackData);
    }

    outData(data) {
        if (Object.keys(data).indexOf("hide") !== -1) {
            this.openPopup = !data.hide;
        }
    }

    onFilterSelected(count) {
        this.filterCounts = count;
    }

    parseData(data) {
        let relevantObj: any = {};
        data.forEach((obj) => {
            relevantObj = obj;
        });
        if (relevantObj.block_data && relevantObj.block_data.product_data) {
            relevantObj.block_data.product_data.forEach((product) => {
                if (
                    product.discount_percentage &&
                    product.pricewithouttax &&
                    parseInt(product.discount_percentage) < 100
                ) {
                    product.discount_percentage = parseInt(product.discount_percentage);
                    product.pricewithouttax = parseInt(product.pricewithouttax);
                }
                let desc = {
                    Brand: "",
                };
                if (product && product.short_description) {
                    let descArr = product.short_description.split("||");
                    descArr.forEach((element) => {
                        let splitEl = element.split(":");
                        if (
                            splitEl[0].toLowerCase() == "brand" ||
                            splitEl[0].toLowerCase() == "by"
                        ) {
                            desc.Brand = splitEl[1];
                        } else {
                            desc[splitEl[0]] = splitEl[1];
                        }
                    });
                }
                product.descriptionObj = desc;
            });
        }
        this.extrasBlock = relevantObj.block_data;
    }

    ngAfterViewInit() {
        this.sortByComponentUpdated.next(this.sortByComponent);
        if (this.isBrowser) {
            this._tState.remove(GRCRK);
            this._tState.remove(RPRK);
            this._tState.remove(GFAQK);
        }
    }

    onUpdaet(data) {
        this.sortByOpt = data.sortByOpt;
    }

    refreshProducts(defaultApiParams): Observable<{}> {
        const defaultParams = this.createDefaultParams(defaultApiParams);
        this._commonService.updateDefaultParamsNew(defaultParams);
        const fragment = this._activatedRoute.snapshot.fragment;
        if (this._tState.hasKey(RPRK) && !fragment) {
            return of(this._tState.get(RPRK, {}));
        } else {
            if (this.isBrowser) {
                this.showLoader = true;
            }
            return this._commonService.refreshProducts();
        }
    }

    /**
     * @param response : returned data from category api or transfer state
     * @param flag     : true, if TrasnferState exist.
     */

    private initiallizeData(response: any, flag: boolean) {
        this.showLoader = false;
        this.productListLength = response.productSearchResult["products"].length;
        if (flag) {
            this.sortByUpdated.next();
            this.paginationUpdated.next({
                itemCount: response.productSearchResult["totalCount"],
            });
            this.pageSizeUpdated.next({
                productSearchResult: response.productSearchResult,
            });
            this.bucketsUpdated.next(this.filterBuckets(response.buckets));
            this.productsUpdated.next(response.productSearchResult.products);
        }
        this.productSearchResult = response.productSearchResult;
        this.productSearchResultSEO = [];
        for (
            let p = 0;
            p < response.productSearchResult.products.length && p < 10;
            p++
        ) {
            if (
                response.productSearchResult.products[p].salesPrice > 0 &&
                response.productSearchResult.products[p].priceWithoutTax > 0
            ) {
                this.productSearchResultSEO.push(
                    response.productSearchResult.products[p]
                );
            }
        }
        this.setCanonicalUrls(response);
    }

    private setCanonicalUrls(response) {
        const currentRoute = this._router.url.split("?")[0].split("#")[0];
        const links = this._renderer2.createElement("link");
        links.rel = "canonical";
        if (this.pageNo == undefined || this.pageNo == 1) {
            links.href = CONSTANTS.PROD + currentRoute.toLowerCase();
        } else {
            links.href =
                CONSTANTS.PROD + currentRoute.toLowerCase() + "?page=" + this.pageNo;
        }
        this._renderer2.appendChild(this._document.head, links);
        this.setAmpTag("alp");
        const currentQueryParams = this._activatedRoute.snapshot.queryParams;
        const pageCountQ = response.productSearchResult.totalCount / 10;
        const currentPageP = parseInt(currentQueryParams["page"]);
        if (pageCountQ > 1 && (currentPageP === 1 || isNaN(currentPageP))) {
            let links = this._renderer2.createElement("link");
            links.rel = "next";
            links.href = CONSTANTS.PROD + currentRoute + "?page=2";
            this._renderer2.appendChild(this._document.head, links);
        } else if (currentPageP > 1 && pageCountQ >= currentPageP) {
            let links = this._renderer2.createElement("link");
            links.rel = "prev";
            if (currentPageP === 2) {
                links.href = CONSTANTS.PROD + currentRoute;
            } else {
                links.href =
                    CONSTANTS.PROD + currentRoute + "?page=" + (currentPageP - 1);
            }

            this._renderer2.appendChild(this._document.head, links);

            links = this._renderer2.createElement("link");
            links.rel = "next";
            links.href =
                CONSTANTS.PROD + currentRoute + "?page=" + (currentPageP + 1);
            this._renderer2.appendChild(this._document.head, links);
        } else if (currentPageP > 1 && pageCountQ + 1 >= currentPageP) {
            let links = this._renderer2.createElement("link");
            links.rel = "prev";
            links.href =
                CONSTANTS.PROD + currentRoute + "?page=" + (currentPageP - 1);
            this._renderer2.appendChild(this._document.head, links);
        }
        let fragmentString = this._activatedRoute.snapshot.fragment;
        if (fragmentString != null || !isNaN(currentPageP)) {
            this.scrollToResults();
        }
    }

    scrollToResults() {
        let footerOffset = document.getElementById('.cate-container').offsetTop;
        ClientUtility.scrollToTop(1000,footerOffset - 30);
    }

    fireTags(response) {
        /**************************GTM START*****************************/
        let cr: any = this._router.url.replace(/\//, " ").replace(/-/g, " ");
        cr = cr.split("/");
        cr.splice(cr.length - 1, 1);
        cr = cr.join("/");
        const gaGtmData = this._commonService.getGaGtmData();
        const psrp = response.productSearchResult.products;
        const dlp = [];
        const criteoItem = [];
        for (let p = 0; p < response.productSearchResult.products.length; p++) {
            const product = {
                id: psrp[p].moglixPartNumber,
                name: psrp[p].productName,
                price: psrp[p].priceWithoutTax,
                brand: psrp[p].brandName,
                category: cr,
                variant: "",
                list: gaGtmData && gaGtmData["list"] ? gaGtmData["list"] : "",
                position: p + 1,
            };
            dlp.push(product);
            criteoItem.push(psrp[p].moglixPartNumber);
        }
        if (this.isBrowser) {
            let user;
            if (this.localStorageService.retrieve("user")) {
                user = this.localStorageService.retrieve("user");
            }
            dataLayer.push({
                event: "pr-impressions",
                ecommerce: {
                    currencyCode: "INR", // Local currency is optional.
                    impressions: dlp,
                },
            });

            const google_tag_params = {
                ecomm_prodid: "",
                ecomm_pagetype: "category",
                ecomm_totalvalue: "",
            };

            dataLayer.push({
                event: "dyn_remk",
                ecomm_prodid: google_tag_params.ecomm_prodid,
                ecomm_pagetype: google_tag_params.ecomm_pagetype,
                ecomm_totalvalue: google_tag_params.ecomm_totalvalue,
                google_tag_params: google_tag_params,
            });

            /*
             *Start Criteo DataLayer Tags
             */
            dataLayer.push({
                event: "viewList",
                email: user && user.email ? user.email : "",
                ProductIDList: criteoItem,
                CategoryId: this.getRelatedCatgory.categoryDetails.taxonomy,
                CategoryName: this.getRelatedCatgory.categoryDetails.canonicalURL,
            });

            /*End Criteo DataLayer Tags */
            /*Start Adobe Analytics Tags */
            if (this.getRelatedCatgory.categoryDetails.taxonomy) {
                this.taxo1 =
                    this.getRelatedCatgory.categoryDetails.taxonomy.split("/")[0] || "";
                this.taxo2 =
                    this.getRelatedCatgory.categoryDetails.taxonomy.split("/")[1] || "";
                this.taxo3 =
                    this.getRelatedCatgory.categoryDetails.taxonomy.split("/")[2] || "";
            }
            let page = {
                pageName:
                    "moglix:" +
                    this.taxo1 +
                    ":" +
                    this.taxo2 +
                    ":" +
                    this.taxo3 +
                    ": listing",
                channel: "listing",
                subSection:
                    "moglix:" +
                    this.taxo1 +
                    ":" +
                    this.taxo2 +
                    ":" +
                    this.taxo3 +
                    ": listing",
                loginStatus:
                    user && user["authenticated"] == "true" ? "registered user" : "guest",
            };
            let custData = {
                customerID: user && user["userId"] ? btoa(user["userId"]) : "",
                emailID: user && user["email"] ? btoa(user["email"]) : "",
                mobile: user && user["phone"] ? btoa(user["phone"]) : "",
                customerType: user && user["userType"] ? user["userType"] : "",
            };
            let order = {
                productCategoryL1: this.taxo1,
                productCategoryL2: this.taxo2,
                productCategoryL3: this.taxo3,
            };
            digitalData["page"] = page;
            digitalData["custData"] = custData;
            digitalData["order"] = order;
            if (
                this.trendingSearchData["tS"] &&
                this.trendingSearchData["tS"] === "no"
            ) {
                digitalData["page"]["trendingSearch"] = "no";
                digitalData["page"]["suggestionClicked"] = "no";
            } else if (
                this.trendingSearchData["tS"] &&
                this.trendingSearchData["tS"] === "yes"
            ) {
                digitalData["page"]["trendingSearch"] = "yes";
                digitalData["page"]["suggestionClicked"] = "yes";
            }
            if (
                this.trendingSearchData["sC"] &&
                this.trendingSearchData["sC"] === "no"
            ) {
                digitalData["page"]["trendingSearch"] = "no";
                digitalData["page"]["suggestionClicked"] = "no";
            } else if (
                this.trendingSearchData["sC"] &&
                this.trendingSearchData["sC"] === "yes"
            ) {
                digitalData["page"]["trendingSearch"] = "no";
                digitalData["page"]["suggestionClicked"] = "yes";
            }
            _satellite.track("genericPageLoad");
            /*End Adobe Analytics Tags */
        }
    }

    filterUp() {
        if (this.isBrowser) {
            if (
                document.querySelector(".mob_filter") &&
                document.querySelector(".mob_filter").classList.contains("upTrans")
            ) {
                document.querySelector(".mob_filter").classList.remove("upTrans");
            } else {
                document.querySelector(".mob_filter").classList.add("upTrans");
            }
        }
    }

    createDefaultParams(defaultApiParams) {
        let newParams = {
            category: defaultApiParams["category"],
            pageName: "ATTRIBUTE",
            queryParams: {},
            filter: {},
        };
        if (defaultApiParams["str"]) {
            //api params/filters
            newParams.queryParams["str"] = defaultApiParams["str"];
        }
        if (defaultApiParams["filter"]) {
            let filterTemp = JSON.parse(
                decodeURIComponent(defaultApiParams["filter"])
            );
            filterTemp = JSON.stringify(filterTemp).replace(/[+]/g, " ");
            newParams.filter = JSON.parse(filterTemp);
        }
        let defaultParams = this._commonService.getDefaultParams();
        if (defaultParams["queryParams"]["orderBy"] != undefined) {
            newParams.queryParams["orderBy"] =
                defaultParams["queryParams"]["orderBy"];
        }
        if (defaultParams["queryParams"]["orderWay"] != undefined) {
            newParams.queryParams["orderWay"] =
                defaultParams["queryParams"]["orderWay"];
        }
        let currentQueryParams = this._activatedRoute.snapshot.queryParams;
        for (let key in currentQueryParams) {
            newParams.queryParams[key] = currentQueryParams[key];
        }
        let fragment = this._activatedRoute.snapshot.fragment;
        if (fragment != undefined && fragment != null && fragment.length > 0) {
            let currentUrlFilterData: any = fragment.replace(/^\/|\/$/g, "");
            currentUrlFilterData = currentUrlFilterData.replace(/^\s+|\s+$/gm, "");
            let newCurrentUrlFilterData = ""; //newCurrentUrlFilterData and for loop is added for a special case, / is coming also in voltage filter part
            for (let i = 0; i < currentUrlFilterData.length; i++) {
                if (
                    currentUrlFilterData[i] == "/" &&
                    /^\d+$/.test(currentUrlFilterData[i + 1])
                ) {
                    newCurrentUrlFilterData = newCurrentUrlFilterData + "$";
                } else {
                    newCurrentUrlFilterData =
                        newCurrentUrlFilterData + currentUrlFilterData[i];
                }
            }
            currentUrlFilterData = newCurrentUrlFilterData.split("/");
            if (currentUrlFilterData.length > 0) {
                var filter = {};
                for (var i = 0; i < currentUrlFilterData.length; i++) {
                    var filterName = currentUrlFilterData[i]
                        .substr(0, currentUrlFilterData[i].indexOf("-"))
                        .toLowerCase(); // "price"
                    var filterData = currentUrlFilterData[i]
                        .replace("$", "/")
                        .substr(currentUrlFilterData[i].indexOf("-") + 1)
                        .split("||"); // ["101 - 500", "501 - 1000"]
                    filter[filterName] = filterData;
                }
                newParams["filter"] = Object.assign({}, newParams["filter"], filter);
            }
        }
        return newParams;
    }

    getExtraCategoryData(data): Observable<{}> {
        if (this._tState.hasKey(EDK)) {
            return of(this._tState.get(EDK, {}));
        } else {
            return this._categoryService.getCategoryExtraData(
                slpPagesExtrasIdMap[data.id]
            );
        }
    }

    getRelatedCategories(categoryID): Observable<{}> {
        if (this.currentRequestGetRelatedCategories !== undefined) {
            this.currentRequestGetRelatedCategories.unsubscribe();
        }
        if (this._tState.hasKey(GRCRK)) {
            return of(this._tState.get(GRCRK, {}));
        } else {
            return this._categoryService.getRelatedCategories(categoryID);
        }
    }

    private initiallizeRelatedCategories(response, flag) {
        this.getRelatedCatgory = response[0];
        const categoryData = response[1];
        let qps = this._activatedRoute.snapshot.queryParams;
        if (this.getRelatedCatgory.categoryDetails.active) {
            const categoryName = this.getRelatedCatgory.categoryDetails.categoryName;
            this.meta.addTag({ name: "description", content: this.metaDescription });
            this.meta.addTag({ name: "og:title", content: this.metaTitle });
            this.meta.addTag({
                name: "og:description",
                content: this.metaDescription,
            });
            this.meta.addTag({
                name: "og:url",
                content: "https://www.moglix.com" + this._router.url,
            });
            this.pageTitle.setTitle(this.metaTitle);
            if (
                categoryData["productSearchResult"]["products"] &&
                categoryData["productSearchResult"]["products"].length > 0
            ) {
                this.meta.addTag({
                    name: "robots",
                    content:
                        qps["page"] && parseInt(qps["page"]) > 1
                            ? CONSTANTS.META.ROBOT1
                            : CONSTANTS.META.ROBOT,
                });
            } else {
                this.meta.addTag({ name: "robots", content: CONSTANTS.META.ROBOT2 });
            }
            this.spl_subCategory_Dt = this.getRelatedCatgory.children;
            if (flag) {
                const bData = {
                    categoryLink: this.getRelatedCatgory.categoryDetails.categoryLink,
                    page: "category",
                };
                this.breadcrumpUpdated.next(bData);
            }
        }
    }

    pageChanged(page) {
        const extras: NavigationExtras = {};
        const currentRoute = this._commonService.getCurrentRoute(this._router.url);
        const fragmentString = this._activatedRoute.snapshot.fragment;
        if (fragmentString != null) {
            extras.fragment = fragmentString;
        }
        const currentQueryParams = this._activatedRoute.snapshot.queryParams;
        const newQueryParams: {} = {};
        if (Object.keys(currentQueryParams).length) {
            for (let key in currentQueryParams) {
                newQueryParams[key] = currentQueryParams[key];
            }
        }
        if (page !== "1") {
            newQueryParams["page"] = page;
        } else if (newQueryParams["page"] !== undefined) {
            delete newQueryParams["page"];
        }

        if (Object.keys(newQueryParams).length > 0) {
            extras.queryParams = newQueryParams;
        } else {
            extras.queryParams = {};
        }
        this._router.navigate([currentRoute], extras);
    }

    ngOnDestroy() {
        if (this.refreshProductsUnsub$) {
            this.refreshProductsUnsub$.unsubscribe();
        }
        if (this.refreshProductsUnsub) {
            this.refreshProductsUnsub.unsubscribe();
        }
        if (this._activatedRouteUnsub) {
            this._activatedRouteUnsub.unsubscribe();
        }
        if (this.combineLatestUnsub) {
            this.combineLatestUnsub.unsubscribe();
        }
        if (this.forkJoinUnsub) {
            this.forkJoinUnsub.unsubscribe();
        }
    }

    filterBuckets(buckets: any[]) {
        if (this.excludeAttributes.length > 0) {
            return buckets.filter(
                (bucket) => this.excludeAttributes.indexOf(bucket.name) == -1
            );
        }
        return buckets;
    }

    /**
     * @description:to group products depending on brandname && total count >2.
     * @description::if products length > 2 then only apply group by otherwise not required
     * @param=>products:products array
     */
    groupByBrandName(products: any[]) {
        this.groupedProducts = this._categoryService.getGroupedProducts(
            products,
            "brandName",
            2
        );
        this.groupedProductNames = Object.keys(this.groupedProducts);
        this.displayGroupBy =
            this.groupedProductNames.length > 1 &&
            (this.pageNo == 1 || this.pageNo == undefined);
    }

    setAmpTag(page) {
        let currentRoute = this._router.url.split("?")[0].split("#")[0];
        let ampLink;
        ampLink = this._renderer2.createElement("link");
        ampLink.rel = "amphtml";
        if (page == "alp") {
            ampLink.href = CONSTANTS.PROD + "/ampl" + currentRoute.toLowerCase();
            this._renderer2.appendChild(this._document.head, ampLink);
        }
    }
}