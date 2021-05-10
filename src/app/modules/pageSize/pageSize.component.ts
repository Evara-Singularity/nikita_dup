/**
 * Created by kuldeep on 09/05/17.
 */
import {
    Component, ViewEncapsulation, Input, ChangeDetectorRef,
    ChangeDetectionStrategy,
} from '@angular/core';
// import { TransferState, makeStateKey } from '@angular/platform-browser';
import {CommonService} from "@app/utils/services/common.service";
import {ActivatedRoute, Router, NavigationExtras} from '@angular/router';
import {Subject} from "rxjs/Subject";
import { TransferState, makeStateKey } from '@angular/platform-browser';

// const DATA_KEY: any = makeStateKey<{}>("data")
const RPRK: any = makeStateKey<{}>("RPRK") //RPRK: Refresh Product Result Key

@Component({
    selector: 'page-size',
    templateUrl: 'pageSize.html',
    styleUrls: [
        './pageSize.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})

export class PageSizeComponent{
    isServer: boolean;
    isBrowser: boolean;
    size: number;
    @Input() pageSizeUpdated: Subject<any>;
    productSearchResult: any;
    constructor(private _tState: TransferState, private _activatedRoute: ActivatedRoute, private cd: ChangeDetectorRef, public _router: Router, private _commonService: CommonService){

    };


    ngOnInit(){
        /*if(this.isBrowser && this.transferState.hasKey(DATA_KEY)){
            this.initizlizeData(this.transferState.get(DATA_KEY, {}))
        }*/
        if (this._tState.hasKey(RPRK)) {
            let response = this._tState.get(RPRK, {});
            this.initizlizeData({ productSearchResult: response["productSearchResult"] });
            // if(this.isBrowser)
                // console.log({ productSearchResult: response["productSearchResult"] }, "pagesize pagesize pagesize pagesize");                
        }
        this.pageSizeUpdated.subscribe((data)=>{
            this.initizlizeData(data);

            /*if(this.isServer)
                this.transferState.set(DATA_KEY, data);*/
            this.cd.markForCheck(); // marks path
        })

    }

    ngAfterViewInit(){
        if(this.isBrowser){
            /*if(this.transferState.hasKey(DATA_KEY))
                this.transferState.remove(DATA_KEY);*/
        }
    }

    private initizlizeData(data){
        this.productSearchResult = data.productSearchResult;
        let queryParams = this._commonService.getDefaultParams().queryParams;
        //console.log("PageSizeComponent constructor()", queryParams["pageSize"]);
        this.size = (queryParams["pageSize"] != undefined && queryParams["pageSize"] != "32") ? queryParams["pageSize"] : "32";
    }

    updateSize(size){
        ////console.log(size);
        /*if(this.size != size){
         this.size = size;*/

        //this._commonService.updateDefaultParamsNew({pageSize: this.size});
        let extras: NavigationExtras = {};
        let currentRoute = this._commonService.getCurrentRoute(this._router.url);
        // let fragmentString = this._commonService.generateFragmentString();
        let fragmentString = this._activatedRoute.snapshot.fragment;
        if(fragmentString != null){
            extras.fragment = fragmentString;
            //console.log(extras);
        }

        let currentQueryParams = this._activatedRoute.snapshot.queryParams;
        let newQueryParams: {} = {};
        if(Object.keys(currentQueryParams).length){
            for(let key in currentQueryParams){
                //console.log(key);
                newQueryParams[key] = currentQueryParams[key];
            }
        }

        if(size != "32")
            newQueryParams["pageSize"] = size;
        else{
            if(newQueryParams["pageSize"] != undefined)
                delete newQueryParams["pageSize"];
        }


        //console.log(newQueryParams);

        if(Object.keys(newQueryParams).length>0)
            extras.queryParams = newQueryParams;
        else
            extras.queryParams = {};

        if(extras.queryParams["page"] != undefined)
            delete extras.queryParams["page"];

        this._router.navigate([currentRoute], extras);

        return;
    }
}
