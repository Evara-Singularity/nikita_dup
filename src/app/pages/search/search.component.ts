import { Subject } from "rxjs";
import { CONSTANTS } from "@config/constants";
import { Meta } from '@angular/platform-browser';
import { LocalStorageService } from 'ngx-webstorage';
import { DataService } from '@services/data.service';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { FooterService } from '@services/footer.service';
import { CommonService } from "@services/common.service";
import { SortByComponent } from "@components/sortBy/sortBy.component";
import { NavigationExtras, ActivatedRoute, Router } from "@angular/router";
import { isPlatformServer, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Component, ViewChild, EventEmitter, PLATFORM_ID, Inject, Renderer2, OnInit, ViewContainerRef, ComponentFactoryResolver, Injector } from '@angular/core';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { ClientUtility } from "@app/utils/client.utility";


interface ProductSearchResult {
    highlightedSearchString: any,
    totalCount: any,
    correctedSearchString: any,
    products: any;
    inputSearchString: any;
    displayString: any;
    searchDisplayOperation: any;
}

@Component({
    selector: 'search',
    templateUrl: './search.component.html',
    styleUrls: ['../category/category.scss', './search.component.scss']
})

export class SearchComponent implements OnInit {
    filterInstance = null;
    @ViewChild('filter', { read: ViewContainerRef }) filterContainerRef: ViewContainerRef;
    sortByInstance = null;
    @ViewChild('sortBy', { read: ViewContainerRef }) sortByContainerRef: ViewContainerRef;
    paginationInstance = null;
    @ViewChild('pagination', { read: ViewContainerRef }) paginationContainerRef: ViewContainerRef;
    brandDetailsFooterInstance = null;
    @ViewChild('brandDetailsFooter', { read: ViewContainerRef }) brandDetailsFooterContainerRef: ViewContainerRef;

    @ViewChild(SortByComponent) sortByComponent: SortByComponent;

    filterData: Array<any> = [];
    sortByData: Array<any> = [];
    paginationData: any = {};

    productsUpdated: BehaviorSubject<any> = new BehaviorSubject<any>({});

    paginationUpdated: BehaviorSubject<any> = new BehaviorSubject<any>({});
    
    pageSizeUpdated: BehaviorSubject<any> = new BehaviorSubject<any>({});

    sortByUpdated: Subject<any> = new Subject<any>();
    
    sortByComponentUpdated: BehaviorSubject<SortByComponent>;

    pageName: string;
    buckets = [];
    session: {};
    relatedSearches: Array<{}> = [];
    didYouMean: string;
    productSearchResult: ProductSearchResult;
    highlightedSearchS: string;
    windowLoaded: number;
    isServer: boolean;
    isBrowser: boolean;
    sortByOpt = false;
    filterCounts;
    refreshProductsUnsub$;
    refreshProductsUnsub;

    constructor(public dataService: DataService,
        private cfr: ComponentFactoryResolver,
        private analytics: GlobalAnalyticsService,
        private injector: Injector,
        public localStorageService: LocalStorageService, private meta: Meta, private _renderer2: Renderer2, @Inject(DOCUMENT) private _document,
        @Inject(PLATFORM_ID) platformId, private footerService: FooterService, private _router: Router,
        private _activatedRoute: ActivatedRoute, private _commonService: CommonService) {
        this._commonService.showLoader = false;
        this.windowLoaded = 0;
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
        this.pageName = 'SEARCH';
    }

    ngOnInit() {
        if (this._commonService.isBrowser) {
            // Set Meta data
            this.meta.addTag({ "name": "robots", "content": CONSTANTS.META.ROBOT2 });

            this.setCategoryDataFromResolver();
    
            // Set Foooters
            this.footerService.setMobileFoooters();

        }
    }

