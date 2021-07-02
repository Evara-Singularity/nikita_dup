import { Component, ViewEncapsulation, Input, OnInit, PLATFORM_ID, Inject, ViewChild, ElementRef, NgModule, Renderer2, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, NavigationStart, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { TypeAheadService } from '../../utils/services/typeAhead.service';
import { LocalStorageService } from 'ngx-webstorage';
import { isPlatformServer, isPlatformBrowser, CommonModule } from '@angular/common';
// import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { CommonService } from '../../utils/services/common.service';
import { TrendingSearchModule } from '../../modules/trendingSearch/trending-search.module';
import { SearchHistoryModule } from '../../modules/searchHistory/search-history.module';
import { AutoFocusDirective } from '../../utils/directives/auto-focus.directive';
import CONSTANTS from '@app/config/constants';

@Component({
    selector: 'app-search-bar',
    templateUrl: './search-bar.component.html',
    styleUrls: ['./search-bar.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SearchBarComponent implements OnInit {

    imagePath = CONSTANTS.IMAGE_BASE_URL;
    imageAssetPath = CONSTANTS.IMAGE_ASSET_URL;
    @Input() ssp: boolean = true; // ssp: show search popup
    @Input() data: { type: string };
    @Output() out: EventEmitter<boolean> = new EventEmitter<boolean>();
    @ViewChild('scrollable') scrollable: ElementRef;
    searchForm: FormGroup;
    @Input() showSuggestionBlock: boolean;
    showSuggestionBlockLoader: boolean;
    suggestionList;
    brandSuggestionList;
    categorySuggestionList;
    topProducts;
    isServer: boolean;
    isBrowser: boolean;


    constructor(
        private _cs: CommonService,
        @Inject(PLATFORM_ID) platformId,
        private _lss: LocalStorageService,
        private _r: Router,
        private _fb: FormBuilder,
        private service: TypeAheadService,
        private renderer: Renderer2
    ) {
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
        // this.ssp = false;

        this.showSuggestionBlock = false;
        this.showSuggestionBlockLoader = false;

        this.suggestionList = [];
        this.brandSuggestionList = [];
        this.categorySuggestionList = [];
        this.topProducts = [];

        this.searchForm = this._fb.group({
            'searchTerm': ['', [Validators.required]],
        });

        /**
         * cTerm is used because sometime suggestion are also showing for two letters in search box.
         * While deleting searched letters one by one.
         */
        let cTerm = null;
        this.searchForm.get('searchTerm').valueChanges
            .pipe(
                map((term) => {
                    cTerm = term;
                    if (!term || term.length <= 2) {
                        this.suggestionList = [];
                        this.brandSuggestionList = [];
                        this.categorySuggestionList = [];
                        this.topProducts = [];
                    }
                    return term;
                }),
                debounceTime(400),
                distinctUntilChanged()
            )
            .subscribe(
                term => {
                    if (term && term.length > 2) {
                        this.service.getSuggession(term).subscribe((data) => {
                            if (data) {
                                this.suggestionList = (data.suggestionList != undefined && data.suggestionList.length) > 0 ? data.suggestionList : [];
                                this.brandSuggestionList = (data.brandSuggestionList != undefined && data.brandSuggestionList.length > 0) ? data.brandSuggestionList : [];
                                this.categorySuggestionList = (data.categorySuggestionList != undefined && data.categorySuggestionList.length > 0) ? data.categorySuggestionList : [];
                                if (cTerm && cTerm.length > 2) {
                                    this.showSuggestionBlock = true;
                                }
                            }
                        });
                    }
                }
            );
    }

    ngOnInit(): void {
        // Below code is used to hide the search bar popup on route change.
        this._r.events
            .pipe(
                filter((evt) => evt instanceof NavigationStart)
            )
            .subscribe((event) => {
                this.ssp = false;
            });

    }


    handleSendTextToSearchBar(data: string, e?: Event) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        this.searchForm.get('searchTerm').patchValue(data);
    }


    updateData(event) {
        this.ssp = event;
    }

    stopScroll() {
        (<HTMLElement>document.getElementById('body')).classList.add('stop-scroll');
    }

    ngAfterViewInit() {
        this.suggestionDropDown();
        this.renderer.selectRootElement('#search-input').focus();
    }

    ngOnDestroy() {
        if (this.isBrowser) {
            (<HTMLElement>document.getElementById('body')).classList.remove('stop-scroll');
        }
    }

    preventDefault(e) {
        e.preventDefault();
    }

    disableScroll() {
        if (!this.ssp) {
            //disableBodyScroll(this.scrollable.nativeElement);
        }
    }

    enableScroll() {
        //enableBodyScroll(this.scrollable.nativeElement);
    }

    searchData(dataD, isValid) {
        this.service.goToDirectBrandCatPage(dataD.searchTerm).subscribe(
            (data) => {
                this._cs.updateSortByFromSearch();
                this.enableScroll();
                const extras = {
                    queryParams: {
                        controller: 'search',
                        orderby: 'position',
                        orderway: 'desc',
                        search_query: dataD.searchTerm,
                        submit_search: 'Search',
                        lsource: 'sinput' // lSource: localSource, sinput: searchinput
                    }
                };
                if (dataD.searchTerm !== undefined && dataD.searchTerm != null && dataD.searchTerm.length > 0) {
                    this.addSearchToLocalStorage(dataD.searchTerm, extras);
                    this._cs.setGaGtmData({ list: 'Site Search' });
                }

                if (data['redirectionLink'] != null) {
                    this.showSuggestionBlock = false;
                    this.ssp = false;
                    this._r.navigate([data['redirectionLink']], { queryParams: { sC: 'no' } });
                }
                else {
                    document.getElementById("search-input").blur();
                    this.resetSearchBar();
                    this.ssp = false;
                    if (dataD.searchTerm !== undefined && dataD.searchTerm != null && dataD.searchTerm.length > 0) {
                        this.showSuggestionBlock = false;
                        this._r.navigate(['search'], extras);
                    }
                }
            }
        );
    }

    _parents(selector, context) {
        const elements = [];
        let elem = context;
        const ishaveselector = selector !== undefined;

        while ((elem = elem.parentElement) !== null) {
            if (elem.nodeType !== Node.ELEMENT_NODE) {
                continue;
            }

            if (!ishaveselector || elem.matches(selector)) {
                elements.push(elem);
            }
        }
        return elements;
    }

    public suggestionDropDown(): void {
        // on mouseover set top products with shaded effect
        if (this.isBrowser && document.querySelector('.ac_results')) {
            const that = this;
            document.querySelector('.ac_results').addEventListener('mouseover', (event) => {
                // $('.ac_results').mouseover(function (event) {
                if (document.querySelectorAll('.ac_results .ac_even')) {
                    Array.prototype.map.call(document.querySelectorAll('.ac_results .ac_even'), (result) => {
                        result.classList.remove('ac_over');
                    });
                }
                if ((<HTMLElement>event.target).getAttribute('type')) {
                    const index = Math.ceil(Number((<HTMLElement>event.target).getAttribute('data-index')));
                    (<HTMLElement>event.target).classList.add('ac_over');
                    that.topProducts = that[(<HTMLElement>event.target).getAttribute('type')][index].productList;
                }
            });
        }
    }

    resetSearchBar() {
        this.searchForm.reset();
        this.showSuggestionBlock = false;
    }

    navigateTo(page, data, redirectUrl, categoryId, attributes) {
        this._cs.updateSortByFromSearch();
        this.enableScroll();
        this.resetSearchBar();
        this.showSuggestionBlock = false;
        this.ssp = false;
        if (redirectUrl != undefined || redirectUrl != null) {
            this._r.navigate([redirectUrl], { queryParams: { sC: 'yes' } });
        }
        else if (page === 'SEARCH') {
            let extras = {
                queryParams: {
                    controller: 'search',
                    orderby: 'position',
                    orderway: 'desc',
                    search_query: data,
                    submit_search: 'Search',
                    lsource: 'sclick', // lsource: localSource, sclick: suggestionClick
                    category: categoryId
                }
            };
            if (attributes) {
                extras['fragment'] = this._cs.generateFragmentString(attributes);
            }
            this._cs.setGaGtmData({ list: 'Site Search' });
            this.addSearchToLocalStorage(data, extras);
            this._r.navigate(['search'], extras);
        } else { 
            this._cs.setGaGtmData({ list: 'Site Search' });
            this._r.navigate([data.productUrl], { queryParams: { source: 'topProduct' } });
        }
    }

    addSearchToLocalStorage(data, extras) {
        /**
             * Save search history data to localstorage STARTS
             */
        let sh: Array<{}> = this._lss.retrieve('search-history');
        const cs = {
            name: data,
            extras: extras
        };
        if (sh) {
            const e = sh.some(t => t['name'].toLowerCase() === data.toLowerCase());
            if (!e) {
                // console.log(e);
                sh.push(cs);
            }
        } else {
            sh = [];
            sh.push(cs);
        }
        // console.log(sh, data);
        this._lss.store('search-history', sh);
        // Save search history data to localstorage ENDS
    }

    outData(data) {
        if (data && data == "resetAll") {
            this.enableScroll();
            this.resetSearchBar();
            this.ssp = false;
        }
    }
}


@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        TrendingSearchModule,
        SearchHistoryModule,
        FormsModule, 
        ReactiveFormsModule,
    ],
    declarations: [
        SearchBarComponent,
        AutoFocusDirective
    ],
    providers: [
        TypeAheadService,
    ]
})
export class SearchBarModule {}
