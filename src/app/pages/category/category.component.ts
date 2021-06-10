import { ClientUtility } from '@utils/client.utility';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { EventEmitter, Component, ViewChild, PLATFORM_ID, Inject, Renderer2, OnInit, Optional, ViewContainerRef, ComponentFactoryResolver, Injector } from '@angular/core';
import { CategoryService } from '@utils/services/category.service';
import { CommonService } from '@app/utils/services/common.service';
import { LocalStorageService } from 'ngx-webstorage';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { FooterService } from '@app/utils/services/footer.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { SortByComponent } from '@app/components/sortBy/sortBy.component';
import { CONSTANTS } from '@app/config/constants';
import { RESPONSE } from '@nguniversal/express-engine/tokens';
import { DataService } from '@app/utils/services/data.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';

const slpPagesExtrasIdMap = { "116111700": "116111700", "114160000": "114160000", "211521500": "211521500", "114132500": "114132500" };
let digitalData = {};

@Component({
    selector: 'category',
    templateUrl: './category.html',
    styleUrls: ['./category.scss',]
})

export class CategoryComponent implements OnInit {
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

    paginationData: any = {};
    breadcrumbData: any;
    productsUpdated: BehaviorSubject<any> = new BehaviorSubject<any>({});
    pageSizeUpdated: BehaviorSubject<any> = new BehaviorSubject<any>({});
    relatedCatgoryListUpdated: BehaviorSubject<any> = new BehaviorSubject<any>({});

    @ViewChild(SortByComponent) sortByComponent: SortByComponent;


    paginationUpdated: Subject<any> = new Subject<any>();
    
    pageName: string;
    buckets = [];

    getRelatedCatgory: any;

    productListLength: number;
    showSubcategoty: boolean;
    currentRequestGetRelatedCategories: any;
    productSearchResult: {
        products: []
    };

    productSearchResultSEO: Array<any> = [];
    filterCounts: number;
    spl_subCategory_Dt: any;
    forkJoinUnsub: any;
    combineLatestUnsub: any;
    pageNo: number;


    isSLPPage: boolean = false;
    API = CONSTANTS;

    firstPageContent: boolean = false;
    brand_Dt: any;
    catBestSeller_Dt: any;
    shopBy_Dt: any;
    static_Dt: any;
    layoutType: any;
    page_title: string;
    trendingSearchData: any;
    faqData: any;
    productCategoryNames: Array<any> = [];
    categoryLinkLists: any = {};
    wb: Array<any> = [];
    reqArray: Array<any> = [];
    PRTA: Array<any> = [];
    categoryId: string;
    categoryFooterData:any;
    constructor(
        @Optional() @Inject(RESPONSE) private _response, 
        private _renderer2: Renderer2,
        private analytics: GlobalAnalyticsService,
        @Inject(DOCUMENT) private _document,
        public dataService: DataService,
        private injector: Injector,
        private cfr: ComponentFactoryResolver,
        public pageTitle: Title, 
        private meta: Meta, 
        @Inject(PLATFORM_ID) platformId, 
        public footerService: FooterService,
        public _router: Router, 
        public _activatedRoute: ActivatedRoute, 
        private localStorageService: LocalStorageService,
        public _commonService: CommonService, 
        private _categoryService: CategoryService,) {
            this.showSubcategoty = true;
            this.getRelatedCatgory = {};
            this.pageName = 'CATEGORY';
    }

    ngOnInit() {
        if (this._commonService.isBrowser) {
            ClientUtility.scrollToTop(100);
        }
        this.setCategoryDataFromResolver();
        if (this._commonService.isBrowser) {            
            // Set footers
            this.footerService.setMobileFoooters();
        }
    }


