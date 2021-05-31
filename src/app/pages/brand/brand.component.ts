import { Title, Meta, makeStateKey, TransferState } from '@angular/platform-browser';
import { Location, isPlatformServer, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { EventEmitter, Component, ViewChild, PLATFORM_ID, Inject, Renderer2, Optional, ViewContainerRef, ComponentFactoryResolver, Injector } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';
import { LocalStorageService } from 'ngx-webstorage';
import { ActivatedRoute, Router, NavigationExtras, Params } from '@angular/router';
import { FooterService } from '@app/utils/services/footer.service';
import { combineLatest, Subject } from 'rxjs';
import { SortByComponent } from '@app/components/sortBy/sortBy.component';
import { CONSTANTS } from '@app/config/constants';
import { ClientUtility } from '@app/utils/client.utility';
import { BehaviorSubject } from 'rxjs';
import { RESPONSE } from '@nguniversal/express-engine/tokens';
import { DataService } from '@app/utils/services/data.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';

@Component({
    selector: 'brand',
    templateUrl: './brand.html',
    styleUrls: ['./brand.scss'],
})

export class BrandComponent {
    filterInstance = null;
    @ViewChild('filter', { read: ViewContainerRef }) filterContainerRef: ViewContainerRef;
    sortByInstance = null;
    @ViewChild('sortBy', { read: ViewContainerRef }) sortByContainerRef: ViewContainerRef;
    paginationInstance = null;
    @ViewChild('pagination', { read: ViewContainerRef }) paginationContainerRef: ViewContainerRef;
    brandDetailsFooterInstance = null;
    @ViewChild('brandDetailsFooter', { read: ViewContainerRef }) brandDetailsFooterContainerRef: ViewContainerRef;

    @ViewChild(SortByComponent) sortByComponent: SortByComponent;

    sortByComponentUpdated: BehaviorSubject<SortByComponent>;

    productsUpdated: BehaviorSubject<any> = new BehaviorSubject<any>({});

    paginationUpdated: Subject<any> = new Subject<any>();

    pageSizeUpdated: BehaviorSubject<any> = new BehaviorSubject<any>({});

    sortByUpdated: Subject<any> = new Subject<any>();

    filterData: Array<any> = [];
    sortByData: Array<any> = [];
    paginationData: any = {};
    filterCounts: number;

    pageName: string;
    buckets = [];
    brand: string;
    brandShortDesc: any;
    brandCatDesc: any;
    heading: any;
    shortDesciption: any;
    brandcatFlag: boolean = false;
    brandContent: boolean = true;
    ProductList: Subject<any> = new Subject<any>();
    productCount;
    categoryLinkLists;
    categoryNames;
    session: {};
    isServer: boolean;
    isBrowser: boolean;
    sortByOpt: boolean;
    iba: boolean; //isBrandActive
    productSearchResult: {};
    productSearchResultSEO: Array<any> = [];
    todayDate: number;
    toggletsWrap: boolean;
    pageNo;
    itemsList;
    friendlyUrl;
    brandCategoryName;
    catUrlName;
    firstPageContent;
    brandCatName;
    showDesc: boolean = false;
    trendingSearchData;
    productCategoryNames = [];
    categoryNameinAPI;

    constructor(public dataService: DataService,
        private cfr: ComponentFactoryResolver,
        private analytics: GlobalAnalyticsService,
        private injector: Injector,
        private router: Router, @Optional() @Inject(RESPONSE) private _response, private _tState: TransferState, private _renderer2: Renderer2, @Inject(DOCUMENT) private _document, private title: Title, private meta: Meta, @Inject(PLATFORM_ID) platformId, public footerService: FooterService, public location: Location, public _router: Router, public _activatedRoute: ActivatedRoute, public _commonService: CommonService, private localStorageService: LocalStorageService) {
        // detect if its a browser or desktop
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);

        // set page name
        this.pageName = "BRAND";

        // Set today's date
        this.todayDate = Date.now();
    }

    ngOnInit() {
        if (this._commonService.isBrowser) {
            
            // set some extra meta tags if brand is a category page
            if (this._activatedRoute.snapshot.queryParams['category']) {
                this.meta.addTag({ "name": "robots", "content": "noindex, nofollow" });
            }

            this.setCategoryDataFromResolver();
    
            // Set brand of the page
            this.brand = decodeURI(this._activatedRoute.snapshot.params['brand']);    

            // Set footers
            this.footerService.setMobileFoooters();
        }
    }

    setCategoryDataFromResolver() {
        // Get data from resolver and render the view
        this._activatedRoute.queryParams.subscribe(data => {
            if (data['page'] == undefined || data['page'] == 1) {
                this.firstPageContent = true;
            } else {
                this.firstPageContent = false;
            }
        });

        this._activatedRoute.data.subscribe(resolverData => {
            ClientUtility.scrollToTop(2000);
            this.initiallizeData(resolverData['brand'][0], resolverData['brand'][0]['flag']);
        });
    }

    setLinks(response) {
        let qp = this._activatedRoute.snapshot.queryParams;
        //console.log("paramssss",qp);
        //console.log("qp",qp['page']);
        this.pageNo = qp['page'];
        if (response["title"]) {
            this.brandCatName = this.heading.replace(/(<([^>]+)>)/ig, '');
            // let title = "Buy " + this.capitalizeFirstLetter(this.brandCatName) + "Online at Best Price - Moglix.com";
            this.title.setTitle(response["title"]);
            this.meta.addTag({ "name": "og:title", "content": response["title"] });
        } else {
            let title = "Buy " + this.capitalizeFirstLetter(this.brand) + " Products Online at Best Price - Moglix.com";
            this.title.setTitle(title);
            this.meta.addTag({ "name": "og:title", "content": title });
        }

        if (response["metaDesciption"]) {
            this.brandCatName = this.heading.replace(/(<([^>]+)>)/ig, '');
            // let metaDesc = "Shop online for" + this.brandCatName + "at best prices now! Moglix is a one-stop shop for buying genuine" + this.brandCatName + ". Free Shipping & COD available.";
            this.meta.addTag({ "name": "description", "content": response["metaDesciption"] });
            this.meta.addTag({ "name": "og:description", "content": response["metaDesciption"] });
        } else {
            let metaDescription = "Buy " + this.brand + " products at best prices in India. Shop online for " + this.brand + " products at Moglix. Free Delivery & COD options across India.";
            this.meta.addTag({ "name": "description", "content": metaDescription });
            this.meta.addTag({ "name": "og:description", "content": metaDescription });
        }

        //this.meta.addTag({ "name": "og:title", "content": title });
        this.meta.addTag({ "name": "og:url", "content": CONSTANTS.PROD + this._router.url });
        this.meta.addTag({ "name": "robots", "content": (qp["page"] && parseInt(qp["page"]) > 1) ? CONSTANTS.META.ROBOT1 : CONSTANTS.META.ROBOT });
        if (this.isServer) {
            let links = this._renderer2.createElement('link');
            links.rel = "canonical";
            let href = CONSTANTS.PROD + this._router.url.split("?")[0].split("#")[0].toLowerCase();
            //console.log("href",href);

            if (qp['page'] == 1 || qp['page'] == undefined) {
                links.href = href;
            }
            else {
                links.href = href + "?page=" + qp['page'];

            }


            this._renderer2.appendChild(this._document.head, links);
        }
        if (this.brandCategoryName) {

            this.itemsList = [{
                "@type": "ListItem",
                "position": 0,
                "item":
                {
                    "@id": CONSTANTS.PROD,
                    "name": "Home"
                }
            },
            {
                "@type": "ListItem",
                "position": 1,
                "item":
                {
                    "@id": CONSTANTS.PROD + "/brand-store",
                    "name": "Brand"
                }
            },
            {
                "@type": "ListItem",
                "position": 2,
                "item":
                {
                    "@id": CONSTANTS.PROD + this.friendlyUrl,
                    "name": this.brand
                }
            },
            {
                "@type": "ListItem",
                "position": 3,
                "item":
                {
                    "@id": CONSTANTS.PROD + this._router.url,
                    "name": this.brandCategoryName
                }
            }
            ];
        }
        else {
            this.itemsList = [{
                "@type": "ListItem",
                "position": 0,
                "item":
                {
                    "@id": CONSTANTS.PROD,
                    "name": "Home"
                }
            },
            {
                "@type": "ListItem",
                "position": 1,
                "item":
                {
                    "@id": CONSTANTS.PROD + "/brand-store",
                    "name": "Brand"
                }
            },
            {
                "@type": "ListItem",
                "position": 2,
                "item":
                {
                    "@id": CONSTANTS.PROD + this._router.url,
                    "name": this.brand
                }
            },


            ];

        }

        if (this.isServer) {
            let s = this._renderer2.createElement('script');
            s.type = "application/ld+json";

            s.text = JSON.stringify({ "@context": CONSTANTS.SCHEMA, "@type": "BreadcrumbList", "itemListElement": this.itemsList });
            this._renderer2.appendChild(this._document.head, s);
        }

        let currentQueryParams = this._activatedRoute.snapshot.queryParams;
        let currentRoute = this._commonService.getCurrentRoute(this._router.url);

        let pageCountQ = response.productSearchResult.totalCount / 10;
        this.productCount = response.productSearchResult.totalCount;
        this.categoryLinkLists = response.categoryLinkList;


        this.productCategoryNames = [];
        for (var key in this.categoryLinkLists) {
            if (this.categoryLinkLists.hasOwnProperty(key)) {
                this.productCategoryNames.push(key);
            }

        }
        this.categoryNames = this.productCategoryNames.toString();
        //console.log("pageCountQ",pageCountQ);
        let currentPageP = parseInt(currentQueryParams["page"]);
        //console.log("currentPageP",currentPageP) ;

        if (pageCountQ > 1 && (currentPageP == 1 || isNaN(currentPageP))) {
            let links = this._renderer2.createElement('link');
            links.rel = "next";
            let href = CONSTANTS.PROD + currentRoute + '?page=2';
            if (qp && qp['category']) {
                href = href + "&category=" + encodeURIComponent((qp['category'].toLowerCase()));
            }
            links.href = href;
            //console.log("page2",links.href);
            this._renderer2.appendChild(this._document.head, links);

        } else if (currentPageP > 1 && pageCountQ >= currentPageP) {
            let links = this._renderer2.createElement('link');
            links.rel = "prev";
            let href = CONSTANTS.PROD + currentRoute + '?page=' + (currentPageP - 1);

            if (currentPageP == 2)
                href = CONSTANTS.PROD + currentRoute;

            if (qp && qp['category']) {
                if (currentPageP == 2)
                    href = href + "?category=" + encodeURIComponent((qp['category'].toLowerCase()));
                else
                    href = href + "&category=" + encodeURIComponent((qp['category'].toLowerCase()));
            }
            links.href = href;
            //console.log("link href",links.href);
            this._renderer2.appendChild(this._document.head, links);

            links = this._renderer2.createElement('link');
            links.rel = "next";
            href = CONSTANTS.PROD + currentRoute + '?page=' + (currentPageP + 1);
            if (qp && qp['category']) {
                href = href + "&category=" + encodeURIComponent((qp['category'].toLowerCase()));
            }
            links.href = href;
            this._renderer2.appendChild(this._document.head, links);
        } else if (currentPageP > 1 && pageCountQ + 1 >= currentPageP) {
            let links = this._renderer2.createElement('link');
            links.rel = "prev";
            let href = CONSTANTS.PROD + currentRoute + '?page=' + (currentPageP - 1);
            if (qp && qp['category']) {
                href = href + "&category=" + encodeURIComponent((qp['category'].toLowerCase()));
            }
            links.href = href;
            this._renderer2.appendChild(this._document.head, links);
        }
        /*Start Adobe Analytics Tags */
        if (this.localStorageService.retrieve('user')) {
            var user = this.localStorageService.retrieve('user');
        }
        let page = {}, custData = {}, order = {};
        let sParams = this._activatedRoute.snapshot.params;
        this._activatedRoute.queryParams.subscribe(queryParams => {
            this.trendingSearchData = queryParams;
        });
        if (this.isBrowser) {
            if (this.brandCategoryName) {
                page = {
                    'pageName': "moglix:" + this.brand + ":" + sParams['category'] + ": listing",
                    'channel': "brand:category",
                    'subSection': "moglix:" + this.brand + ":" + sParams['category'] + ": listing " + this._commonService.getSectionClick().toLowerCase(),
                    'loginStatus': (user && user["authenticated"] == 'true') ? "registered user" : "guest"
                }
                custData = {
                    'customerID': (user && user["userId"]) ? btoa(user["userId"]) : '',
                    'emailID': (user && user["email"]) ? btoa(user["email"]) : '',
                    'mobile': (user && user["phone"]) ? btoa(user["phone"]) : '',
                    'customerType': (user && user["userType"]) ? user["userType"] : '',
                }
                order = {
                    'brand': this.brand,
                    'productCategory': sParams['category']
                }
            } else {
                page = {
                    'pageName': "moglix:" + this.brand + ": listing",
                    'channel': "brand",
                    'subSection': "moglix:" + this.brand + ": listing " + this._commonService.getSectionClick().toLowerCase(),
                    'loginStatus': (user && user["authenticated"] == 'true') ? "registered user" : "guest"
                }
                custData = {
                    'customerID': (user && user["userId"]) ? btoa(user["userId"]) : '',
                    'emailID': (user && user["email"]) ? btoa(user["email"]) : '',
                    'mobile': (user && user["phone"]) ? btoa(user["phone"]) : '',
                    'customerType': (user && user["userType"]) ? user["userType"] : '',
                }
                order = {
                    'brand': this.brand
                }
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
        /* Setting of product schema for products */
        if (this.isServer) {
            const products = response.productSearchResult.products || [];
            if (products && products.length) {
                const categoryName = qp && qp['categoryName'];
                this.createProductsSchema(products, categoryName);
            }
        }
    }

    async onVisiblebrandDetailsFooter(event) {
        if (!this.brandDetailsFooterInstance) {
            const { BrandDetailsFooterComponent } = await import('@app/pages/brand/brand-details-footer/brand-details-footer.component');
            const factory = this.cfr.resolveComponentFactory(BrandDetailsFooterComponent);
            this.brandDetailsFooterInstance = this.brandDetailsFooterContainerRef.createComponent(factory, null, this.injector);
            this.brandDetailsFooterInstance.instance['brandDetailsFooterData'] = {
                brandCatDesc: this.brandCatDesc,
                brandShortDesc: this.brandShortDesc,
                brandContent: this.brandContent,
                iba: this.iba,
                firstPageContent: this.firstPageContent,
                productSearchResult: this.productSearchResult,
                productSearchResultSEO: this.productSearchResultSEO,
                heading: this.heading,
                productCount: this.productCount,
                brand: this.brand,
                productCategoryNames: this.productCategoryNames,
                categoryLinkLists: this.categoryLinkLists,
                categoryNames: this.categoryNames,
                todayDate: this.todayDate
            };
        }
    }

    async onVisiblePagination(event) {
        if (!this.paginationInstance) {
            const { PaginationComponent } = await import('@app/components/pagination/pagination.component');
            const factory = this.cfr.resolveComponentFactory(PaginationComponent);
            this.paginationInstance = this.paginationContainerRef.createComponent(factory, null, this.injector);
            this.paginationInstance.instance['paginationUpdated'] = new BehaviorSubject({});
            this.paginationInstance.instance['paginationUpdated'].next(this.paginationData);
            this.paginationUpdated.next(this.paginationData);
            this.paginationInstance.instance['position'] = 'BOTTOM';
            this.paginationInstance.instance['sortByComponentUpdated'] = new BehaviorSubject<SortByComponent>(this.sortByComponent);
            this.paginationInstance.instance['sortByComponent'] = this.sortByComponent;

            if (this.paginationInstance) {
                (this.paginationInstance.instance['onPageChange'] as EventEmitter<any>).subscribe(data => {
                    this.pageChanged(data);
                });
            }

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
            this.filterInstance.instance['pageName'] = this.pageName;
            this.filterInstance.instance['bucketsUpdated'] = new BehaviorSubject<any>(this.filterData);
            this.filterInstance.instance['sortByComponentUpdated'] = new BehaviorSubject<SortByComponent>(this.sortByComponent);
            (this.filterInstance.instance['filterSelected'] as EventEmitter<any>).subscribe(data => {
                this.onFilterSelected(data);
            });
        } else {
            const mob_filter = document.querySelector('.mob_filter');

            if (mob_filter) {
                mob_filter.classList.toggle('upTrans');
            }
        }


    }

    async toggleSortBy(data) {
        if (this.isBrowser) {
            this.sortByOpt = data.sortByOpt;
            if (!this.sortByInstance) {
                const { SortByComponent } = await import('@app/components/sortBy/sortBy.component');
                const factory = this.cfr.resolveComponentFactory(SortByComponent);
                this.sortByInstance = this.sortByContainerRef.createComponent(factory, null, this.injector);
                this.sortByInstance.instance['sortByUpdated'] = new BehaviorSubject<any>(null);

                (this.sortByInstance.instance['outData$'] as EventEmitter<any>).subscribe(data => {
                    this.toggleSortBy(data);
                });

            }

            const sortByFilter = document.querySelector('sort-by');

            if (sortByFilter) {
                sortByFilter.classList.toggle('open');
            }
        }
    }

    createProductsSchema(productArray, categoryName) {
        if (this.isServer) {
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
                    "@context": CONSTANTS.SCHEMA,
                    "@type": "ItemList",
                    "numberOfItems": productArray.length,
                    "url": CONSTANTS.PROD + this._router.url,
                    "name": categoryName,
                    "itemListElement": productList
                }
                let s = this._renderer2.createElement('script');
                s.type = "application/ld+json";

                s.text = JSON.stringify(schemaObj);
                this._renderer2.appendChild(this._document.head, s);
            }
        }
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    private initiallizeData(response: any, flag: boolean) {
        this._commonService.showLoader = false;
        this.iba = response['brandDetails']['active'];
        if (!this.iba || response['productSearchResult']['totalCount'] === 0) {
            if (this.isServer) {
                let httpStatus = 404;
                if (response['httpStatus']) {
                    httpStatus = response['httpStatus'];
                }
                this._response.status(httpStatus);
            }
            // response = {brandDetails: response['brandDetails'], buckets: [], productSearchResult: {products: [], totalCount: 0}};
        }
        this.paginationData = { itemCount: response.productSearchResult.totalCount };
        this.paginationUpdated.next(this.paginationData);
        this.sortByUpdated.next();
        this.pageSizeUpdated.next({ productSearchResult: response.productSearchResult });
        this.filterData = response.buckets;
        this.productsUpdated.next(response.productSearchResult.products);
    
        if (this.filterInstance) {
            this.filterInstance.instance['bucketsUpdated'].next(response.buckets);
        } else {
            this.filterCounts = this._commonService.calculateFilterCount(response.buckets);
        }
        if (this.paginationInstance) {
            this.paginationInstance.instance['paginationUpdated'].next(this.paginationData);
        }
        this.paginationUpdated.next(this.paginationData);
        this.productSearchResult = response.productSearchResult;
        this.productSearchResultSEO = [];
        for (let p = 0; p < response.productSearchResult.products.length && p < 10; p++) {
            if (response.productSearchResult.products[p].salesPrice > 0 && response.productSearchResult.products[p].priceWithoutTax > 0) {
                this.productSearchResultSEO.push(response.productSearchResult.products[p]);

            }
        }
        if (response['category'] !== "undefined") {
            this.brandcatFlag = true;
            this.brandCatDesc = response.desciption;
            this.categoryNameinAPI = response.categoryName
            this.heading = response.heading;
            this.shortDesciption = response.shortDesciption;
            if (response.categoryName) {
                this.brandCategoryName = response.categoryName
            }
            this.friendlyUrl = response.brandDetails.friendlyUrl;
            //console.log(" this.heading",this.heading );


            // if (this.isBrowser) {

            //     setTimeout(() => {
            //         if (document.querySelector('h3 .inv_span')) {
            //             document.querySelector('h3 .inv_span').addEventListener('click', function () {
            //                 if (parseInt((<HTMLElement>document.querySelector('.show-mobile')).style.opacity) > 0) {
            //                     ClientUtility.fadeOut(document.querySelector('.show-mobile'));
            //                 } else {
            //                     ClientUtility.fadeIn(document.querySelector('.show-mobile'));
            //                 }
            //                 document.querySelector('.showplus').classList.toggle('showminus');
            //             }, { passive: true });
            //         }
            //     }, 3000);
            // }

        } else {
            this.heading = 'shop ' + this.brand + ' products online.';
        }
        this.brand = response.brandDetails.brandName;
        if (this.isBrowser) {
            var trackingData = {
                event_type: "page_load",
                label: "view",
                channel: "Listing",
                page_type: "brand_page",
                brand: this.brand,
                filter_added: !!window.location.hash.substr(1) ? 'true' : 'false',
                product_count: response.productSearchResult.totalCount

            }
            this.dataService.sendMessage(trackingData);
        }
        // this.brandShortDesc = response.brandDetails.brandDesc;
        if (response.brandDetails.brandDesc !== null && response.brandDetails.brandDesc !== '') {
            this.brandShortDesc = response.brandDetails.brandDesc;
            this.showDesc = true;
        }
        /* Only set links if brand is active */
        if (this.iba) {
            this.setLinks(response);
        }

        // Set amp tag only for brand-category page.
        if (this.isServer) {
            const params = this._activatedRoute.snapshot.params;
            if (params['category']) {
                this.catUrlName = this._router.url.split("/brands/" + this._activatedRoute.snapshot.params["brand"])[1];
                this.setAmpTag('brand-category');
            } else {
                this.setAmpTag('brand');
            }
        }
    }

    setAmpTag(page) {
        // console.log("page33",page);
        let currentRoute = this._router.url.split("?")[0].split("#")[0];
        let ampLink;
        ampLink = this._renderer2.createElement('link');
        ampLink.rel = 'amphtml';
        if (page == "brand-category") {
            if (this.pageNo == 1 || this.pageNo == undefined) {
                ampLink.href = CONSTANTS.PROD + '/ampcb' + currentRoute.toLowerCase();
                //console.log("ampLink.href in brand category", ampLink.href);
                //console.log("pageNo in brand category",this.pageNo);
                this._renderer2.appendChild(this._document.head, ampLink);
            }
        }
        if (page == "brand") {
            if (this.pageNo == 1 || this.pageNo == undefined) {
                ampLink.href = CONSTANTS.PROD + '/ampb' + currentRoute.toLowerCase();
                //console.log("ampLink.href in brand", ampLink.href);
                //console.log("pageNo in brand",this.pageNo);
                this._renderer2.appendChild(this._document.head, ampLink);

            }

        }

    }

    onFilterSelected(count) {
        setTimeout(() => {
            this.filterCounts = count;
        }, 0);
    }

    pageChanged(page) {

        //this._commonService.updateDefaultParamsNew({ pageIndex: page });

        let extras: NavigationExtras = {};
        let currentRoute = this._commonService.getCurrentRoute(this._router.url);
        //let fragmentString = this._commonService.generateFragmentString();
        let fragmentString = this._activatedRoute.snapshot.fragment;
        if (fragmentString != null) {
            extras.fragment = fragmentString;
            //console.log(extras);
        }


        let currentQueryParams = this._activatedRoute.snapshot.queryParams;
        let newQueryParams: {} = {};
        if (Object.keys(currentQueryParams).length) {
            for (let key in currentQueryParams) {
                //console.log(key);
                newQueryParams[key] = currentQueryParams[key];
            }
        }

        if (page != "1") {
            newQueryParams["page"] = page;
        } else if (newQueryParams["page"] != undefined) {
            delete newQueryParams["page"];
        }

        //console.log("New Query Params pagination", newQueryParams);
        //newQueryParams["page"] = page;

        if (Object.keys(newQueryParams).length > 0)
            extras.queryParams = newQueryParams;
        else
            extras.queryParams = {};

        this._router.navigate([currentRoute], extras);
    }

    onUpdaet(data) {
        this.sortByOpt = data.sortByOpt;
    }

    scrollTop(eve) {
        if (this.isBrowser) {
            ClientUtility.scrollToTop(500, eve.target.offsetTop - 50);
        }
    }
    togglets() {
        this.toggletsWrap = !this.toggletsWrap;
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
        if (this.brandDetailsFooterInstance) {
            this.brandDetailsFooterInstance = null;
            this.brandDetailsFooterContainerRef.remove();
        }
    }

    ngOnDestroy() {
        this._commonService.updateSortBy.next('popularity');
        this.resetLazyComponents();
    }

}
