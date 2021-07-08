import { Component, ComponentFactoryResolver, Inject, Injector, Renderer2, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { CategoryService } from '@app/utils/services/category.service';
import { CommonService } from '@app/utils/services/common.service';
import { ProductListService } from '@app/utils/services/productList.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { FooterService } from '@app/utils/services/footer.service';
import { Title } from '@angular/platform-browser';
import { GLOBAL_CONSTANT } from '@app/config/global.constant';

const slpPagesExtrasIdMap = { "116111700": "116111700", "114160000": "114160000", "211521500": "211521500", "114132500": "114132500" };

@Component({
    selector: 'category',
    templateUrl: './category-v1.html',
    styleUrls: ['./category-v1.scss'],
})

export class CategoryV1Component {
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
        private _title: Title,
        public _commonService: CommonService,
        private _activatedRoute: ActivatedRoute,
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

            console.log(result);

            this.API_RESPONSE = result;

            this._title.setTitle((this.API_RESPONSE.category[0].categoryDetails.metaTitle != undefined && this.API_RESPONSE.category[0].categoryDetails.metaTitle != null && this.API_RESPONSE.category[0].categoryDetails.metaTitle != "") ? this.API_RESPONSE.category[0].categoryDetails.metaTitle : "Buy " + this.API_RESPONSE.category[0].categoryDetails.categoryName + " Online at Best Price in India - Moglix.com");

            this.updateComponentsBasedOnrouteChange();

            // genrate popular links data
            this.popularLinks = Object.keys(this.API_RESPONSE.category[1].categoryLinkList);

            this._commonService.selectedFilterData.totalCount = result['category'][1].productSearchResult.totalCount;

            this._productListService.createAndProvideDataToSharedListingComponent(result['category'][1], 'Category Results');

            this.genrateAndUpdateCategoryFooterData();
        });
    }

    genrateAndUpdateCategoryFooterData() {
        this.categoryFooterData = {
            productSearchResult: this.API_RESPONSE.category[1].productSearchResult,
            getRelatedCatgory: this.API_RESPONSE.category[0],
            productSearchResultSEO: this.genrateProductSearchResultSEOData(),
            faqData: this.API_RESPONSE.category[2],
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
                    this.createDynamicComponent('slpSubCategory');
                }

                this.page_title = data['pageTitle'];

                if (data['data'][0].block_data.brand_block) {
                    this.shopByBrandData = data['data'][0].block_data.brand_block;
                    this.createDynamicComponent('shopByBrand');
                }
                if (data['data'][0].block_data.product_data) {
                    this.catBestsellerData = data['data'][0].block_data.product_data;
                    this.createDynamicComponent('catBestseller');
                }
                if (data['data'][0].block_data.image_block) {
                    this.shopbyFeatrData = data['data'][0].block_data.image_block;
                    this.createDynamicComponent('shopbyFeatr');
                }

                if (data['data'][0].block_data.general_block) {
                    this.catStaticData = data['data'][0].block_data.general_block;
                    this.createDynamicComponent('catStatic');
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

