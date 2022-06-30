import { EventEmitter, Component, ViewChild, Inject, Renderer2, ViewContainerRef, Injector, ComponentFactoryResolver } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { CommonService } from "@services/common.service";
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { PopularProductService } from './popularProduct.service';
import { SortByComponent } from "@components/sortBy/sortBy.component";
import { CONSTANTS } from '@config/constants';
import { Title, Meta } from '@angular/platform-browser';
import { Subject, BehaviorSubject, combineLatest } from 'rxjs';

@Component({
    selector: 'popular-product',
    templateUrl: './popularProduct.component.html',
    styleUrls: ['popularProduct.component.scss']

})

export class PopularProductComponent {
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

    productsUpdated: Subject<any> = new Subject<any>();
    bucketsUpdated: Subject<any> = new Subject<any>();
    sortByComponentUpdated: Subject<SortByComponent> = new Subject<SortByComponent>();
    sortByUpdated: Subject<any> = new Subject<any>();
    paginationUpdated: Subject<any> = new Subject<any>();
    pageSizeUpdated: Subject<any> = new Subject<any>();
    pageName: string;
    productListLength: number;
    inputQueryString: string;
    searchString: string;
    isServer: boolean;
    isBrowser: boolean;
    windowWidth: number;
    windowLoaded: number = 0;
    productSearchResult: {};
    popularKeywordsDetails: any;
    keywordDescription: any;
    
    refreshProductsUnsub:any;
    refreshProductsUnsub$:any;
    constructor(private meta: Meta, 
        private cfr: ComponentFactoryResolver,
        private injector: Injector,
        private title: Title, public router: Router, public activatedRoute: ActivatedRoute, public popularProductService: PopularProductService, private _commonService: CommonService, private _activatedRoute: ActivatedRoute, private _router: Router, private _renderer2: Renderer2, @Inject(DOCUMENT) private _document) {
        this.isServer = _commonService.isServer;
        this.isBrowser = _commonService.isBrowser;
        this.pageName = "POPULAR SEARCH";
    }

    popularProductList: any;
    baseImagePath: string = CONSTANTS.IMAGE_BASE_URL;
    showLoader: boolean = true;

    ngOnInit() {
        this.popularProductList = {};
        if (this.isBrowser) {
            this.windowWidth = window.innerWidth;
            window.onresize = () => {
                this.windowWidth = window.innerWidth;
            }
        }

        this.refreshProductsUnsub$= this._commonService.refreshProducts$.subscribe(
            (params) => {
                this.showLoader = true;
                this.refreshProductsUnsub =   this._commonService.refreshProducts().subscribe((response) => {
                    this.showLoader = false;
                    this.paginationUpdated.next({ itemCount: response.productSearchResult["totalCount"] });
                    this.sortByUpdated.next();
                    this.pageSizeUpdated.next({ productSearchResult: response.productSearchResult });
                    this.bucketsUpdated.next(response.buckets);
                    this.productsUpdated.next(response.productSearchResult.products);
                });
            }
        );

        let sParams = this._activatedRoute.snapshot.params;
        this.searchString = decodeURI(sParams['searchString']);

        combineLatest(this._activatedRoute.params, this._activatedRoute.queryParams, this._activatedRoute.fragment).subscribe(data => {
            this.refreshProducts();
        });
    }

    ngAfterViewInit() {
        this.sortByComponentUpdated.next(this.sortByComponent);
        /*Remove key set on server side to avoid api on dom load of frontend side*/
        // if (this.isBrowser) {
        //     this.transferState.remove(REFRESH_PRODUCTS_RESPONSE_KEY)
        // }
    }

    refreshProducts() {
        let defaultParams = this.createDefaultParams();
        this._commonService.updateDefaultParamsNew(defaultParams);

        // if (!this.transferState.hasKey(REFRESH_PRODUCTS_RESPONSE_KEY)) {
            this.showLoader = true;
            this._commonService.refreshProducts().subscribe((response) => {
                this.initializeData(response, true);
            });
    }


