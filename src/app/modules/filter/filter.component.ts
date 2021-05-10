/**
 * Created by kuldeep on 09/05/17.
 */
import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, HostListener, PLATFORM_ID, Inject, OnInit, AfterViewInit, Output, EventEmitter } from '@angular/core';
// import { TransferState, makeStateKey } from '@angular/platform-browser';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { CommonService } from '@app/utils/services/common.service';
import { ClientUtility } from '@app/utils/client.utility';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { SortByComponent } from '../sortBy/sortBy.component';
declare let dataLayer;
// const BUCKETS_KEY: any = makeStateKey<{}>('buckets');
import { CONSTANTS } from '@app/config/constants';
import { makeStateKey, TransferState } from '@angular/platform-browser';
const RPRK: any = makeStateKey<{}>('RPRK'); // RPRK: Refresh Product Result Key
const ISMOB: any = makeStateKey<boolean>('ISMOB'); // ISMOB: IS MOBILE

@Component({
    selector: 'filter',
    templateUrl: 'filter.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./filter.scss']
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
        // console.log(this._ts.get(ISMOB, false), 'filterfilterfilterfilterfilter');
        this.isMob = this._ts.get(ISMOB, false);
        const defaultParams = this._cs.getDefaultParams();

        if (defaultParams['filter'] !== undefined) {
            this.productFilterData = defaultParams['filter'];
        }
    }

    ngOnInit() {
        // console.log('*****************Before Bucket Initialization********************');
        // console.log(this.buckets);
        // if (this.isBrowser && this.transferState.hasKey(BUCKETS_KEY)) {
            // console.log('*****************After Bucket Initialization********************');            
            // console.log(this.transferState.hasKey(BUCKETS_KEY))
            // this.buckets = this.transferState.get(BUCKETS_KEY, []);
            // this.initiallizeData(this.buckets);
        //
        // }

        if (this._ts.hasKey(RPRK)) {
            const response = this._ts.get(RPRK, {});
            this.initiallizeData(response['buckets']);
            // if(this.isBrowser)
                // console.log(response['buckets'], 'filter filter filter');
        }
        this.bucketsUpdated.subscribe((buckets) => {
            this.isInitialLoad++;
            this._ar.fragment.subscribe((data) => {
                if (!data) {
                    this.isInitialLoad = 0;
                    this.initiallizeData(buckets);
                    // if (this.isServer)
                    //     this.transferState.set(BUCKETS_KEY, buckets);
                    this._cd.markForCheck(); // marks path
                }
                if (data) {
                    this.initiallizeData(buckets);
                    // if (this.isServer)
                    //     this.transferState.set(BUCKETS_KEY, buckets);
                    this._cd.markForCheck(); // marks path
                }
            });

            // console.log('*****************Called Bucket next********************');
            // console.log(buckets);

        });

        // console.log('FilterComponent : ngOnInit : productFilterData', this.productFilterData)
        // console.log(this.buckets);
        if (this.isBrowser) {
            // document.addEventListener('DOMContentLoaded', () => {
                // console.log('rendered');
                // console.log(document.querySelector('filter'));
                /* document.querySelector('filter').addEventListener('click', function(e) {
                    if (e.target && (<Element>e.target).matches('h4')) {
                      this.classList.toggle('minus');
                    }
                }); */
            // });
        }


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
                    /* document.querySelector('.enabled-filter div.' + selectorClass).classList.remove('out');
                    ClientUtility.getSiblings(document.querySelector('.enabled-filter div.' + selectorClass), function(el){
                        if( el.nodeName.toLowerCase() === 'h4') {
                            el.classList.add('minus');
                        }
                        return true;
                    });
                    document.querySelector('.enabled-filter div.' + selectorClass).classList.add('in'); */
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
                        //  'eventCategory': 'id',
                        'eventAction': bucketName,
                        'eventLabel': bucketTerm.term + '@' + id
                    });
                }
            });
            if (isFound) {
                dataLayer.push({
                    'event': 'filterClick',
                    // 'eventCategory': 'checkout',
                    'eventAction': bucketName,
                    'eventLabel': bucketTerm.term,
                });
            }
        });
    }

    private initializeSortByData(data) {
        // console.log('sortByComponentUpdated **********', data);

        this.sortByComponent = data;
    }
    private initiallizeData(buckets) {
        // this.allArraows = [
        //     { right: true },
        //     { right: true },
        //     { right: true },
        //     { right: true },
        //     { right: true },
        //     { right: true },
        //     { right: true },
        //     { right: true },
        //     { right: true }
        // ];
        this.buckets = buckets;
        this.productFilterData = this.createProductFilterData(this.buckets);
    }

    ngAfterViewInit() {
        if (this.isBrowser) {
            this.windowWidth = window.innerWidth;
            if (document.querySelector('.fa-angle-right')) {
                document.querySelector('.fa-angle-right').addEventListener('click', function (e) {
                    // alert('ok');
                    this.classList.add('fa-angle-down');
                });
            }

            // $('.fa-angle-down').click(function (e) {
            //     $(this).addClass('fa-angle-right');
            // })

            // if (this.transferState.hasKey(BUCKETS_KEY))
            //     this.transferState.remove(BUCKETS_KEY);
        }
    }

    @HostListener('window:resize', ['$event'])
     resize(event) {
     this.windowWidth = window.innerWidth;
     }

    filterUp() {
        if (this.isBrowser) {
            document.querySelector('.mob_filter').classList.toggle('upTrans');
            // if ($('.mob_filter').hasClass('upTrans')) {
            //     $('.mob_filter').removeClass('upTrans');
            // } else {
            //     $('.mob_filter').addClass('upTrans');
            // }
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
        // console.log(pfdKey, fd);

        // console.log('Before Slice', this.productFilterData);
        const si = this.productFilterData[pfdKey].indexOf(fd);
        this.productFilterData[pfdKey].splice(si, 1);
        // console.log('After Slice', this.productFilterData);
        /**
         * Delete filter, if no filter present.
         */
        if (this.productFilterData[pfdKey].length === 0) {
            delete this.productFilterData[pfdKey];
        }

        // console.log('After Slice', this.productFilterData);

        // this._cs.updateDefaultParamsNew({filter: this.productFilterData, page:1, pageIndex:1});

        const currentRoute = this._cs.getCurrentRoute(this._router.url);
        const extras: NavigationExtras = this.getExtras();

        // console.log('##############Extras#################', extras);
        // this._cs.useLastSortByState = true;
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
        // ClientUtility.slideToggle(document.querySelector(level + index));
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
            // //console.log('777777777777', buckets[bucketKey])
            const bucket = buckets[bucketKey];
            bucket.count = 0;
            for (const termKey of Object.keys(bucket['terms'])) {
                // //console.log('55555555555', bucket['terms'][termKey]);
                const term = bucket['terms'][termKey];
                if (term['selected']) {
                    bucket.count = bucket.count + 1;
                    // //console.log('55555555555', term);
                    if (productFilterData.hasOwnProperty(bucket['name'])) {
                        productFilterData[bucket['name']].push(term['term']);
                    } else {
                        productFilterData[bucket['name']] = [term['term']];
                    }
                }
            }
        }
        this.filterSelected.emit(Object.keys(productFilterData).length);
        // console.log('6666666666666666666666', productFilterData)
        // console.log('bucketesss@@@@@@@@@@@@@', this.buckets);
        return productFilterData;
    }

    updateProductFilterData = (event, bucketName, bucketTerm, mobileView) => {
        // alert('ok');
        this.gaEventOncategory(bucketName, bucketTerm);
        // console.log(event, bucketName, bucketTerm, mobileView);


        // console.log(event.target.checked);
        bucketName = bucketName.toLowerCase(); // Done this because, sometime first letter becomes capital.

        // console.log(mobileView);
        /**
         * Initially assign the current `$scope.productFilterData` in a variable `productFilterData`
         */
        let productFilterData = {};

        // console.log(mobileView);
        /*if(mobileView == true)
         productFilterData = Object.assign(productFilterData, this.productFilterDataMobileView);
         else*/
        productFilterData = Object.assign(productFilterData, this.productFilterData);

        // console.log(bucketName, bucketTerm)
        /**
         * Test object is like below :
         * productFilterData = {'price':['101 - 500'],'brand':['Aaditya','AAE','Bajaj'],'discount':['0 - 10']}
         */
        // console.log(bucketTerm.selected);
        if (productFilterData.hasOwnProperty(bucketName)) {
            // console.log('Bucket found in `productFilterData`, Updating bucket in `productFilterData`');
            // console.log(bucketName, bucketTerm.term);
            if (event.target.checked === true) {
                // console.log('Adding term to bucket in `productFilterData`');
                productFilterData[bucketName].push(bucketTerm.term);

                // console.log(productFilterData);
            } else {
                // console.log('Removing term from bucket in `productFilterData`');
                for (let i = 0; i < productFilterData[bucketName].length; i++) {
                    if (productFilterData[bucketName][i] === bucketTerm.term) {
                        productFilterData[bucketName].splice(i, 1);
                    }
                }
            }
        } else {
            productFilterData[bucketName] = [bucketTerm.term];
            // console.log(productFilterData);
        }

        this.productFilterData = productFilterData;
        if (this.isBrowser) {
            // setTimeout(() => {
                for (const key of Object.keys(this.productFilterData)) {
                    let selectorClass = key;
                    if (key === 'toe type') {
                        selectorClass = 'toe';
                    }
                    /* document.querySelector('.enabled-filter div.' + selectorClass).classList.remove('out');
                    ClientUtility.getSiblings(document.querySelector('.enabled-filter div.' + selectorClass), function(el){
                        if (el.nodeName.toLowerCase() === 'h4') {
                            el.classList.add('minus');
                        }
                        return true;
                    });
                    document.querySelector('.enabled-filter div.' + selectorClass).classList.add('in'); */
                }

                // console.log(this.productFilterData);
            // }, 0);
        }


        /* if (!mobileView) {
            const currentRoute = this._cs.getCurrentRoute(this._router.url);
            const extras: NavigationExtras = this.getExtras();
            this._cs.updateSortByState(this.sortByComponent.sortBy);
            this._router.navigate([currentRoute], extras);
        } */
    }

    /*updateSortByState(){
     let sortBy = this.sortByComponent.sortBy;
     let orderBy = (sortBy == 'popularity') ? 'popularity' : 'price';
     let orderWay = (sortBy == 'lowPrice') ? 'asc' : 'desc';
     // this._cs.useLastSortByState=true;
     this._cs.defaultParams.queryParams['orderBy'] = orderBy;
     this._cs.defaultParams.queryParams['orderWay'] = orderWay;
     }*/

    goToCategory(list) {
        this._router.navigateByUrl(list.categoryLink);
    }

    getRouterLink(item) {
        const defaultParams = this._cs.getDefaultParams();
        // console.log('!!!!!!!!!!!!!1', defaultParams);
        if (defaultParams['pageName'] === 'CATEGORY') {
            return ['/' + item.categoryLink];
        }
        if (defaultParams['pageName'] === 'BRAND') {
            return ['/brands/' + defaultParams['brand'] + '/' +  item.categoryLink];
        }
        return '';
    }

    updateFilterActiveIndex(i) {
        this.filterActiveIndex = i;
    }

    applyMobileFilter(data?: any) {
        // console.log(this.productFilterData);
        /**
         * Below if is used in case of resetting the filters.
         */
        if (data !== undefined && data.productFilterData !== undefined) {
            this.productFilterData = data.productFilterData;
        }

        const currentRoute = this._cs.getCurrentRoute(this._router.url);
        const extras: NavigationExtras = this.getExtras();

        // console.log('##############Extras#################', extras);
        // this._cs.useLastSortByState = true;
        this._cs.updateSortByState(this.sortByComponent.sortBy);
        this._router.navigate([currentRoute], extras);
        if (this.isBrowser) {
            document.querySelector('.mob_filter').classList.toggle('upTrans');
            // if ($('.mob_filter').hasClass('upTrans')) {
            //     $('.mob_filter').removeClass('upTrans');
            // } else {
            //     $('.mob_filter').addClass('upTrans');
            // }
        }
    }

    clearFilter() {
        this.productFilterData = {};
        const currentRoute = this._cs.getCurrentRoute(this._router.url);
        const extras: NavigationExtras = this.getExtras();
        // console.log('##############Extras#################', extras);
        // this._cs.useLastSortByState = true;
        this._cs.updateSortByState(this.sortByComponent.sortBy);
        this._router.navigate([currentRoute], extras);
    }

    getExtras() {
        const extras: NavigationExtras = { queryParams: {} };
        const fragmentString = this._cs.generateFragmentString(this.productFilterData);
        if (fragmentString != null) {
            extras.fragment = fragmentString;
            // console.log(extras);
        }
        // let queryParams = this._cs.generateQueryParams();
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
        // console.log('1', filter)
        let currentUrlFilterData = filter.replace(/^\/|\/$/g, '');
        // console.log('2', currentUrlFilterData);
        currentUrlFilterData = currentUrlFilterData.replace(/^\s+|\s+$/gm, '');
        // console.log('3', currentUrlFilterData);
        let newCurrentUrlFilterData = '';
        // voltage-12/24 VDC/price-1001 - 5000/
        for (let i = 0; i < currentUrlFilterData.length; i++) {
            // //console.log(/^\d+$/.test(currentUrlFilterData[i]))
            if (currentUrlFilterData[i] == '/' && /^\d+$/.test(currentUrlFilterData[i + 1])) {
                // console.log(/^\d+$/.test(currentUrlFilterData[i+1]), newCurrentUrlFilterData);
                newCurrentUrlFilterData = newCurrentUrlFilterData + '$';
                // console.log(newCurrentUrlFilterData);
            } else {
                newCurrentUrlFilterData = newCurrentUrlFilterData + currentUrlFilterData[i];
            }
            // console.log(currentUrlFilterData[i]);
        }
        // console.log('4',  newCurrentUrlFilterData);
        currentUrlFilterData = newCurrentUrlFilterData.split('/');
        // console.log('5', currentUrlFilterData);
        if (currentUrlFilterData.length > 0) {
            const filter: any = {};
            for (let i = 0; i < currentUrlFilterData.length; i++) {
                const filterName = currentUrlFilterData[i].substr(0, currentUrlFilterData[i].indexOf('-')).toLowerCase(); // 'price'
                const filterData = currentUrlFilterData[i].replace('$', '/')
                .substr(currentUrlFilterData[i].indexOf('-') + 1).split('||'); // ['101 - 500', '501 - 1000']
                filter[filterName] = filterData;
            }
            // console.log(filter);
            // defaultParams['filter']=filter;
        }
    }

    addRupee(priceData) // adding rupee (₹) symbol
    {
       let symbol = '₹';
       let price  = priceData.split('-');
       let rData = symbol+price[0].trim()+" - ";
       if(price[1].trim()=="*")
       {
            symbol="";
       }
       rData = rData+symbol+price[1].trim();
       return rData;
    }
    addDiscount(discountData){
        let symbol = '%';
        let discount  = discountData.split('-');
        let dData = discount[0].trim()+symbol+" - ";
        if(discount[1].trim()=="*")
        {
             symbol="";
        }
        dData = dData+discount[1].trim()+symbol;
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
