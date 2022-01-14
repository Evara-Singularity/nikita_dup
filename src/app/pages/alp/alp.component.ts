import { Title, Meta, makeStateKey, TransferState } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { Component, Inject, Renderer2, OnInit, Optional } from '@angular/core';
import { AlpService } from './alp.service';
import { CommonService } from '@services/common.service';
import { LocalStorageService } from 'ngx-webstorage';
import { ActivatedRoute, Router } from '@angular/router';
import { FooterService } from '@services/footer.service';
import { CONSTANTS } from '@config/constants';
import { ClientUtility } from '@utils/client.utility';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { RESPONSE } from '@nguniversal/express-engine/tokens';
import { DataService } from '@services/data.service';
import { GlobalAnalyticsService } from '@services/global-analytics.service';
import { ProductListService } from '@app/utils/services/productList.service';

const slpPagesExtrasIdMap = { "116111700": "116111700", "114160000": "114160000", "211521500": "211521500", "114132500": "114132500" };
const EDK: any = makeStateKey<{}>('EDK');  //EDK:Extra Data Key

@Component({
    selector: 'alp',
    templateUrl: './alp.html',
    styleUrls: ['./alp.scss'],
})

export class AlpComponent implements OnInit
{
    productsUpdated: BehaviorSubject<any> = new BehaviorSubject<any>({});
    showLoader: boolean;
    pageName: string;
    buckets = [];
    productListLength: number;
    isServer: boolean;
    isBrowser: boolean;
    productSearchResult: {};
    productSearchResultSEO: Array<any> = [];
    pageNo;
    isSLPPage: boolean = false;
    imagePath = CONSTANTS.IMAGE_BASE_URL;
    firstPageContent: boolean = false;
    page_title;
    taxo1: any;
    taxo2: any;
    taxo3: any;
    trendingSearchData;
    titleHeading = '';
    titleDescription='';
    pageDescription = '';
    metaTitle = '';
    metaDescription = '';
    displayGroupBy = false;
    bestSellerTitle = '';
    //1704
    alpAttrListingData = null;
    alpBreadCrumbData = null;
    alpCategoryCodeData = null;
    alpProductListingData = null;

    constructor(
        @Optional() @Inject(RESPONSE) private _response,
        private _tState: TransferState, private _renderer2: Renderer2,
        private analytics: GlobalAnalyticsService,
        @Inject(DOCUMENT) private _document,
        public dataService: DataService,
        public pageTitle: Title, private meta: Meta, public footerService: FooterService,
        public _router: Router, public _activatedRoute: ActivatedRoute,
        private localStorageService: LocalStorageService,
        public _commonService: CommonService,
        private _categoryService: AlpService,
        public _productListService: ProductListService
    )
    {
        this.pageName = 'ATTRIBUTE';
    }

    ngOnInit()
    {
        this.setCategoryDataFromResolver();
        if (this._commonService.isBrowser) {
            ClientUtility.scrollToTop(100);
        }
    }

    setCategoryDataFromResolver()
    {
        this._commonService.showLoader = true;
        this._activatedRoute.data.subscribe(res =>
        {
            this._productListService.excludeAttributes = [];
            // Set config based on query params change
            const queryParamsData = this._activatedRoute.snapshot.queryParams;
            this.updateConfigBasedOnQueryParams(queryParamsData);

            // Set config based on params change
            const paramsData = this._activatedRoute.snapshot.params;
            this.updateConfigBasedOnParams(paramsData);
            //TODO:1704 Uncomment
            this._commonService.showLoader = false;
            const ALP_DATA = res.alp[0];
            this.alpAttrListingData = ALP_DATA[0];
            this.alpCategoryCodeData = ALP_DATA[1];
            this.alpBreadCrumbData = ALP_DATA[2];
            this.alpProductListingData = ALP_DATA[3];
            this.setAttributeListingInfo();
        });
    }

    setAttributeListingInfo()
    {
        //TODO:1704 if data is null then 404
        if (this._commonService.isServer && this.alpAttrListingData['data'] === null) {
            this._response.status(404);
            return;
        }
        let attributeListing = this.alpAttrListingData['data']['attributesListing'];
        this.titleHeading = attributeListing['title']
        this.titleDescription=attributeListing['titleDescription'];
        this.pageDescription = attributeListing['pageDescription'];
        this.metaTitle = attributeListing['metaTitle'];
        this.metaDescription = attributeListing['metaDescription'];
        this._productListService.excludeAttributes = JSON.parse(JSON.stringify(attributeListing['attributes']));
        this.fetchCIMSRelatedData();
    }

