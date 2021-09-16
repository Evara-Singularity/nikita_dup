import { Component, ComponentFactoryResolver, Inject, Injector, Optional, Renderer2, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CONSTANTS } from '@app/config/constants';
import { CategoryService } from '@app/utils/services/category.service';
import { CommonService } from '@app/utils/services/common.service';
import { ProductListService } from '@app/utils/services/productList.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { FooterService } from '@app/utils/services/footer.service';
import { Meta, Title } from '@angular/platform-browser';
import { RESPONSE } from '@nguniversal/express-engine/tokens';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { DataService } from '@app/utils/services/data.service';
import { LocalStorageService } from 'ngx-webstorage';

let digitalData = {
    page: {},
    custData: {},
    order: {}
};

const slpPagesExtrasIdMap = { "116111700": "116111700", "114160000": "114160000", "211521500": "211521500", "114132500": "114132500" };

@Component({
    selector: 'category',
    templateUrl: './category.html',
    styleUrls: ['./category.scss'],
})

export class CategoryComponent {
    encodeURI = encodeURI;
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
    public API_RESPONSE: any;

    reqArray: any[] = [];
    popularLinks: any[] = [];
    wantedBucket: any[] = [];
    categoryFooterData: any;
    productRangeTableArray: any[] = [];

    constructor(
        public _router: Router,
        private injector: Injector,
        private _renderer2: Renderer2,
        @Inject(DOCUMENT) private _document,
        public _footerService: FooterService,
        private _analytics: GlobalAnalyticsService,
        private _localStorageService: LocalStorageService,
        private _dataService: DataService,
        private _title: Title,
        @Optional() @Inject(RESPONSE) private _response,
        public _commonService: CommonService,
        private _activatedRoute: ActivatedRoute,
        private meta: Meta, 
        private _categoryService: CategoryService,
        public _productListService: ProductListService,
        private _componentFactoryResolver: ComponentFactoryResolver,
    ) { }

    ngOnInit(): void {
        this.setDataFromResolver();

        if (this._commonService.isBrowser) {
            this._footerService.setMobileFoooters();
        }
    }

    setDataFromResolver() {
        this._activatedRoute.data.subscribe(result => {

            // set API result data
            this.API_RESPONSE = result;
            console.log(this.API_RESPONSE);
            
            if (this.cmsInstance) {
                this.cmsInstance.instance['cmsData'] = this.API_RESPONSE.category[4];
            }

            // Set Title and Meta for category
            this.setTitleAndMetaForCategory();

            // if this PLP is active and perform some tasks like fire tags
            this.checkIfThisCategoryIsActive();

            // static components updates
            this.updateComponentsBasedOnrouteChange();

            // create Schema for PLP category products
            this.createCategorySchema(this.API_RESPONSE.category[1].productSearchResult['products']);

            // create FAQ section schema
            this.setFaqSchema(this.API_RESPONSE.category[2]);

            // genrate popular links data
            this.popularLinks = Object.keys(this.API_RESPONSE.category[1].categoryLinkList);

            // Update total product account
            this._commonService.selectedFilterData.totalCount = this.API_RESPONSE['category'][1].productSearchResult.totalCount;

            // shared product listing data update
            this._productListService.createAndProvideDataToSharedListingComponent(this.API_RESPONSE['category'][1], 'Category Results');

            // update footer data
            this.genrateAndUpdateCategoryFooterData();

            this.setCanonicalUrls();

            // send tracking data 
            this.sendTrackingData();        
        });
    }

