import { Component, Renderer2, ChangeDetectorRef, Input, Inject, PLATFORM_ID, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformServer, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { BreadcrumpService } from './breadcrump.service';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { Subject } from 'rxjs/Subject';
import { CommonService } from '@app/utils/services/common.service';

const BRK = makeStateKey<any>('BRK');

@Component({
    selector: 'breadcrump',
    templateUrl: './breadcrump.component.html',
    styleUrls: ['./breadcrump.component.css'],
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
            this.breadCrump = this._tState.get(BRK, []);
            this.breadCrumpCategorySchema();
        }
        this.breadcrumpUpdated.subscribe((bData) => {
            let link = bData["categoryLink"];
            let type = bData["page"];
            this.breadCrumpService.getBreadcrumpData(link, type, this.pageTitle).subscribe((data) => {
                if (this.isServer) {
                    this._tState.set(BRK, data);
                }
                this.breadCrump = data;
                if (this.type == "category") {
                    this.breadCrumpCategorySchema()
                }
                this.cd.markForCheck();                // marks path                       
            });
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
    }

    goToCategory(link) {
        this._commonService.deleteDefaultQueryParams(['orderWay', 'orderBy']);
        this.router.navigateByUrl(link);
    }
}