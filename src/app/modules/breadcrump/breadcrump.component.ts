import { Component, Renderer2, ChangeDetectorRef, Input, Inject, PLATFORM_ID, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformServer, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { BreadcrumpService } from './breadcrump.service';
import { CommonService } from "@app/utils/services/common.service";
import { CONSTANTS } from '@app/config/constants';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { Subject } from 'rxjs';

const BRK = makeStateKey<any>('BRK');



@Component({
    selector: 'breadcrump',
    templateUrl: './breadcrump.component.html',
    styleUrls: ['./breadcrump.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class BreadcrumpComponent {

    @Input() link: string;
    @Input() pageTitle: string;
    @Input() type: string;
    @Input() breadcrumpUpdated: Subject<any>;
    @Input() hideUI: boolean = false;

    breadCrump: {}[] = [];

    isServer: boolean;
    isBrowser: boolean;

    constructor(private _tState: TransferState, private _renderer2: Renderer2, @Inject(DOCUMENT) private _document, private cd: ChangeDetectorRef, @Inject(PLATFORM_ID) platformId, private _commonService: CommonService, public router: Router, public breadCrumpService: BreadcrumpService) {
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit() {

        if (this._tState.hasKey(BRK)) {
            // console.log("BRK", this._tState.hasKey(BRK), this.isBrowser);
            this.breadCrump = this._tState.get(BRK, []);
            // console.log(this.breadCrump, "this.breadCrumpthis.breadCrump", this.isBrowser);   
            /* if (this.isBrowser) {
                this._tState.remove(BRK);
            }  */
            this.breadCrumpCategorySchema();
            // this.cd.markForCheck(); // marks path                        // console.log(this.transferState.get(BREADCRUMP_KEY, []));
        }

        this.breadcrumpUpdated.subscribe((bData) => {
            // console.log("Breadcrump subscribe ******************", this.isBrowser);
            // else{
            let link = bData["categoryLink"];
            let type = bData["page"];
            this.breadCrumpService.getBreadcrumpData(link, type ,this.pageTitle ).subscribe((data) => {
                if (this.isServer) {
                    this._tState.set(BRK, data);
                }
                this.breadCrump = data;
                if (this.type == "category") {
                    this.breadCrumpCategorySchema()
                }
                this.cd.markForCheck(); // marks path                        // console.log(this.transferState.get(BREADCRUMP_KEY, []));
            });
            // }
        });
        
    }

    breadCrumpCategorySchema() {
        if (this.isServer) {
            let itemsList = [{
                "@type": "ListItem",
                "position": 0,
                "item":
                {
                    "@id": "https://www.moglix.com",
                    "name": "Home"
                }
            }];
            this.breadCrump.forEach((element, index) => {
                itemsList.push({
                    "@type": "ListItem",
                    "position": index + 1,
                    "item":
                    {
                        "@id": "https://www.moglix.com/" + element['categoryLink'],
                        "name": element['categoryName']
                    }
                })
            });

            let s = this._renderer2.createElement('script');
            s.type = "application/ld+json";

            s.text = JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": itemsList });
            this._renderer2.appendChild(this._document.head, s);
        }
    }

    ngAfterViewInit() {
        if (this.isBrowser) {
            this._tState.remove(BRK);
        }
        // if (this.isBrowser) {
        //     if (this.transferState.hasKey(BREADCRUMP_KEY))
        //         this.transferState.remove(BREADCRUMP_KEY);
        // }
    }

    getBreadCrumpHttp(link, type) {
        if(this._tState.hasKey(BRK)){
            this.breadCrump = this._tState.get(BRK, []);

        }else{
            let url = CONSTANTS.NEW_MOGLIX_API + "/homepage/getbreadcrumb?source=" + link + "&type=" + type;
            this.breadCrumpService.getBreadCrumpHttpApi('GET', url).subscribe((data: {}[]) => {
                this.breadCrump = data;
                if (this.isServer)
                    this._tState.set(BRK, data);
            })
        }
    }

    goToCategory(link) {
        this._commonService.deleteDefaultQueryParams(['orderWay', 'orderBy']);
        this.router.navigateByUrl(link);
    }
}