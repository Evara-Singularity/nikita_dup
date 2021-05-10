/**
 * Created by kuldeep on 09/05/17.
 */
import {
    Component, ElementRef, Input, EventEmitter, Output, SimpleChanges,
    ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation, PLATFORM_ID, Inject
} from '@angular/core';
// import { TransferState, makeStateKey } from '@angular/platform-browser';
import {PagerService} from "./pager.service";
import {isPlatformServer, isPlatformBrowser} from '@angular/common';
import { Subject } from "rxjs/Subject";
import {ActivatedRoute,Router} from "@angular/router";
import {CommonService} from "@app/utils/services/common.service";
import {GLOBAL_CONSTANT} from "@app/config/global.constant";
import {SortByComponent} from "@app/modules/sortBy/sortBy.component";
import { makeStateKey, TransferState } from '@angular/platform-browser';

// const PAGINATION_DATA_KEY: any = makeStateKey<{}>("pagination")
// const SORTBY_DATA_KEY: any = makeStateKey<{}>("sortby")
const RPRK: any = makeStateKey<{}>("RPRK") //RPRK: Refresh Product Result Key


@Component({
    selector: 'pagination',
    templateUrl: 'pagination.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls:['./pagination.scss'],
    encapsulation: ViewEncapsulation.None
})

export class PaginationComponent{
    @Output() onPageChange: EventEmitter<any> = new EventEmitter<any>();
    @Input() paginationUpdated: Subject<any>;
    @Input() sortByComponent: SortByComponent;
    @Input() sortByComponentUpdated: Subject<SortByComponent>;
    page: number = 1;
    itemCount = 0;
    @Input() position: string;
    pageSize: number;
    pager: any = {};
    // p: number = 1;
    pages: any[] = [];
    isServer: boolean;
    isBrowser: boolean;
    currRoute: string;

    constructor(private _router: Router,private _tState: TransferState, @Inject(PLATFORM_ID) platformId, private cd: ChangeDetectorRef, private _commonService: CommonService, public _activatedRoute: ActivatedRoute, private _pagerService: PagerService, private elementRef: ElementRef){
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
        //console.log("pagination page");
        //console.log(this.sortByComponent);
    };

    ngOnInit(){
        this.currRoute = this._router.url.split("?")[0];
        //console.log("Pagination Component: ngOnInit", this.paginationUpdated);

        // if(this.isBrowser && this.transferState.hasKey(PAGINATION_DATA_KEY))
        //     this.initializePaginationData(this.transferState.get(PAGINATION_DATA_KEY, {}));

        //console.log("Pagination Component *******************");
        //console.log(this.transferState.get(PAGINATION_DATA_KEY, {}));

        // if(this.isBrowser && this.transferState.hasKey(SORTBY_DATA_KEY))
        //     this.initializeSortByData(this.transferState.get(SORTBY_DATA_KEY, {}));

        if (this._tState.hasKey(RPRK)) {
            let response = this._tState.get(RPRK, {});
            this.initializePaginationData({ itemCount: response["productSearchResult"]["totalCount"] });
            // if(this.isBrowser)
                // console.log({ itemCount: response["productSearchResult"]["totalCount"] }, "pagination pagination pagination pagination");                
        }

        this.paginationUpdated.subscribe((data)=>{

            this.initializePaginationData(data);

            /*if(this.isServer)
                this.transferState.set(PAGINATION_DATA_KEY, data);*/

            //console.log("Completed setting pagination data key")
            // this.setDefaultPage(this.page);
            this.cd.markForCheck(); // marks path
        });


        this.sortByComponentUpdated.subscribe((data)=>{
            this.initializeSortByData(data);
            // if(this.isServer)
            //     this.transferState.set(SORTBY_DATA_KEY, data);
            this.cd.markForCheck();
        })
    }

    private initializeSortByData(data){
        //console.log("sortByComponentUpdated **********", data);

        this.sortByComponent = data;
    }

    private initializePaginationData(data){
        // console.log(data, "datadatadatadatadatadatadata")
        // alert();
        // console.log(data);
        //console.log("Pagination Component: ngOnInit: paginationUpdated.subscribe", data);
        let queryParams = data["queryParams"] ? data["queryParams"] : this._commonService.getDefaultParams().queryParams;

        if(data["pageSize"])
            this.pageSize = data["pageSize"];
        else
            this.pageSize = (queryParams["pageSize"] != undefined && queryParams["pageSize"] != GLOBAL_CONSTANT.default.pageSize+"") ? queryParams["pageSize"] : GLOBAL_CONSTANT.default.pageSize+"";
        // this.itemCount = data.itemCount;
        // console.log("Pagination Component: ngOnInit: paginationUpdated.subscribe", queryParams);

        if(queryParams["page"] != undefined)
            this.page = parseInt(queryParams["page"]);
        else{
            this.page = 1;
        }

        let pages = [];
        for(let i=0; i<data.itemCount; i++){
            pages.push(i+1);
        }
        this.pages = pages;

        this.itemCount = data.itemCount;
    }

    ngAfterViewInit(){
        /*if(this.isBrowser){
            if(this.transferState.hasKey(PAGINATION_DATA_KEY))
                this.transferState.remove(PAGINATION_DATA_KEY);
            if(this.transferState.hasKey(SORTBY_DATA_KEY))
                this.transferState.remove(SORTBY_DATA_KEY);
        }*/
    }

    checkSortBy(){
        //console.log("Check sort by", this.sortByComponent);
    }
    ngOnChanges(changes: SimpleChanges){
        // console.log(changes);
        // console.log("Pagination Component: ngOnChanges", changes);
        // console.log(Object.keys(changes));

        if(Object.keys(changes).length > 0 && changes["sortByComponent"]){
            // console.log("sort by component **************", changes["sortByComponent"]["currentValue"][0]);    
            this.sortByComponent = changes["sortByComponent"]["currentValue"][0];
        }

        // console.log("ngOnChanges***", changes["sortByComponent"], this.sortByComponent);

        if(changes["itemCount"]){
            /*let queryParams = this._activatedRoute.snapshot.queryParams;
             if(Object.keys(queryParams).length>0 && queryParams["page"] != undefined && queryParams["page"] != 1)
             this.page = queryParams["page"];
             else
             this.page = 1;
             this.setPage(this.page);
             //console.log("Pagination Component: ngOnChanges", this.itemCount, this.position);*/
        }
    }

    setDefaultPage(page: number) {
        //console.log("Page changed to ", page);
        if (page < 1 || page > this.pager.totalPages) {
            return;
        }
        this.pager = this._pagerService.getPager(this.itemCount, page, this.pageSize);
    }


    setPage(page: number) {
        if (page < 1 || page > this.pager.totalPages) {
            return;
        }
        this.pager = this._pagerService.getPager(this.itemCount, page, this.pageSize);
        this.onPageChange.emit(page);
    }

    increamentPage(page: any){
        page = parseInt(page) + 1;
        this.setPage(page);
    }
    decreamentPage(page: any){
        page = parseInt(page) - 1
        this.setPage(page);
    }
    //totalItems: number, currentPage: number = 1, pageSize: number = 32
    updatePagination(itemCount: number, page=GLOBAL_CONSTANT.default.pageSize){

    }

    pageChanged(newPage){
        // this._commonService.useLastSortByState = true;
       // console.log("Page Changed **********", this.sortByComponent);
        if(this.sortByComponent)
            this._commonService.updateSortByState(this.sortByComponent.sortBy);
        this.page = newPage;
        this.onPageChange.emit(this.page);
    }
}
