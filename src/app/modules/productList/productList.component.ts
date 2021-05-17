import {
    Component, ElementRef, ViewEncapsulation, Input, ChangeDetectorRef,
    ChangeDetectionStrategy,
    PLATFORM_ID, Inject
} from '@angular/core';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import {CommonService} from "@app/utils/services/common.service";
import {Subject} from "rxjs";
import { fade } from '@app/utils/animations/animation';
import { CONSTANTS } from "@app/config/constants";
import { makeStateKey, TransferState } from '@angular/platform-browser';
declare let dataLayer;
declare let $:any;

const RPRK: any = makeStateKey<{}>("RPRK") //RPRK: Refresh Product Result Key
const GRCRK: any = makeStateKey<{}>("GRCRK")// GRCRK: Get Related Category Result Key


@Component({
    selector: 'product-list',
    templateUrl: 'productList.html',
    styleUrls: [
        '../../pages/category/category.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        fade
    ]
})

export class ProductListComponent{
    isServer: boolean;
    isBrowser: boolean;
    defaultImage = CONSTANTS.IMAGE_BASE_URL + 'img/others/Card.jpg';
    offset = 100;
    currentUrl: string;
    imagePath = CONSTANTS.IMAGE_BASE_URL;
    blank = '';
    gridView = false;
    @Input() productsUpdated: Subject<any>;
    @Input() productsCount: Subject<any>;
    @Input() relatedCatgoryListUpdated: Subject<any>;
    @Input('isDisplayCategoryName') isDisplayCategoryName = true;
    products;
    categoryDataResponse:any;
    categoryDataName:any;
    displayCategoryName:any;
    productCount:any;
    firstImage = '';
    API = CONSTANTS;
    constructor(private _tState:TransferState, @Inject(PLATFORM_ID) platformId, private cd: ChangeDetectorRef, public _router:Router,private _commonService: CommonService, private elementRef: ElementRef){
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
    };

    ngOnInit(){

        if (this.isBrowser) {
            if (window.outerWidth >= 768) {
                this.blank = '_blank';
            }
        }

        this.currentUrl = this._router.url;
        if (this.isBrowser && document.querySelector('a[target="_blank"]')) {
            document.querySelector('a[target="_blank"]').removeAttribute('target');
        }

        if (this._tState.hasKey(RPRK)) {
            const response = this._tState.get(RPRK, {});
            this.products = response['productSearchResult']['products'];
            this.productCount = response['productSearchResult']['totalCount'];
            
            // if(this.isBrowser)
                // console.log(this.products, "product listproduct listproduct list")
        }

        this.productsUpdated.subscribe((products)=>{
            this.products = products;
            if(this.products.length)
                this.firstImage = CONSTANTS.IMAGE_BASE_URL + products[0].mainImageLink;
            this.cd.markForCheck(); // marks path
        });
        
        if(this.productsCount && this.productsCount.subscribe){
            this.productsCount.subscribe((productsCount)=>{
                this.productCount = productsCount.itemCount;
            })
        }

         if (this._tState.hasKey(GRCRK)) {
            let response = this._tState.get(GRCRK, {});
            //this.relatedCatgoryList = response["children"];
            //this.categoryDataResponse= response;
            this.displayCategoryName = response['categoryDetails'].categoryName;
        } 
        if (this.relatedCatgoryListUpdated && this.relatedCatgoryListUpdated.subscribe) {
            this.relatedCatgoryListUpdated.subscribe((relatedCatgoryList)=>{
                this.displayCategoryName = relatedCatgoryList['categoryDetails'].categoryName;
                this.cd.markForCheck(); // marks path
            })
        }
    }

    ngAfterViewInit(){
        
    }

    goToProducDetailPage(url)
    {
        this._router.navigate([url]);
    }

    execGaGTm(product, index){
        // alert();

        let defaultParams = this._commonService.getDefaultParams();
        this._commonService.setSectionClickInformation(defaultParams['pageName'], 'pdp');
        let searchResultsTrackingData = this._commonService.getSearchResultsTrackingData();
        if(defaultParams['pageName'] == "SEARCH"){
            dataLayer.push({
                'event':'search-results-click',
                'search-query':searchResultsTrackingData['search-query'],
                'search-results':searchResultsTrackingData['search-results'],
                'click-result':product.productName,
                'search-click-category':'pdp'
            });
        }

        let cr: any = this._router.url.replace(/\//,' ').replace(/-/g,' ');
        if(defaultParams['pageName'] == "SEARCH"){
            cr = defaultParams['queryParams']['search_query'];
        }else{
            //console.log(cr);
            cr = cr.split('/');
            //console.log("cr after split", cr);
            cr.splice(cr.length-1, 1);
           //console.log("cr after splice", cr);
            let list = cr[cr.length-1].replace(/ /g,' and ');
            //console.log("cr after replace", cr, list);
            cr = cr.join('/');
            //console.log("cr after join", cr, list);
        }



        let gaGtmData = this._commonService.getGaGtmData();
        this._commonService.setGaGtmData({category: cr});


        dataLayer.push({
            'event': 'productClick',
            'ecommerce': {
                'click': {
                    'actionField': {
                        'list': (gaGtmData && gaGtmData["list"]) ? gaGtmData["list"] : ""
                    },
                    'products': [{
                        'name': product.productName,       // Name or ID of the product is required.
                        'id': product.moglixPartNumber,
                        'price': product.salesPrice,
                        'brand': product.brandName,
                        'category': cr,
                        'variant': '',
                        'position': index+1
                    }]
                }
            },
        });
    }

    ngOnDestroy() {
        if (this.isBrowser) {
            sessionStorage.removeItem('listing-page');
        }
    }
}
