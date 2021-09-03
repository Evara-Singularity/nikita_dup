import { Title, Meta, makeStateKey, TransferState } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { EventEmitter, Component, ViewChild, PLATFORM_ID, Inject, Renderer2, OnInit, Optional, ViewContainerRef, ComponentFactoryResolver, Injector } from '@angular/core';
import { AlpService } from './alp.service';
import { CommonService } from '@services/common.service';
import { LocalStorageService } from 'ngx-webstorage';
import { ActivatedRoute, Router, NavigationExtras, Params } from '@angular/router';
import { FooterService } from '@services/footer.service';
import { SortByComponent } from '@components/sortBy/sortBy.component';
import { CONSTANTS } from '@config/constants';
import { ClientUtility } from '@utils/client.utility';
import { Subject, BehaviorSubject, Observable, of } from 'rxjs';
import { RESPONSE } from '@nguniversal/express-engine/tokens';
import { DataService } from '@services/data.service';
import { NgxSiemaOptions, NgxSiemaService } from 'ngx-siema';
import { GlobalAnalyticsService } from '@services/global-analytics.service';

const slpPagesExtrasIdMap = { "116111700": "116111700", "114160000": "114160000", "211521500": "211521500", "114132500": "114132500" };
const GRCRK: any = makeStateKey<{}>('GRCRK'); // GRCRK: Get Related Category Result Key
const EDK: any = makeStateKey<{}>('EDK');  //EDK:Extra Data Key

@Component({
    selector: 'alp',
    templateUrl: './alp.html',
    styleUrls: ['./alp.scss'],
})

export class AlpComponent implements OnInit {
    paginationInstance = null;
    @ViewChild('pagination', { read: ViewContainerRef }) paginationContainerRef: ViewContainerRef;
    filterInstance = null;
    @ViewChild('filter', { read: ViewContainerRef }) filterContainerRef: ViewContainerRef;
    sortByInstance = null;
    @ViewChild('sortBy', { read: ViewContainerRef }) sortByContainerRef: ViewContainerRef;
    subCategoryInstance = null;
    @ViewChild('subCategory', { read: ViewContainerRef }) subCategoryContainerRef: ViewContainerRef;
    catBestSellerInstance = null;
    @ViewChild('catBestsellers', { read: ViewContainerRef }) catBestSellerContainerRef: ViewContainerRef;
    shopByBrandInstance = null;
    @ViewChild('shopByBrand', { read: ViewContainerRef }) shopByBrandContainerRef: ViewContainerRef;
    catStaticInstance = null;
    @ViewChild('catStatic', { read: ViewContainerRef }) catStaticContainerRef: ViewContainerRef;
    slpSubCategoryInstance = null;
    @ViewChild('slpSubCategoryRef', { read: ViewContainerRef }) slpSubCategoryContainerRef: ViewContainerRef;
    shopbyFeatrInstance = null;
    @ViewChild('shopbyFeatr', { read: ViewContainerRef }) shopbyFeatrContainerRef: ViewContainerRef;
    cmsInstance = null;
    @ViewChild('cms', { read: ViewContainerRef }) cmsContainerRef: ViewContainerRef;
    cateoryFooterInstance = null;
    @ViewChild('cateoryFooter', { read: ViewContainerRef }) cateoryFooterContainerRef: ViewContainerRef;
    recentArticlesInstance = null;
    @ViewChild('recentArticles', { read: ViewContainerRef }) recentArticlesContainerRef: ViewContainerRef;

    @ViewChild(SortByComponent) sortByComponent: SortByComponent;

    paginationData: any = {};
    breadcrumbData: any;
    productsUpdated: BehaviorSubject<any> = new BehaviorSubject<any>({});
    pageSizeUpdated: BehaviorSubject<any> = new BehaviorSubject<any>({});
    relatedCatgoryListUpdated: BehaviorSubject<any> = new BehaviorSubject<any>({});
    showLoader: boolean;
    paginationUpdated: Subject<any> = new Subject<any>();
    sortByUpdated: Subject<any> = new Subject<any>();
    
