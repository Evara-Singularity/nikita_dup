import { EventEmitter, Component, Input, OnInit, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
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

    constructor(
        public _commonService: CommonService,
    ) {
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
                    if (this._commonService.selectedFilterData.filter.hasOwnProperty(this.filterData[filterKey]['name'])) {
                        this._commonService.selectedFilterData.filter[this.filterData[filterKey]['name']].push(term['term']);
                    } else {
                        this._commonService.selectedFilterData.filter[this.filterData[filterKey]['name']] = [term['term']];
                    }
                }
            }
        }
        this._commonService.selectedFilterData.filter;
    }

    /**
     * This funcition is used to modify the selected filters data i.e stored in selectedFilterData
     * @param event 
     * @param filterName - name of the filter
     * @param filterRow - filter row which is checked or unchecked
     */
    updateSelectedFilterData = (event, filterName, filterRow) => {
        filterName = filterName.toLowerCase();

        if (this._commonService.selectedFilterData.filter.hasOwnProperty(filterName)) {
            if (event.target.checked === true) {
                this._commonService.selectedFilterData.filter[filterName].push(filterRow.term);
                this.filterData[this.selectedFilterIndex].count = this.filterData[this.selectedFilterIndex].count + 1;
            } else {
                for (let i = 0; i < this._commonService.selectedFilterData.filter[filterName].length; i++) {
                    if (this._commonService.selectedFilterData.filter[filterName][i] === filterRow.term) {
                        this._commonService.selectedFilterData.filter[filterName].splice(i, 1);
                        this.filterData[this.selectedFilterIndex].count = this.filterData[this.selectedFilterIndex].count - 1;
                    }
                }
            }
        } else {
            this.filterData[this.selectedFilterIndex].count = 1;
            this._commonService.selectedFilterData.filter[filterName] = [filterRow.term];
        }
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