import { Component, Inject, Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductListingDataEntity } from '@app/utils/models/product.listing.search';
import { CommonService } from '@app/utils/services/common.service';
import { ProductListService } from '@app/utils/services/productList.service';
import { RESPONSE } from '@nguniversal/express-engine/tokens';

@Component({
    selector: 'brand',
    templateUrl: './brand-v1.html',
    styleUrls: ['./brand-v1.scss','../category-v1/category-v1.scss'],
})

export class BrandV1Component {
    public productListingData: ProductListingDataEntity;
    public cmsData: any[] = [];
    public API_RESPONSE: any;
    public popularLinks;
    public brandFooterData;

    constructor(
        public _activatedRoute: ActivatedRoute,
        public _commonService: CommonService,
        public _productListService: ProductListService,
        @Optional() @Inject(RESPONSE) private _response,
    ) {}


    ngOnInit(): void {
        this.setDataFromResolver();
    }

    setDataFromResolver() {
        this._activatedRoute.data.subscribe(result => {
            // pass data to this genric data holder
            this.API_RESPONSE = result; 

            // handle if brand is not active or has zero product count
            this.handleIfBrandIsNotActive();

            // genrate popular links data
            this.popularLinks = Object.keys(this.API_RESPONSE.brand[1].categoryLinkList);

            // create data for shared listing component
            this._productListService.createAndProvideDataToSharedListingComponent(this.API_RESPONSE['brand'][1], 'Brand Results');

            // genrate data for footer
            this.genrateAndUpdateBrandFooterData();
        });
    }

    handleIfBrandIsNotActive(){
        if (!this.API_RESPONSE.brand[0].active || this.API_RESPONSE.brand[1]['productSearchResult']['totalCount'] === 0) {
            if (this._commonService.isServer) {
                this._response.status(404);
            }
        }
    }

    genrateProductSearchResultSEOData() {
        let productSearchResultSEO = [];
        for (let i = 0; i < this.API_RESPONSE.brand[1].productSearchResult.products.length && i < 10; i++) {
            if (this.API_RESPONSE.brand[1].productSearchResult.products[i].salesPrice > 0 && this.API_RESPONSE.brand[1].productSearchResult.products[i].priceWithoutTax > 0) {
                productSearchResultSEO.push(this.API_RESPONSE.brand[1].productSearchResult.products[i]);

            }
        }
        return productSearchResultSEO;
    }

    genrateAndUpdateBrandFooterData(){
        this.brandFooterData = {
            brandCatDesc: this.API_RESPONSE.brand[1].desciption,
            brandShortDesc: this.API_RESPONSE.brand[0].brandDesc,
            iba: this.API_RESPONSE.brand[0].active,
            firstPageContent: this._commonService.selectedFilterData.page < 2,
            productSearchResult: this.API_RESPONSE.brand[1].productSearchResult,
            productSearchResultSEO: this.genrateProductSearchResultSEOData(),
            heading: this.API_RESPONSE.brand[1].heading,
            productCount: this.API_RESPONSE.brand[1].productSearchResult.totalCount,
            brand: this._activatedRoute.snapshot.params.brand,
            productCategoryNames: this.popularLinks,
            categoryLinkLists: this.API_RESPONSE.brand[1].categoryLinkList,
            categoryNames: this.popularLinks.toString(),
            todayDate: Date.now(),
            showDesc: !!(this.API_RESPONSE.brand[0].brandDesc)
        };
    }
}
