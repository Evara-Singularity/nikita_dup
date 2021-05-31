import { Component, Input, PLATFORM_ID, Inject } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';

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
        // console.log('!!!!!!!!!!!!!1', defaultParams);
        // console.log(item.categoryLink);
        if (defaultParams['pageName'] === 'CATEGORY' || defaultParams['pageName'] === 'ATTRIBUTE') {
            return '/' + item.categoryLink;
        }
        if (defaultParams['pageName'] === 'SEARCH') {
            return item.categoryLink;
        }
        if (defaultParams['pageName'] === 'BRAND') {
            return '/' + 'brands/' + defaultParams['brand'] + '/' +  item.categoryLink;
        }
    }

    getQueryParams(item) {

        const qp = this._cs.getDefaultParams().queryParams;
        const queryParams = this._cs.generateQueryParams(qp);

        const defaultParams = this._cs.getDefaultParams();
        // console.log('!!!!!!!!!!!!!1', defaultParams);
        if (defaultParams['pageName'] === 'SEARCH') {
            // search_query
            // return ['/'+item.categoryLink];
            queryParams['search_query'] = item.term.toLowerCase();
        }

        /*if (defaultParams['pageName'] == 'BRAND') {
            queryParams['category'] = item.term.toLowerCase();
        }*/

        if (Object.keys(queryParams).length > 0) {
            return queryParams;
        }

        return {};
    }

    getFragments() {
        const filterData = this._cs.getDefaultParams().filter;
        console.log(filterData);
        console.log('--------------------');
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