    fetchCIMSRelatedData()
    {
        this._commonService.showLoader = false;
        const ict = this.alpCategoryCodeData["categoryDetails"]['active'];
        const PRODUCT_COUNT = this.alpProductListingData['productSearchResult']['totalCount'];
        if (!ict || PRODUCT_COUNT === 0) {
            //TODO 1704 :NO PRODUCTS FOUND SHOULD COME HERE
            if (this._commonService.isServer) {
                this._response.status(404);
            }
        }
        this.initiallizeRelatedCategories(this.alpCategoryCodeData, true);
        this.initiallizeData(this.alpProductListingData, true);
        if (this.isBrowser) {
            this.showLoader = false;
            this.setTrackingData();
            if ((ict && PRODUCT_COUNT > 0)) {
                this.fireTags(this.alpProductListingData);
            }
        }
    }

    private initiallizeRelatedCategories(response, flag)
    {
        let qps = this._activatedRoute.snapshot.queryParams;
        if (this.alpCategoryCodeData.categoryDetails.active) {
            this.meta.addTag({ 'name': 'description', 'content': this.metaDescription });
            this.meta.addTag({ 'name': 'og:title', 'content': this.metaTitle });
            this.meta.addTag({ 'name': 'og:description', 'content': this.metaDescription });
            this.meta.addTag({ 'name': 'og:url', 'content': 'https://www.moglix.com' + this._router.url });
            this.pageTitle.setTitle(this.metaTitle);
            const PRODUCTS_LENGTH = (this.alpProductListingData['productSearchResult']['products'] as any[]).length;
            if (PRODUCTS_LENGTH) {
                this.meta.addTag({ 'name': 'robots', 'content': (qps["page"] && parseInt(qps["page"]) > 1) ? CONSTANTS.META.ROBOT1 : CONSTANTS.META.ROBOT });
            } else {
                this.meta.addTag({ 'name': 'robots', 'content': CONSTANTS.META.ROBOT2 });
            }
        }
    }

    /**
     *
     * @param response : returned data from category api or transfer state
     * @param flag : true, if TrasnferState exist.
     */
    private initiallizeData(response: any, flag: boolean)
    {
        this.showLoader = false;
        this.productListLength = response.productSearchResult['products'].length;
        this.productsUpdated.next(response.productSearchResult.products);
        this.productSearchResult = response.productSearchResult;
        this.productSearchResultSEO = [];
        for (let p = 0; p < response.productSearchResult.products.length && p < 10; p++) {
            if (response.productSearchResult.products[p].salesPrice > 0 && response.productSearchResult.products[p].priceWithoutTax > 0) {
                this.productSearchResultSEO.push(response.productSearchResult.products[p]);
            }
        }
        this.setCanonicalUrls(response);
        const products = response.productSearchResult.products || [];
        if (products && products.length) {
            this.createProductsSchema(products);
        }
        // shared product listing data update
        this._productListService.createAndProvideDataToSharedListingComponent(response, 'Category Results');
        this._productListService.createAndProvideDataToSharedListingComponent(response, 'Category Results', true);

        // Update total product account
        this._commonService.selectedFilterData.totalCount = response.productSearchResult.totalCount;

    }

    setTrackingData()
    {
        var taxonomy = this.alpCategoryCodeData["categoryDetails"]['taxonomy'];
        var trackData = {
            event_type: "page_load",
            label: "view",
            product_count: this.alpProductListingData["productSearchResult"]["totalCount"],
            category_l1: taxonomy.split("/")[0] ? taxonomy.split("/")[0] : null,
            category_l2: taxonomy.split("/")[1] ? taxonomy.split("/")[1] : null,
            category_l3: taxonomy.split("/")[2] ? taxonomy.split("/")[2] : null,
            channel: "Listing",
            search_query: null,
            suggestion_click: null,
            url_complete_load_time: null,
            page_type: "Category"
        }
        this.dataService.sendMessage(trackData);
    }

    fireTags(response)
    {

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

        if (this.isBrowser) {
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
                'CategoryId': this.alpCategoryCodeData.categoryDetails.taxonomy,
                'CategoryName': this.alpCategoryCodeData.categoryDetails.canonicalURL
            });

            /*End Criteo DataLayer Tags */

            /*Start Adobe Analytics Tags */
            if (this.alpCategoryCodeData.categoryDetails.taxonomy) {
                this.taxo1 = this.alpCategoryCodeData.categoryDetails.taxonomy.split("/")[0] || '';
                this.taxo2 = this.alpCategoryCodeData.categoryDetails.taxonomy.split("/")[1] || '';
                this.taxo3 = this.alpCategoryCodeData.categoryDetails.taxonomy.split("/")[2] || '';
            }
            let page = {
                'pageName': "moglix:" + this.taxo1 + ":" + this.taxo2 + ":" + this.taxo3 + ": listing",
                'channel': "listing",
                'subSection': "moglix:" + this.taxo1 + ":" + this.taxo2 + ":" + this.taxo3 + ": listing",
                'loginStatus': (user && user["authenticated"] == 'true') ? "registered user" : "guest"
            }
            let custData = {
                'customerID': (user && user["userId"]) ? btoa(user["userId"]) : '',
                'emailID': (user && user["email"]) ? btoa(user["email"]) : '',
                'mobile': (user && user["phone"]) ? btoa(user["phone"]) : '',
                'customerType': (user && user["userType"]) ? user["userType"] : '',
            }
            let order = {
                'productCategoryL1': this.taxo1,
                'productCategoryL2': this.taxo2,
                'productCategoryL3': this.taxo3
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
    }

