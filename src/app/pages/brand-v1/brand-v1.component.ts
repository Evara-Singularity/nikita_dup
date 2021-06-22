import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductListingDataEntity } from '@app/utils/models/product.listing.search';

@Component({
    selector: 'brand',
    templateUrl: './brand-v1.html',
    styleUrls: ['./brand-v1.scss'],
})

export class BrandV1Component {
    filterInstance = null;
    @ViewChild('filter', { read: ViewContainerRef }) filterContainerRef: ViewContainerRef;

    sortByInstance = null;
    @ViewChild('sortBy', { read: ViewContainerRef }) sortByContainerRef: ViewContainerRef;

    paginationInstance = null;
    @ViewChild('pagination', { read: ViewContainerRef }) paginationContainerRef: ViewContainerRef;

    brandDetailsFooterInstance = null;
    @ViewChild('brandDetailsFooter', { read: ViewContainerRef }) brandDetailsFooterContainerRef: ViewContainerRef;

    productListingData: ProductListingDataEntity;
    constructor(public _activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.setCategoryDataFromResolver();
    }

    setCategoryDataFromResolver() {
        // Get data from resolver and render the view

        this._activatedRoute.data.subscribe(resolverData => {
            console.log(resolverData);
            // this.initiallizeData(resolverData['brand'][0]);
        });
    }
}
