import {
    Component, Input, EventEmitter, Output,
    ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation, PLATFORM_ID, Inject
} from '@angular/core';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Subject } from "rxjs/Subject";
import { ActivatedRoute, Router } from "@angular/router";
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { SortByComponent } from '@components/sortBy/sortBy.component';
import { CommonService } from '@app/utils/services/common.service';
import CONSTANTS from '@app/config/constants';
const RPRK: any = makeStateKey<{}>("RPRK") //RPRK: Refresh Product Result Key

@Component({
    selector: 'pagination',
    templateUrl: 'pagination.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./pagination.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PaginationComponent {
    @Output() onPageChange: EventEmitter<any> = new EventEmitter<any>();
    @Input() paginationUpdated: Subject<any>;
    @Input() sortByComponent: SortByComponent;
    @Input() sortByComponentUpdated: Subject<SortByComponent>;
    page: number = 1;
    itemCount = 0;
    @Input() position: string;
    pageSize: number;
    pager: any = {};
    pages: any[] = [];
    isServer: boolean;
    isBrowser: boolean;
    currRoute: string;

    constructor(private _router: Router, private _tState: TransferState, @Inject(PLATFORM_ID) platformId, private cd: ChangeDetectorRef, private _commonService: CommonService, public _activatedRoute: ActivatedRoute) {
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);

    };

    ngOnInit() {
        this.currRoute = this._router.url.split("?")[0];
        if (this._tState.hasKey(RPRK)) {
            let response = this._tState.get(RPRK, {});
            this.initializePaginationData({ itemCount: response["productSearchResult"]["totalCount"] });
        }

        this.paginationUpdated.subscribe((data) => {
            this.initializePaginationData(data);
            this.cd.markForCheck();                            // marks path
        });

        this.sortByComponentUpdated.subscribe((data) => {
            this.initializeSortByData(data);
            this.cd.markForCheck();
        })
    }

    private initializeSortByData(data) {
        this.sortByComponent = data;
    }

    private initializePaginationData(data) {
        let queryParams = data["queryParams"] ? data["queryParams"] : this._commonService.getDefaultParams().queryParams;

        if (data["pageSize"])
            this.pageSize = data["pageSize"];
        else
            this.pageSize = (queryParams["pageSize"] != undefined && queryParams["pageSize"] != CONSTANTS.GLOBAL.default.pageSize + "") ? queryParams["pageSize"] : CONSTANTS.GLOBAL.default.pageSize + "";

        if (queryParams["page"] != undefined)
            this.page = parseInt(queryParams["page"]);
        else {
            this.page = 1;
        }
        let pages = [];

        for (let i = 0; i < data.itemCount; i++) {
            pages.push(i + 1);
        }
        this.pages = pages;
        this.itemCount = data.itemCount;
    }

    pageChanged(newPage) {
        this.page = newPage;
        this.onPageChange.emit(this.page);
    }
}