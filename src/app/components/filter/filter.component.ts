import { EventEmitter, Component, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
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

    constructor(public _commonService: CommonService, private _activatedRoute: ActivatedRoute) {
    }

    ngOnInit(){
        // this.initializeSelectedFilterData();
    }

    /**
     * This funcition is used to initalize the selected filters data i.e stored in selectedFilterData
     */
    // initializeSelectedFilterData = (flag?: boolean) => {
    //     if (!flag) {
    //         if (this._activatedRoute.snapshot.fragment) {
    //             this._commonService.selectedFilterData.filter = this._commonService.updateSelectedFilterDataFilterFromFragment(this._activatedRoute.snapshot.fragment);
    //         } else {
    //             this._commonService.selectedFilterData.filter = {};
    //         }
    //     }
    // }


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
                const index = this._commonService.selectedFilterData.filter[filterName].findIndex(f => f === filterRow.term);
                if (index < 0) {
                    this._commonService.selectedFilterData.filter[filterName].push(filterRow.term);
                }
            } else {
                for (let i = 0; i < this._commonService.selectedFilterData.filter[filterName].length; i++) {
                    if (this._commonService.selectedFilterData.filter[filterName][i] === filterRow.term) {
                        const index = this._commonService.selectedFilterData.filter[filterName].findIndex(f => f === filterRow.term);
                        if (index > -1) {
                            this._commonService.selectedFilterData.filter[filterName].splice(i, 1);
                        }
                    }
                }
            }
        } else {
            this._commonService.selectedFilterData.filter[filterName] = [filterRow.term];
        }
    }

}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObjectToArrayPipeModule } from '@app/utils/pipes/object-to-array.pipe';
import { FilterCategoryComponent } from '@app/components/filter/filter-category/filter-category.component';
import { FilterSearchBoxDirectiveModule } from '@app/utils/directives/filterSearchBox.directive';
import { ApplyRemoveClassOnParentModule } from '@app/utils/directives/apply-remove-class-on-parent.directive';
import { AddFilterSymbolPipeModule } from '@app/utils/pipes/addSymbol.pipe';
import { EnabledFilterPipeModule } from '@app/utils/pipes/enabledFilterCount.pipe';


@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ObjectToArrayPipeModule,
        ApplyRemoveClassOnParentModule,
        FilterSearchBoxDirectiveModule,
        AddFilterSymbolPipeModule,
        EnabledFilterPipeModule
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