    categoryDataName: Subject<any> = new Subject<any>();
    sortByComponentUpdated: Subject<SortByComponent> = new Subject<SortByComponent>();
    pageName: string;
    buckets = [];
    subCategoryCount: number;
    session: {};
    getRelatedCatgory: any;
    toggletsWrap: boolean;
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
    imagePath = CONSTANTS.IMAGE_BASE_URL;
    firstPageContent: boolean = false;
    page_title;
    taxo1: any;
    taxo2: any;
    taxo3: any;
    trendingSearchData;
    faqData;
    excludeAttributes: string[] = [];
    attributeListingData = null;
    filterData: Array<any> = [];
    titleHeading = '';
    titleDescription = '';
    pageDescription = '';
    metaTitle = '';
    metaDescription = '';
    groupedProductNames = [];
    groupedProducts = {};
    displayGroupBy = false;
    bestSellerProducts: any[] = [];
    groupedBrandSiema: NgxSiemaOptions = {
        selector: '.group-brand-siema',
        duration: 200,
        threshold: 10,
        startIndex: 0,
        perPage: 1.2,
    }
    bestSellerTitle = '';

    constructor(@Optional() @Inject(RESPONSE) private _response, private _tState: TransferState, private _renderer2: Renderer2,
        private injector: Injector,
        private cfr: ComponentFactoryResolver,
        private analytics: GlobalAnalyticsService,
        @Inject(DOCUMENT) private _document,
        public dataService: DataService,
        public pageTitle: Title, private meta: Meta, @Inject(PLATFORM_ID) platformId, public footerService: FooterService,
        public _router: Router, public _activatedRoute: ActivatedRoute, private localStorageService: LocalStorageService,
        public _commonService: CommonService, private _categoryService: AlpService, private ngxSiemaService: NgxSiemaService) {
        this.showSubcategoty = true;
        this.getRelatedCatgory = {};
        this.todayDate = Date.now();
        this.pageName = 'ATTRIBUTE';
        this.subCategoryCount = 0;
    }

    ngOnInit() {
        this.setCategoryDataFromResolver();
        
        if (this._commonService.isBrowser) {
            ClientUtility.scrollToTop(100);
        }

        this.footerService.setMobileFoooters();

    }

    setDataAfterGettingDataFromResolver(res) {
        this.setAttributeListingInfo(res);
    }

    setCategoryDataFromResolver() {
        this._commonService.showLoader = true;
        this._activatedRoute.data.subscribe(res => {
            // Set config based on query params change
            const queryParamsData = this._activatedRoute.snapshot.queryParams;
            this.updateConfigBasedOnQueryParams(queryParamsData);

            // Set config based on params change
            const paramsData = this._activatedRoute.snapshot.params;
            this.updateConfigBasedOnParams(paramsData);

            this.setDataAfterGettingDataFromResolver(res.alp);
        });
    }

    updateConfigBasedOnQueryParams(queryParamsData) {
        this.pageNo = queryParamsData['page'];
        this.displayGroupBy = (queryParamsData['page'] == 1);
        this.trendingSearchData = queryParamsData;

        if (queryParamsData['page'] == undefined || queryParamsData['page'] == 1) {
            this.firstPageContent = true;
        } else {
            this.firstPageContent = false;
        }
    }

    updateConfigBasedOnParams(paramsData) {
        if (paramsData && paramsData.id && slpPagesExtrasIdMap.hasOwnProperty(paramsData.id)) {
            this.isSLPPage = true;
            this.getExtraCategoryData(paramsData).subscribe((paramsData) => {
                if (paramsData && paramsData['status'] && paramsData['data'] && paramsData['data'].length) {
                    if (this._commonService.isServer) {
                        this._tState.set(EDK, paramsData);
                    }
                    this.parseData(paramsData['data']);
                }
                this.page_title = paramsData['pageTitle'];
            });
        } else {
            this.isSLPPage = false;
        }
    }

