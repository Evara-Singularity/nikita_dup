import { Component, Inject, Optional, Renderer2 } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { ProductListingDataEntity } from '@app/utils/models/product.listing.search';
import { CommonService } from '@app/utils/services/common.service';
import { DataService } from '@app/utils/services/data.service';
import { FooterService } from '@app/utils/services/footer.service';
import { ProductListService } from '@app/utils/services/productList.service';
import { RESPONSE } from '@nguniversal/express-engine/tokens';
import { DOCUMENT } from '@angular/common';
import { LocalStorageService } from 'ngx-webstorage';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';

let digitalData = {
    page: {},
    custData: {},
    order: {}
};

@Component({
    selector: 'brand',
    templateUrl: './brand.html',
    styleUrls: ['./brand.scss','../category/category.scss', './../../components/homefooter-accordian/homefooter-accordian.component.scss'],
})

export class BrandComponent {
    public productListingData: ProductListingDataEntity;
    public cmsData: any[] = [];
    public API_RESPONSE: any;
    public popularLinks;
    public brandFooterData;
    
    constructor(
        public _activatedRoute: ActivatedRoute,
        public _router: Router,
        public _commonService: CommonService,
        private _renderer2: Renderer2,
        public _footerService: FooterService,
        private _analytics: GlobalAnalyticsService,
        @Inject(DOCUMENT) private _document,
        private meta: Meta,
        private title: Title,
        private _dataService: DataService,
        private _localStorageService: LocalStorageService,
        public _productListService: ProductListService,
        @Optional() @Inject(RESPONSE) private _response,
    ) {}


    ngOnInit(): void {
        if (this._commonService.isBrowser) {
            
            // set some extra meta tags if brand is a category page
            if (this._activatedRoute.snapshot.queryParams['category']) {
                this.meta.addTag({ "name": "robots", "content": "noindex, nofollow" });
            }

            // Set footers
            this._footerService.setMobileFoooters();
        }

        this.setDataFromResolver();
    }

    setDataFromResolver() {
        this._activatedRoute.data.subscribe(result => {
            // pass data to this genric data holder
            this.API_RESPONSE = result; 
            console.log(this.API_RESPONSE);

            // genrate popular links data
            this.popularLinks = Object.keys(this.API_RESPONSE.brand[1][0].categoryLinkList);

            // Total count
            this._commonService.selectedFilterData.totalCount = this.API_RESPONSE.brand[1][0].productSearchResult.totalCount;
            
            // create data for shared listing component
            this._productListService.createAndProvideDataToSharedListingComponent(this.API_RESPONSE['brand'][1][0], 'Brand Results');
            
            // handle if brand is not active or has zero product count
            this.handleIfBrandIsNotActive();

            // genrate data for footer
            this.genrateAndUpdateBrandFooterData();

            // Send Adobe Tracking Data
            this.setAdobeTrackingData();

            // Set Amp tags
            // this.setAmpTag(this._activatedRoute.snapshot.params['category'] ? 'brand-category' : 'brand');

        });
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    setLinks() {
        let qp = this._activatedRoute.snapshot.queryParams;
        let itemsList = [];
        if (this.API_RESPONSE.brand[1][0]["title"]) {
            this.title.setTitle(this.API_RESPONSE.brand[1][0]["title"]);
            this.meta.addTag({ "name": "og:title", "content": this.API_RESPONSE.brand[1][0]["title"] });
        } else {
            let title = "Buy " + this.API_RESPONSE.brand[1][0]["brandName"] + " Products Online at Best Price - Moglix.com";
            this.title.setTitle(title);
            this.meta.addTag({ "name": "og:title", "content": title });
        }

        if (this.API_RESPONSE.brand[1][0]["metaDesciption"]) {
            this.meta.addTag({ "name": "description", "content": this.API_RESPONSE.brand[1][0]["metaDesciption"] });
            this.meta.addTag({ "name": "og:description", "content": this.API_RESPONSE.brand[1][0]["metaDesciption"] });
        } else {
            let metaDescription = "Buy " + this.API_RESPONSE.brand[1][0]["brandName"] + " products at best prices in India. Shop online for " + this.API_RESPONSE.brand[1][0]["brandName"] + " products at Moglix. Free Delivery & COD options across India.";
            this.meta.addTag({ "name": "description", "content": metaDescription });
            this.meta.addTag({ "name": "og:description", "content": metaDescription });
        }

        //this.meta.addTag({ "name": "og:title", "content": title });
        this.meta.addTag({ "name": "og:url", "content": CONSTANTS.PROD + this._router.url });
        this.meta.addTag({ "name": "robots", "content": (qp["page"] && parseInt(qp["page"]) > 1) ? CONSTANTS.META.ROBOT1 : CONSTANTS.META.ROBOT });
        if (this._commonService.isServer) {
            //canonical
            let links = this._renderer2.createElement('link');
            links.rel = "canonical";
            let href = CONSTANTS.PROD + this._router.url.split("?")[0].split("#")[0].toLowerCase();
            links.href = (qp['page'] == 1 || qp['page'] == undefined) ? href : href + "?page=" + qp['page'];
            this._renderer2.appendChild(this._document.head, links);
            //list schema
            if (this.API_RESPONSE['brand'][1][0].categoryName) {
                itemsList = [
                    {
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
                            "@id": CONSTANTS.PROD + '/' +this.API_RESPONSE.brand[0].friendlyUrl,
                            "name": this.API_RESPONSE.brand[1][0]["brandName"]
                        }
                    },
                    {
                        "@type": "ListItem",
                        "position": 3,
                        "item":
                        {
                            "@id": CONSTANTS.PROD + this._router.url,
                            "name": this.API_RESPONSE['brand'][1][0].categoryName
                        }
                    }
                ];
            }
            else {
                itemsList = [
                    {
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
                            "name": this.API_RESPONSE.brand[1][0]["brandName"]
                        }
                    },
                ];
            }
            let s = this._renderer2.createElement('script');
            s.type = "application/ld+json";
            s.text = JSON.stringify({ "@context": CONSTANTS.SCHEMA, "@type": "BreadcrumbList", "itemListElement": itemsList });
            this._renderer2.appendChild(this._document.head, s);
        }
        let currentQueryParams = this._activatedRoute.snapshot.queryParams;
        let currentRoute = this._commonService.getCurrentRoute(this._router.url);