    setCategoryDataFromResolver() {
        this._commonService.showLoader = true;
        // Get data from resolver and render the view
        this._activatedRoute.data.subscribe(resolverData => {

            const oldDefaultParams = JSON.parse(JSON.stringify(this._commonService.getDefaultParams()));
            this.initiallizeData(resolverData['search'][0], { oldDefaultParams }, true);
            
            // Empty the setSearchResultsTrackingData initially.
            this._commonService.setSearchResultsTrackingData({});

            // Remove spacing from input search input value
            if (this.isBrowser && (<HTMLInputElement>document.querySelector('#search-input'))) {
                const queryParams = this._activatedRoute.snapshot.queryParams;
                (<HTMLInputElement>document.querySelector('#search-input')).value = queryParams['search_query'].trim();
            }

            
            // Set Adobe tracking and other tasks
            this.setAdobeTracking();
            
            // hide loader
            this._commonService.showLoader = false;
        });
    }

    setAdobeTracking() {
        const user = this.localStorageService.retrieve('user');
        let page = {
            'pageName': "Search Listing Page",
            'channel': "search",
            'subSection': "moglix:search " + this._commonService.getSectionClick().toLowerCase(),
            'loginStatus': (user && user["authenticated"] == 'true') ? "registered user" : "guest"
        }
        let custData = {
            'customerID': (user && user["userId"]) ? btoa(user["userId"]) : '',
            'emailID': (user && user["email"]) ? btoa(user["email"]) : '',
            'mobile': (user && user["phone"]) ? btoa(user["phone"]) : '',
            'customerType': (user && user["userType"]) ? user["userType"] : '',
        }
        let order = {}
        let digitalData = {}
        
        digitalData["page"] = page;
        digitalData["custData"] = custData;
        digitalData["order"] = order;
    }

    refreshProducts() {
        this._commonService.showLoader = true;
        const oldDefaultParams = JSON.parse(JSON.stringify(this._commonService.getDefaultParams()));
        const defaultParams = this.createDefaultParams();
        this._commonService.updateDefaultParamsNew(defaultParams);

        this.refreshProductsUnsub = this._commonService.refreshProducts().subscribe((response) => {
            this._commonService.showLoader = false;
            const extra = { oldDefaultParams: oldDefaultParams };
            this.initiallizeData(response, extra, true);
            if (response.productSearchResult.highlightedSearchString)
                this.highlightedSearchS = response.productSearchResult.highlightedSearchString.match(/<em>([^<]+)<\/em>/)[1];
        });
    }
    onFilterSelected(count) {
        setTimeout(() => {
            this.filterCounts = count;
        }, 0);
    }
    topFunction() {
        document.body.scrollTop = document.getElementById('related-list').offsetTop;
        document.documentElement.scrollTop = document.getElementById('related-list').offsetTop;
    }