    private updateConfigBasedOnParams(data) {
        this.categoryId = data['id'];
        this.layoutType = 0;
        if (data && data.id && slpPagesExtrasIdMap.hasOwnProperty(data.id)) {
            this.isSLPPage = true;
            this.getExtraCategoryData(data).subscribe((data) => {

                this.layoutType = data['layoutType'];
                if (this.spl_subCategory_Dt && this.layoutType == 2) {
                    this.createDynamicComponent('slpSubCategory');
                }

                this.page_title = data['pageTitle'];
                this.brand_Dt = data['data'][0].block_data.brand_block;
                this.catBestSeller_Dt = data['data'][0].block_data.product_data;
                if (this.brand_Dt) {
                    this.createDynamicComponent('shopByBrand');
                }
                if (this.catBestSeller_Dt) {
                    this.createDynamicComponent('catBestseller');
                }
                this.shopBy_Dt = data['data'][0].block_data.image_block;
                if (this.shopBy_Dt) {
                    this.createDynamicComponent('shopbyFeatr');
                }

                this.static_Dt = data['data'][0].block_data.general_block;
                if (this.static_Dt) {
                    this.createDynamicComponent('catStatic');
                }

            });
        } else {
            this.isSLPPage = false;
        }
    }

    private updateConfigBasedOnQueryParams(data) {
        this.trendingSearchData = data;
        this.pageNo = data['page'];
        if (this._commonService.isBrowser) {
            if (data['page'] > 1) {
                this.showSubcategoty = false;
            } else {
                this.showSubcategoty = true;
                setTimeout(() => {
                    this.createDynamicComponent('subCategory');
                }, 0);
            }
        }
        if (data['page'] == undefined || data['page'] == 1) {
            this.firstPageContent = true;
        } else {
            this.firstPageContent = false;
        }
    }

    onVisibleCateoryFooter() {
        this.categoryFooterData = {
            productSearchResult: this.productSearchResult,
            getRelatedCatgory: this.getRelatedCatgory,
            productSearchResultSEO: this.productSearchResultSEO,
            faqData: this.faqData,
            buckets: this.buckets,
            PRTA: this.PRTA
        };
    }

    async createDynamicComponent(name) {
        if (this._commonService.isBrowser) {
            if (name === 'catBestseller' && !this.catBestSellerInstance) {
                const { CatBestsellerComponent } = await import('@components/cat-bestseller/cat-bestseller.component');
                const factory = this.cfr.resolveComponentFactory(CatBestsellerComponent);
                this.catBestSellerInstance = this.catBestSellerContainerRef.createComponent(factory, null, this.injector);
                this.catBestSellerInstance.instance['bestSeller_Data'] = this.catBestSeller_Dt;
            } else if (name === 'subCategory' && !this.subCategoryInstance) {
                const { SubCategoryComponent } = await import('@components/subCategory/subCategory.component');
                const factory = this.cfr.resolveComponentFactory(SubCategoryComponent);
                this.subCategoryInstance = this.subCategoryContainerRef.createComponent(factory, null, this.injector);
                this.subCategoryInstance.instance['relatedCatgoryListUpdated'] = this.relatedCatgoryListUpdated;
            } else if (name === 'shopByBrand' && !this.shopByBrandInstance) {
                const { ShopbyBrandComponent } = await import('@components/shopby-brand/shopby-brand.component');
                const factory = this.cfr.resolveComponentFactory(ShopbyBrandComponent);
                this.shopByBrandInstance = this.shopByBrandContainerRef.createComponent(factory, null, this.injector);
                this.shopByBrandInstance.instance['brand_Data'] = this.brand_Dt;
            } else if (name === 'catStatic' && !this.catStaticInstance) {
                const { CatStaticComponent } = await import('@components/cat-static/cat-static.component');
                const factory = this.cfr.resolveComponentFactory(CatStaticComponent);
                this.catStaticInstance = this.catStaticContainerRef.createComponent(factory, null, this.injector);
                this.catStaticInstance.instance['page_title'] = this.page_title;
                this.catStaticInstance.instance['static_data'] = this.static_Dt;
            } else if (name === 'slpSubCategory' && !this.slpSubCategoryInstance) {
                this.slpSubCategoryInstance = null;
                const { SlpSubCategoryComponent } = await import('@components/slp-sub-category/slp-sub-category.component');
                const factory = this.cfr.resolveComponentFactory(SlpSubCategoryComponent);
                this.slpSubCategoryInstance = this.slpSubCategoryContainerRef.createComponent(factory, null, this.injector);
                this.slpSubCategoryInstance.instance['sub_category_Data'] = this.spl_subCategory_Dt;
            } else if (name === 'shopbyFeatr' && !this.shopbyFeatrInstance) {
                this.shopbyFeatrInstance = null;
                const { ShopbyFeatrComponent } = await import('@components/shopby-featr/shopby-featr.component');
                const factory = this.cfr.resolveComponentFactory(ShopbyFeatrComponent);
                this.shopbyFeatrInstance = this.shopbyFeatrContainerRef.createComponent(factory, null, this.injector);
                this.shopbyFeatrInstance.instance['shopBy_Data'] = this.shopBy_Dt;
            } else if (name === 'cms' && !this.cmsInstance) {
                this.cmsInstance = null;
                const { CmsWrapperComponent } = await import('@modules/cms/cms.component');
                const factory = this.cfr.resolveComponentFactory(CmsWrapperComponent);
                this.cmsInstance = this.cmsContainerRef.createComponent(factory, null, this.injector);
                this.cmsInstance.instance['cmsData'] = this._commonService.cmsData;
                this.cmsInstance.instance['background'] = 'bg-trans';
            }
        }
    }

