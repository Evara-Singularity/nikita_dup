import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, HostListener, PLATFORM_ID, Inject, OnInit, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
declare let dataLayer;
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { CommonService } from 'src/app/utils/services/common.service';
import { SortByComponent } from '../sortBy/sortBy.component';
import CONSTANTS from 'src/app/config/constants';
const RPRK: any = makeStateKey<{}>('RPRK');            // RPRK: Refresh Product Result Key
const ISMOB: any = makeStateKey<boolean>('ISMOB');     // ISMOB: IS MOBILE

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
                    this._cd.markForCheck();             // marks path
                }
                if (data) {
                    this.initiallizeData(buckets);
                   
                    this._cd.markForCheck();             // marks path
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
        bucketName = bucketName.toLowerCase();                                 // Done this because, sometime first letter becomes capital.
        let productFilterData = {};
        productFilterData = Object.assign(productFilterData, this.productFilterData);

        if (productFilterData.hasOwnProperty(bucketName)) {;
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

    updateFilterActiveIndex(i) {
        this.filterActiveIndex = i;
    }

    applyMobileFilter(data?: any) {
        if (data !== undefined && data.productFilterData !== undefined) {
            this.productFilterData = data.productFilterData;
        }
        const currentRoute = this._cs.getCurrentRoute(this._router.url);
        const extras: NavigationExtras = this.getExtras();
        this._cs.updateSortByState(this.sortByComponent.sortBy);
        this._router.navigate([currentRoute], extras);
        if (this.isBrowser) {
            document.querySelector('.mob_filter').classList.toggle('upTrans');
        }
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

    addRupee(priceData)                          // adding rupee (₹) symbol
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