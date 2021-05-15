import {
    Component, ViewEncapsulation, Input, EventEmitter, Output,
    ChangeDetectorRef, ChangeDetectionStrategy, PLATFORM_ID, Inject
} from '@angular/core';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { CategoryService } from '../category.service';
import { SubCategoryService } from "./subCategory.service";
import { CONSTANTS } from '@app/config/constants';
import { Subject } from "rxjs";
import { fade } from '@app/utils/animations/animation'
import { TransferState, makeStateKey } from '@angular/platform-browser';
import { CommonService } from '@app/utils/services/common.service';

const GRCRK: any = makeStateKey<{}>("GRCRK")// GRCRK: Get Related Category Result Key
// const RELATED_CATEGORY_LIST_KEY: any = makeStateKey<{}>("relatedCatgoryList")

@Component({
    selector: 'sub-category',
    templateUrl: 'subCategory.html',
    styleUrls: [
        './subCategory.scss'
    ],
    providers: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    animations: [
        fade
    ]
})

export class SubCategoryComponent {
    defaultImage;
    relatedCatgoryList: Array<any> = [];
    @Output() getCategoryById: EventEmitter<any> = new EventEmitter<any>();
    @Output() updateSubCategoryCount$: EventEmitter<any> = new EventEmitter<any>();
    catdata;
    imageBasePath: string;
    public isAllListShow: boolean;
    moreLessCategoryText: string = "Show more";
    @Input() relatedCatgoryListUpdated: Subject<any>;
    isServer: boolean;
    isBrowser: boolean;

    constructor(private _tState: TransferState, @Inject(PLATFORM_ID) platformId, private cd: ChangeDetectorRef, public categoryService: CategoryService, private _subCategoryService: SubCategoryService, public router: Router, public commonService: CommonService) {
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
    };

    ngOnInit() {
        this.imageBasePath = CONSTANTS.IMAGE_BASE_URL;

        if (this._tState.hasKey(GRCRK)) {
            let response = this._tState.get(GRCRK, {});
            this.relatedCatgoryList = response["children"];
        }
        this.relatedCatgoryListUpdated.subscribe((relatedCatgoryList) => {
            this.showList(false);
            this.relatedCatgoryList = relatedCatgoryList["children"];
            this.cd.markForCheck(); // marks path
        })
    }


    goToAnother(id, categoryLink) {
        let obj = { "id": id };
        this.getCategoryById.emit(obj);
        this.router.navigateByUrl(categoryLink);
    }

    showList(flag?) {
        this.isAllListShow = flag != undefined ? flag : !this.isAllListShow;
        if (this.isAllListShow) {
            this.moreLessCategoryText = "Show less";
        }
        else {
            this.moreLessCategoryText = "Show more";
        }
    }
}


