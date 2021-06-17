import { EventEmitter, Component, Input, OnInit, Output } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonService } from '@app/utils/services/common.service';

@Component({
    selector: 'listing-filter',
    templateUrl: 'filter.html',
    styleUrls: ['./filter.scss'],    
})

export class FilterComponent implements OnInit {
    // input variable to get filter data from parent component
    @Input() filterData: Array<any>;

    // Output event to toggle filter
    @Output('toggleFilter') toggleFilter: EventEmitter<any> = new EventEmitter<any>();

    public selectedFilterIndex: number = 0;
    
    public selectedFilterData: any;

    constructor(
        private _commonService: CommonService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute
    ) {
        this.selectedFilterData = {};
    }

    ngOnInit(){
        this.initializeSelectedFilterData();
    }

    /**
     * This funcition is used to initalize the selected filters data i.e stored in selectedFilterData
     */
    initializeSelectedFilterData = () => {
        for (const filterKey of Object.keys(this.filterData)) {
            this.filterData[filterKey].count = 0;
            for (const termKey of Object.keys(this.filterData[filterKey]['terms'])) {
                const term = this.filterData[filterKey]['terms'][termKey];
                if (term['selected']) {
                    this.filterData[filterKey].count = this.filterData[filterKey].count + 1;
                    if (this.selectedFilterData.hasOwnProperty(this.filterData[filterKey]['name'])) {
                        this.selectedFilterData[this.filterData[filterKey]['name']].push(term['term']);
                    } else {
                        this.selectedFilterData[this.filterData[filterKey]['name']] = [term['term']];
                    }
                }
            }
        }
        this.selectedFilterData;
    }

    /**
     * This funcition is used to modify the selected filters data i.e stored in selectedFilterData
     * @param event 
     * @param filterName - name of the filter
     * @param filterRow - filter row which is checked or unchecked
     */
    updateSelectedFilterData = (event, filterName, filterRow) => {
        filterName = filterName.toLowerCase();

        if (this.selectedFilterData.hasOwnProperty(filterName)) {
            if (event.target.checked === true) {
                this.selectedFilterData[filterName].push(filterRow.term);
                this.filterData[this.selectedFilterIndex].count = this.filterData[this.selectedFilterIndex].count + 1;
            } else {
                for (let i = 0; i < this.selectedFilterData[filterName].length; i++) {
                    if (this.selectedFilterData[filterName][i] === filterRow.term) {
                        this.selectedFilterData[filterName].splice(i, 1);
                        this.filterData[this.selectedFilterIndex].count = this.filterData[this.selectedFilterIndex].count - 1;
                    }
                }
            }
        } else {
            this.filterData[this.selectedFilterIndex].count = 1;
            this.selectedFilterData[filterName] = [filterRow.term];
        }
    }

    /**
     * This funtion is used to create fragment & queryparams and navigate to the specific routes
     */
    applyFilter(currentRouteFromCategoryFilter?){
        const currentRoute = !currentRouteFromCategoryFilter ? this._commonService.getCurrentRoute(this._router.url) : currentRouteFromCategoryFilter;

        const extras: NavigationExtras = { queryParams: {} };

        const fragmentString = this._commonService.generateFragmentString(this.selectedFilterData);

        const queryParams = this._activatedRoute.snapshot.queryParams;
        extras.queryParams = queryParams;

        if (fragmentString != null) {
            extras.fragment = fragmentString;
        } 

        if (extras.queryParams['page']) {
            delete extras.queryParams['page'];
        }

        this.toggleFilter.emit(true);
        this._router.navigate([currentRoute], extras);
    }

    getselectedCategoryLink(item) {
        this.applyFilter(item.categoryLink);
    }
    
    addRupee(priceData) {
        let symbol = '₹';
        let price = priceData.split('-');
        let rData = symbol + price[0].trim() + " - ";
        if (price[1].trim() == "*") {
            symbol = "";
        }
        rData = rData + symbol + price[1].trim();
        return rData;
    }

    addDiscount(discountData) {
        let symbol = '%';
        let discount = discountData.split('-');
        let dData = discount[0].trim() + symbol + " - ";
        if (discount[1].trim() == "*") {
            symbol = "";
        }
        dData = dData + discount[1].trim() + symbol;
        return dData;
    }
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddRupaySymbolPipeModule } from "@utils/pipes/add-rupay-symbol";
import { ObjectToArrayPipeModule } from '@app/utils/pipes/object-to-array.pipe';
import { FilterCategoryComponent } from '@app/components/filter/filter-category/filter-category.component';
import { FilterSearchBoxDirectiveModule } from '@app/utils/directives/filterSearchBox.directive';
import { ApplyRemoveClassOnParentModule } from '@app/utils/directives/apply-remove-class-on-parent.directive';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ObjectToArrayPipeModule,
        AddRupaySymbolPipeModule,
        ApplyRemoveClassOnParentModule,
        FilterSearchBoxDirectiveModule,
    ],
    exports: [
        FilterComponent,
        FilterCategoryComponent,
    ],
    declarations: [
        FilterComponent,
        FilterCategoryComponent,
    ],
})

export class FilterModule { }
export class BrandModule extends FilterModule { }
export class SearchModule extends FilterModule { }
export class CategoryModule extends FilterModule { }
export class PopularProductModule extends FilterModule { }