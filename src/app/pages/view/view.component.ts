import { Component, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { isPlatformServer, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { ViewService } from './view.service';
import { CommonService } from '@app/utils/services/common.service';
import CONSTANTS from '@app/config/constants';
import { allCategoriesData } from '@app/config/all-categories';
@Component({
	selector: 'view',
	templateUrl: 'view.html',
	styleUrls: ['view.scss'],
})
export class ViewComponent {
	categoriesData: any;
	dataList: any;
	API: {};
	isBrowser: boolean;
	isServer: boolean;
	clickedCategories: any = [];
	childCatIcons = false;
	currentL1Index = -1;
	currentL1Id = -1;
	clusterCategoryData;
	defaultImage = CONSTANTS.IMAGE_BASE_URL + 'assets/img/home_card.webp';

	constructor(
		private categoriesDataService: ViewService,
		private _title: Title,
		private _meta: Meta,
		@Inject(DOCUMENT) private _document,
		private _renderer2: Renderer2,
		private _router: Router,
		@Inject(PLATFORM_ID) platformId,
		public _commonService: CommonService
	) {
		this.isServer = isPlatformServer(platformId);
		this.isBrowser = isPlatformBrowser(platformId);
		this.getAllCategoriesData();
	}

	ngOnInit() {
		if (this.isBrowser) {
			if (<HTMLElement>document.querySelector('.toggle-head '))
				(<HTMLElement>document.querySelector('.toggle-head ')).style.display =
					'none';
		}

		this.getClustorCategoryApi().subscribe((res) => {
			console.log(res);
			if (res['status'] && res['data']) {
				this.clusterCategoryData =
					res['data'][0]['block_data']['all-categories'];
			}
		});

		this.API = CONSTANTS;
		/**
		 * Set canonical starts
		 */
		let links = this._renderer2.createElement('link');
		links.rel = 'canonical';
		let href =
			CONSTANTS.PROD +
			this._router.url.split('?')[0].split('#')[0].toLowerCase();
		links.href = href;
		this._renderer2.appendChild(this._document.head, links);

		this._title.setTitle('All Categories - Moglix');
		this._meta.addTag({ name: 'og:title', content: 'All Categories - Moglix' });
		this._meta.addTag({
			name: 'description',
			content: 'List of all categories of Moglix.com',
		});
		this._meta.addTag({
			name: 'og:description',
			content: 'List of all categories of Moglix.com',
		});
	}

	getClustorCategoryApi() {
		return this.categoriesDataService.getClustorCategoryApi();
	}

	getAllCategoriesData() {
		this.categoriesDataService.getCategoriesData().subscribe((response) => {
			// console.log(response)
			this.dataList = response;
			if (this.dataList) {
				this.categoriesData = this.dataList.categories;
			}
		});
	}

	getUpArrow(index, parentTab) {
		this.currentL1Index = -1;
		this.currentL1Id = -1;
		this.categoriesData[index]['showChild'] = false;
	}
	getDownArrow(index, parentTab) {
		this.currentL1Index = index;
		this.currentL1Id = parentTab;
		this.categoriesData[index]['showChild'] = true;
	}

	goto(level, index?) {
		this.categoriesData = allCategoriesData['all-Categories'];
		if (level > 0) {
			let indices;
			if (typeof index === 'number') {
				indices = [index];
			} else {
				indices = index.split(',');
			}
			for (let i = 0; i < indices.length; i++) {
				if (
					this.categoriesData[indices[i]] &&
					this.categoriesData[indices[i]].childCategories
				) {
					this.categoriesData = this.categoriesData[indices[i]].childCategories;
				}
			}
		}
		if (this.clickedCategories && this.clickedCategories.length) {
			this.clickedCategories.splice(level, this.clickedCategories.length);
		}
		if (level == 0) {
			this.childCatIcons = false;
		}
	}
}
