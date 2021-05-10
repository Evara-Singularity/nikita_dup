import { FooterService } from '@app/utils/services/footer.service';
import { Component, ViewChild, PLATFORM_ID, Inject, Renderer2, Optional } from '@angular/core';
import { Location, isPlatformServer, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { CommonService } from "@app/utils/services/common.service";
import { ClientUtility } from "@app/utils/client.utility";
import { Subject } from "rxjs/Subject";
import { SortByComponent } from "@app/modules/sortBy/sortBy.component";
import { Title, Meta, TransferState, makeStateKey } from '@angular/platform-browser';
import { CONSTANTS } from "@app/config/constants";
import { combineLatest } from 'rxjs/observable/combineLatest';
import { RESPONSE } from '@nguniversal/express-engine/tokens';
import { LocalStorageService } from 'ngx-webstorage';
import { DataService } from '@app/utils/services/data.service';

const RPRK: any = makeStateKey<{}>("RPRK");
declare var digitalData: {};
declare let _satellite;

@Component({
    selector: 'brand',
    templateUrl: './brand.html',
    styleUrls: ['./brand.scss'],
    // encapsulation: ViewEncapsulation.None

})

export class BrandComponent {
    showLoader: boolean = true;
    @ViewChild(SortByComponent) sortByComponent: SortByComponent;
    getRelatedCatgory;
    productsUpdated: Subject<any> = new Subject<any>();
    paginationUpdated: Subject<any> = new Subject<any>();
    sortByUpdated: Subject<any> = new Subject<any>();
    pageSizeUpdated: Subject<any> = new Subject<any>();
    bucketsUpdated: Subject<any> = new Subject<any>();
    sortByComponentUpdated: Subject<SortByComponent> = new Subject<SortByComponent>();
    windowWidth: number;
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


    refreshProductsUnsub$: any;
    constructor(public dataService: DataService, private router: Router, @Optional() @Inject(RESPONSE) private _response, private _tState: TransferState, private _renderer2: Renderer2, @Inject(DOCUMENT) private _document, private title: Title, private meta: Meta, @Inject(PLATFORM_ID) platformId, public footerService: FooterService, public location: Location, public _router: Router, public _activatedRoute: ActivatedRoute, public _commonService: CommonService, private localStorageService: LocalStorageService) {
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
        this.pageName = "BRAND";
        //alert(this._router.url);
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


    ngOnInit() {
        let queryParams = this._activatedRoute.snapshot.queryParams;
        if (queryParams['category']) {

            this.meta.addTag({ "name": "robots", "content": "noindex, nofollow" });
        }

        this.todayDate = Date.now();
        if (this.isBrowser) {
            this.windowWidth = window.innerWidth;
            window.onresize = () => {
                this.windowWidth = window.innerWidth;
            }
        }

        if (this.isBrowser) {
            if (window.outerWidth >= 768) {
                this.footerService.setFooterObj({ footerData: false });
                this.footerService.footerChangeSubject.next(this.footerService.getFooterObj());
            } else {
                this.footerService.setMobileFoooters();
            }
        }

        this.refreshProductsUnsub$ = this._commonService.refreshProducts$.subscribe(
            () => {
                this.showLoader = true;
                this.refreshProductsUnsub = this._commonService.refreshProducts().subscribe((response) => {
                    this.showLoader = false;
                    // $("#page-loader").hide();
                    this.paginationUpdated.next({ itemCount: response.productSearchResult.totalCount });
                    this.sortByUpdated.next();
                    this.pageSizeUpdated.next({ productSearchResult: response.productSearchResult });
                    this.bucketsUpdated.next(response.buckets);
                    this.productsUpdated.next(response.productSearchResult.products);
                });
            }
        );

        const sParams = this._activatedRoute.snapshot.params;


        this.brand = decodeURI(sParams['brand']);


        combineLatest(this._activatedRoute.params, this._activatedRoute.queryParams, this._activatedRoute.fragment).subscribe(() => {
            this.refreshProducts();
        });

        this._activatedRoute.queryParams.subscribe(data => {
            if (data['page'] == undefined || data['page'] == 1) {
                this.firstPageContent = true;
            } else {
                this.firstPageContent = false;
            }

        })


    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    ngAfterViewInit() {
        this.sortByComponentUpdated.next(this.sortByComponent);
        /*Remove key set on server side to avoid api on dom load of frontend side*/
        if (this.isBrowser) {
            this._tState.remove(RPRK);
        }
    }

    refreshProducts() {
        const defaultParams = this.createDefaultParams();
        this._commonService.updateDefaultParamsNew(defaultParams);
        const fragment = this._activatedRoute.snapshot.fragment;

        if (this._tState.hasKey(RPRK) && !fragment) {
            const response = this._tState.get(RPRK, {});
            this.initiallizeData(response, false);
        } else {
            if (this.isBrowser) {
                this.showLoader = true;
            }
            this.refreshProductsUnsub = this._commonService.refreshProducts().subscribe((response) => {
                if (this.isServer) {
                    this._tState.set(RPRK, response);
                }
                this.initiallizeData(response, true);
            });
        }
    }

    private initiallizeData(response: any, flag: boolean) {
        this.showLoader = false;
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
        if (flag) {
            this.paginationUpdated.next({ itemCount: response.productSearchResult['totalCount'] });
            this.sortByUpdated.next();
            this.pageSizeUpdated.next({ productSearchResult: response.productSearchResult });
            this.bucketsUpdated.next(response.buckets);
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
            //console.log(" this.heading",this.heading );


            if (this.isBrowser) {
                this.windowWidth = window.innerWidth;
                window.onresize = () => {
                    this.windowWidth = window.innerWidth;
                };
                setTimeout(() => {
                    if (document.querySelector('h3 .inv_span')) {
                        document.querySelector('h3 .inv_span').addEventListener('click', function () {
                            if (parseInt((<HTMLElement>document.querySelector('.show-mobile')).style.opacity) > 0) {
                                ClientUtility.fadeOut(document.querySelector('.show-mobile'));
                            } else {
                                ClientUtility.fadeIn(document.querySelector('.show-mobile'));
                            }
                            document.querySelector('.showplus').classList.toggle('showminus');
                        }, {passive: true});
                    }
                }, 3000);
            }

        } else {
            this.heading = 'shop ' + this.brand + ' products online.';
        }
        this.brand = response.brandDetails.brandName;
        //console.log("this.brand 2",this.brand);
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
        const params = this._activatedRoute.snapshot.params;
        if (params['category']) {
            this.catUrlName = this._router.url.split("/brands/" + this._activatedRoute.snapshot.params["brand"])[1];
            this.setAmpTag('brand-category');
        } else {
            this.setAmpTag('brand');
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

    filterUp() {
        if (this.isBrowser) {
            if (document.querySelector('.mob_filter').classList.contains('upTrans')) {
                document.querySelector('.mob_filter').classList.remove('upTrans');
            } else {
                document.querySelector('.mob_filter').classList.add('upTrans');
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

        // Object.assign(newParams["queryParams"], currentQueryParams);

        for (let key in currentQueryParams) {
            newParams.queryParams[key] = currentQueryParams[key];
        }

        // newParams["queryParams"] = queryParams;
        newParams["filter"] = {};

        let params = this._activatedRoute.snapshot.params;
        newParams["brand"] = params['brand'];
        if (params['category'])
            newParams["category"] = params['category'];
        else{
            this._commonService.deleteDefaultParam('category');
        }
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


    pageChanged(page) {
        //console.log("Event page changed called");

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
    ngOnDestroy() {
        if (this.refreshProductsUnsub$) {
            this.refreshProductsUnsub$.unsubscribe();
        }
        if (this.refreshProductsUnsub) {
            this.refreshProductsUnsub.unsubscribe();
        }
    }

}
