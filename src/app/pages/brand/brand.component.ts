import { FooterService } from '@app/utils/services/footer.service';
import { Component, ViewChild, PLATFORM_ID, Inject, Renderer2, Optional, ViewContainerRef, ComponentFactoryResolver, Injector, EventEmitter } from '@angular/core';
import { Location, isPlatformServer, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { CommonService } from "@app/utils/services/common.service";
import { Subject } from "rxjs/Subject";
import { SortByComponent } from "@app/components/sortBy/sortBy.component";
import { Title, Meta, TransferState, makeStateKey } from '@angular/platform-browser';
import { CONSTANTS } from "@app/config/constants";
import { RESPONSE } from '@nguniversal/express-engine/tokens';
import { LocalStorageService } from 'ngx-webstorage';
import { DataService } from '@app/utils/services/data.service';
import { BehaviorSubject } from 'rxjs';

const RPRK: any = makeStateKey<{}>("RPRK");
declare var digitalData: {};
declare let _satellite;

@Component({
    selector: 'brand',
    templateUrl: './brand.html',
    styleUrls: ['./../category/category.scss'],
})

export class BrandComponent {
    filterInstance = null;
    @ViewChild('filter', { read: ViewContainerRef }) filterContainerRef: ViewContainerRef;
    sortByInstance = null;
    @ViewChild('sortBy', { read: ViewContainerRef }) sortByContainerRef: ViewContainerRef;
    paginationInstance = null;
    @ViewChild('pagination', { read: ViewContainerRef }) paginationContainerRef: ViewContainerRef;
    
    @ViewChild(SortByComponent) sortByComponent: SortByComponent;
    productsUpdated: BehaviorSubject<any> = new BehaviorSubject<any>({});
    
    paginationUpdated: BehaviorSubject<any> = new BehaviorSubject<any>({});

    pageSizeUpdated: BehaviorSubject<any> = new BehaviorSubject<any>({});
    
    sortByUpdated: Subject<any> = new Subject<any>();

    sortByComponentUpdated: Subject<SortByComponent> = new Subject<SortByComponent>();
    
    filterData: Array<any> = [];
    sortByData: Array<any> = [];
    paginationData: any= {};
    
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
    refreshProductsUnsub: any;
    productSearchResult: {};
    productSearchResultSEO: Array<any> = [];
    todayDate: number;
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
    refreshProductsUnsub$: any;

    constructor(
        public dataService: DataService, 
        @Optional() @Inject(RESPONSE)  private _response,
        private _tState: TransferState, 
        private _renderer2: Renderer2, @Inject(DOCUMENT) 
        private _document, private title: Title, 
        private meta: Meta, @Inject(PLATFORM_ID) platformId, 
        public footerService: FooterService, 
        public location: Location, 
        public _router: Router, 
        public _activatedRoute: ActivatedRoute, 
        private cfr: ComponentFactoryResolver,
        private injector: Injector,
        public _commonService: CommonService, 
        private localStorageService: LocalStorageService
    ) {
        // detect if its a browser or desktop
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
        
        // set page name
        this.pageName = "BRAND";

        // Set today's date
        this.todayDate = Date.now();
    }
    

    ngOnInit() {
        // set some extra meta tags if brand is a category page
        if (this._activatedRoute.snapshot.queryParams['category']) {
            this.meta.addTag({ "name": "robots", "content": "noindex, nofollow" });
        }
        
        // Set brand of the page
        this.brand = decodeURI(this._activatedRoute.snapshot.params['brand']);

        // Get data from resolver and render the view
        const resolverData = this._activatedRoute.snapshot.data;
        this.initiallizeData(resolverData['brand'][0], resolverData['brand'][0]['flag']);

        // surbscribe to route change and based on that refresh products
        this.refreshProductsBasedOnRouteChange();

        // Set footers
        this.footerService.setMobileFoooters();

        this._activatedRoute.queryParams.subscribe(data => {
            if (data['page'] == undefined || data['page'] == 1) {
                this.firstPageContent = true;
            } else {
                this.firstPageContent = false;
            }
        });
    }

    ngAfterViewInit() {
        this.sortByComponentUpdated.next(this.sortByComponent);
        /* Remove key set on server side to avoid api on dom load of frontend side */
        if (this.isBrowser) {
            this._tState.remove(RPRK);
        }
    }

    private refreshProductsBasedOnRouteChange(){
        this.refreshProductsUnsub$ = this._commonService.refreshProducts$.subscribe(
            () => {
                this._commonService.showLoader = true;
                this.refreshProductsUnsub = this._commonService.refreshProducts().subscribe((response) => {
                    this._commonService.showLoader = false;
                    this.paginationData = { itemCount: response.productSearchResult.totalCount };
                    this.paginationUpdated.next(this.paginationData);
                    // this.sortByUpdated.next();
                    this.pageSizeUpdated.next({ productSearchResult: response.productSearchResult });
                    this.filterData = response.buckets;
                    this.productsUpdated.next(response.productSearchResult.products);
                });
            }
        );
    }

    private initiallizeData(response: any, flag: boolean) {
        this._commonService.showLoader = false;

        // Check if brand is Active 
        this.iba = response['brandDetails']['active'];

        // If brand is inactive or num of products = 0 redirect to page not found
        if (!this.iba || response['productSearchResult']['totalCount'] === 0) {
            if (this.isServer) {
                let httpStatus = 404;
                if (response['httpStatus']) {
                    httpStatus = response['httpStatus'];
                }
                this._response.status(httpStatus);
            }
        }

        /* Only set links if brand is active */
        if (this.iba) {
            this.setLinks(response);
        }

        // Set sort by, filters and listing products 
        if (flag) {
            this.paginationData = { itemCount: response.productSearchResult.totalCount };
            this.paginationUpdated.next(this.paginationData);
            // this.sortByUpdated.next();
            this.pageSizeUpdated.next({ productSearchResult: response.productSearchResult });
            this.filterData = response.buckets;
            this.productsUpdated.next(response.productSearchResult.products);
        }
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

        } else {
            this.heading = 'shop ' + this.brand + ' products online.';
        }
        
        // update brand name based on API response
        this.brand = response.brandDetails.brandName;

        this.setTrackingData(response);
    }

    private setTrackingData(response){
        if (this.isBrowser) {
            let trackingData = {
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
        if (response.brandDetails.brandDesc !== null && response.brandDetails.brandDesc !== '') {
            this.brandShortDesc = response.brandDetails.brandDesc;
            this.showDesc = true;
        }

        // Set amp tag only for brand-category page.
        const params = this._activatedRoute.snapshot.params;
        if (params['category']) {
            this.catUrlName = this._router.url.split("/brands/" + this._activatedRoute.snapshot.params["brand"])[1];
            this.setAmpTag('brand-category');
        } else {
            this.setAmpTag('brand');
        }
    }

    private setLinks(response) {
        let qp = this._activatedRoute.snapshot.queryParams;
        this.pageNo = qp['page'];
        if (response["title"]) {
            this.brandCatName = this.heading.replace(/(<([^>]+)>)/ig, '');
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
        this.meta.addTag({ "name": "og:url", "content": "https://www.moglix.com" + this._router.url });
        this.meta.addTag({ "name": "robots", "content": (qp["page"] && parseInt(qp["page"]) > 1) ? CONSTANTS.META.ROBOT1 : CONSTANTS.META.ROBOT });

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
        if (this.brandCategoryName) {

            this.itemsList = [{
                "@type": "ListItem",
                "position": 0,
                "item":
                {
                    "@id": "https://www.moglix.com",
                    "name": "Home"
                }
            },
            {
                "@type": "ListItem",
                "position": 1,
                "item":
                {
                    "@id": "https://www.moglix.com/brand-store",
                    "name": "Brand"
                }
            },
            {
                "@type": "ListItem",
                "position": 2,
                "item":
                {
                    "@id": "https://www.moglix.com/" + this.friendlyUrl,
                    "name": this.brand
                }
            },
            {
                "@type": "ListItem",
                "position": 3,
                "item":
                {
                    "@id": "https://www.moglix.com" + this._router.url,
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
                    "@id": "https://www.moglix.com",
                    "name": "Home"
                }
            },
            {
                "@type": "ListItem",
                "position": 1,
                "item":
                {
                    "@id": "https://www.moglix.com/brand-store",
                    "name": "Brand"
                }
            },
            {
                "@type": "ListItem",
                "position": 2,
                "item":
                {
                    "@id": "https://www.moglix.com" + this._router.url,
                    "name": this.brand
                }
            },


            ];

        }

        if (this.isServer) {
            let s = this._renderer2.createElement('script');
            s.type = "application/ld+json";

            s.text = JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": this.itemsList });
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
                    'subSection': "moglix:" + this.brand + ": listing "  + this._commonService.getSectionClick().toLowerCase(),
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

            // if (typeof _satellite !== "undefined") {
            _satellite.track("genericPageLoad");
            // }
            /*End Adobe Analytics Tags */
        }
    }

    private capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    async onVisiblePagination(event) {
        if (!this.paginationInstance) {
            this._commonService.showLoader = true;
            const { PaginationComponent } = await import('@app/components/pagination/pagination.component').finally(() => {
                this._commonService.showLoader = false;
            });
            const factory = this.cfr.resolveComponentFactory(PaginationComponent);
            this.paginationInstance = this.paginationContainerRef.createComponent(factory, null, this.injector);
            this.paginationInstance.instance['paginationUpdated'] = this.paginationUpdated;
            this.paginationUpdated.next(this.paginationData);
            this.paginationInstance.instance['sortByComponentUpdated'] = this.sortByComponentUpdated;
            this.paginationInstance.instance['sortByComponentUpdated'].next(this.sortByComponent);
            this.paginationInstance.instance['position'] = 'BOTTOM';

            if (this.paginationInstance) {
                (this.paginationInstance.instance['onPageChange'] as EventEmitter<any>).subscribe(data => {
                    this.pageChanged(data);
                });
            }

        }
    }

    async filterUp() {
        if (this.isBrowser) {
            if (!this.filterInstance) {
                this._commonService.showLoader = true;
                const { FilterComponent } = await import('@app/components/filter/filter.component').finally(() => {
                    this._commonService.showLoader = false;
                });
                const factory = this.cfr.resolveComponentFactory(FilterComponent);
                this.filterInstance = this.filterContainerRef.createComponent(factory, null, this.injector);
                this.filterInstance.instance['bucketsUpdated'] = new BehaviorSubject<any>(this.filterData);
                this.filterInstance.instance['pageName'] = this.pageName;
                this.filterInstance.instance['sortByComponentUpdated'] = this.sortByComponentUpdated;
                this.filterInstance.instance['sortByComponent'] = this.sortByComponentUpdated;
            }

            const mob_filter = document.querySelector('.mob_filter');

            if (mob_filter) {
                if (mob_filter.classList.contains('upTrans')) {
                    mob_filter.classList.remove('upTrans');
                } else {
                    mob_filter.classList.add('upTrans');
                }
            }
        }

    }

    async toggleSortBy(data) {
        if (this.isBrowser) {
            this.sortByOpt = data.sortByOpt;

            if (!this.sortByInstance) {
                const { SortByComponent } = await import('@app/components/sortBy/sortBy.component').finally(() => {
                    this._commonService.showLoader = false;
                });
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

    private setAmpTag(page) {
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

    private pageChanged(page) {
        let extras: NavigationExtras = {};
        let currentRoute = this._commonService.getCurrentRoute(this._router.url);
        let fragmentString = this._activatedRoute.snapshot.fragment;
        if (fragmentString != null) {
            extras.fragment = fragmentString;
        }

        let currentQueryParams = this._activatedRoute.snapshot.queryParams;
        let newQueryParams: {} = {};
        if (Object.keys(currentQueryParams).length) {
            for (let key in currentQueryParams) {
                newQueryParams[key] = currentQueryParams[key];
            }
        }

        if (page != "1") {
            newQueryParams["page"] = page;
        } else if (newQueryParams["page"] != undefined) {
            delete newQueryParams["page"];
        }

        if (Object.keys(newQueryParams).length > 0)
            extras.queryParams = newQueryParams;
        else
            extras.queryParams = {};

        this._router.navigate([currentRoute], extras);
    }

    public scrollTop(event) {
        this._commonService.scrollTo(event);
    }

    resetLazyComponents(){
        if (this.filterInstance) {
            this.filterInstance = null;
            this.filterContainerRef.remove();
        }
        if (this.sortByInstance) {
            this.sortByInstance = null;
            this.sortByContainerRef.remove();
        }
    }

    ngOnDestroy() {
        if (this.refreshProductsUnsub$) {
            this.refreshProductsUnsub$.unsubscribe();
        }
        if (this.refreshProductsUnsub) {
            this.refreshProductsUnsub.unsubscribe();
        }
        this.resetLazyComponents();
    }

}
