import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, HostListener, PLATFORM_ID, Inject, OnInit, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { CommonService } from '@app/utils/services/common.service';
import { ClientUtility } from '@app/utils/client.utility';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { SortByComponent } from '@app/components/sortBy/sortBy.component';
declare let dataLayer;
import { CONSTANTS } from '@app/config/constants';
import { makeStateKey, TransferState } from '@angular/platform-browser';
const RPRK: any = makeStateKey<{}>('RPRK'); // RPRK: Refresh Product Result Key
const ISMOB: any = makeStateKey<boolean>('ISMOB'); // ISMOB: IS MOBILE

@Component({
    selector: 'filter',
    templateUrl: 'filter.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./filter.scss'],    
})

export class FilterComponent implements OnInit, AfterViewInit {
    @Input() pageName: string;
    @Input() sortByComponent: SortByComponent;
    buckets = [];
    @Input() bucketsUpdated: Subject<any>;
    @Input() sortByComponentUpdated: Subject<SortByComponent>;
    @Output() filterSelected = new EventEmitter<any>();
    productFilterDataMobileView: any;
    productFilterData: {};
    windowWidth: number;
    filterActiveIndex: number;
    isServer: boolean;
    isBrowser: boolean;
    isInitialLoad: number;
    lev0 = lev0;
    lev1 = lev1;
    lev2 = lev2;
    lev3 = lev3;
    lev4 = lev4;
    lev5 = lev5;
    lev6 = lev6;
    lev7 = lev7;
    lev8 = lev8;
    lev9 = lev9;
    accordianTarget: boolean;
    isMob: boolean;
    constructor(private _ts: TransferState, @Inject(PLATFORM_ID) platformId, private _ar: ActivatedRoute,
        private _cd: ChangeDetectorRef, public _router: Router, private _cs: CommonService) {
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
        this.filterActiveIndex = 0;
        this.isInitialLoad = 0;
        this.isMob = this._ts.get(ISMOB, false);
        const defaultParams = this._cs.getDefaultParams();

        if (defaultParams['filter'] !== undefined) {
            this.productFilterData = defaultParams['filter'];
        }
    }

    ngOnInit() {

        if (this._ts.hasKey(RPRK)) {
            const response = this._ts.get(RPRK, {});
            this.initiallizeData(response['buckets']);
        }
        
        this.bucketsUpdated.subscribe((buckets) => {
            this.isInitialLoad++;
            this._ar.fragment.subscribe((data) => {
                if (!data) {
                    this.isInitialLoad = 0;
                    this.initiallizeData(buckets);
                    this._cd.markForCheck(); // marks path
                }
                if (data) {
                    this.initiallizeData(buckets);
                    this._cd.markForCheck(); // marks path
                }
            });

        });

        this.sortByComponentUpdated.subscribe((data) => {
            this.initializeSortByData(data);
            this._cd.markForCheck();
        });

        if (this.isBrowser) {
            setTimeout(() => {
                if (document.querySelector('div.material')) {
                    document.querySelector('div.material').classList.remove('outer');
                }
                for (const key of Object.keys(this.productFilterData)) {
                    let selectorClass = key;
                    if (key === 'toe type') {
                        selectorClass = 'toe';
                    }
                }
            }, 0);
        }
    }

    gaEventOncategory(bucketName, bucketTerm) {
        const categories: Array<any> = CONSTANTS.FILTER_GA_ID;
        this._ar.params.subscribe((data) => {
            const id = data['id'];
            let isFound = true;
            categories.forEach(element => {
                if (element === id) {
                    isFound = false;
                    dataLayer.push({
                        'event': 'filterClick',
                        'eventAction': bucketName,
                        'eventLabel': bucketTerm.term + '@' + id
                    });
                }
            });
            if (isFound) {
                dataLayer.push({
                    'event': 'filterClick',
                    'eventAction': bucketName,
                    'eventLabel': bucketTerm.term,
                });
            }
        });
    }

    private initializeSortByData(data) {
        this.sortByComponent = data;
    }

    private initiallizeData(buckets) {
        this.buckets = buckets;
        this.productFilterData = this.createProductFilterData(this.buckets);
    }

    ngAfterViewInit() {
        if (this.isBrowser) {
            this.windowWidth = window.innerWidth;
            if (document.querySelector('.fa-angle-right')) {
                document.querySelector('.fa-angle-right').addEventListener('click', function (e) {
                    this.classList.add('fa-angle-down');
                });
            }
        }
    }

    @HostListener('window:resize', ['$event'])
    resize(event) {
        this.windowWidth = window.innerWidth;
    }