    private setCanonicalUrls() {
        const currentRoute = this._router.url.split('?')[0].split('#')[0];

        if (this._commonService.isServer) {
            const links = this._renderer2.createElement('link');
            links.rel = 'canonical';
            if (this._activatedRoute.snapshot.queryParams.page == undefined || this._activatedRoute.snapshot.queryParams.page == 1) {
                links.href = CONSTANTS.PROD + currentRoute.toLowerCase();
            } else {
                links.href = CONSTANTS.PROD + currentRoute.toLowerCase() + "?page=" + this._activatedRoute.snapshot.queryParams.page;
            }
            this._renderer2.appendChild(this._document.head, links);
        }

        const currentQueryParams = this._activatedRoute.snapshot.queryParams;
        const pageCountQ = this.API_RESPONSE['category'][1].productSearchResult.totalCount / 10;
        const currentPageP = parseInt(currentQueryParams['page']);

        if (pageCountQ > 1 && (currentPageP === 1 || isNaN(currentPageP))) {
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

    sendTrackingData() {
        if (this._commonService.isBrowser) {
            let taxonomy = this.API_RESPONSE['category'][0]["categoryDetails"]['taxonomy'];
            let trackData = {
                event_type: "page_load",
                label: "view",
                product_count: this.API_RESPONSE['category'][1]["productSearchResult"]["totalCount"],
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
            this._dataService.sendMessage(trackData);
        }
    }

    private setFaqSchema(faqData) {
        if (this._commonService.isServer) {
            const data:any[] = (faqData['data'] as any[]);
            if (data.length > 0) {
                const qaSchema = [];
                data.forEach((element, index) => {
                    qaSchema.push({
                        "@type": "Question",
                        "name": element.questionText,
                        "acceptedAnswer":
                        {
                            "@type": "Answer",
                            "text": element.answerText
                        }

                    });

                })
                let qna = this._renderer2.createElement('script');
                qna.type = "application/ld+json";
                qna.text = JSON.stringify({ "@context": CONSTANTS.SCHEMA, "@type": "FAQPage", "mainEntity": qaSchema });
                this._renderer2.appendChild(this._document.head, qna);
            }
        }
    }

    handleZeroProductListOnServer() {
        if (this._commonService.isServer) {
            let httpStatus = 404;
            if (this.API_RESPONSE.category[0]['httpStatus']) {
                httpStatus = this.API_RESPONSE.category[0]['httpStatus'];
            } else if (this.API_RESPONSE.category[1]['httpStatus']) {
                httpStatus = this.API_RESPONSE.category[1]['httpStatus'];
            }
            this._response.status(httpStatus);
        }
    }

    checkIfThisCategoryIsActive(){
        if (!this.API_RESPONSE.category[0]['categoryDetails']['active'] || this.API_RESPONSE.category[1]['productSearchResult']['totalCount'] === 0) {
            
            this.handleZeroProductListOnServer();
        } else if (this.API_RESPONSE.category[0]['categoryDetails']['active']) {

            if (this.API_RESPONSE.category[1]['productSearchResult']['totalCount'] > 0 && this._commonService.isBrowser) {
                this.fireTags();
            }
        }
    }

    fireTags() {
        /**************************GTM START*****************************/
        let cr: any = this._router.url.replace(/\//, ' ').replace(/-/g, ' ');
        cr = cr.split('/');
        cr.splice(cr.length - 1, 1);

        cr = cr.join('/');
        const gaGtmData = this._commonService.getGaGtmData();
        const psrp = this.API_RESPONSE.category[1].productSearchResult.products;

        const dlp = [];
        const criteoItem = [];
        for (let p = 0; p < this.API_RESPONSE.category[1].productSearchResult.products.length; p++) {
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

            let user;
            if (this._localStorageService.retrieve('user')) {
                user = this._localStorageService.retrieve('user');
            }
            this._analytics.sendGTMCall({
                'event': 'pr-impressions',
                'ecommerce': {
                    'currencyCode': 'INR', // Local currency is optional.
                    'impressions': dlp,
                },
            });

            const google_tag_params = {
                ecomm_prodid: '',
                ecomm_pagetype: 'category',
                ecomm_totalvalue: ''
            };

            this._analytics.sendGTMCall({
                'event': 'dyn_remk',
                'ecomm_prodid': google_tag_params.ecomm_prodid,
                'ecomm_pagetype': google_tag_params.ecomm_pagetype,
                'ecomm_totalvalue': google_tag_params.ecomm_totalvalue,
                'google_tag_params': google_tag_params
            });

            /*Start Criteo DataLayer Tags */

            this._analytics.sendGTMCall({
                'event': 'viewList',
                'email': (user && user.email) ? user.email : '',
                'ProductIDList': criteoItem,
                'CategoryId': this.API_RESPONSE.category[0].categoryDetails.taxonomy,
                'CategoryName': this.API_RESPONSE.category[0].categoryDetails.canonicalURL
            });

            /*End Criteo DataLayer Tags */

            let taxo1;
            let taxo2;
            let taxo3;
            /*Start Adobe Analytics Tags */
            if (this.API_RESPONSE.category[0].categoryDetails.taxonomy) {
                taxo1 = this.API_RESPONSE.category[0].categoryDetails.taxonomy.split("/")[0] || '';
                taxo2 = this.API_RESPONSE.category[0].categoryDetails.taxonomy.split("/")[1] || '';
                taxo3 = this.API_RESPONSE.category[0].categoryDetails.taxonomy.split("/")[2] || '';
            }
            let page = {
                'pageName': "moglix:" + taxo1 + ":" + taxo2 + ":" + taxo3 + ": listing",
                'channel': "listing",
                'subSection': "moglix:" + taxo1 + ":" + taxo2 + ":" + taxo3 + ": listing " + this._commonService.getSectionClick().toLowerCase(),
                'loginStatus': (user && user["authenticated"] == 'true') ? "registered user" : "guest"
            }
            let custData = {
                'customerID': (user && user["userId"]) ? btoa(user["userId"]) : '',
                'emailID': (user && user["email"]) ? btoa(user["email"]) : '',
                'mobile': (user && user["phone"]) ? btoa(user["phone"]) : '',
                'customerType': (user && user["userType"]) ? user["userType"] : '',
            }
            let order = {
                'productCategoryL1': taxo1,
                'productCategoryL2': taxo2,
                'productCategoryL3': taxo3            
            }

            
            digitalData["page"] = page;
            digitalData["custData"] = custData;
            digitalData["order"] = order;

            if (this._activatedRoute.snapshot.queryParams['tS'] && this._activatedRoute.snapshot.queryParams['tS'] === 'no') {
                digitalData["page"]["trendingSearch"] = 'no';
                digitalData["page"]["suggestionClicked"] = 'no';
            }
            else if (this._activatedRoute.snapshot.queryParams['tS'] && this._activatedRoute.snapshot.queryParams['tS'] === 'yes') {
                digitalData["page"]["trendingSearch"] = 'yes';
                digitalData["page"]["suggestionClicked"] = 'yes';
            }

            if (this._activatedRoute.snapshot.queryParams['sC'] && this._activatedRoute.snapshot.queryParams['sC'] === 'no') {
                digitalData["page"]["trendingSearch"] = 'no';
                digitalData["page"]["suggestionClicked"] = 'no';
            }
            else if (this._activatedRoute.snapshot.queryParams['sC'] && this._activatedRoute.snapshot.queryParams['sC'] === 'yes') {
                digitalData["page"]["trendingSearch"] = 'no';
                digitalData["page"]["suggestionClicked"] = 'yes';
            }
            this._analytics.sendAdobeCall(digitalData);
            /*End Adobe Analytics Tags */
        
    }

    setTitleAndMetaForCategory(){
        let title = (this.API_RESPONSE.category[0].categoryDetails.metaTitle != undefined && this.API_RESPONSE.category[0].categoryDetails.metaTitle != null && this.API_RESPONSE.category[0].categoryDetails.metaTitle != "") ? this.API_RESPONSE.category[0].categoryDetails.metaTitle : "Buy " + this.API_RESPONSE.category[0].categoryDetails.categoryName + " Online at Best Price in India - Moglix.com";
        let metaDescription = (this.API_RESPONSE.category[0].categoryDetails.metaDescription != undefined && this.API_RESPONSE.category[0].categoryDetails.metaDescription != null && this.API_RESPONSE.category[0].categoryDetails.metaDescription != "") ? this.API_RESPONSE.category[0].categoryDetails.metaDescription : "Shop online for " + this.API_RESPONSE.category[0].categoryDetails.categoryName + " at best prices now! Moglix is a one stop shop for genuine " + this.API_RESPONSE.category[0].categoryDetails.categoryName + ". Cash on delivery, Free shipping available.";
        this.meta.addTag({ 'name': 'description', 'content': metaDescription });
        this.meta.addTag({ 'name': 'og:title', 'content': title });
        this.meta.addTag({ 'name': 'og:description', 'content': metaDescription });
        this.meta.addTag({ 'name': 'og:url', 'content': CONSTANTS.PROD + this._router.url });
        this.meta.addTag({
            'name': 'keywords',
            'content': this.API_RESPONSE.category[0].categoryDetails.categoryName + ', ' + this.API_RESPONSE.category[0].categoryDetails.categoryName + ' online, buy ' + this.API_RESPONSE.category[0].categoryDetails.categoryName + ', industrial ' + this.API_RESPONSE.category[0].categoryDetails.categoryName
        });

        if (this.API_RESPONSE.category[1]['productSearchResult']['products'] && this.API_RESPONSE.category[1]['productSearchResult']['products'].length > 0) {
            this.meta.addTag({ 'name': 'robots', 'content': (this._activatedRoute.snapshot.queryParams["page"] && parseInt(this._activatedRoute.snapshot.queryParams["page"]) > 1) ? CONSTANTS.META.ROBOT1 : CONSTANTS.META.ROBOT });
        } else {
            this.meta.addTag({ 'name': 'robots', 'content': CONSTANTS.META.ROBOT2 });
        }

        this._title.setTitle(title);
    }

    isUrlEqual(url1: string, url2: string): boolean {
        if (url2.indexOf(url1) !== -1) {
            return true;
        }
        return false;
    }

    genrateAndUpdateCategoryFooterData() {
        this.categoryFooterData = {
            productSearchResult: this.API_RESPONSE.category[1].productSearchResult,
            getRelatedCatgory: this.API_RESPONSE.category[0],
            productSearchResultSEO: this.genrateProductSearchResultSEOData(),
            faqData: this.API_RESPONSE.category[2]['data'],
            buckets: this.API_RESPONSE.category[1].buckets,
            PRTA: this.genrateProductRangeTable()
        };
    }

    genrateProductRangeTable() {
        this.priceRangeTable(this.API_RESPONSE.category[1]);
        return this.productRangeTableArray;
    }

    /* 
     *  In this method condition is checked that if all products  have 0 quantity available, ie all products are "Available on request" then price table code is not proceeded , inversaly it proceeds.
     */
    priceRangeTable(res) {
        let count = 0;
        for (let val of res.productSearchResult.products) {
            if (val.quantityAvailable === 0) {
                count++;
            }
        }
        if (count !== res.productSearchResult.products.length) {
            this.getBucketForPriceRangeTable(JSON.parse(JSON.stringify(res['priceRangeBuckets'] ? res['priceRangeBuckets'] : res['buckets'])));
        }
    }

    /* 
   * excluding data that we don't want to add to price range table , from buckets we get from getCategory Api
   */

    getBucketForPriceRangeTable(buckets: any) {
        for (let i = 0; i < buckets.length; i++) {
            if (buckets[i].name !== "price" &&
                buckets[i].name !== "discount" &&
                buckets[i].name !== "badges" &&
                buckets[i].name !== "availability") {
                this.wantedBucket.push(buckets[i]); //wb(wanted bucket)
            }
        }

        this.productRangeTableArray = [];                        //PRTA(Product Range Table Array):-array which stores final data after computation , is reset for when component is instantiated again
        this.priceRangeData();               //proceeding calculations
        this.wantedBucket = [];                          //wb(wanted bucket):-array which stores bucket data excluding price , discount , badges , availability.
    }

    priceRangeData() {
        let temp = [];
        if (this.wantedBucket.length > 0) {
            for (let i = 0; i < this.wantedBucket.length; i++) {

                /*
                *to get category data in price range table
                */

                if (this.wantedBucket[i].name === "category") {
                    this.getCategoryData(this.wantedBucket[i].terms);                // calling reccursive function to find out specific page category data
                    if (this.reqArray !== null) {
                        for (let val of this.reqArray) {                       // added "newName" to value we got from "getCategoryData" , to tackle difficulty faced in getting "other custom filters"(below)
                            val.newName = val.term
                        }
                        temp = this.reqArray;
                    }

                    for (let i = 0; i < temp.length && this.productRangeTableArray.length < 4; i++) {   //getting top four values with non-zero min , max price 
                        if (temp[i].minPrice > 0 && temp[i].maxPrice > 0) {
                            this.productRangeTableArray.push(temp[i])
                        }
                    }
                    this.productRangeTableArray.filter(x => !!x)                               //removing null values from array
                    temp = [];
                }


                /* 
                *to get brand data in price range table
                */

                else if (this.wantedBucket[i].name === "brand") {
                    let temp = [];
                    for (let j = 0; j < this.wantedBucket[i].terms.length && temp.length < 4; j++) {                                                      //getting top four values with non-zero min , max price 
                        if (this.wantedBucket[i].terms[j].minPrice > 0 && this.wantedBucket[i].terms[j].maxPrice > 0) {
                            this.wantedBucket[i].terms[j].term = this.wantedBucket[i].terms[j].term + " " + this.API_RESPONSE.category[0].categoryDetails.categoryName;
                            temp.push(this.wantedBucket[i].terms[j]);
                        }
                    }
                    if (temp.length !== 0) {
                        for (let val of temp) {                                                                                           //added "newName" to value we got from "getCategoryData" , to tackle difficulty faced in getting "other custom filters"(below) 
                            val.newName = val.term
                            this.productRangeTableArray.push(val);
                        }
                    }
                    this.productRangeTableArray.filter(x => !!x)                                                                                        //removing null values from array
                    temp = [];
                }

                /* 
                *to get other filter data in price range table
                */

                else {
                    let str = ""
                    let temp = [];
                    for (let j = 0; j < this.wantedBucket[i].terms.length && temp.length < 4; j++) {                                                        //getting top four values with non-zero min , max price for each "other filters"
                        if (this.wantedBucket[i].terms[j].minPrice > 0 && this.wantedBucket[i].terms[j].maxPrice > 0) {
                            this.wantedBucket[i].terms[j].newName = "";
                            str = this.wantedBucket[i].name + " - " + this.wantedBucket[i].terms[j].term + " " + this.API_RESPONSE.category[0].categoryDetails.categoryName;
                            this.wantedBucket[i].terms[j].newName = this.camalize(str);
                            temp.push(this.wantedBucket[i].terms[j]);
                        }
                    }
                    if (temp.length !== 0) {
                        for (let val of temp) {
                            this.productRangeTableArray.push(val);
                        }
                    }
                    this.productRangeTableArray.filter(x => !!x)
                    temp = [];                                                                                                              //removing null values from PRTA
                }
            }
        }
    }

    /*
     *  Reccursive function to find out specific page category data .
     */

    getCategoryData(obj: any[]) {
        for (let i = 0; i < obj.length; i++) {
            if (obj[i].term === this.API_RESPONSE.category[0].categoryDetails.categoryName) {
                this.reqArray = obj[i].childCategoryList;                              //Base condition.
                break;
            }
            else if (obj[i].childCategoryList !== null) {
                obj = obj[i].childCategoryList;
                this.getCategoryData(obj);
            }
        }
    }

    camalize(str) {
        return str.toLowerCase().replace(/^\w|\s\w/g, function (letter) {
            return letter.toUpperCase();
        }
        );
    }

    genrateProductSearchResultSEOData() {
        let productSearchResultSEO = [];
        for (let i = 0; i < this.API_RESPONSE.category[1].productSearchResult.products.length && i < 10; i++) {
            if (this.API_RESPONSE.category[1].productSearchResult.products[i].salesPrice > 0 && this.API_RESPONSE.category[1].productSearchResult.products[i].priceWithoutTax > 0) {
                productSearchResultSEO.push(this.API_RESPONSE.category[1].productSearchResult.products[i]);

            }
        }
        return productSearchResultSEO;
    }

    isSLPPage: boolean = false;
    layoutType: number = 0;
    page_title: string = '';
    catStaticData: any;
    catBestsellerData: any;
    shopbyFeatrData: any;
    shopByBrandData: any;

    private updateComponentsBasedOnrouteChange() {
        const params = this._activatedRoute.snapshot.params;
        
        if (!this.subCategoryInstance) {
            this.createDynamicComponent('subCategory');
        } else {
            this.subCategoryInstance.instance.relatedCatgoryList = this.API_RESPONSE.category[0].children;
            this.subCategoryInstance.instance.initializeSubcategoryData(this.API_RESPONSE.category[0].children);
        }

        this.layoutType = 0;
        if (params && params.id && slpPagesExtrasIdMap.hasOwnProperty(params.id)) {
            this.isSLPPage = true;
            this.getExtraCategoryData(params).subscribe((data) => {

                this.layoutType = data['layoutType'];
                if (this.API_RESPONSE.category[0].children && this.layoutType == 2) {
                    if (this.slpSubCategoryInstance) {
                        this.slpSubCategoryInstance.instance['sub_category_Data'] = this.API_RESPONSE.category[0].children;
                    } else {
                        this.createDynamicComponent('slpSubCategory');
                    }
                } else {
                    if (this.slpSubCategoryInstance) {
                        this.slpSubCategoryInstance = null;
                        this.slpSubCategoryContainerRef.remove();
                    }
                }

                this.page_title = data['pageTitle'];

                if (data['data'][0].block_data.brand_block) {
                    this.shopByBrandData = data['data'][0].block_data.brand_block;
                    if (this.shopByBrandInstance) {
                        this.shopByBrandInstance.instance['brand_Data'] = this.shopByBrandData;
                    } else {
                        this.createDynamicComponent('shopByBrand');
                    }
                } else {
                    if (this.shopByBrandInstance) {
                        this.shopByBrandInstance = null;
                        this.shopByBrandContainerRef.remove();
                    }
                }

                if (data['data'][0].block_data.product_data) {
                    this.catBestsellerData = data['data'][0].block_data.product_data;
                    if (this.catBestSellerInstance) {
                        this.catBestSellerInstance.instance['bestSeller_Data'] = this.catBestsellerData;
                    } else {
                        this.createDynamicComponent('catBestseller');
                    }
                } else {
                    if (this.catBestSellerInstance) {
                        this.catBestSellerInstance = null;
                        this.catBestSellerContainerRef.remove();
                    }
                }

                if (data['data'][0].block_data.image_block) {
                    this.shopbyFeatrData = data['data'][0].block_data.image_block;
                    if (this.shopbyFeatrInstance) {
                        this.shopbyFeatrInstance.instance['shopBy_Data'] = this.shopbyFeatrData;
                    } else {
                        this.createDynamicComponent('shopbyFeatr');
                    }
                } else {
                    if (this.shopbyFeatrInstance) {
                        this.shopbyFeatrInstance = null;
                        this.shopbyFeatrContainerRef.remove();
                    }
                }

                if (data['data'][0].block_data.general_block) {
                    this.catStaticData = data['data'][0].block_data.general_block;
                    if (this.catStaticInstance) {
                        this.catStaticInstance.instance['page_title'] = this.page_title;
                        this.catStaticInstance.instance['static_data'] = this.catStaticData;
                    } else {
                        this.createDynamicComponent('catStatic');
                    }

                } else {
                    if (this.catStaticInstance) {
                        this.catStaticInstance = null;
                        this.catStaticContainerRef.remove();
                    }
                }

            });
        } else {
            this.isSLPPage = false;
        }
    }

    createCategorySchema(productArray) {
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
                    "name": this.API_RESPONSE.category[0].categoryDetails.categoryName,
                    "itemListElement": productList
                }
                let s = this._renderer2.createElement('script');
                s.type = "application/ld+json";

                s.text = JSON.stringify(schemaObj);
                this._renderer2.appendChild(this._document.head, s);
            }
        }
    }

    getExtraCategoryData(data): Observable<{}> {
        return this._categoryService.getCategoryExtraData(slpPagesExtrasIdMap[data.id]);
    }

    async createDynamicComponent(name) {
        if (this._commonService.isBrowser) {
            if (name === 'catBestseller' && !this.catBestSellerInstance) {
                const { CatBestsellerComponent } = await import('@components/cat-bestseller/cat-bestseller.component');
                const factory = this._componentFactoryResolver.resolveComponentFactory(CatBestsellerComponent);
                this.catBestSellerInstance = this.catBestSellerContainerRef.createComponent(factory, null, this.injector);
                this.catBestSellerInstance.instance['bestSeller_Data'] = this.catBestsellerData;
            } else if (name === 'subCategory' && !this.subCategoryInstance) {
                const { SubCategoryComponent } = await import('@components/subCategory/subCategory.component');
                const factory = this._componentFactoryResolver.resolveComponentFactory(SubCategoryComponent);
                this.subCategoryInstance = this.subCategoryContainerRef.createComponent(factory, null, this.injector);
                this.subCategoryInstance.instance['relatedCatgoryList'] = this.API_RESPONSE.category[0].children;
            } else if (name === 'shopByBrand' && !this.shopByBrandInstance) {
                const { ShopbyBrandComponent } = await import('@components/shopby-brand/shopby-brand.component');
                const factory = this._componentFactoryResolver.resolveComponentFactory(ShopbyBrandComponent);
                this.shopByBrandInstance = this.shopByBrandContainerRef.createComponent(factory, null, this.injector);
                this.shopByBrandInstance.instance['brand_Data'] = this.shopByBrandData;
            } else if (name === 'catStatic' && !this.catStaticInstance) {
                const { CatStaticComponent } = await import('@components/cat-static/cat-static.component');
                const factory = this._componentFactoryResolver.resolveComponentFactory(CatStaticComponent);
                this.catStaticInstance = this.catStaticContainerRef.createComponent(factory, null, this.injector);
                this.catStaticInstance.instance['page_title'] = this.page_title;
                this.catStaticInstance.instance['static_data'] = this.catStaticData;
            } else if (name === 'slpSubCategory' && !this.slpSubCategoryInstance) {
                this.slpSubCategoryInstance = null;
                const { SlpSubCategoryComponent } = await import('@components/slp-sub-category/slp-sub-category.component');
                const factory = this._componentFactoryResolver.resolveComponentFactory(SlpSubCategoryComponent);
                this.slpSubCategoryInstance = this.slpSubCategoryContainerRef.createComponent(factory, null, this.injector);
                this.slpSubCategoryInstance.instance['sub_category_Data'] = this.API_RESPONSE.category[0].children;
            } else if (name === 'shopbyFeatr' && !this.shopbyFeatrInstance) {
                this.shopbyFeatrInstance = null;
                const { ShopbyFeatrComponent } = await import('@components/shopby-featr/shopby-featr.component');
                const factory = this._componentFactoryResolver.resolveComponentFactory(ShopbyFeatrComponent);
                this.shopbyFeatrInstance = this.shopbyFeatrContainerRef.createComponent(factory, null, this.injector);
                this.shopbyFeatrInstance.instance['shopBy_Data'] = this.shopbyFeatrData;
            } else if (name === 'cms' && !this.cmsInstance) {
                this.cmsInstance = null;
                const { CmsWrapperComponent } = await import('@modules/cms/cms.component');
                const factory = this._componentFactoryResolver.resolveComponentFactory(CmsWrapperComponent);
                this.cmsInstance = this.cmsContainerRef.createComponent(factory, null, this.injector);
                this.cmsInstance.instance['cmsData'] = this.API_RESPONSE.category[4];
                this.cmsInstance.instance['background'] = 'bg-trans';
            }
            
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

    ngOnDestroy() {
        this.resetLazyComponents();
    }
}

