import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CONSTANTS } from '@app/config/constants';
import { CommonService } from '../../utils/services/common.service';
import { TypeAheadService } from '../../utils/services/typeAhead.service';

@Component({
    selector: 'app-trending-search',
    templateUrl: './trending-search.component.html',
    styleUrls: ['./trending-search.component.scss']
})
export class TrendingSearchComponent {
    CONSTANTS = CONSTANTS;
    trendingCat;
    topCategories;
    trendingCatName;
    @Output() outData$: EventEmitter<any> = new EventEmitter<any>();

    constructor(public _router: Router, private _service: TypeAheadService, public _commonService:CommonService) { }

    ngOnInit() {
        this._service.getTrendingCategories().subscribe((data: any) => {
            this.trendingCat = data.data[0]['block_data'];
            this.trendingCatName = this.getTrendingCategories(this.trendingCat['all-categories']);
            this.topCategories = this.getTopCategories(this.trendingCat['search_trending_list']);
        });
    }

    getTopCategories(data) {
        let topCategories = [];
        if (data.data && data.data.length > 0) {
            topCategories = data.data.map((item) => {
                let obj = {
                    'categoryLink': item['image_link'],
                    'categoryName': item['image_title'],
                    'categoryImage': item['image_name'],
                };
                return obj;
            });
        }
        return topCategories;
    }

    getTrendingCategories(data){
        let trendingCategories = [];
        if (data.data && data.data.length > 0) {
            trendingCategories = data.data.map((item) => {
                let obj = {
                    'categoryLink': item['image_link'],
                    'categoryName': item['image_title'],
                    'categoryImage': item['image_name'],
                };
                return obj;
            });
        }
        return trendingCategories;
    }

    navigateTo(link, qp) {
        this._commonService.updateSortByFromSearch();
        this._commonService.setSectionClickInformation('trending_categories_search', 'listing');
        this.outData$.emit('resetAll');
        this._router.navigate([link], { queryParams: qp });
    }

}

