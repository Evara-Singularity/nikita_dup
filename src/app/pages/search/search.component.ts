import { FooterService } from '@app/utils/services/footer.service';
import { EventEmitter, Component, ViewChild, PLATFORM_ID, Inject, Renderer2, OnInit, AfterViewInit, ViewContainerRef, Injector, ComponentFactoryResolver } from '@angular/core';
import { isPlatformServer, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { CommonService } from "@app/utils/services/common.service";
import { NavigationExtras, ActivatedRoute, Router } from "@angular/router";
import { Subject } from "rxjs/Subject";
import { SortByComponent } from "@app/components/sortBy/sortBy.component";
import { CONSTANTS } from "@app/config/constants";
import { Meta } from '@angular/platform-browser';
import { LocalStorageService } from 'ngx-webstorage';
import { DataService } from '@app/utils/services/data.service';
import { BehaviorSubject } from 'rxjs';

declare let dataLayer;
declare var digitalData: {};
declare let _satellite;

@Component({
    selector: 'search',
    templateUrl: './search.html',
    styleUrls: ['./../category/category.scss']
})

export class SearchComponent implements OnInit, AfterViewInit {
    paginationInstance = null;
    @ViewChild('pagination', { read: ViewContainerRef }) paginationContainerRef: ViewContainerRef;
    filterInstance = null;
    @ViewChild('filter', { read: ViewContainerRef }) filterContainerRef: ViewContainerRef;
    sortByInstance = null;
    @ViewChild('sortBy', { read: ViewContainerRef }) sortByContainerRef: ViewContainerRef;

    filterData: Array<any> = [];
    sortByData: Array<any> = [];
    paginationData: any = {};

    @ViewChild(SortByComponent) sortByComponent: SortByComponent;
    showLoader: boolean;
    productsUpdated: BehaviorSubject<any> = new BehaviorSubject<any>({});
    paginationUpdated: BehaviorSubject<any> = new BehaviorSubject<any>({});
    pageSizeUpdated: BehaviorSubject<any> = new BehaviorSubject<any>({});
    sortByUpdated: Subject<any> = new Subject<any>();
    // bucketsUpdated: Subject<any> = new Subject<any>();
    sortByComponentUpdated: Subject<SortByComponent> = new Subject<SortByComponent>();
    windowWidth: number;
    pageName: string;
    buckets = [];
    session: {};
    relatedSearches: Array<{}> = [];
    didYouMean: string;
    productSearchResult: {
        correctedSearchString: {},
        displayString: {},
        inputSearchString: {},
        totalCount: {},
        searchDisplayOperation: {},
    };
    highlightedSearchS: string;
    windowLoaded: number;
    isServer: boolean;
    isBrowser: boolean;
    sortByOpt = false;
    filterCounts;
    refreshProductsUnsub$;
    refreshProductsUnsub;

    constructor(public dataService: DataService, public localStorageService: LocalStorageService, private meta: Meta, private _renderer2: Renderer2, 
        private cfr: ComponentFactoryResolver,
        private injector: Injector,
        @Inject(DOCUMENT) private _document,
        @Inject(PLATFORM_ID) platformId, private footerService: FooterService, private _router: Router,
        private _activatedRoute: ActivatedRoute, private _commonService: CommonService) {
        this.windowLoaded = 0;
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
        this.pageName = 'SEARCH';
    }

    ngOnInit() {
        this.meta.addTag({ "name": "robots", "content": CONSTANTS.META.ROBOT2 });

        const queryParams = this._activatedRoute.snapshot.queryParams;

        if (this.isBrowser && (<HTMLInputElement>document.querySelector('#search-input'))) {
            (<HTMLInputElement>document.querySelector('#search-input')).value = queryParams['search_query'].trim();
        }        
        
        this.setProductsAfterResolverData();
        
        this.footerService.setMobileFoooters();

        this.refreshProductsBasedOnRouteChange();
        
        this.windowLoaded = this.windowLoaded + 1;
        
        this._commonService.setSearchResultsTrackingData({});

        this.setDigitalData();

    }

    setDigitalData() {
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
        let digitalData = {};
        digitalData["page"] = page;
        digitalData["custData"] = custData;
        digitalData["order"] = order;
    }

    ngAfterViewInit() {
        this.sortByComponentUpdated.next(this.sortByComponent);
    }

    private refreshProductsBasedOnRouteChange() {
        this.refreshProductsUnsub$ = this._commonService.refreshProducts$.subscribe(
            (params) => {
                this._commonService.showLoader = true;
                this.refreshProductsUnsub = this._commonService.refreshProducts().subscribe((response) => {
                    this._commonService.showLoader = false;
                    this.paginationData = { itemCount: response.productSearchResult.totalCount };
                    this.paginationUpdated.next(this.paginationData);
                    this.sortByUpdated.next();
                    this.pageSizeUpdated.next({ productSearchResult: response.productSearchResult });
                    this.filterData = response.buckets;
                    // this.bucketsUpdated.next(response.buckets);
                    this.productsUpdated.next(response.productSearchResult.products);
                    // console.log(response.productSearchResult.products);
                    this.relatedSearches = response.relatedSearches;

                    this.productSearchResult = response.productSearchResult;
                    const qp = this._activatedRoute.snapshot.queryParams;

                    if (qp['didYouMean'] !== undefined) {
                        this.didYouMean = qp['didYouMean'];
                    }
                });
            }
        );
    }

    setProductsAfterResolverData() {
        const response = this._activatedRoute.snapshot.data['search'][0];
        const oldDefaultParams = JSON.parse(JSON.stringify(this._commonService.getDefaultParams()));
        this._commonService.showLoader = false;
        const extra = { oldDefaultParams: oldDefaultParams };
        this.initiallizeData(response, extra, true);
        if (response.productSearchResult.highlightedSearchString) {
            this.highlightedSearchS = response.productSearchResult.highlightedSearchString.match(/<em>([^<]+)<\/em>/)[1];
        }
    }
    onFilterSelected(count) {
        this.filterCounts = count;
    }
    topFunction() {
        document.body.scrollTop = document.getElementById('related-list').offsetTop;
        document.documentElement.scrollTop = document.getElementById('related-list').offsetTop;
    }

    private initiallizeData(response: any, extra: {}, flag: boolean) {
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

            // For only 1 Result Search, Pushing only when the window is loaded for the first time
            // if (this.windowLoaded==1) {
            if (this.isBrowser && !oldDefaultParams['queryParams'].hasOwnProperty("search_query") || oldDefaultParams['queryParams']['search_query'] != dp['queryParams']['search_query']) {
                this._commonService.setSearchResultsTrackingData({ 'search-query': dp["queryParams"]["search_query"], 'search-results': '1' });
                setTimeout(() => {
                    dataLayer.push({
                        'event': 'search-results',
                        'search-query': dp['queryParams']['search_query'],
                        'search-results': '1'
                    });
                }, 2000);
            }

            const products = response.productSearchResult.products;
            if (this.isBrowser) {
                digitalData = { page: {} };
                digitalData["page"]["trendingSearch"] = 'no';
                digitalData['page']['searchTerm'] = products[0].moglixPartNumber;
                digitalData['page']['suggestionClicked'] = queryParams['lsource'] && queryParams['lsource'] == 'sclick' ? 'yes' : 'no'
                _satellite.track("genericPageLoad");
            }

            this._router.navigate([products[0].productUrl], { replaceUrl: true });
        } else {
            if (this.isBrowser && !oldDefaultParams["queryParams"].hasOwnProperty("search_query") || oldDefaultParams["queryParams"]["search_query"] != dp["queryParams"]["search_query"]) {
                // console.log("****************", dp["queryParams"]["search_query"]);
                this._commonService.setSearchResultsTrackingData({ 'search-query': dp["queryParams"]["search_query"], 'search-results': '' + response.productSearchResult["totalCount"] });
                setTimeout(() => {
                    dataLayer.push({
                        'event': 'search-results',
                        'search-query': dp["queryParams"]["search_query"],
                        'search-results': '' + response.productSearchResult["totalCount"]
                    });
                }, 2000);
            }


            if (this.isBrowser) {
                digitalData = {page: {}};
                digitalData["page"]["trendingSearch"] = 'no';
                digitalData['page']['searchTerm'] = queryParams['search_query'];
                digitalData['page']['suggestionClicked'] = queryParams['lsource'] && queryParams['lsource'] == 'sclick' ? 'yes' : 'no'
                _satellite.track("genericPageLoad");
            }

            if (flag) {
                this.paginationData = { itemCount: response.productSearchResult.totalCount };
                this.paginationUpdated.next(this.paginationData);
                this.sortByUpdated.next();
                this.pageSizeUpdated.next({ productSearchResult: response.productSearchResult });
                this.filterData = response.buckets;
                    // this.bucketsUpdated.next(response.buckets);
                this.productsUpdated.next(response.productSearchResult.products);
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
    ngOnDestroy() {
        if (this.refreshProductsUnsub$) {
            this.refreshProductsUnsub$.unsubscribe();
        }
        if (this.refreshProductsUnsub) {
            this.refreshProductsUnsub.unsubscribe();
        }
    }
}
