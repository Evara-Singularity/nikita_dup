import { Component, Input, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { CommonService } from 'src/app/utils/services/common.service';

@Component({
    selector: 'app-f-category',
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.scss']
})
export class CategoryComponent {
    @Input() terms: {};
    isServer: boolean;
    isBrowser: boolean;
    constructor(@Inject(PLATFORM_ID) platformId, private _cs: CommonService) {
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
    }
    getRouterLink(item) {
        const defaultParams = this._cs.getDefaultParams();
        if (defaultParams['pageName'] === 'CATEGORY' || defaultParams['pageName'] === 'ATTRIBUTE') {
            return '/' + item.categoryLink;
        }
        if (defaultParams['pageName'] === 'SEARCH') {
            return item.categoryLink;
        }
        if (defaultParams['pageName'] === 'BRAND') {
            return '/' + 'brands/' + defaultParams['brand'] + '/' + item.categoryLink;
        }
    }

    getQueryParams(item) {
        const qp = this._cs.getDefaultParams().queryParams;
        const queryParams = this._cs.generateQueryParams(qp);
        const defaultParams = this._cs.getDefaultParams();
        if (defaultParams['pageName'] === 'SEARCH') {
            queryParams['search_query'] = item.term.toLowerCase();
        }
        if (Object.keys(queryParams).length > 0) {
            return queryParams;
        }
        return {};
    }

    getFragments() {
        const filterData = this._cs.getDefaultParams().filter;
        const fragmentString = this._cs.generateFragmentString(filterData);
        if (fragmentString !== null) {
            return fragmentString;
        }
        return null;
    }

    hideFilter() {
        if (this.isBrowser) {
            document.querySelector('.mob_filter').classList.toggle('upTrans');
        }
    }
}