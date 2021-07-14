import { Component, Renderer2, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import CONSTANTS from '../../../config/constants';
import { ClientUtility } from '../../../utils/client.utility';
import { GlobalLoaderService } from '../../../utils/services/global-loader.service';
import { CommonService } from '@app/utils/services/common.service';
import { ENDPOINTS } from '@app/config/endpoints';

@Component({
	selector: 'brand-store',
	templateUrl: 'brand-store.html',
	styleUrls: ['brand-store.scss'],
})
export class BrandComponent{
	API: {};
	brandData: any;
	cmsData: any;
	val: any;
	brand_name: any = [];
	final_arr: any = [];
	final_arr1: any = [];
	alphabet_arr = CONSTANTS.alphabet_arr;
	total_count: any;
	brand_url: any;
	brandsLogo;
	set isShowLoader(value) {
		this.loaderService.setLoaderState(value);
	}
	imagePath = CONSTANTS.IMAGE_BASE_URL;

	constructor(
		private title: Title,
		private meta: Meta,
		private _renderer2: Renderer2,
		@Inject(DOCUMENT) private _document,
		public _commonService: CommonService,
		public _router: Router,
		private route: ActivatedRoute,
		private loaderService: GlobalLoaderService,
		@Inject(PLATFORM_ID) private platformId
	) {
		this.API = CONSTANTS;
		this.title.setTitle('Moglix Brand Store');
		this.meta.addTag({ property: 'og:title', content: 'Moglix Brand Store' });
		this.meta.addTag({
			property: 'og:description',
			content:
				'Get access to exclusive brands at Moglix brand store. Shop for products from your favorite brands inclusing Bosch, Eveready, Havells, V-Guard, Makita, Karam and more.',
		});
		this.meta.addTag({
			property: 'og:url',
			content: CONSTANTS.PROD+ENDPOINTS.BRAND_STORE,
		});
		this.meta.addTag({
			name: 'description',
			content:
				'Get access to exclusive brands at Moglix brand store. Shop for products from your favorite brands inclusing Bosch, Eveready, Havells, V-Guard, Makita, Karam and more.',
		});
		if (this._commonService.isServer) {
			let links = this._renderer2.createElement('link');
			links.rel = 'canonical';
			links.href = CONSTANTS.PROD + ENDPOINTS.BRAND_STORE;
			this._renderer2.appendChild(this._document.head, links);
			this.isShowLoader = true;
		}
	}

	ngOnInit() {
		this.route.data.subscribe((rawData) => {
			if (!rawData['brandData']['error'] && rawData['brandData'].length) {
				const brandData = rawData['brandData'];
				this.cmsData = rawData['brandData'][2]['data'] ? rawData['brandData'][2]['data']['data'] : [];
				this.brandsLogo =
				brandData[0]['data'][0]['block_data']['all_brand_store']['data'];
				this.isShowLoader = false;
				this.total_count = brandData[1]['totalCount'];
				this.final_arr1 = brandData[1]['brands'].sort(this.compare);
				this.final_arr1.forEach((element) => {
					this.adjustArray(element);
				});
			}
		});
	}

	scrollToList(getAlphabet) {
		let idValue = 'alphabet_' + getAlphabet;
		let getOffset = document.getElementById(idValue).offsetTop - 150;
		ClientUtility.scrollToTop(1000, getOffset);
	}

	adjustArray(element) {
		let _alphabet = {};
		const ind = parseInt(element.name.charAt(0)) ? 0 : 1;
		if (ind === 0) {
			_alphabet['letter'] = '0-9';
		} else {
			_alphabet['letter'] = element.name.charAt(0);
		}
		let index = this.final_arr.findIndex(
			(obj) =>
				obj['letter'] === _alphabet['letter'] ||
				obj['letter'] === _alphabet['letter'].toUpperCase()
		);
		_alphabet['nameArr'] = index < 0 ? [] : this.final_arr[index]['nameArr'];
		_alphabet['nameArr'].push(element);
		_alphabet['nameArr'].length === 1 ? this.final_arr.push(_alphabet) : null;
	}
  
	compare(a, b) {
		const genreA = a.name.trim().toUpperCase();
		const genreB = b.name.trim().toUpperCase();

		if (a.link) {
			if (a.link.split('/')[1])
				a.link = 'brands/' + a.link.split('/')[1].split('.')[0];
		}
		if (b.link) {
			if (b.link.split('/')[1])
				b.link = 'brands/' + b.link.split('/')[1].split('.')[0];
		}
		let comparison = 0;
		if (genreA > genreB) {
			comparison = 1;
		} else if (genreA < genreB) {
			comparison = -1;
		}
		return comparison;
	}
}