    private setCategoryDataFromResolver() {
        this._commonService.showLoader = true;
        this._activatedRoute.data.subscribe(res => {
            // Set config based on query params change
            const queryParamsData = this._activatedRoute.snapshot.queryParams;
            this.updateConfigBasedOnQueryParams(queryParamsData);

            // Set config based on params change
            const paramsData = this._activatedRoute.snapshot.params;
            this.updateConfigBasedOnParams(paramsData);

            this.setDataAfterGettingDataFromResolver(res.category);
        });
    }

    setDataAfterGettingDataFromResolver(res) {
        this._commonService.showLoader = false;
        const ict = res[0]['categoryDetails']['active'];
        const canonicalURL = res[0]['categoryDetails']['canonicalURL']
        const chk = this.isUrlEqual(canonicalURL, this._router.url);
        if (!chk) {
            this._router.navigateByUrl("/" + canonicalURL);
        }
        
        if (!ict || res[1]['productSearchResult']['totalCount'] === 0) {
            if (this._commonService.isServer) {
                let httpStatus = 404;
                if (res[0]['httpStatus']) {
                    httpStatus = res[0]['httpStatus'];
                } else if (res[1]['httpStatus']) {
                    httpStatus = res[1]['httpStatus'];
                }
                this._response.status(httpStatus);
            }
            res[1] = { buckets: [], productSearchResult: { products: [], totalCount: 0 } };
        }
        
        
        if (res[4] && res[4]['data']) {
            this._commonService.cmsData = res[3]['data'];
            this._commonService.replaceHeading = this._commonService.cmsData.find(x => x.componentLabel === 'text_component') ? true : false;
        }

        if (res[3]){
            this.breadcrumbData = res[3];
        }
        
        //  taking 2sec
        this.initiallizeRelatedCategories(res);
        
        
        /**
         * For refresh products
         */
        this.initiallizeData(res[1], true);

        if (this._commonService.isBrowser) {
            this.setTrackingData(res);
            if ((ict && res[1]['productSearchResult']['totalCount'] > 0)) {
                this.fireTags(res[1]);
            }
        }
        
        this.setFaqSchema(res[2]);
        this.faqData = res[2];
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
    
    onFilterSelected(count) {
        setTimeout(() => {
            this.filterCounts = count;
        }, 0);
    }

    getRelatedCategories(categoryID): Observable<{}> {
        if (this.currentRequestGetRelatedCategories !== undefined) {
            this.currentRequestGetRelatedCategories.unsubscribe();
        }
        return this._categoryService.getRelatedCategories(categoryID);
    }

    refreshProducts(): Observable<{}> {
        const defaultParams = this.createDefaultParams();
        this._commonService.updateDefaultParamsNew(defaultParams);
        return this._commonService.refreshProducts();
    }


    /**
     *
     * @param response : returned data from category api or transfer state
     * @param flag : true, if TrasnferState exist.
     */
    private initiallizeData(response: any, flag: boolean) {
        // this._commonService.showLoader = false;
        this.productListLength = response.productSearchResult['products'].length;
        this.createCategorySchema(response.productSearchResult['products']); // ODP-684
        if (flag) {
            this.paginationData = { itemCount: response.productSearchResult.totalCount };
            this.pageSizeUpdated.next({ productSearchResult: response.productSearchResult });
            this.productsUpdated.next(response.productSearchResult.products);
            this.paginationUpdated.next(this.paginationData);
        }
        this.buckets = response.buckets;

        if (this.paginationInstance) {
            this.paginationInstance.instance['paginationUpdated'].next(this.paginationData);
        }
        if (this.filterInstance) {
            this.filterInstance.instance['bucketsUpdated'].next(this.buckets);
        } else {
            this.filterCounts = this._commonService.calculateFilterCount(this.buckets);
        }
        this.priceRangeTable(response);      //price range table code starts here
        this.productSearchResult = response.productSearchResult;
        this.productSearchResultSEO = [];
        for (let p = 0; p < response.productSearchResult.products.length && p < 10; p++) {
            if (response.productSearchResult.products[p].salesPrice > 0 && response.productSearchResult.products[p].priceWithoutTax > 0) {
                this.productSearchResultSEO.push(response.productSearchResult.products[p]);
            }
        }
        this.setCanonicalUrls(response);
        this.categoryLinkLists = response.categoryLinkList;
        this.productCategoryNames = [];
        for (var key in this.categoryLinkLists) {
            if (this.categoryLinkLists.hasOwnProperty(key)) {
                this.productCategoryNames.push(key);
            }
        }
        this.onVisibleCateoryFooter();
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
            this.getBucketForPriceRangeTable(JSON.parse(JSON.stringify(res.buckets)));
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
                this.wb.push(buckets[i]); //wb(wanted bucket)
            }
        }

