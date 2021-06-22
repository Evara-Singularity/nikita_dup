import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductListingDataEntity } from '@app/utils/models/product.listing.search';
import { ProductListService } from '@app/utils/services/productList.service';

@Component({
    selector: 'category',
    templateUrl: './category-v1.html',
    styleUrls: ['./category-v1.scss'],
})

export class CategoryV1Component {
    filterInstance = null;
    @ViewChild('filter', { read: ViewContainerRef }) filterContainerRef: ViewContainerRef;

    sortByInstance = null;
    @ViewChild('sortBy', { read: ViewContainerRef }) sortByContainerRef: ViewContainerRef;

    paginationInstance = null;
    @ViewChild('pagination', { read: ViewContainerRef }) paginationContainerRef: ViewContainerRef;

    brandDetailsFooterInstance = null;
    @ViewChild('brandDetailsFooter', { read: ViewContainerRef }) brandDetailsFooterContainerRef: ViewContainerRef;

    productListingData: ProductListingDataEntity;
    constructor(
        private _activatedRoute: ActivatedRoute,
        public _productListService: ProductListService
    ) {}

    ngOnInit(): void {
        this.setDataFromResolver();
    }
    
    setDataFromResolver() {
    this._activatedRoute.data.subscribe(result => {
        console.log(result);
        this._productListService.createAndProvideDataToSharedListingComponent(result['category'][1], 'Category Results');
    });
    }
}