    filterUp() {
        if (this.isBrowser) {
            document.querySelector('.mob_filter').classList.toggle('upTrans');
        }
    }

    isChildCategoryExist(childCategories) {
        if (Object.keys(childCategories).length > 0) {
            return true;
        } else {
            return false;
        }
    }

    deleteProductFilterData = (pfdKey, fd) => {
        const si = this.productFilterData[pfdKey].indexOf(fd);
        this.productFilterData[pfdKey].splice(si, 1);
        /**
         * Delete filter, if no filter present.
         */
        if (this.productFilterData[pfdKey].length === 0) {
            delete this.productFilterData[pfdKey];
        }

        const currentRoute = this._cs.getCurrentRoute(this._router.url);
        const extras: NavigationExtras = this.getExtras();

        this._cs.updateSortByState(this.sortByComponent.sortBy);
        this._router.navigate([currentRoute], extras);
    }

    createDataTarget(data, i) {
        return data + i;
    }

    openAccordion(i) {
        this.accordianTarget = !this.accordianTarget;
    }

    toggleList(level, index) {
        if (document.querySelector(level + index)) {
            document.querySelector(level + index).classList.toggle('collapse');
        }
    }
    expandFilter(name, index, event) {
        let targetEl = event.target;
        if (targetEl && (!ClientUtility.parent(targetEl, '.js-do-not-capture') && !targetEl.classList.contains('js-do-not-capture'))) {
            if (targetEl && !targetEl.classList.contains('js-filter-section')) {
                targetEl = ClientUtility.parent(targetEl, '.js-filter-section');
                if (!targetEl || !targetEl.classList.contains('js-filter-section')) {
                    return;
                }
            }
            if (targetEl.querySelector('h4')) {
                targetEl.querySelector('h4').classList.toggle('minus');
            }
            if (name === 'category') {
                this.toggleList(name, index);
            }
            setTimeout(() => {
                name = name.split(' ').join('-');
                if (targetEl.querySelector('#' + name + index)) {
                    if (targetEl.querySelector('#' + name + index).classList.contains('in')) {
                        targetEl.querySelector('#' + name + index).classList.add('out');
                        targetEl.querySelector('#' + name + index).classList.remove('in');
                    } else {
                        targetEl.querySelector('#' + name + index).classList.add('in');
                        targetEl.querySelector('#' + name + index).classList.remove('out');
                    }
                }
            }, 0);
        }
    }
    changeArraow(lev, index) {
        if (this['lev' + lev][index].right) {
            this['lev' + lev][index] = { right: false };
        } else {
            this['lev' + lev][index] = { right: true };
        }
    }

    createProductFilterData = (buckets) => {
        const productFilterData = {};
        for (const bucketKey of Object.keys(buckets)) {
            const bucket = buckets[bucketKey];
            bucket.count = 0;
            for (const termKey of Object.keys(bucket['terms'])) {
                const term = bucket['terms'][termKey];
                if (term['selected']) {
                    bucket.count = bucket.count + 1;
                    if (productFilterData.hasOwnProperty(bucket['name'])) {
                        productFilterData[bucket['name']].push(term['term']);
                    } else {
                        productFilterData[bucket['name']] = [term['term']];
                    }
                }
            }
        }
        this.filterSelected.emit(Object.keys(productFilterData).length);
        return productFilterData;
    }

    updateProductFilterData = (event, bucketName, bucketTerm, mobileView) => {
        this.gaEventOncategory(bucketName, bucketTerm);
        bucketName = bucketName.toLowerCase(); // Done this because, sometime first letter becomes capital.
        let productFilterData = {};

        productFilterData = Object.assign(productFilterData, this.productFilterData);

        if (productFilterData.hasOwnProperty(bucketName)) {
            if (event.target.checked === true) {
                productFilterData[bucketName].push(bucketTerm.term);
            } else {
                for (let i = 0; i < productFilterData[bucketName].length; i++) {
                    if (productFilterData[bucketName][i] === bucketTerm.term) {
                        productFilterData[bucketName].splice(i, 1);
                    }
                }
            }
        } else {
            productFilterData[bucketName] = [bucketTerm.term];
        }

        this.productFilterData = productFilterData;
        if (this.isBrowser) {
            for (const key of Object.keys(this.productFilterData)) {
                let selectorClass = key;
                if (key === 'toe type') {
                    selectorClass = 'toe';
                }
            }
        }

    }
    goToCategory(list) {
        this._router.navigateByUrl(list.categoryLink);
    }

