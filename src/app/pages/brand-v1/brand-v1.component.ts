import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductListingDataEntity } from '@app/utils/models/product.listing.search';
import { ProductListService } from '@app/utils/services/productList.service';

@Component({
    selector: 'brand',
    templateUrl: './brand-v1.html',
    styleUrls: ['./brand-v1.scss','../category-v1/category-v1.scss'],
})

export class BrandV1Component {
    public productListingData: ProductListingDataEntity;
    public cmsData: any[] = [];
    public API_RESPONSE: any;

    constructor(
        public _activatedRoute: ActivatedRoute,
        public _productListService: ProductListService
    ) {}


    ngOnInit(): void {
        this.setDataFromResolver();
    }

    setDataFromResolver() {
        this._activatedRoute.data.subscribe(result => {
            this.API_RESPONSE = result; 
            this._productListService.createAndProvideDataToSharedListingComponent(this.API_RESPONSE['brand'][1], 'Brand Results');
        });
    }
}
