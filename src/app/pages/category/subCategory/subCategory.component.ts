import {
    Component, ViewEncapsulation, Input, EventEmitter, Output,
    ChangeDetectorRef, ChangeDetectionStrategy, PLATFORM_ID, Inject
} from '@angular/core';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { CategoryService } from '../../../utils/services/category.service';
import { SubCategoryService } from "../../../utils/services/subCategory.service";
import { CONSTANTS } from "@config/constants";
import {Subject} from "rxjs";
import { fade } from '@utils/animations/animation'
import { TransferState, makeStateKey } from '@angular/platform-browser';
import { CommonService } from '@services/common.service';

const GRCRK: any = makeStateKey<{}>("GRCRK")// GRCRK: Get Related Category Result Key
// const RELATED_CATEGORY_LIST_KEY: any = makeStateKey<{}>("relatedCatgoryList")

@Component({
    selector: 'sub-category',
    templateUrl: 'subCategory.html',
    styleUrls: [
        './subCategory.scss'
    ],
    providers:[],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    animations: [
      fade
    ]
})

export class SubCategoryComponent {
    relatedCatgoryList: Array<any> = [];
    @Output() getCategoryById:EventEmitter<any>=new EventEmitter<any>();
    @Output() updateSubCategoryCount$: EventEmitter<any> = new EventEmitter<any>();
    catdata;
    imageBasePath: string;
    public isAllListShow:boolean;
    moreLessCategoryText:string="Show more";
    @Input() relatedCatgoryListUpdated: Subject<any>;
    isServer: boolean;
    defaultImage;
    isBrowser: boolean;

    constructor(private _tState: TransferState, @Inject(PLATFORM_ID) platformId, private cd: ChangeDetectorRef, public categoryService: CategoryService, private _subCategoryService: SubCategoryService, public router: Router, public commonService: CommonService) {
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
        // this._subCategoryService.refreshSubCategoryData$.subscribe(
        //     (params)=>{
        //         ////console.log(params);
        //         this._subCategoryService.refreshSubCategoryData(params);
        //     }
        // );

        // this._subCategoryService.updateSubCategoryData$.subscribe(
        //     (subCategoryData)=>{
        //         ////console.log(subCategoryData);
        //         this.catdata = subCategoryData.children;
        //         this.updateSubCategoryCount$.emit(this.catdata.length);
        //         //console.log(this.catdata);
        //     }
        // )
    };

    ngOnInit() {

        // console.log("Before Initialization");
        // console.log(this.transferState.get(RELATED_CATEGORY_LIST_KEY, []));

        /*if(this.isBrowser && this.transferState.hasKey(RELATED_CATEGORY_LIST_KEY))
            this.relatedCatgoryList = this.transferState.get(RELATED_CATEGORY_LIST_KEY, []);*/

        // console.log("After Initialization");
        // console.log(this.transferState.get(RELATED_CATEGORY_LIST_KEY, []));
        this.imageBasePath = CONSTANTS.IMAGE_BASE_URL;
        // this._subCategoryService.refreshSubCategoryData$.emit({catId: '211280000'});

        if (this._tState.hasKey(GRCRK)) {
            let response = this._tState.get(GRCRK, {});
            this.relatedCatgoryList = response["children"];
            // if(this.isBrowser)
                // console.log(this.relatedCatgoryList, "subCategory subCategory subCategory");                
        }
        this.relatedCatgoryListUpdated.subscribe((relatedCatgoryList)=>{
            this.showList(false);
            // alert("asdf");
            //console.log("relatedCatgoryList", relatedCatgoryList);
            this.relatedCatgoryList = relatedCatgoryList["children"];
            if(this.isServer){
                // this.transferState.set(RELATED_CATEGORY_LIST_KEY, relatedCatgoryList);
                // console.log("On Server updates");
                // console.log(this.transferState.get(RELATED_CATEGORY_LIST_KEY, []));
            }
            this.cd.markForCheck(); // marks path
        })
    }

    ngAfterViewInit() {
        /*if(this.isBrowser){
            if(this.transferState.hasKey(RELATED_CATEGORY_LIST_KEY))
                this.transferState.remove(RELATED_CATEGORY_LIST_KEY);
        }*/
    }

    goToAnother(id,categoryLink) {
        let obj = { "id": id };
        this.getCategoryById.emit(obj);
        //this.categoryService.reloadCatgoryData.next(obj);
        //  alert(categoryLink);
        this.router.navigateByUrl(categoryLink);
    }

    showList(flag?)
    {
        this.isAllListShow = flag != undefined ? flag : !this.isAllListShow;
        if(this.isAllListShow)
        {
            this.moreLessCategoryText="Show less";
        }
        else{
            this.moreLessCategoryText="Show more";
        }
    }

    // createCategoryImageUrl(mainImageLink) {
    //     if(mainImageLink != undefined && mainImageLink != null && mainImageLink != '')
    //         return CONSTANTS.IMAGE_BASE_URL+mainImageLink;
    //     else
    //         return CONSTANTS.IMG_CAT_DIR+'default-medium_default.jpg';

    // }
}