    setAttributeListingInfo(data) {
        this.attributeListingData = data[0]['data'];
        let attributeListing = this.attributeListingData['attributesListing'];
        this.titleHeading = attributeListing['title']
        this.titleDescription = attributeListing['titleDescription'];
        this.pageDescription = attributeListing['pageDescription'];
        this.metaTitle = attributeListing['metaTitle'];
        this.metaDescription = attributeListing['metaDescription'];
        this.excludeAttributes = (attributeListing['attributes'] as string[]).map((name=>name.toLowerCase()));
        this.bestSellerProducts = this.attributeListingData['bestSellersProducts'];
        this.bestSellerTitle = attributeListing['categoryName'];
        this.fetchCIMSRelatedData(data[1]);
    }

    fetchCIMSRelatedData(res) {
        this._commonService.showLoader = false;
        this.breadcrumbData = res[1];
        const ict = res[0]['categoryDetails']['active'];
        let productSearchResult = res[2]["productSearchResult"];
        this.groupByBrandName(productSearchResult['products']);

        if (!ict || res[2]['productSearchResult']['totalCount'] === 0) {
            if (this._commonService.isServer) {
                let httpStatus = 404;
                if (res[0]['httpStatus']) {
                    httpStatus = res[0]['httpStatus'];
                } else if (res[2]['httpStatus']) {
                    httpStatus = res[2]['httpStatus'];
                }
                this._response.status(httpStatus);
            }
            res[2] = { buckets: [], productSearchResult: { products: [], totalCount: 0 } };
        }
        if (this.isBrowser) {
            this.showLoader = false;
        }

        this.initiallizeRelatedCategories(res, true);

        if (this._commonService.isServer) {
            res[2]['buckets'] = this.filterBuckets(res[2]['buckets']);
        }

        this.initiallizeData(res[2], true);

        if (this.isBrowser) {
            this.setTrackingData(res);
        }

        if (this.isBrowser && (ict && res[2]['productSearchResult']['totalCount'] > 0)) {
            this.fireTags(res[2]);
        }
    }


