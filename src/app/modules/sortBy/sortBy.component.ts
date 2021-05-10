/**
 * Created by kuldeep on 09/05/17.
 */
import {
  Component, ViewEncapsulation, Input, Output, ChangeDetectionStrategy, EventEmitter,
  ChangeDetectorRef, PLATFORM_ID, Inject
} from '@angular/core';
// import { TransferState, makeStateKey } from '@angular/platform-browser';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import {CommonService} from "@app/utils/services/common.service";
import {NavigationExtras, ActivatedRoute, Router} from "@angular/router";
import {Subject} from "rxjs/Subject";
import { TransferState, makeStateKey } from '@angular/platform-browser';
// const SORTBY_KEY: any = makeStateKey<{}>("sortby");
const RPRK: any = makeStateKey<{}>("RPRK") //RPRK: Refresh Product Result Key
declare let $: any;
declare let scrollToTop: any;
const slpPagesExtrasIdMap = {"116111700":"safety"};


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
  categoryId:any;
  @Output() outData$: EventEmitter<{}>;
  constructor(private _tState: TransferState, @Inject(PLATFORM_ID) platformId, private _activatedRoute: ActivatedRoute, private cd: ChangeDetectorRef, private _commonService: CommonService , private router:Router ,private route:ActivatedRoute) {
    this.sortBy = 'popularity';
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);
    this.outData$ = new EventEmitter();

  };
  
 
  
  ngOnInit() {
    /*if(this.isBrowser && this.transferState.hasKey(SORTBY_KEY))
      this.sortBy = this.transferState.get(SORTBY_KEY, 'popularity');*/
      this._activatedRoute.params.subscribe((data)=>{
        this.categoryId = data.id;
      });
      if (this._tState.hasKey(RPRK)) {
        this.initializeData();
      }
      this.sortByUpdated.subscribe(() => {
        this.initializeData();
        /*if(this.isServer)
          this.transferState.set(SORTBY_KEY, this.sortBy);*/

        this.cd.markForCheck(); // marks path
      })
  }
  updateParent(data){
    this.outData$.emit(data)
  }

  private initializeData(){
    let queryParams = this._commonService.getDefaultParams().queryParams;
    //console.log("SortBy constructor()", queryParams);
    if (queryParams['orderBy'] != undefined && queryParams['orderBy'] == 'price') {
      if (queryParams['orderWay'] == 'asc')
        this.sortBy = 'lowPrice';
      else
        this.sortBy = 'highPrice';
    }
    else
      this.sortBy = 'popularity';

    /*Set below to false so that current sort by cant be used for another routes*/
    //this._commonService.useLastSortByState=false;
    this._commonService.deleteDefaultQueryParams(['orderWay', 'orderBy']);
    //this.size = (queryParams["pageSize"] != undefined && queryParams["pageSize"] != "32") ? queryParams["pageSize"] : "32";
  }

  ngAfterViewInit() {
    if(this.isBrowser) {
      /*if(this.transferState.hasKey(SORTBY_KEY))
          this.transferState.remove(SORTBY_KEY);*/
  }
  }

  updateSortBy(sortBy) {
    if (this.sortBy != sortBy) {
      this.updateParent({sortByOpt : false});
      this.sortBy = sortBy;
      let orderBy = this.sortBy == 'popularity' ? 'popularity' : 'price';
      let orderWay = this.sortBy == 'lowPrice' ? 'asc' : 'desc';

      let extras: NavigationExtras = {};
      // let fragmentString = this._commonService.generateFragmentString();
      /*let fragmentString = this._activatedRoute.snapshot.fragment;
       if(fragmentString != null){
       extras.fragment = fragmentString;
       //console.log(extras);
       }*/

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
      newQueryParams["page"]=1;
      this.route.fragment.subscribe((fragment:string)=>{
        this.router.navigate([],{queryParams:newQueryParams,fragment:fragment})
      extras.queryParams = newQueryParams;
      // this._commonService.useLastSortByState=true;
      this._commonService.updateDefaultParamsNew(extras);
      this._commonService.refreshProducts$.next();
    })
      // if(!this.isServer && !slpPagesExtrasIdMap.hasOwnProperty(this.categoryId)){
      //   ClientUtility.scrollToTop(2000, 100);
      //   // $('html,body').animate({ scrollTop: 100 }, 2000);
      // }
      
    }
  }
}
