import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../utils/services/common.service';
import { TypeAheadService } from '../../utils/services/typeAhead.service';

@Component({
    selector: 'app-trending-search',
    templateUrl: './trending-search.component.html',
    styleUrls: ['./trending-search.component.scss']
})
export class TrendingSearchComponent {
    trendingCat;
    trendingCatName;
    @Output() outData$: EventEmitter<any> = new EventEmitter<any>();

    constructor(public _router: Router, private _service: TypeAheadService, public _commonService:CommonService) { }

    ngOnInit() {
        this._service.getTrendingCategories().subscribe((data: any) => {
            this.trendingCat = data;
            this.trendingCatName = this.trendingCat['category'];
        });
    }

    navigateTo(link, qp) {
        this._commonService.resetSelectedFilterData();
        this._commonService.setSectionClickInformation('trending_categories_search', 'listing');
        this.outData$.emit('resetAll');
        this._router.navigate([link], { queryParams: qp });
    }

}