    private initiallizeData(response: any, extra: {}, flag: boolean) {
        ClientUtility.scrollToTop(2000);
        const oldDefaultParams = extra['oldDefaultParams'];
        const dp = this._commonService.getDefaultParams();
        const fragment = this._activatedRoute.snapshot.fragment;
        const queryParams = this._activatedRoute.snapshot.queryParams;
        var trackingData = {
            event_type: "page_load",
            label: "view",
            channel: "Search Listing",
            page_type: "search page",
            search_query: queryParams['search_query'].trim(),
            filter_added: !!window.location.hash.substr(1) ? 'true' : 'false',
            product_count: response.productSearchResult.totalCount
        }
        this.dataService.sendMessage(trackingData);
        if (response.productSearchResult['totalCount'] === 1 && fragment == null) {
            if (this.isBrowser && !oldDefaultParams['queryParams'].hasOwnProperty("search_query") || oldDefaultParams['queryParams']['search_query'] != dp['queryParams']['search_query']) {
                this._commonService.setSearchResultsTrackingData({ 'search-query': dp["queryParams"]["search_query"], 'search-results': '1' });
                setTimeout(() => {
                    this.analytics.sendGTMCall({
                        'event': 'search-results',
                        'search-query': dp['queryParams']['search_query'],
                        'search-results': '1'
                    });
                }, 2000);
            }

            const products = response.productSearchResult.products;
            let digitalData = {};
            if (this.isBrowser) {
                digitalData = {page: {}};
                digitalData["page"]["trendingSearch"] = 'no';
                digitalData['page']['searchTerm'] = products[0].moglixPartNumber;
                digitalData['page']['suggestionClicked'] = queryParams['lsource'] && queryParams['lsource'] == 'sclick' ? 'yes' : 'no'
                this.analytics.sendAdobeCall(digitalData);
            }

            this._router.navigate([products[0].productUrl], { replaceUrl: true });
        } else {
            if (this.isBrowser && !oldDefaultParams["queryParams"].hasOwnProperty("search_query") || oldDefaultParams["queryParams"]["search_query"] != dp["queryParams"]["search_query"]) {
                this._commonService.setSearchResultsTrackingData({ 'search-query': dp["queryParams"]["search_query"], 'search-results': '' + response.productSearchResult["totalCount"] });
                setTimeout(() => {
                    this.analytics.sendGTMCall({
                        'event': 'search-results',
                        'search-query': dp["queryParams"]["search_query"],
                        'search-results': '' + response.productSearchResult["totalCount"]
                    });
                }, 2000);
            }


            let digitalData = {};
            if (this.isBrowser) {
                digitalData = {page: {}};
                digitalData["page"]["trendingSearch"] = 'no';
                digitalData['page']['searchTerm'] = queryParams['search_query'];
                digitalData['page']['suggestionClicked'] = queryParams['lsource'] && queryParams['lsource'] == 'sclick' ? 'yes' : 'no'
                this.analytics.sendAdobeCall(digitalData);
            }

            if (flag) {
                this.paginationData = { itemCount: response.productSearchResult.totalCount };
                this.sortByUpdated.next();
                this.pageSizeUpdated.next({ productSearchResult: response.productSearchResult });
                this.filterData = response.buckets;
                this.productsUpdated.next(response.productSearchResult.products);
            }
            if (this.paginationInstance) {
                this.paginationInstance.instance['paginationUpdated'].next(this.paginationData);
            }
            if (this.filterInstance) {
                this.filterInstance.instance['bucketsUpdated'].next(this.filterData);
            }
            this.relatedSearches = response.relatedSearches;

            this.productSearchResult = response.productSearchResult;

            // let queryParams = this._activatedRoute.snapshot.queryParams;
            if (queryParams["didYouMean"] != undefined)
                this.didYouMean = queryParams["didYouMean"];
        }

        //Start Canonical URL 
        let currentQueryParams = this._activatedRoute.snapshot.queryParams;
        let currentRoute = this._commonService.getCurrentRoute(this._router.url);
        //console.log("Current router:" + currentRoute);
        let pageCountQ = response.productSearchResult.totalCount / 10;
        let currentPageP = parseInt(currentQueryParams["page"]);

        if (pageCountQ > 1 && (currentPageP == 1 || isNaN(currentPageP))) {
            // console.log("hello");
            let links = this._renderer2.createElement('link');
            links.rel = "next";
            links.href = CONSTANTS.PROD + currentRoute + '?page=2';
            this._renderer2.appendChild(this._document.head, links);

        } else if (currentPageP > 1 && pageCountQ >= currentPageP) {
            let links = this._renderer2.createElement('link');
            links.rel = "prev";
            links.href = CONSTANTS.PROD + currentRoute + '?page=' + (currentPageP - 1);
            this._renderer2.appendChild(this._document.head, links);

            links = this._renderer2.createElement('link');
            links.rel = "next";
            links.href = CONSTANTS.PROD + currentRoute + '?page=' + (currentPageP + 1);
            this._renderer2.appendChild(this._document.head, links);
        } else if (currentPageP > 1 && pageCountQ + 1 >= currentPageP) {
            let links = this._renderer2.createElement('link');
            links.rel = "prev";
            links.href = CONSTANTS.PROD + currentRoute + '?page=' + (currentPageP - 1);
            this._renderer2.appendChild(this._document.head, links);
        }

        // this.refreshProductsBasedOnRouteChange();
    }
    onUpdaet(data) {
        this.sortByOpt = data.sortByOpt;
    }
    createDefaultParams() {
        let newParams: any = {
            queryParams: {}
        };

        let defaultParams = this._commonService.getDefaultParams();
        /**
         *  Below code is added to maintain the state of sortBy : STARTS
         */
        if (defaultParams['queryParams']['orderBy'] != undefined)
            newParams.queryParams['orderBy'] = defaultParams['queryParams']['orderBy'];
        if (defaultParams['queryParams']['orderWay'] != undefined)
            newParams.queryParams['orderWay'] = defaultParams['queryParams']['orderWay'];
        /**
         *  maintain the state of sortBy : ENDS
         */

        let currentQueryParams = this._activatedRoute.snapshot.queryParams;

        //Object.assign(newParams["queryParams"], defaultParams['queryParams'], queryParams);
        for (let key in currentQueryParams) {
            newParams.queryParams[key] = currentQueryParams[key];
        }

        // newParams["queryParams"] = queryParams;
        newParams["filter"] = {};

        let params = this._activatedRoute.snapshot.params;
        newParams["category"] = params['id'];

        let fragment = this._activatedRoute.snapshot.fragment;
        if (fragment != undefined && fragment != null && fragment.length > 0) {
            let currentUrlFilterData: any = fragment.replace(/^\/|\/$/g, '');
            ////console.log(currentUrlFilterData);
            currentUrlFilterData = currentUrlFilterData.replace(/^\s+|\s+$/gm, '');
            currentUrlFilterData = currentUrlFilterData.split("/");
            if (currentUrlFilterData.length > 0) {
                const filter = {};
                for (let i = 0; i < currentUrlFilterData.length; i++) {
                    const filterName = currentUrlFilterData[i].substr(0, currentUrlFilterData[i].indexOf('-')).toLowerCase(); // "price"
                    const filterData = currentUrlFilterData[i].substr(currentUrlFilterData[i].indexOf('-') + 1).split("||"); // ["101 - 500", "501 - 1000"]
                    filter[filterName] = filterData;
                }
                newParams["filter"] = filter;
            }
        }

        newParams["pageName"] = this.pageName;
        return newParams;
    }

