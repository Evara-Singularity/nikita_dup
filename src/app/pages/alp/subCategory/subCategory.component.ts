import {
    Component, ViewEncapsulation, Input, EventEmitter, Output, SimpleChanges,
    ChangeDetectorRef, ChangeDetectionStrategy, PLATFORM_ID, Inject
} from '@angular/core';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { CategoryService } from '../category.service';
import { SubCategoryService } from "./subCategory.service";
import { Subject } from "rxjs/Subject";
import { TransferState, makeStateKey } from '@angular/platform-browser';
import CONSTANTS from 'src/app/config/constants';

const GRCRK: any = makeStateKey<{}>("GRCRK")       // GRCRK: Get Related Category Result Key

@Component({
    selector: 'sub-category',
    templateUrl: 'subCategory.html',
    styleUrls: [
        './subCategory.scss'
    ],
    providers: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})

export class SubCategoryComponent {
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

    constructor(private _tState: TransferState, @Inject(PLATFORM_ID) platformId, private cd: ChangeDetectorRef, public categoryService: CategoryService, private _subCategoryService: SubCategoryService, public router: Router) {
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
            if (this.isServer) {
            }
            this.cd.markForCheck(); // marks path
        })
    }

    showList(flag?) {
        this.isAllListShow = flag != undefined ? flag : !this.isAllListShow;
        if (this.isAllListShow) {
            this.moreLessCategoryText = "Show less";
        } else {
            this.moreLessCategoryText = "Show more";
        }
    }
}