        let pageCountQ = this.API_RESPONSE.brand[1][0].productSearchResult.totalCount / 10;
        let categoryLinkLists = this.API_RESPONSE.brand[1][0].categoryLinkList;


        let productCategoryNames = [];
        for (var key in categoryLinkLists) {
            if (categoryLinkLists.hasOwnProperty(key)) {
                productCategoryNames.push(key);
            }

        }
        let currentPageP = parseInt(currentQueryParams["page"]);

        if (pageCountQ > 1 && (currentPageP == 1 || isNaN(currentPageP))) {
            let links = this._renderer2.createElement('link');
            links.rel = "next";
            let href = CONSTANTS.PROD + currentRoute + '?page=2';
            if (qp && qp['category']) {
                href = href + "&category=" + encodeURIComponent((qp['category'].toLowerCase()));
            }
            links.href = href;
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
        if (this._localStorageService.retrieve('user')) {
            var user = this._localStorageService.retrieve('user');
        }
        let page = {}, custData = {}, order = {};
        let sParams = this._activatedRoute.snapshot.params;
        let trendingSearchData = {};
        this._activatedRoute.queryParams.subscribe(queryParams => {
            trendingSearchData = queryParams;
        });
        if (this._commonService.isBrowser) {
            if (this.API_RESPONSE['brand'][1][0].categoryName) {
                page = {
                    'pageName': "moglix:" + this._activatedRoute.snapshot.params.brand + ":" + sParams['category'] + ": listing",
                    'channel': "brand:category",
                    'subSection': "moglix:" + this._activatedRoute.snapshot.params.brand + ":" + sParams['category'] + ": listing " + this._commonService.getSectionClick().toLowerCase(),
                    'loginStatus': (user && user["authenticated"] == 'true') ? "registered user" : "guest"
                }
                custData = {
                    'customerID': (user && user["userId"]) ? btoa(user["userId"]) : '',
                    'emailID': (user && user["email"]) ? btoa(user["email"]) : '',
                    'mobile': (user && user["phone"]) ? btoa(user["phone"]) : '',
                    'customerType': (user && user["userType"]) ? user["userType"] : '',
                }
                order = {
                    'brand': this._activatedRoute.snapshot.params.brand,
                    'productCategory': sParams['category']
                }
            } else {
                page = {
                    'pageName': "moglix:" + this._activatedRoute.snapshot.params.brand + ": listing",
                    'channel': "brand",
                    'subSection': "moglix:" + this._activatedRoute.snapshot.params.brand + ": listing " + this._commonService.getSectionClick().toLowerCase(),
                    'loginStatus': (user && user["authenticated"] == 'true') ? "registered user" : "guest"
                }
                custData = {
                    'customerID': (user && user["userId"]) ? btoa(user["userId"]) : '',
                    'emailID': (user && user["email"]) ? btoa(user["email"]) : '',
                    'mobile': (user && user["phone"]) ? btoa(user["phone"]) : '',
                    'customerType': (user && user["userType"]) ? user["userType"] : '',
                }
                order = {
                    'brand': this._activatedRoute.snapshot.params.brand
                }
            }

            digitalData["page"] = page;
            digitalData["custData"] = custData;
            digitalData["order"] = order;

            if (trendingSearchData['tS'] && trendingSearchData['tS'] === 'no') {
                digitalData["page"]["trendingSearch"] = 'no';
                digitalData["page"]["suggestionClicked"] = 'no';
            }
            else if (trendingSearchData['tS'] && trendingSearchData['tS'] === 'yes') {
                digitalData["page"]["trendingSearch"] = 'yes';
                digitalData["page"]["suggestionClicked"] = 'yes';
            }

            if (trendingSearchData['sC'] && trendingSearchData['sC'] === 'no') {
                digitalData["page"]["trendingSearch"] = 'no';
                digitalData["page"]["suggestionClicked"] = 'no';
            }
            else if (trendingSearchData['sC'] && trendingSearchData['sC'] === 'yes') {
                digitalData["page"]["trendingSearch"] = 'no';
                digitalData["page"]["suggestionClicked"] = 'yes';
            }

            this._analytics.sendGTMCall({ 
                'event': 'viewBrand', 
                'brandName': this._activatedRoute.snapshot.params.brand,
                'brandUrl': window.location.origin + window.location.pathname
            });

            this._analytics.sendAdobeCall(digitalData);
            /*End Adobe Analytics Tags */
        }
        /* Setting of product schema for products */
        if (this._commonService.isServer) {
            const products = this.API_RESPONSE.brand[1][0].productSearchResult.products || [];
            if (products && products.length) {
                const categoryName = qp && qp['categoryName'];
                this.createProductsSchema(products, categoryName);
            }
        }
    }

