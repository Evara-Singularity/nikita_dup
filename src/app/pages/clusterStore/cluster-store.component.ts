import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, Renderer2, ViewEncapsulation } from '@angular/core';
import { makeStateKey, Meta, Title, TransferState } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import CONSTANTS from 'src/app/config/constants';
import { ToastMessageService } from 'src/app/modules/toastMessage/toast-message.service';
import { ClusterStoreService } from './cluster-store.service';

const l0Data = makeStateKey<any>('l0Data');

@Component({
    selector: 'app-cluster-store',
    templateUrl: './cluster-store.component.html',
    styleUrls: ['./cluster-store.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ClusterStoreComponent implements OnInit {
    isServer: boolean;
    isBrowser: boolean;
    extraData: {};
    private cDistryoyed = new Subject();
    data: {};
    isShowLoader: boolean;
    clusterStoreUrl = CONSTANTS.PROD;

    constructor(private _router: Router, private _activatedRoute: ActivatedRoute, private _cls: ClusterStoreService, private _tState: TransferState, @Inject(PLATFORM_ID) platformId, public title: Title, public meta: Meta, private _renderer2: Renderer2, @Inject(DOCUMENT) private _document, private toastMessageService: ToastMessageService) {
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
        this.isShowLoader = false;
    }

    ngOnInit() {
        this._activatedRoute.data.subscribe((rawData) => {
            let response = rawData['clusterStoreData'];
            if (response['statusCode'] === 200 && response['data'] != null && response['data'][0]['block_data']) {
                const cType = this._activatedRoute.snapshot.params.type;
                this.extraData = { currentRoute: "store/" + cType }
                this.clusterStoreUrl = this.clusterStoreUrl + (this._router.url.split('?')[0].split('#')[0] as string).toLowerCase();
                this.initialize(response);
            } else {
                this.toastMessageService.show({ type: 'error', text: response['message'] });
            }
        });
    }

    initialize(response) {
        this.getSelectedCategoryTop(response['data'][0]['block_data']['category_cluster']);
        this.data = response['data'][0]['block_data'];
        if (this.isServer) {
            this.setMetaInformation(response['metaTitle'], response['metaDescritpion']);
            this.setCanonicalUrl();
        } else {
            this.title.setTitle(response['metaTitle']);
        }
    }

    setMetaInformation(title, description) {
        this.meta.addTag({ 'name': 'robots', 'content': CONSTANTS.META.ROBOT });
        this.title.setTitle(title);
        this.meta.addTag({ "name": "og:title", "content": title });
        this.meta.addTag({ "name": "description", "content": description });
        this.meta.addTag({ "name": "og:description", "content": description });
    }

    setCanonicalUrl() {
        let ampLink = this._renderer2.createElement('link');
        ampLink.rel = 'canonical';
        ampLink.href = this.clusterStoreUrl;
        this._renderer2.appendChild(this._document.head, ampLink);
    }

    getSelectedCategoryTop(category_cluster) {
        let selectedItem;
        if (category_cluster && category_cluster['data'].length > 0) {
            category_cluster['data'] = category_cluster['data'].filter((item) => {
                if (this.extraData['currentRoute'] != item['category_url']) {
                    return true;
                }
                selectedItem = item;
                return false;
            });
            category_cluster['data'] = [selectedItem].concat(category_cluster['data'])
        }
    }

    ngOnDestroy() {
        this.cDistryoyed.next();
        this.cDistryoyed.unsubscribe();
    }
}