    setTrackingData(res) {
        var taxonomy = res[0]["categoryDetails"]['taxonomy'];
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
            filter_added: !!window.location.hash.substr(1) ? 'true' : 'false',
            url_complete_load_time: null,
            page_type: "Category"
        }
        this.dataService.sendMessage(trackData);
    }
    outData(data) {
        if (Object.keys(data).indexOf('hide') !== -1) {
            this.openPopup = !data.hide;
        }
    }
    onFilterSelected(count) {
        setTimeout(() => {
            this.filterCounts = count;
        }, 0);
    }
    togglets() {
        this.toggletsWrap = !this.toggletsWrap;
    }
    parseData(data) {
        let relevantObj: any = {};
        data.forEach(obj => {
            relevantObj = obj;
        });

        if (relevantObj.block_data && relevantObj.block_data.product_data) {
            relevantObj.block_data.product_data.forEach(product => {
                if (product.discount_percentage && product.pricewithouttax && parseInt(product.discount_percentage) < 100) {
                    product.discount_percentage = parseInt(product.discount_percentage);
                    product.pricewithouttax = parseInt(product.pricewithouttax);
                }
                let desc = {
                    Brand: ""
                };
                if (product && product.short_description) {
                    let descArr = product.short_description.split("||");
                    descArr.forEach(element => {
                        let splitEl = element.split(":");
                        if (splitEl[0].toLowerCase() == "brand" || splitEl[0].toLowerCase() == "by") {
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

    
    /**
     *
     * @param response : returned data from category api or transfer state
     * @param flag : true, if TrasnferState exist.
     */
    private initiallizeData(response: any, flag: boolean) {
        this.showLoader = false;
        this.productListLength = response.productSearchResult['products'].length;
        this.productsUpdated.next(response.productSearchResult.products);
        this.filterData = this.filterBuckets(response.buckets);
        this.filterCounts = this._commonService.calculateFilterCount(response.buckets);
        

        this.buckets = this.filterBuckets(response.buckets);
        this.productSearchResult = response.productSearchResult;
        this.productSearchResultSEO = [];
        for (let p = 0; p < response.productSearchResult.products.length && p < 10; p++) {
            if (response.productSearchResult.products[p].salesPrice > 0 && response.productSearchResult.products[p].priceWithoutTax > 0) {
                this.productSearchResultSEO.push(response.productSearchResult.products[p]);
            }
        }
        this.setCanonicalUrls(response);
        const products = response.productSearchResult.products || [];
        if (products && products.length) {
            this.createProductsSchema(products);
        }
        //console.log("set cano func",response);
    }
    createProductsSchema(productArray) {
        if (this._commonService.isServer) {
            if (productArray.length > 0) {
                const productList = [];
                productArray.forEach((product, index) => {
                    productList.push({
                        "@type": "ListItem",
                        "position": index + 1,
                        "url": CONSTANTS.PROD + '/' + product.productUrl,
                        "name": product.productName,
                        "image": CONSTANTS.IMAGE_BASE_URL + product.mainImagePath
                    })
                });
                const schemaObj = {
                    "@context": "https://schema.org",
                    "@type": "ItemList",
                    "numberOfItems": productArray.length,
                    "url": CONSTANTS.PROD + this._router.url,
                    "name": this.getRelatedCatgory?.categoryDetails?.categoryName,
                    "itemListElement": productList
                }
                let s = this._renderer2.createElement('script');
                s.type = "application/ld+json";

                s.text = JSON.stringify(schemaObj);
                this._renderer2.appendChild(this._document.head, s);
            }
        }
    }

    private setCanonicalUrls(response) {

        const currentRoute = this._router.url.split('?')[0].split('#')[0];
        if (this._commonService.isServer) {

            const links = this._renderer2.createElement('link');
            //console.log("links ",links);
            links.rel = 'canonical';
            if (this.pageNo == undefined || this.pageNo == 1) {
                links.href = CONSTANTS.PROD + currentRoute.toLowerCase();
            }
            else {
                links.href = CONSTANTS.PROD + currentRoute.toLowerCase() + "?page=" + this.pageNo;
            }
            // links.href = CONSTANTS.PROD + currentRoute.toLowerCase()+ "?page="+this.pageNo;
            //console.log("links.href", links.href)
            this._renderer2.appendChild(this._document.head, links);

        }
        
        this.setAmpTag('alp');



        // console.log("amplink",ampLink);

        // if (this.pageNo == undefined || this.pageNo == 1) {

        //     let ampLink;
        //     ampLink = this._renderer2.createElement('link');
        //     ampLink.rel = 'amphtml';
        //     ampLink.href = CONSTANTS.PROD + '/ampc' + currentRoute.toLowerCase();

        //     /**
        //      * Below if condition is just a temporary solution.
        //      * Strictly remove if condtion, once amp of drill(114160000) page is completed.
        //      */
        //     // if(this._activatedRoute.snapshot.params.id != "114160000"){
        //     this._renderer2.appendChild(this._document.head, ampLink);
        //     // }
        //     //console.log("ampLink",ampLink);
        // }


        // console.log(" ampLink.href", ampLink.href);
        // this._renderer2.appendChild(this._document.head, ampLink);

        // Start Canonical URL
        const currentQueryParams = this._activatedRoute.snapshot.queryParams;
        // console.log("Current router:" + currentRoute);
        const pageCountQ = response.productSearchResult.totalCount / 10;
        const currentPageP = parseInt(currentQueryParams['page']);

        if (pageCountQ > 1 && (currentPageP === 1 || isNaN(currentPageP))) {
            // console.log("hello");
            //console.log("current page",currentPageP);
            let links = this._renderer2.createElement('link');
            links.rel = 'next';
            links.href = CONSTANTS.PROD + currentRoute + '?page=2';
            this._renderer2.appendChild(this._document.head, links);

        } else if (currentPageP > 1 && pageCountQ >= currentPageP) {
            let links = this._renderer2.createElement('link');
            links.rel = 'prev';
            if (currentPageP === 2) {
                links.href = CONSTANTS.PROD + currentRoute;
            } else {
                links.href = CONSTANTS.PROD + currentRoute + '?page=' + (currentPageP - 1);
            }

            this._renderer2.appendChild(this._document.head, links);

            links = this._renderer2.createElement('link');
            links.rel = 'next';
            links.href = CONSTANTS.PROD + currentRoute + '?page=' + (currentPageP + 1);
            this._renderer2.appendChild(this._document.head, links);
        } else if (currentPageP > 1 && pageCountQ + 1 >= currentPageP) {
            let links = this._renderer2.createElement('link');
            links.rel = 'prev';
            links.href = CONSTANTS.PROD + currentRoute + '?page=' + (currentPageP - 1);
            this._renderer2.appendChild(this._document.head, links);
        }
    }

    fireTags(response) {

        /**************************GTM START*****************************/
        let cr: any = this._router.url.replace(/\//, ' ').replace(/-/g, ' ');
        cr = cr.split('/');
        cr.splice(cr.length - 1, 1);

        cr = cr.join('/');
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
                variant: '',
                list: (gaGtmData && gaGtmData['list']) ? gaGtmData['list'] : '',
                position: p + 1
            };
            dlp.push(product);
            criteoItem.push(psrp[p].moglixPartNumber);
        }

        if (this.isBrowser) {
            let user;
            if (this.localStorageService.retrieve('user')) {
                user = this.localStorageService.retrieve('user');
            }
            this.analytics.sendGTMCall({
                'event': 'pr-impressions',
                'ecommerce': {
                    'currencyCode': 'INR',                       // Local currency is optional.
                    'impressions': dlp,
                },
            });

            const google_tag_params = {
                ecomm_prodid: '',
                ecomm_pagetype: 'category',
                ecomm_totalvalue: ''
            };

            this.analytics.sendGTMCall({
                'event': 'dyn_remk',
                'ecomm_prodid': google_tag_params.ecomm_prodid,
                'ecomm_pagetype': google_tag_params.ecomm_pagetype,
                'ecomm_totalvalue': google_tag_params.ecomm_totalvalue,
                'google_tag_params': google_tag_params
            });

            /*Start Criteo DataLayer Tags */

            this.analytics.sendGTMCall({
                'event': 'viewList',
                'email': (user && user.email) ? user.email : '',
                'ProductIDList': criteoItem,
                'CategoryId': this.getRelatedCatgory.categoryDetails.taxonomy,
                'CategoryName': this.getRelatedCatgory.categoryDetails.canonicalURL
            });

            /*End Criteo DataLayer Tags */

            /*Start Adobe Analytics Tags */
            if (this.getRelatedCatgory.categoryDetails.taxonomy) {
                this.taxo1 = this.getRelatedCatgory.categoryDetails.taxonomy.split("/")[0] || '';
                this.taxo2 = this.getRelatedCatgory.categoryDetails.taxonomy.split("/")[1] || '';
                this.taxo3 = this.getRelatedCatgory.categoryDetails.taxonomy.split("/")[2] || '';
            }
            let page = {
                'pageName': "moglix:" + this.taxo1 + ":" + this.taxo2 + ":" + this.taxo3 + ": listing",
                'channel': "listing",
                'subSection': "moglix:" + this.taxo1 + ":" + this.taxo2 + ":" + this.taxo3 + ": listing",
                'loginStatus': (user && user["authenticated"] == 'true') ? "registered user" : "guest"
            }
            let custData = {
                'customerID': (user && user["userId"]) ? btoa(user["userId"]) : '',
                'emailID': (user && user["email"]) ? btoa(user["email"]) : '',
                'mobile': (user && user["phone"]) ? btoa(user["phone"]) : '',
                'customerType': (user && user["userType"]) ? user["userType"] : '',
            }
            let order = {
                'productCategoryL1': this.taxo1,
                'productCategoryL2': this.taxo2,
                'productCategoryL3': this.taxo3
            }

            let digitalData = {};
            digitalData["page"] = page;
            digitalData["custData"] = custData;
            digitalData["order"] = order;

            if (this.trendingSearchData['tS'] && this.trendingSearchData['tS'] === 'no') {
                digitalData["page"]["trendingSearch"] = 'no';
                digitalData["page"]["suggestionClicked"] = 'no';
            }
            else if (this.trendingSearchData['tS'] && this.trendingSearchData['tS'] === 'yes') {
                digitalData["page"]["trendingSearch"] = 'yes';
                digitalData["page"]["suggestionClicked"] = 'yes';
            }

            if (this.trendingSearchData['sC'] && this.trendingSearchData['sC'] === 'no') {
                digitalData["page"]["trendingSearch"] = 'no';
                digitalData["page"]["suggestionClicked"] = 'no';
            }
            else if (this.trendingSearchData['sC'] && this.trendingSearchData['sC'] === 'yes') {
                digitalData["page"]["trendingSearch"] = 'no';
                digitalData["page"]["suggestionClicked"] = 'yes';
            }
            this.analytics.sendAdobeCall(digitalData);
            /*End Adobe Analytics Tags */
        }
    }

    async onVisiblePagination(event) {
        if (!this.paginationInstance) {
            const { PaginationComponent } = await import('@app/components/pagination/pagination.component');
            const factory = this.cfr.resolveComponentFactory(PaginationComponent);
            this.paginationInstance = this.paginationContainerRef.createComponent(factory, null, this.injector);
            this.paginationInstance.instance['paginationData'] = this.paginationData;
        }
    }

    async filterUp() {
        if (!this.filterInstance) {
            const { FilterComponent } = await import('@app/components/filter/filter.component').finally(() => {
                setTimeout(() => {
                    const mob_filter = document.querySelector('.mob_filter');
                    if (mob_filter) {
                        mob_filter.classList.add('upTrans');
                    }
                }, 0);
            });
            const factory = this.cfr.resolveComponentFactory(FilterComponent);
            this.filterInstance = this.filterContainerRef.createComponent(factory, null, this.injector);
            this.filterInstance.instance['filterData'] = this.filterData;
            (this.filterInstance.instance['toggleFilter'] as EventEmitter<any>).subscribe(data => {
                this.filterUp();
            });
        } else {
            const mob_filter = document.querySelector('.mob_filter');

            if (mob_filter) {
                mob_filter.classList.toggle('upTrans');
            }
        }
    }
    
    async toggleSortBy() {

        if (!this.sortByInstance) {
            const { SortByComponent } = await import('@app/components/sortBy/sortBy.component');
            const factory = this.cfr.resolveComponentFactory(SortByComponent);
            this.sortByInstance = this.sortByContainerRef.createComponent(factory, null, this.injector);

            (this.sortByInstance.instance['toggleFilter'] as EventEmitter<any>).subscribe(data => {
                this.toggleSortBy();
            });
        } else {
            const sortByFilter = document.querySelector('sort-by');

            if (sortByFilter) {
                sortByFilter.classList.toggle('open');
            }
        }
    }
    createDefaultParams(defaultApiParams) {

        let newParams = {
            category: defaultApiParams['category'], pageName: 'ATTRIBUTE', queryParams: {}, filter: {}
        }
        //api params/filters
        if (defaultApiParams['str']) {
            newParams.queryParams['str'] = defaultApiParams['str'];
        }
        if (defaultApiParams['filter']) {
            let filterTemp = JSON.parse(decodeURIComponent(defaultApiParams['filter']));
            filterTemp = JSON.stringify(filterTemp).replace(/[+]/g, ' ');
            newParams.filter = JSON.parse(filterTemp);
        }
        let defaultParams = this._commonService.getDefaultParams();
        if (defaultParams['queryParams']['orderBy'] != undefined) {
            newParams.queryParams['orderBy'] = defaultParams['queryParams']['orderBy'];
        }
        if (defaultParams['queryParams']['orderWay'] != undefined) {
            newParams.queryParams['orderWay'] = defaultParams['queryParams']['orderWay'];
        }
        let currentQueryParams = this._activatedRoute.snapshot.queryParams;
        for (let key in currentQueryParams) {
            newParams.queryParams[key] = currentQueryParams[key];
        }

        let fragment = this._activatedRoute.snapshot.fragment;
        if (fragment != undefined && fragment != null && fragment.length > 0) {
            let currentUrlFilterData: any = fragment.replace(/^\/|\/$/g, '');
            ////console.log(currentUrlFilterData);
            currentUrlFilterData = currentUrlFilterData.replace(/^\s+|\s+$/gm, '');
            /*Below newCurrentUrlFilterData and for loop is added for a special case, / is coming also in voltage filter part*/
            let newCurrentUrlFilterData = "";
            for (let i = 0; i < currentUrlFilterData.length; i++) {
                if (currentUrlFilterData[i] == "/" && /^\d+$/.test(currentUrlFilterData[i + 1])) {
                    //console.log(/^\d+$/.test(currentUrlFilterData[i+1]), newCurrentUrlFilterData);
                    newCurrentUrlFilterData = newCurrentUrlFilterData + "$";
                    //console.log(newCurrentUrlFilterData);
                } else {
                    newCurrentUrlFilterData = newCurrentUrlFilterData + currentUrlFilterData[i];
                }
            }
            currentUrlFilterData = newCurrentUrlFilterData.split("/");
            if (currentUrlFilterData.length > 0) {
                var filter = {};
                for (var i = 0; i < currentUrlFilterData.length; i++) {
                    var filterName = currentUrlFilterData[i].substr(0, currentUrlFilterData[i].indexOf('-')).toLowerCase(); // "price"
                    var filterData = currentUrlFilterData[i].replace("$", "/").substr(currentUrlFilterData[i].indexOf('-') + 1).split("||"); // ["101 - 500", "501 - 1000"]
                    filter[filterName] = filterData;
                }
                newParams["filter"] = Object.assign({}, newParams["filter"], filter);
            }
        }
        // console.log('New Params', JSON.stringify(newParams));
        return newParams;
    }

    getExtraCategoryData(data): Observable<{}> {
        if (this._tState.hasKey(EDK)) {
            return of(this._tState.get(EDK, {}));
        } else {
            return this._categoryService.getCategoryExtraData(slpPagesExtrasIdMap[data.id]);
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
        const categoryData = response[2];

        let qps = this._activatedRoute.snapshot.queryParams;

        if (this.getRelatedCatgory.categoryDetails.active) {
            this.meta.addTag({ 'name': 'description', 'content': this.metaDescription });
            this.meta.addTag({ 'name': 'og:title', 'content': this.metaTitle });
            this.meta.addTag({ 'name': 'og:description', 'content': this.metaDescription });
            this.meta.addTag({ 'name': 'og:url', 'content': 'https://www.moglix.com' + this._router.url });
            this.pageTitle.setTitle(this.metaTitle);

            if (categoryData['productSearchResult']['products'] && categoryData['productSearchResult']['products'].length > 0) {
                this.meta.addTag({ 'name': 'robots', 'content': (qps["page"] && parseInt(qps["page"]) > 1) ? CONSTANTS.META.ROBOT1 : CONSTANTS.META.ROBOT });
            } else {
                this.meta.addTag({ 'name': 'robots', 'content': CONSTANTS.META.ROBOT2 });
            }
            this.spl_subCategory_Dt = this.getRelatedCatgory.children;

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

        if (page !== '1') {
            newQueryParams['page'] = page;
        } else if (newQueryParams['page'] !== undefined) {
            delete newQueryParams['page'];
        }

        if (Object.keys(newQueryParams).length > 0) {
            extras.queryParams = newQueryParams;
        } else {
            extras.queryParams = {};
        }

        this._router.navigate([currentRoute], extras);
    }

    updateSubCategoryCount(count) {
        this.subCategoryCount = count;
    }

    getTopTenBrandName(buckets: Array<{}>) {
        let bNames = null;

        if (buckets === undefined || buckets === null || (buckets && buckets.length === 0)) {
            return '';
        }

        for (let i = 0; i < buckets.length; i++) {
            if (buckets[i]['name'] === 'brand') {
                for (let j = 0; j < buckets[i]['terms'].length; j++) {
                    if (bNames === null) {
                        bNames = buckets[i]['terms'][j]['term'];
                    } else {
                        bNames = bNames + ', ' + buckets[i]['terms'][j]['term'];
                    }
                    if (j === 9) {
                        break;
                    }
                }
                break;
            }
        }
        return bNames;
        // console.log(buckets, "bucketsbucketsbuckets");
    }

    getFeaturedProducts(products: Array<{}>) {
        let fProducts = null;
        if (products == undefined || products == null || (products && products.length == 0))
            return "";

        for (let i = 0; i < products.length; i++) {
            if (fProducts == null)
                fProducts = products[i]['productName'];
            else
                fProducts = fProducts + ", " + products[i]['productName'];
            if (i == 5)
                break;
        }
        return fProducts;
    }
    scrollTop(eve) {
        if (this.isBrowser) {
            ClientUtility.scrollToTop(500, eve.target.offsetTop - 50);
        }
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
            this.combineLatestUnsub.unsubscribe()
        }
        if (this.forkJoinUnsub) {
            this.forkJoinUnsub.unsubscribe();
        }
        this.resetLazyComponents();
    }
    getAltName(brandName) {
        if (brandName == null || brandName == undefined) {
            return 'safety shoes';
        }
        else {
            return brandName + " safety shoes";
        }
    }

    filterBuckets(buckets: any[]) {
        if (this.excludeAttributes.length > 0) {
            return buckets.filter((bucket) => this.excludeAttributes.indexOf((bucket.name as string).toLowerCase()) == -1);
        }
        return buckets;
    }

    /** 
    * @description:to group products depending on brandname && total count >2.
    * @description::if products length > 2 then only apply group by otherwise not required
    * @param=>products:products array
   */
    groupByBrandName(products: any[]) {
        this.groupedProducts = this._categoryService.getGroupedProducts(products, 'brandName', 2);
        this.groupedProductNames = Object.keys(this.groupedProducts);
        this.displayGroupBy = this.groupedProductNames.length > 1 && (this.pageNo == 1 || this.pageNo == undefined);
    }

    changeBanner(direction) {
        this.ngxSiemaService[direction](1, this.groupedBrandSiema.selector);
    }

    setAmpTag(page) {
        let currentRoute = this._router.url.split("?")[0].split("#")[0];
        let ampLink;
        ampLink = this._renderer2.createElement('link');
        ampLink.rel = 'amphtml';
        if (page == "alp") {
            ampLink.href = CONSTANTS.PROD + '/ampl' + currentRoute.toLowerCase();
            this._renderer2.appendChild(this._document.head, ampLink);
        }
    }

    resetLazyComponents() {
        if (this.filterInstance) {
            this.filterInstance = null;
            this.filterContainerRef.remove();
        }
        if (this.sortByInstance) {
            this.sortByInstance = null;
            this.sortByContainerRef.remove();
        }
        if (this.paginationInstance) {
            this.paginationInstance = null;
            this.paginationContainerRef.remove();
        }
        if (this.subCategoryInstance) {
            this.subCategoryInstance = null;
            this.subCategoryContainerRef.remove();
        }
        if (this.catBestSellerInstance) {
            this.catBestSellerInstance = null;
            this.catBestSellerContainerRef.remove();
        }
        if (this.shopByBrandInstance) {
            this.shopByBrandInstance = null;
            this.shopByBrandContainerRef.remove();
        }
        if (this.catStaticInstance) {
            this.catStaticInstance = null;
            this.catStaticContainerRef.remove();
        }
        if (this.shopbyFeatrInstance) {
            this.shopbyFeatrInstance = null;
            this.shopbyFeatrContainerRef.remove();
        }
        if (this.shopbyFeatrInstance) {
            this.shopbyFeatrInstance = null;
            this.shopbyFeatrContainerRef.remove();
        }
        if (this.slpSubCategoryInstance) {
            this.slpSubCategoryInstance = null;
            this.slpSubCategoryContainerRef.remove();
        }
        if (this.cmsInstance) {
            this.cmsInstance = null;
            this.cmsContainerRef.remove();
        }
        if (this.cateoryFooterInstance) {
            this.cateoryFooterInstance = null;
            this.cateoryFooterContainerRef.remove();
        }
    }
}
