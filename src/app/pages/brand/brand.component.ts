import { AfterViewInit, Component, Inject, OnInit, Optional, Renderer2 } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
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
import { AccordiansDetails,AccordianDataItem } from '@app/utils/models/accordianInterface';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { AdsenseService } from '@app/utils/services/adsense.service';
import * as localization_en from '../../config/static-en';
import * as localization_hi from '../../config/static-hi';

let digitalData = {
    page: {},
    custData: {},
    order: {}
};

@Component({
    selector: 'data-brand',
    templateUrl: './brand.html',
    styleUrls: ['./brand.scss', '../category/category.scss', './../../components/homefooter-accordian/homefooter-accordian.component.scss'],
})

export class BrandComponent implements OnInit, AfterViewInit {
    encodeURI = encodeURI;
    public productListingData: ProductListingDataEntity;
    public cmsData: any[] = [];
    public API_RESPONSE: any;
    public popularLinks = [];
    public brandFooterData;
    baseDomain=CONSTANTS.PROD;
    accordiansDetails: AccordiansDetails[] = [];
    popularCategories = [];
    couponForbrandCategory: Object= null;
    informativeVideosData:any;    
    productStaticData = this._commonService.defaultLocaleValue;
    public adsenseData: any = null
    isAcceptLanguage = false;
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
        private _globalLoader: GlobalLoaderService,
        @Optional() @Inject(RESPONSE) private _response,
        private globalAnalyticsService: GlobalAnalyticsService,
        private _adsenseService: AdsenseService,
    ) {
        this._commonService.isHomeHeader = false;
        this._commonService.isPLPHeader = true;
    }


    ngOnInit(): void {
        this.initializeLocalization();
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

    initializeLocalization() {
        if ((this._router.url).includes("/hi/")) {
            this._commonService.defaultLocaleValue = localization_hi.product;
            this.productStaticData = localization_hi.product;
            this._commonService.changeStaticJson.next(this.productStaticData);
        } else {
            this._commonService.defaultLocaleValue = localization_en.product;
            this.productStaticData = localization_en.product;
            this._commonService.changeStaticJson.next(this.productStaticData);
        }
        this._commonService.changeStaticJson.asObservable().subscribe(localization_content => {
            this.productStaticData = localization_content;
        });
    }

    setDataFromResolver() {
        this._activatedRoute.data.subscribe(result => {
            // pass data to this genric data holder
            this.API_RESPONSE = result;

            this._productListService.excludeAttributes = [];

            // Total count
            this._commonService.selectedFilterData.totalCount = this.API_RESPONSE.brand[1][0].productSearchResult.totalCount;

            // create data for shared listing component
            this._productListService.createAndProvideDataToSharedListingComponent(this.API_RESPONSE['brand'][1][0], 'Brand Results');
            const isHindiUrl = this._router.url && (this._router.url).toLowerCase().indexOf('/hi/') !== -1 ? true : false;
            let brandName = this.API_RESPONSE.brand[1][0].brandName;
            this.isAcceptLanguage = this.API_RESPONSE['brand'][1][0]['acceptLanguage'] && this.API_RESPONSE['brand'][1][0]['acceptLanguage'].length ? true : false;
            if(isHindiUrl) {
                if(this.API_RESPONSE['brand'][1][0]['productSearchResult'] && this.API_RESPONSE['brand'][1][0]['productSearchResult']['totalCount'] > 0) {
                    brandName = this.API_RESPONSE['brand'][1][0]['productSearchResult']['products'][0]['brandName']
                }
            }
            this._productListService.getFilterBucket(this._activatedRoute.snapshot.params.id, 'BRAND', brandName, isHindiUrl).subscribe(res => {
                if (res.hasOwnProperty('buckets')) {
                    this.API_RESPONSE.brand[1][0].buckets = JSON.parse(JSON.stringify(res['buckets']));
                    this.API_RESPONSE.brand[1][0].priceRangeBuckets = JSON.parse(JSON.stringify(res['priceRangeBuckets']));
                    this._productListService.createAndProvideDataToSharedListingComponent(this.API_RESPONSE['brand'][1][0], 'Brand Results', true);

                    const category = this.API_RESPONSE.brand[1][0].buckets.find(c => c.name === 'category');
                    if (!this._activatedRoute.snapshot.params.category && category && category.hasOwnProperty('terms')) {
                        this.setPopularCategories(category.terms);
                    }


                    if (res.hasOwnProperty('categoryLinkList')) {
                        this.API_RESPONSE.brand[1][0].categoryLinkList = JSON.parse(JSON.stringify(res['categoryLinkList']));
                        // genrate popular links data
                        this.popularLinks = Object.keys(this.API_RESPONSE.brand[1][0].categoryLinkList || {});
                    }
                    // create accordians data
                    this.createFooterAccordianData();
                    // genrate data for footer
                    this.genrateAndUpdateBrandFooterData();
                }
            });

            //set youtube informative video data
            if (this.API_RESPONSE['brand'][1][0].categoryName &&
                this.API_RESPONSE['brand'][6] &&
                (this.API_RESPONSE['brand'][6].status == true) &&
                this.API_RESPONSE['brand'][6].data &&
                this.API_RESPONSE['brand'][6].data.length > 0) {
                this.informativeVideosData = this.API_RESPONSE['brand'][6].data
            }

            // handle if brand is not active or has zero product count
            this.handleIfBrandIsNotActive();
            // Send Adobe Tracking Data
            this.setAdobeTrackingData();
            // Set Amp tags
            // this.setAmpTag(this._activatedRoute.snapshot.params['category'] ? 'brand-category' : 'brand');

        });
    }

    private createFooterAccordianData() {
        this.accordiansDetails = [];
        this.accordiansDetails.push({
            name: this.productStaticData.accordian_list2_label,
            extra: this.API_RESPONSE['brand'][0].brandName,
            data: Object.entries(this.API_RESPONSE.brand[1][0].categoryLinkList).map(x => ({ name: this.API_RESPONSE['brand'][0].brandName+' '+x[0], link: x[1] }) as AccordianDataItem),
            icon:'icon-brand_store'
        });
        this.accordiansDetails.push({
            name: this.productStaticData.popular_categories,
            data: this.popularCategories?.map(e => ({ name: e.name, link: e.link }) as AccordianDataItem),
            icon:'icon-categories'
        });
        this.accordiansDetails.push({
            name: this.productStaticData.similar_category,
            data: this.API_RESPONSE.brand[2]?.mostSoledSiblingCategories?.map(e => ({ name: e.categoryName, link: e.categoryLink }) as AccordianDataItem),
            icon:'icon-categories'
        });
        this.accordiansDetails.push({
            name: this.productStaticData.accordian_list1_label,
            data: this.API_RESPONSE.brand[5]?.data?.map(e => ({ name: e.title, link: e.friendlyUrl }) as AccordianDataItem),
            icon:'icon-attribute'
        });
        this.accordiansDetails.push({
            name: this.productStaticData.related_brands,
            isNotVisible:!!this._activatedRoute.snapshot.params.category,
            data: this.API_RESPONSE.brand[3]?.searchBrandInfoList?.map(e => ({ name: e.brandName, link: e.brandLink }) as AccordianDataItem),
            icon:'icon-brand_store'
        });
    }

    setPopularCategories(data) {
        data.forEach(d => {
            let b = {};
            b['name'] = d['term'];
            b['link'] = d['categoryLink'];
            this.popularCategories.push(b);
            if (d && d.hasOwnProperty('childCategoryList') && d['childCategoryList'] && d['childCategoryList'].length > 0) {
                this.setPopularCategories(d['childCategoryList'])
            }
        });
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    get isHindiUrl() {
        return (this._router.url).toLowerCase().indexOf('/hi') !== -1
    }

    setLinks() {
        let qp = this._activatedRoute.snapshot.queryParams;
        let itemsList = [];
        //for null seo in brand only
        if(!this.API_RESPONSE.brand[0].seoDetails && (!this.API_RESPONSE['brand'][1][0].categoryName)){
            let title = this.productStaticData.buy + ' ' + this.API_RESPONSE.brand[1][0]["brandName"] + ' ' + this.productStaticData.buy_online +" - Moglix.com";
            this.title.setTitle(title);
            this.meta.addTag({ "name": "og:title", "content": title }); 
            
            let metaDescription = this.productStaticData.buy + " " + this.API_RESPONSE.brand[1][0]["brandName"] + " " + this.productStaticData.shop_online +' ' + this.API_RESPONSE.brand[1][0]["brandName"] + " " + this.productStaticData.brand_title;
            this.meta.addTag({ "name": "description", "content": metaDescription });
            this.meta.addTag({ "name": "og:description", "content": metaDescription });
        }
        //seo in brand only
        if (this.API_RESPONSE.brand[0].seoDetails?.title && (!this.API_RESPONSE['brand'][1][0].categoryName) ) {
            this.title.setTitle(this.API_RESPONSE.brand[0].seoDetails.title);
            this.meta.addTag({ "name": "og:title", "content": this.API_RESPONSE.brand[0].seoDetails.title });
        } else if(this.API_RESPONSE.brand[0].seoDetails && !this.API_RESPONSE.brand[0].seoDetails.title && (!this.API_RESPONSE['brand'][1][0].categoryName) ) {
            let title = this.productStaticData.buy + ' ' + this.API_RESPONSE.brand[1][0]["brandName"] + ' ' + this.productStaticData.buy_online +" - Moglix.com";
            this.title.setTitle(title);
            this.meta.addTag({ "name": "og:title", "content": title });
        }
        
        if (this.API_RESPONSE.brand[0].seoDetails?.metaDescription && (!this.API_RESPONSE['brand'][1][0].categoryName)) {
            this.meta.addTag({ "name": "description", "content": this.API_RESPONSE.brand[0].seoDetails.metaDescription });
            this.meta.addTag({ "name": "og:description", "content": this.API_RESPONSE.brand[0].seoDetails.metaDescription });
        } else if(this.API_RESPONSE.brand[0].seoDetails && !this.API_RESPONSE.brand[0].seoDetails.metaDescription && (!this.API_RESPONSE['brand'][1][0].categoryName) ){
            let metaDescription = this.productStaticData.buy + " " + this.API_RESPONSE.brand[1][0]["brandName"] + this.productStaticData.shop_online + " " + this.API_RESPONSE.brand[1][0]["brandName"] + " " + this.productStaticData.brand_title;
            this.meta.addTag({ "name": "description", "content": metaDescription });
            this.meta.addTag({ "name": "og:description", "content": metaDescription });
        }
        //seo in brand+category
        if (this.API_RESPONSE['brand'][1][0]?.categoryName && this.API_RESPONSE.brand[1][0].title && this.API_RESPONSE.brand[1][0].metaDesciption) {
            this.title.setTitle(this.API_RESPONSE.brand[1][0].title);
            this.meta.addTag({ "name": "og:title", "content": this.API_RESPONSE.brand[1][0].title });

            let metaDescription = this.API_RESPONSE.brand[1][0].metaDesciption;
            this.meta.addTag({ "name": "description", "content": metaDescription });
            this.meta.addTag({ "name": "og:description", "content": metaDescription });
        }
        //for null seo in brand+category 
        if (this.API_RESPONSE['brand'][1][0].categoryName && !this.API_RESPONSE.brand[1][0].metaDesciption) {

            if(!this.API_RESPONSE.brand[0].seoDetails){
                let title = this.productStaticData.buy + " " + this.API_RESPONSE.brand[1][0]["brandName"] + ' ' + this.productStaticData.buy_online +" - Moglix.com";
                this.title.setTitle(title);
                this.meta.addTag({ "name": "og:title", "content": title }); 
                
                let metaDescription = this.productStaticData.buy + " " + this.API_RESPONSE.brand[1][0]["brandName"] + " " + this.productStaticData.shop_online +' ' + this.API_RESPONSE.brand[1][0]["brandName"] + " " + this.productStaticData.brand_title;
                this.meta.addTag({ "name": "description", "content": metaDescription });
                this.meta.addTag({ "name": "og:description", "content": metaDescription });
            }
            if (this.API_RESPONSE.brand[0].seoDetails?.title) {
                this.title.setTitle(this.API_RESPONSE.brand[0].seoDetails.title);
                this.meta.addTag({ "name": "og:title", "content": this.API_RESPONSE.brand[0].seoDetails.title });
            } else {
                let title = this.productStaticData.buy + " " + this.API_RESPONSE.brand[1][0]["brandName"] + ' ' + this.productStaticData.buy_online +" - Moglix.com";
                this.title.setTitle(title);
                this.meta.addTag({ "name": "og:title", "content": title });
            }
            
            if (this.API_RESPONSE.brand[0].seoDetails?.metaDescription) {
                this.meta.addTag({ "name": "description", "content": this.API_RESPONSE.brand[0].seoDetails.metaDescription });
                this.meta.addTag({ "name": "og:description", "content": this.API_RESPONSE.brand[0].seoDetails.metaDescription });
            } else {
                let metaDescription = this.productStaticData.buy + " " + this.API_RESPONSE.brand[1][0]["brandName"] + " " + this.productStaticData.shop_online +' ' + this.API_RESPONSE.brand[1][0]["brandName"] + " " + this.productStaticData.brand_title;
                this.meta.addTag({ "name": "description", "content": metaDescription });
                this.meta.addTag({ "name": "og:description", "content": metaDescription });
            }
            
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
                            "@id": CONSTANTS.PROD + '/brands/' + this.API_RESPONSE.brand[0].friendlyUrl,
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
        if(this.isAcceptLanguage) {
            const currentRoute = this._router.url.split('?')[0].split('#')[0];
            const languagelink = this._renderer2.createElement("link");
            languagelink.rel = "alternate";
            if (this._activatedRoute.snapshot.queryParams.page == undefined || this._activatedRoute.snapshot.queryParams.page == 1) {
                languagelink.href = this.isHindiUrl ? CONSTANTS.PROD + currentRoute.toLowerCase() : CONSTANTS.PROD +  '/hi' + currentRoute.toLowerCase();
            } else {
                languagelink.href = this.isHindiUrl ? CONSTANTS.PROD + currentRoute.toLowerCase() : CONSTANTS.PROD + '/hi' + currentRoute.toLowerCase(); + "?page=" + this._activatedRoute.snapshot.queryParams.page;
            }
            // languagelink.href = CONSTANTS.PROD + this.isHindiUrl ? CONSTANTS.PROD + this._router.url : '/hi/' + this._router.url;
            languagelink.hreflang = 'hi-in';
            this._renderer2.appendChild(this._document.head, languagelink);
    
            const elanguagelink = this._renderer2.createElement("link");
            elanguagelink.rel = "alternate";
            if (this._activatedRoute.snapshot.queryParams.page == undefined || this._activatedRoute.snapshot.queryParams.page == 1) {
                elanguagelink.href = !this.isHindiUrl ? CONSTANTS.PROD + currentRoute.toLowerCase() : CONSTANTS.PROD + currentRoute.toLowerCase().replace('/hi', '');
            } else {
                elanguagelink.href = !this.isHindiUrl ? CONSTANTS.PROD + currentRoute.toLowerCase() : CONSTANTS.PROD + currentRoute.toLowerCase().replace('/hi', ''); + "?page=" + this._activatedRoute.snapshot.queryParams.page;
            }
            elanguagelink.hreflang = 'en'
            this._renderer2.appendChild(this._document.head, elanguagelink);
            if (this._commonService.isBrowser) {
                this.isHindiUrl ? document.documentElement.setAttribute("lang", 'hi') : document.documentElement.setAttribute("lang", 'en');
            }
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
                custData = this._commonService.custDataTracking
                order = {
                    'brand': this._activatedRoute.snapshot.params.brand,
                    'productCategory': sParams['category']
                }
            } else {
                page = {
                    'pageName': "moglix:" + this._activatedRoute.snapshot.params.brand + ": listing",
                    'channel': "brand",
                    'subSection': "moglix:" + this._activatedRoute.snapshot.params.brand + ": listing " + this._commonService.getSectionClick().toLowerCase(),
                    'totalProductCount':this._productListService?.productListingData.totalCount,
                    'loginStatus': (user && user["authenticated"] == 'true') ? "registered user" : "guest",
                }
                custData = this._commonService.custDataTracking
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
            if(this._activatedRoute.snapshot.params.brand) {
                this._analytics.sendGTMCall({
                    'event': 'viewBrand',
                    'brandName': this._activatedRoute.snapshot.params.brand,
                    'brandUrl': window.location.origin + window.location.pathname
                });
            }

            this._analytics.sendAdobeCall(digitalData);
            /*End Adobe Analytics Tags */
        }
        /* Setting of product schema for products */
        if (!this._commonService.isServer) {
            const products = this.API_RESPONSE.brand[1][0].productSearchResult.products || [];
            if (products && products.length) {
                const categoryName = qp && qp['categoryName'];
                this.createProductsSchema(products, categoryName);
            }
        }
    }

    createProductsSchema(productArray, categoryName) {
        if (!this._commonService.isServer) {
            if (productArray.length > 0) {
                const productList = [];
                productArray.forEach((product, index) => {
                    productList.push({
                        "@type": "ListItem",
                        "position": index + 1,
                        "url": !this.isHindiUrl ? CONSTANTS.PROD + '/' + product.productUrl : CONSTANTS.PROD + '/hi/' + product.productUrl,
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

    setAdobeTrackingData() {
        // console.log('setAdobeTrackingData', 'nrand called');
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
            this.globalAnalyticsService.sendMessage(trackingData);
        }
    }

    handleIfBrandIsNotActive() {
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

    navigateTo() {
        this._router.navigateByUrl(window.location.pathname);
    }

    genrateAndUpdateBrandFooterData() {
        this.brandFooterData = {
            brandCatDesc: this.API_RESPONSE.brand[1][0].desciption,
            brandShortDesc: this.API_RESPONSE.brand[0].brandDesc,
            iba: this.API_RESPONSE.brand[0].active,
            firstPageContent: this._commonService.selectedFilterData.page < 2,
            productSearchResult: this.API_RESPONSE.brand[1][0].productSearchResult,
            productSearchResultSEO: this.genrateProductSearchResultSEOData(),
            heading: this.API_RESPONSE.brand[1][0].heading || this.API_RESPONSE['brand'][0].brandName,
            productCount: this.API_RESPONSE.brand[1][0].productSearchResult.totalCount,
            brand: this.API_RESPONSE.brand[0].brandName,
            productCategoryNames: this.popularLinks,
            categoryLinkLists: this.API_RESPONSE.brand[1][0].categoryLinkList,
            categoryNames: JSON.parse(JSON.stringify(this.popularLinks)).toString(),
            todayDate: Date.now(),
            showDesc: !!(this.API_RESPONSE.brand[0].brandDesc)
        };
    }

    ngAfterViewInit() {
        this.couponOnBrandCategory();
        this.getAdsenseData();
    }

    private getAdsenseData() {
        if (
            this.API_RESPONSE &&
            this.API_RESPONSE['brand'] &&
            this.API_RESPONSE['brand'][0] &&
            this.API_RESPONSE['brand'][0]['friendlyUrl']
        ) {
            const categoryId = this._activatedRoute.snapshot.params['category'] || null;
            const brandId = this.API_RESPONSE['brand'][0].idBrand || null;
            this._adsenseService.getAdsense(categoryId, brandId).subscribe(adsenseData => this.adsenseData = adsenseData)
        }
    }

    couponOnBrandCategory() {
        if (this._activatedRoute.snapshot.params.brand && this._activatedRoute.snapshot.params.category) {
            this._globalLoader.setLoaderState(true);
            this._dataService.getCouponOnBrandCategory(this.API_RESPONSE['brand'][0].brandName, this._activatedRoute.snapshot.params.category).subscribe(response => {
                if (response['statusCode'] == 200 && response['data'] != null) {
                    this.couponForbrandCategory = response['data'];
                } else {
                    this.couponForbrandCategory = null;
                }
                this._globalLoader.setLoaderState(false)
            })
        }
    }
}