    createProductsSchema(productArray, categoryName) {
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

    // setAmpTag(page) {
    //     if (this._commonService.isServer && this._commonService.selectedFilterData.page == 1) {
    //         const currentRoute = (this._router.url.split("?")[0].split("#")[0] as string).toLowerCase();
    //         const ampLink = this._renderer2.createElement('link');
    //         ampLink.rel = 'amphtml';
    //         ampLink.href = CONSTANTS.PROD + ((page == "brand") ? '/ampb' : '/ampcb') + currentRoute;
    //         this._renderer2.appendChild(this._document.head, ampLink);
    //     }
    // }

    setAdobeTrackingData(){
        if (this._commonService.isBrowser) {
            var trackingData = {
                event_type: "page_load",
                label: "view",
                channel: "Listing",
                page_type: "brand_page",
                brand: this.API_RESPONSE['brand'][0].brandName,
                filter_added: !!window.location.hash.substr(1) ? 'true' : 'false',
                product_count: this.API_RESPONSE['brand'][1][0].productSearchResult.totalCount
            }
            this._dataService.sendMessage(trackingData);
        }
    }

    handleIfBrandIsNotActive(){
        if (!this.API_RESPONSE.brand[0].active || this.API_RESPONSE.brand[1][0]['productSearchResult']['totalCount'] === 0) {
            if (this._commonService.isServer) {
                this._response.status(404);
            }
        }

        if (this.API_RESPONSE.brand[0].active) {
            this.setLinks();
        }
    }

    genrateProductSearchResultSEOData() {
        let productSearchResultSEO = [];
        for (let i = 0; i < this.API_RESPONSE.brand[1][0].productSearchResult.products.length && i < 10; i++) {
            if (this.API_RESPONSE.brand[1][0].productSearchResult.products[i].salesPrice > 0 && this.API_RESPONSE.brand[1][0].productSearchResult.products[i].priceWithoutTax > 0) {
                productSearchResultSEO.push(this.API_RESPONSE.brand[1][0].productSearchResult.products[i]);

            }
        }
        return productSearchResultSEO;
    }

    navigateTo(){
        this._router.navigateByUrl(window.location.pathname);
    }

    genrateAndUpdateBrandFooterData(){
        this.brandFooterData = {
            brandCatDesc: this.API_RESPONSE.brand[1][0].desciption,
            brandShortDesc: this.API_RESPONSE.brand[0].brandDesc,
            iba: this.API_RESPONSE.brand[0].active,
            firstPageContent: this._commonService.selectedFilterData.page < 2,
            productSearchResult: this.API_RESPONSE.brand[1][0].productSearchResult,
            productSearchResultSEO: this.genrateProductSearchResultSEOData(),
            heading: this.API_RESPONSE.brand[1][0].heading,
            productCount: this.API_RESPONSE.brand[1][0].productSearchResult.totalCount,
            brand: this.API_RESPONSE.brand[0].brandName,
            productCategoryNames: this.popularLinks,
            categoryLinkLists: this.API_RESPONSE.brand[1][0].categoryLinkList,
            categoryNames: this.popularLinks.toString(),
            todayDate: Date.now(),
            showDesc: !!(this.API_RESPONSE.brand[0].brandDesc)
        };
    }
}
