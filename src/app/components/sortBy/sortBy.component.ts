import { debounceTime, first } from 'rxjs/operators';
import {
  Component, ViewEncapsulation, Input, Output, ChangeDetectionStrategy, EventEmitter,
  ChangeDetectorRef, PLATFORM_ID, Inject
} from '@angular/core';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { CommonService } from "@app/utils/services/common.service";
import { NavigationExtras, ActivatedRoute, Router } from "@angular/router";
import { Subject, Subscription } from "rxjs";
import { TransferState, makeStateKey } from '@angular/platform-browser';

@Component({
  selector: 'sort-by',
  templateUrl: 'sortBy.html',
  styleUrls: [
    './sortBy.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class SortByComponent {
  sortBy: string;
  @Input() sortByUpdated: Subject<any>;
  isServer: boolean;
  isBrowser: boolean;
  sortByOpt: boolean;
  @Output() outData$: EventEmitter<{}>;
  constructor(private _tState: TransferState, 
    private _cd: ChangeDetectorRef, 
    @Inject(PLATFORM_ID) platformId, private _activatedRoute: ActivatedRoute, private cd: ChangeDetectorRef, private _commonService: CommonService, private router: Router, private route: ActivatedRoute) {
    this.sortBy = 'popularity';
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);
    this.outData$ = new EventEmitter();

  };

  
  ngOnInit() {
    this.sortByUpdated.subscribe(() => {
      this.initializeData();
      this.cd.markForCheck(); // marks path
    });

    this._commonService.updateSortBy.pipe(first(),debounceTime(600)).subscribe(data => {
      this.updateSortBy(data);
      this._cd.markForCheck();
    });
  }

  updateParent(data) {
    this.outData$.emit(data)
  }

  private initializeData() {
    let queryParams = this._commonService.getDefaultParams().queryParams;
    if (queryParams['orderBy'] != undefined && queryParams['orderBy'] == 'price') {
      if (queryParams['orderWay'] == 'asc')
        this.sortBy = 'lowPrice';
      else
        this.sortBy = 'highPrice';
    } else {
      this.sortBy = 'popularity';
    }


    this._commonService.deleteDefaultQueryParams(['orderWay', 'orderBy']);
  }

  updateSortBy(sortBy) {
    if (this.sortBy != sortBy) {
      this.updateParent({ sortByOpt: false });
      this.sortBy = sortBy;
      let orderBy = this.sortBy == 'popularity' ? 'popularity' : 'price';
      let orderWay = this.sortBy == 'lowPrice' ? 'asc' : 'desc';

      let extras: NavigationExtras = {};
      let currentQueryParams = this._activatedRoute.snapshot.queryParams;
      let newQueryParams: {} = {};
      if (Object.keys(currentQueryParams).length) {
        for (let key in currentQueryParams) {
          //console.log(key);
          newQueryParams[key] = currentQueryParams[key];
        }
      }

      newQueryParams["orderBy"] = orderBy;
      newQueryParams["orderWay"] = orderWay;
      newQueryParams["page"] = 1;
      this.route.fragment.pipe(first()).subscribe((fragment: string) => {
        extras.queryParams = newQueryParams;
        this._commonService.updateDefaultParamsNew(extras);
        this.router.navigate([], { queryParams: newQueryParams, fragment: fragment })
      })
    }
  }
}