        this.PRTA = [];                        //PRTA(Product Range Table Array):-array which stores final data after computation , is reset for when component is instantiated again
        this.priceRangeData();               //proceeding calculations
        this.wb = [];                          //wb(wanted bucket):-array which stores bucket data excluding price , discount , badges , availability.
    }

    priceRangeData() {
        let temp = [];
        if (this.wb.length > 0) {
            for (let i = 0; i < this.wb.length; i++) {

                /*
                *to get category data in price range table
                */

                if (this.wb[i].name === "category") {
                    this.getCategoryData(this.wb[i].terms);                // calling reccursive function to find out specific page category data
                    if (this.reqArray !== null) {
                        for (let val of this.reqArray) {                       // added "newName" to value we got from "getCategoryData" , to tackle difficulty faced in getting "other custom filters"(below)
                            val.newName = val.term
                        }
                        temp = this.reqArray;
                    }

                    for (let i = 0; i < temp.length && this.PRTA.length < 4; i++) {   //getting top four values with non-zero min , max price 
                        if (temp[i].minPrice > 0 && temp[i].maxPrice > 0) {
                            this.PRTA.push(temp[i])
                        }
                    }
                    this.PRTA.filter(x => !!x)                               //removing null values from array
                    temp = [];
                }


                /* 
                *to get brand data in price range table
                */

                else if (this.wb[i].name === "brand") {
                    let temp = [];
                    for (let j = 0; j < this.wb[i].terms.length && temp.length < 4; j++) {                                                      //getting top four values with non-zero min , max price 
                        if (this.wb[i].terms[j].minPrice > 0 && this.wb[i].terms[j].maxPrice > 0) {
                            this.wb[i].terms[j].term = this.wb[i].terms[j].term + " " + this.getRelatedCatgory.categoryDetails.categoryName;
                            temp.push(this.wb[i].terms[j]);
                        }
                    }
                    if (temp.length !== 0) {
                        for (let val of temp) {                                                                                           //added "newName" to value we got from "getCategoryData" , to tackle difficulty faced in getting "other custom filters"(below) 
                            val.newName = val.term
                            this.PRTA.push(val);
                        }
                    }
                    this.PRTA.filter(x => !!x)                                                                                        //removing null values from array
                    temp = [];
                }

                /* 
                *to get other filter data in price range table
                */

                else {
                    let str = ""
                    let temp = [];
                    for (let j = 0; j < this.wb[i].terms.length && temp.length < 4; j++) {                                                        //getting top four values with non-zero min , max price for each "other filters"
                        if (this.wb[i].terms[j].minPrice > 0 && this.wb[i].terms[j].maxPrice > 0) {
                            this.wb[i].terms[j].newName = "";
                            str = this.wb[i].name + " - " + this.wb[i].terms[j].term + " " + this.getRelatedCatgory.categoryDetails.categoryName;
                            this.wb[i].terms[j].newName = this.camalize(str);
                            temp.push(this.wb[i].terms[j]);
                        }
                    }
                    if (temp.length !== 0) {
                        for (let val of temp) {
                            this.PRTA.push(val);
                        }
                    }
                    this.PRTA.filter(x => !!x)
                    temp = [];                                                                                                              //removing null values from PRTA
                }
            }
        }
    }

    camalize(str) {
        return str.toLowerCase().replace(/^\w|\s\w/g, function (letter) {
            return letter.toUpperCase();
        }
        );
    }

    /*
     *  Reccursive function to find out specific page category data .
     */

    getCategoryData(obj: any[]) {
        for (let i = 0; i < obj.length; i++) {
            if (obj[i].term === this.getRelatedCatgory.categoryDetails.categoryName) {
                this.reqArray = obj[i].childCategoryList;                              //Base condition.
                break;
            }
            else if (obj[i].childCategoryList !== null) {
                obj = obj[i].childCategoryList;
                this.getCategoryData(obj);
            }
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
                    "name": this.getRelatedCatgory.categoryDetails.categoryName,
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
            links.rel = 'canonical';
            if (this.pageNo == undefined || this.pageNo == 1) {
                links.href = CONSTANTS.PROD + currentRoute.toLowerCase();
            } else {
                links.href = CONSTANTS.PROD + currentRoute.toLowerCase() + "?page=" + this.pageNo;
            }
            this._renderer2.appendChild(this._document.head, links);
        }

        if (this.pageNo == undefined || this.pageNo == 1) {
            if (this._commonService.isServer) {
                let ampLink;
                ampLink = this._renderer2.createElement('link');
                ampLink.rel = 'amphtml';
                ampLink.href = CONSTANTS.PROD + '/ampc' + currentRoute.toLowerCase();
                /**
                 * Below if condition is just a temporary solution.
                 * Strictly remove if condtion, once amp of drill(114160000) page is completed.
                 */
                this._renderer2.appendChild(this._document.head, ampLink);
            }
        }

        const currentQueryParams = this._activatedRoute.snapshot.queryParams;
        const pageCountQ = response.productSearchResult.totalCount / 10;
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

            let taxo1;
            let taxo2;
            let taxo3;
            /*Start Adobe Analytics Tags */
            if (this.getRelatedCatgory.categoryDetails.taxonomy) {
                taxo1 = this.getRelatedCatgory.categoryDetails.taxonomy.split("/")[0] || '';
                taxo2 = this.getRelatedCatgory.categoryDetails.taxonomy.split("/")[1] || '';
                taxo3 = this.getRelatedCatgory.categoryDetails.taxonomy.split("/")[2] || '';
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

    async onVisiblePagination(event) {
        if (!this.paginationInstance) {
            const { PaginationComponent } = await import('@app/components/pagination/pagination.component');
            const factory = this.cfr.resolveComponentFactory(PaginationComponent);
            this.paginationInstance = this.paginationContainerRef.createComponent(factory, null, this.injector);
            this.paginationInstance.instance['paginationUpdated'] = new BehaviorSubject<any>({});
            this.paginationInstance.instance['paginationUpdated'].next(this.paginationData);
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
                const { FilterComponent } = await import('@app/components/filter/filter.component').finally(function() {
                    setTimeout(function(){
                        const mob_filter = document.querySelector('.mob_filter');
                        if (mob_filter) {
                            mob_filter.classList.add('upTrans');
                        }
                    }, 0);
                });
                const factory = this.cfr.resolveComponentFactory(FilterComponent);
                this.filterInstance = this.filterContainerRef.createComponent(factory, null, this.injector);
                this.filterInstance.instance['pageName'] = this.pageName;
                this.filterInstance.instance['bucketsUpdated'] = new BehaviorSubject<any>(this.buckets);
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
        if (!this.sortByInstance) {
            const { SortByComponent } = await import('@app/components/sortBy/sortBy.component');
            const factory = this.cfr.resolveComponentFactory(SortByComponent);
            this.sortByInstance = this.sortByContainerRef.createComponent(factory, null, this.injector);
            this.sortByInstance.instance['sortByUpdated'] = new BehaviorSubject<any>(null);
            (this.sortByInstance.instance['outData$'] as EventEmitter<any>).subscribe(data => {
                this.toggleSortBy(data);
            });
        } else {
            const sortByFilter = document.querySelector('sort-by');
    
            if (sortByFilter) {
                sortByFilter.classList.toggle('open');
            }
        }

        
    }

    createDefaultParams() {
        // alert('createDefaultParams');

        const newParams: any = {
            queryParams: {}
        };

        const defaultParams = this._commonService.getDefaultParams();
        /**
         *  Below code is added to maintain the state of sortBy : STARTS
         */
        if (defaultParams['queryParams']['orderBy'] !== undefined) {
            newParams.queryParams['orderBy'] = defaultParams['queryParams']['orderBy'];
        }
        if (defaultParams['queryParams']['orderWay'] !== undefined) {
            newParams.queryParams['orderWay'] = defaultParams['queryParams']['orderWay'];
        }
        /**
         *  maintain the state of sortBy : ENDS
         */

        const currentQueryParams = this._activatedRoute.snapshot.queryParams;

        for (let key in currentQueryParams) {
            newParams.queryParams[key] = currentQueryParams[key];
        }

        // newParams["queryParams"] = queryParams;
        newParams['filter'] = {};

        const params = this._activatedRoute.snapshot.params;

        newParams['category'] = params['id'];

        const fragment = this._activatedRoute.snapshot.fragment;

        if (fragment !== undefined && fragment != null && fragment.length > 0) {
            let currentUrlFilterData: any = fragment.replace(/^\/|\/$/g, '');
            currentUrlFilterData = currentUrlFilterData.replace(/^\s+|\s+$/gm, '');


            /*Below newCurrentUrlFilterData and for loop is added for a special case, / is coming also in voltage filter part*/
            let newCurrentUrlFilterData = '';
            for (let i = 0; i < currentUrlFilterData.length; i++) {
                if (currentUrlFilterData[i] === '/' && /^\d+$/.test(currentUrlFilterData[i + 1])) {
                    newCurrentUrlFilterData = newCurrentUrlFilterData + '$';
                } else {
                    newCurrentUrlFilterData = newCurrentUrlFilterData + currentUrlFilterData[i];
                }
            }

            currentUrlFilterData = newCurrentUrlFilterData.split('/');
            if (currentUrlFilterData.length > 0) {
                const filter = {};
                for (let i = 0; i < currentUrlFilterData.length; i++) {
                    const filterName = currentUrlFilterData[i].substr(0, currentUrlFilterData[i].indexOf('-')).toLowerCase(); // "price"
                    const filterData = currentUrlFilterData[i]
                        .replace('$', '/')
                        .substr(currentUrlFilterData[i]
                            .indexOf('-') + 1).split('||');
                    filter[filterName] = filterData;
                }
                newParams['filter'] = filter;
            }
        }

        newParams['pageName'] = this.pageName;
        return newParams;
    }

    getExtraCategoryData(data): Observable<{}> {
        return this._categoryService.getCategoryExtraData(slpPagesExtrasIdMap[data.id]);
    }
    
    private setFaqSchema(faqData) {
        if (this._commonService.isServer) {
            if (faqData && faqData.length > 0) {
                const qaSchema = [];
                faqData.forEach((element, index) => {
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

    private initiallizeRelatedCategories(response) {
        this.getRelatedCatgory = response[0];
        const categoryData = response[1];

        let qps = this._activatedRoute.snapshot.queryParams;

        if (this.getRelatedCatgory.categoryDetails.active) {
            const categoryName = this.getRelatedCatgory.categoryDetails.categoryName;
            let title = (this.getRelatedCatgory.categoryDetails.metaTitle != undefined && this.getRelatedCatgory.categoryDetails.metaTitle != null && this.getRelatedCatgory.categoryDetails.metaTitle != "") ? this.getRelatedCatgory.categoryDetails.metaTitle : "Buy " + categoryName + " Online at Best Price in India - Moglix.com";
            let metaDescription = (this.getRelatedCatgory.categoryDetails.metaDescription != undefined && this.getRelatedCatgory.categoryDetails.metaDescription != null && this.getRelatedCatgory.categoryDetails.metaDescription != "") ? this.getRelatedCatgory.categoryDetails.metaDescription : "Shop online for " + categoryName + " at best prices now! Moglix is a one stop shop for genuine " + categoryName + ". Cash on delivery, Free shipping available.";
            this.meta.addTag({ 'name': 'description', 'content': metaDescription });
            this.meta.addTag({ 'name': 'og:title', 'content': title });
            this.meta.addTag({ 'name': 'og:description', 'content': metaDescription });
            this.meta.addTag({ 'name': 'og:url', 'content': CONSTANTS.PROD + this._router.url });
            this.meta.addTag({
                'name': 'keywords',
                'content': categoryName + ', ' + categoryName + ' online, buy ' + categoryName + ', industrial ' + categoryName
            });
            this.pageTitle.setTitle(title);

            if (categoryData['productSearchResult']['products'] && categoryData['productSearchResult']['products'].length > 0) {
                this.meta.addTag({ 'name': 'robots', 'content': (qps["page"] && parseInt(qps["page"]) > 1) ? CONSTANTS.META.ROBOT1 : CONSTANTS.META.ROBOT });
            } else {
                this.meta.addTag({ 'name': 'robots', 'content': CONSTANTS.META.ROBOT2 });
            }
            
            this.spl_subCategory_Dt = this.getRelatedCatgory.children;
            this.relatedCatgoryListUpdated.next(this.getRelatedCatgory);
        } else {
            this.relatedCatgoryListUpdated.next([]);
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

    getAltName(brandName) {
        if (brandName == null || brandName == undefined) {
            return 'safety shoes';
        }
        else {
            return brandName + " safety shoes";
        }

    }

    isUrlEqual(url1: string, url2: string): boolean {
        if (url2.indexOf(url1) !== -1) {
            return true;
        }
        return false;
    }

    async onVisibleRecentArticles(htmlElement) {
        if (this.productListLength) {
            const { RecentArticles } = await import('@components/recent-articles/recent-articles.component');
            const factory = this.cfr.resolveComponentFactory(RecentArticles);
            this.recentArticlesInstance = this.recentArticlesContainerRef.createComponent(factory, null, this.injector);
            let articlesData = [];
            this._categoryService.getRelatedArticles(this.categoryId).subscribe(res => {
                if (res && res['status'] && res['statusCode'] == 200) {
                    articlesData = res['data'];
                    this.recentArticlesInstance.instance['recentArticles'] = articlesData;
                    this.recentArticlesInstance.instance['title'] = this.getRelatedCatgory.categoryDetails.categoryName
                }
            });
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
        if (this.catBestSellerInstance){
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
        if(this.cateoryFooterInstance) {
            this.cateoryFooterInstance = null;
            this.cateoryFooterContainerRef.remove();
        }
    }

    ngOnDestroy() {
        // this.sortByContainerRef['sortBy'] = 'popularity';
        this.resetLazyComponents();
    }
    
}