    getRouterLink(item) {
        const defaultParams = this._cs.getDefaultParams();
        if (defaultParams['pageName'] === 'CATEGORY') {
            return ['/' + item.categoryLink];
        }
        if (defaultParams['pageName'] === 'BRAND') {
            return ['/brands/' + defaultParams['brand'] + '/' + item.categoryLink];
        }
        return '';
    }

    updateFilterActiveIndex(i) {
        this.filterActiveIndex = i;
    }

    applyMobileFilter(data?: any) {
        if (data !== undefined && data.productFilterData !== undefined) {
            this.productFilterData = data.productFilterData;
        }

        const currentRoute = this._cs.getCurrentRoute(this._router.url);
        const extras: NavigationExtras = this.getExtras();
        if (this.sortByComponent) {
            this._cs.updateSortByState(this.sortByComponent.sortBy);
        }
        this._router.navigate([currentRoute], extras);
        if (this.isBrowser) {
            document.querySelector('.mob_filter').classList.toggle('upTrans');
        }
    }

    clearFilter() {
        this.productFilterData = {};
        const currentRoute = this._cs.getCurrentRoute(this._router.url);
        const extras: NavigationExtras = this.getExtras();
        if (this.sortByComponent) {
            this._cs.updateSortByState(this.sortByComponent.sortBy);
        }
        this._router.navigate([currentRoute], extras);
    }

    getExtras() {
        const extras: NavigationExtras = { queryParams: {} };
        const fragmentString = this._cs.generateFragmentString(this.productFilterData);
        if (fragmentString != null) {
            extras.fragment = fragmentString;
        }
        const queryParams = this._ar.snapshot.queryParams;

        if (Object.keys(queryParams).length > 0) {
            for (const key of Object.keys(queryParams)) {
                extras.queryParams[key] = queryParams[key];
            }
        }

        if (extras.queryParams['page'] !== undefined) {
            delete extras.queryParams['page'];
        }

        return extras;
    }



    testFilterFragment(filter) {
        let currentUrlFilterData = filter.replace(/^\/|\/$/g, '');
        currentUrlFilterData = currentUrlFilterData.replace(/^\s+|\s+$/gm, '');
        let newCurrentUrlFilterData = '';
        for (let i = 0; i < currentUrlFilterData.length; i++) {
            if (currentUrlFilterData[i] == '/' && /^\d+$/.test(currentUrlFilterData[i + 1])) {
                newCurrentUrlFilterData = newCurrentUrlFilterData + '$';
            } else {
                newCurrentUrlFilterData = newCurrentUrlFilterData + currentUrlFilterData[i];
            }
        }
        currentUrlFilterData = newCurrentUrlFilterData.split('/');
        if (currentUrlFilterData.length > 0) {
            const filter: any = {};
            for (let i = 0; i < currentUrlFilterData.length; i++) {
                const filterName = currentUrlFilterData[i].substr(0, currentUrlFilterData[i].indexOf('-')).toLowerCase(); // 'price'
                const filterData = currentUrlFilterData[i].replace('$', '/')
                    .substr(currentUrlFilterData[i].indexOf('-') + 1).split('||'); // ['101 - 500', '501 - 1000']
                filter[filterName] = filterData;
            }
        }
    }

    addRupee(priceData)
    {
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

function createArray(what, L) {
    const arr = new Array(L);
    while (L) {
        arr[--L] = what;
    }
    return arr;
}


const lev0 = createArray({ right: true }, 25);
const lev1 = createArray({ right: true }, 25);
const lev2 = createArray({ right: true }, 25);
const lev3 = createArray({ right: true }, 25);
const lev4 = createArray({ right: true }, 25);
const lev5 = createArray({ right: true }, 25);
const lev6 = createArray({ right: true }, 25);
const lev7 = createArray({ right: true }, 25);
const lev8 = createArray({ right: true }, 25);
const lev9 = createArray({ right: true }, 25);


import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'
import { ObjectToArrayPipeModule } from '@app/utils/pipes/object-to-array.pipe';
import { FilterSearchBoxDirectiveModule } from '@app/utils/directives/filterSearchBox.directive';
import { CategoryModule as FilterCategoryModule } from '@app/components/filter/category/category.module';
import { AddRupaySymbolPipeModule } from "./pipes/add-rupay-symbol";

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        FilterCategoryModule,
        ObjectToArrayPipeModule,
        AddRupaySymbolPipeModule,
        FilterSearchBoxDirectiveModule,
    ],
    exports: [
        FilterComponent
    ],
    declarations: [
        FilterComponent
    ],
})
export class BrandModule { }
export class CategoryModule extends BrandModule { }
export class SearchModule extends BrandModule { }