    updateConfigBasedOnQueryParams(queryParamsData)
    {
        this.pageNo = queryParamsData['page'];
        this.displayGroupBy = (queryParamsData['page'] == 1);
        this.trendingSearchData = queryParamsData;

        if (queryParamsData['page'] == undefined || queryParamsData['page'] == 1) {
            this.firstPageContent = true;
        } else {
            this.firstPageContent = false;
        }
    }

    updateConfigBasedOnParams(paramsData)
    {
        if (paramsData && paramsData.id && slpPagesExtrasIdMap.hasOwnProperty(paramsData.id)) {
            this.isSLPPage = true;
            this.getExtraCategoryData(paramsData).subscribe((paramsData) =>
            {
                if (paramsData && paramsData['status'] && paramsData['data'] && paramsData['data'].length) {
                    if (this._commonService.isServer) {
                        this._tState.set(EDK, paramsData);
                    }
                    this.parseData(paramsData['data']);
                }
                this.page_title = paramsData['pageTitle'];
            });
        } else {
            this.isSLPPage = false;
        }
    }

    parseData(data)
    {
        let relevantObj: any = {};
        data.forEach(obj =>
        {
            relevantObj = obj;
        });

        if (relevantObj.block_data && relevantObj.block_data.product_data) {
            relevantObj.block_data.product_data.forEach(product =>
            {
                if (product.discount_percentage && product.pricewithouttax && parseInt(product.discount_percentage) < 100) {
                    product.discount_percentage = parseInt(product.discount_percentage);
                    product.pricewithouttax = parseInt(product.pricewithouttax);
                }
                let desc = {
                    Brand: ""
                };
                if (product && product.short_description) {
                    let descArr = product.short_description.split("||");
                    descArr.forEach(element =>
                    {
                        let splitEl = element.split(":");
                        if (splitEl[0].toLowerCase() == "brand" || splitEl[0].toLowerCase() == "by") {
                            desc.Brand = splitEl[1];
                        } else {
                            desc[splitEl[0]] = splitEl[1];
                        }
                    });
                }
                product.descriptionObj = desc;
            });
        }
    }
    // shared product listing data update
    createProductsSchema(productArray)
    {
        if (this._commonService.isServer) {
            if (productArray.length > 0) {
                const productList = [];
                productArray.forEach((product, index) =>
                {
                    productList.push({
                        "@type": "ListItem",
                        "position": index + 1,
                        "url": CONSTANTS.PROD + '/' + product.productUrl,
                        "name": product.productName,
                        "image": CONSTANTS.IMAGE_BASE_URL + product.mainImagePath
                    })
                });
                const schemaObj = {
                    "@context": "https://schema.org",
                    "@type": "ItemList",
                    "numberOfItems": productArray.length,
                    "url": CONSTANTS.PROD + this._router.url,
                    "name": this.alpCategoryCodeData?.categoryDetails?.categoryName,
                    "itemListElement": productList
                }
                let s = this._renderer2.createElement('script');
                s.type = "application/ld+json";

                s.text = JSON.stringify(schemaObj);
                this._renderer2.appendChild(this._document.head, s);
            }
        }
    }

    private setCanonicalUrls(response)
    {

        const currentRoute = this._router.url.split('?')[0].split('#')[0];
        if (this._commonService.isServer) {

            const links = this._renderer2.createElement('link');
            //console.log("links ",links);
            links.rel = 'canonical';
            if (this.pageNo == undefined || this.pageNo == 1) {
                links.href = CONSTANTS.PROD + currentRoute.toLowerCase();
            }
            else {
                links.href = CONSTANTS.PROD + currentRoute.toLowerCase() + "?page=" + this.pageNo;
            }
            // links.href = CONSTANTS.PROD + currentRoute.toLowerCase()+ "?page="+this.pageNo;
            //console.log("links.href", links.href)
            this._renderer2.appendChild(this._document.head, links);

            // JIRA: ODP-1371
            // this.setAmpTag('alp');
        }

        // Start Canonical URL
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

    getExtraCategoryData(data): Observable<{}>
    {
        if (this._tState.hasKey(EDK)) {
            return of(this._tState.get(EDK, {}));
        } else {
            return this._categoryService.getCategoryExtraData(slpPagesExtrasIdMap[data.id]);
        }
    }

    setAmpTag(page)
    {
        let currentRoute = this._router.url.split("?")[0].split("#")[0];
        let ampLink;
        ampLink = this._renderer2.createElement('link');
        ampLink.rel = 'amphtml';
        if (page == "alp") {
            ampLink.href = CONSTANTS.PROD + '/ampl' + currentRoute.toLowerCase();
            this._renderer2.appendChild(this._document.head, ampLink);
        }
    }
}