    private initializeData(response: any, flag: boolean) {
        this.showLoader = false;
        if (flag) {
            this.paginationUpdated.next({ itemCount: response.productSearchResult["totalCount"] });
            this.sortByUpdated.next();
            this.pageSizeUpdated.next({ productSearchResult: response.productSearchResult });
            // this.bucketsUpdated.next(response.buckets);
            this.filterData = response.buckets;
            this.inputQueryString = this.activatedRoute.snapshot.params['searchString'];
            this.inputQueryString=this.inputQueryString.replace(/-|\s/g," ");
            let name=this.inputQueryString;
            this.title.setTitle(name + " -  Buy Popular " + name + " Online - Moglix.com");
            this.meta.addTag({ "name": "og:title", "content": name + " -  Buy Popular " + name + " Online - Moglix.com" });
            this.meta.addTag({ "name": "description", "content": "Explore popular " + name + " available at Moglix and get spoilt for choice. Moglix is a one stop shop for genuine " + name + " at lowest prices in India. " });
            this.meta.addTag({ "name": "og:description", "content": "Explore popular " + name + " available at Moglix and get spoilt for choice. Moglix is a one stop shop for genuine " + name + " at lowest prices in India. "});
            this.meta.addTag({ "name": "keywords", "content": name + ", " + name + " online, Popular " + name + ", buy " + name });
            this.meta.addTag({ "name": "og:url", "content": CONSTANTS.PROD + this._router.url });
            

            // if(this._router.url == '/q/led-street-light' || this._router.url == '/q/led-lights' || this._router.url == '/q/torch' || this._router.url == '/q/led-bulbs' || this._router.url == '/q/ballast' || this._router.url == '/q/led-panel-light' || this._router.url == '/q/wall-lights' || this._router.url == '/q/ceiling-lights' || this._router.url == '/q/led-strip-lights' || this._router.url == '/q/decorative-lights' || this._router.url == '/q/tachometers' || this._router.url == '/q/weighing-scales' || this._router.url == '/q/multimeters' || this._router.url == '/q/ir-thermometers' || this._router.url == '/q/anemometers' || this._router.url == '/q/micrometers' || this._router.url == '/q/lawn-mowers' || this._router.url == '/q/power-tools' || this._router.url == '/q/blowers' || this._router.url == '/q/cutters' || this._router.url == '/q/drills' || this._router.url == '/q/electric-screwdrivers' || this._router.url == '/q/glue-guns' || this._router.url == '/q/jigsaws' || this._router.url == '/q/grinding-machines' || this._router.url == '/q/safety-gloves' || this._router.url == '/q/safety-goggles' || this._router.url == '/q/safety-shoes' || this._router.url == '/q/safety-jackets' || this._router.url == '/q/acme-safety-shoes' ||this._router.url == '/q/bosch-drill-machine') {
            //     this.meta.addTag({ "name": "robots", "content": "noindex, nofollow"});
            // } else {
            //     this.meta.addTag({ "name": "robots", "content": API.META.ROBOT });
            // }
            if (this.isServer) {
                let links = this._renderer2.createElement('link');
                links.rel = "canonical";
                links.href = CONSTANTS.PROD + this._router.url.split("?")[0].split("#")[0].toLowerCase();
                this._renderer2.appendChild(this._document.head, links);
            }

            this.productsUpdated.next(response.productSearchResult.products);
            this.getPopularKeywordDetails(this.inputQueryString);
        }
    }

    getPopularKeywordDetails(searchUrl) 
    {
        this.popularKeywordsDetails = this.popularProductService.getPopularKeywordDetails(searchUrl).subscribe
            (
            data => {
                this.keywordDescription = data;
            });
    }


    async toggleSortBy() {
        if (this.isBrowser) {
            if (!this.sortByInstance) {
                this._commonService.showLoader = true;
                const { SortByComponent } = await import('@app/components/sortBy/sortBy.component').finally(() => {
                    this._commonService.showLoader = false;
                });
                const factory = this.cfr.resolveComponentFactory(SortByComponent);
                this.sortByInstance = this.sortByContainerRef.createComponent(factory, null, this.injector);
                this.sortByInstance.instance['sortByUpdated'] = new BehaviorSubject<any>(null);

                (this.sortByInstance.instance['outData$'] as EventEmitter<any>).subscribe(data => {
                    this.toggleSortBy();
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
            } else {
                const mob_filter = document.querySelector('.mob_filter');
                if (mob_filter) {
                    mob_filter.classList.toggle('upTrans');
                }
            }

        }

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

        for (let key in currentQueryParams) {
            newParams.queryParams[key] = currentQueryParams[key];
        }

        newParams["filter"] = {};

        let params = this._activatedRoute.snapshot.params;
        newParams["searchString"] = params['searchString'];

        let fragment = this._activatedRoute.snapshot.fragment;
        if (fragment != undefined && fragment != null && fragment.length > 0) {
            let currentUrlFilterData: any = fragment.replace(/^\/|\/$/g, '');
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

    goToProductDescription(item) {
        this.router.navigateByUrl(item.productUrl)
    }

    pageChanged(page) {
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

    ngOnDestroy(){
        if(this.refreshProductsUnsub$){
            this.refreshProductsUnsub$.unsubscribe();
        }
        if(this.refreshProductsUnsub){
            this.refreshProductsUnsub.unsubscribe();
        }

        this.resetLazyComponents();
    }
}