    pageChanged(page) {
        let extras: NavigationExtras = {};
        let currentRoute = this._commonService.getCurrentRoute(this._router.url);
        // let fragmentString = this._commonService.generateFragmentString();
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

        if (Object.keys(newQueryParams).length > 0)
            extras.queryParams = newQueryParams;
        else
            extras.queryParams = {};

        this._router.navigate([currentRoute], extras);
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
                    this._commonService.showLoader = false;
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
                this._commonService.showLoader = true;
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


    getQueryParams(newQueryParams?) {
        let qp = this._commonService.getDefaultParams().queryParams;
        let queryParams = this._commonService.generateQueryParams(qp);

        if (newQueryParams != undefined) {
            for (let key in newQueryParams) {
                queryParams[key] = newQueryParams[key].toLowerCase();
            }
        }

        if (Object.keys(queryParams).length > 0)
            return queryParams;
        return {};
    }

    redirectWithNoPreProcessRequiredParam(searchTerm: string) {
        this._commonService.showLoader = true;
        let oldDefaultParams = JSON.parse(JSON.stringify(this._commonService.getDefaultParams()));
        let defaultParams = this.createDefaultParams();
        defaultParams['queryParams']['search_query'] = searchTerm;
        defaultParams['queryParams']['preProcessRequired'] = 'n';

        this._commonService.updateDefaultParamsNew(defaultParams);

        this._commonService.refreshProducts().subscribe((response) => {
            let extra = { oldDefaultParams: oldDefaultParams };
            this.initiallizeData(response, extra, true);
            if (response.productSearchResult.highlightedSearchString) {
                this.highlightedSearchS = response.productSearchResult.highlightedSearchString.match(/<em>([^<]+)<\/em>/)[1];
            }
            this._commonService.showLoader = false;
        });
    }

    getFragments() {
        let filterData = this._commonService.getDefaultParams().filter;
        let fragmentString = this._commonService.generateFragmentString(filterData);
        if (fragmentString != null)
            return fragmentString;
        return null;
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
