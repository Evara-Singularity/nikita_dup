import { FilterPipe, GetQuesPipe } from './faq.pipe';
import {
	Component,
	Renderer2,
	Inject,
	ViewChild,
	ElementRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { faqData } from './faq.data';
import { FooterService } from '../../utils/services/footer.service';
import { DOCUMENT } from '@angular/common';
import { ClientUtility } from '../../utils/client.utility';
import CONSTANTS from '@app/config/constants';
import { FAQDATA } from './faq.mock';
import { CommonService } from '@app/utils/services/common.service';

@Component({
	selector: 'faq',
	templateUrl: 'faq.html',
	styleUrls: ['faq.scss'],
})
export class FaqComponent {
	overlaysuggestion: boolean = false;
	noResults: boolean = false;
	faqData = faqData;
	public showThis: Boolean = false;
	public showSideMenu: Boolean = true;
	public hideSuggestionInMobile: Boolean = false;
	isServer: boolean;
	isBrowser: boolean;
	defaultIndex = 0;
	@ViewChild('CRP') crpElement: ElementRef;
	constructor(
		private _getQuesPipe: GetQuesPipe,
		private _filterPipe: FilterPipe,
		private title: Title,
		private meta: Meta,
		private _renderer2: Renderer2,
		@Inject(DOCUMENT) private _document,
		private _router: Router,
		public footerService: FooterService,
		private route: ActivatedRoute,
		public _commonService:CommonService
	) {
		this.isServer = _commonService.isServer;
        this.isBrowser = _commonService.isBrowser;
		this.title.setTitle('FAQ-Moglix.com');
		this.meta.addTag({
			name: 'description',
			content:
				'Frequently asked questions on order tracking, return and refund policy and payment options on Moglix.com.',
		});
		this.meta.addTag({
			property: 'og:description',
			content:
				'Frequently asked questions on order tracking, return and refund policy and payment options on Moglix.com.',
		});
		this.meta.addTag({ property: 'og:title', content: 'FAQ - Moglix.com' });
		this.meta.addTag({
			property: 'og:url',
			content: CONSTANTS.PROD+'/faq',
		});
		if (this.isServer) {
			let links = this._renderer2.createElement('link');
			let url = this._router.url as string;
			if (url.indexOf(';') > -1) {
				url = url.split(';')[0];
			}
			links.rel = 'canonical';
			links.href =
				CONSTANTS.PROD +
				this._router.url
					.split('?')[0]
					.split('#')[0]
					.split(':')[0]
					.split(';')[0]
					.toLowerCase();
			this._renderer2.appendChild(this._document.head, links);
		}
	}

	ngOnInit() {
		this.defaultIndex = this.route.snapshot.params.active == 'CRP' ? 1 : 0;
		if (this.isServer) {
			let faqs = this._renderer2.createElement('script');
			faqs.type = 'application/ld+json';
			faqs.text = JSON.stringify(FAQDATA);
			this._renderer2.appendChild(this._document.head, faqs);
		}
		if (this.isBrowser) {
			if (document.querySelector('.faq-icon')) {
				document
					.querySelector('.faq-icon')
					.addEventListener('click', function () {
						document
							.querySelector('.faq-search')
							.classList.toggle('faq-expanded');
					});
			}
			if (document.querySelector('.faq-icon1')) {
				document
					.querySelector('.faq-icon1')
					.addEventListener('click', function () {
						document
							.querySelector('.faq-search')
							.classList.toggle('faq-expanded');
					});
			}
			window.addEventListener(
				'load',
				function () {
					window.addEventListener(
						'scroll',
						function () {
							let scrollEl =
								document.scrollingElement || document.documentElement;
							let scroll = scrollEl.scrollTop;
							if (window.outerWidth > 767) {
								let scrollEl =
									document.scrollingElement || document.documentElement;
								let ws = scrollEl.scrollTop;
								let top_offset =
									ClientUtility.outerHeight(
										document.querySelector('ba-page-top')
									) +
									ClientUtility.outerHeight(
										document.querySelector('.faq-main h2')
									);
								let side_height =
									ClientUtility.outerHeight(
										document.querySelector('.faq-wrap')
									) - 300;
								if (
									ws >= top_offset &&
									!document
										.querySelector('.faq_sidebar')
										.classList.contains('fix')
								) {
									document.querySelector('.faq_sidebar').classList.add('fix');
									(<HTMLElement>(
										document.querySelector('.faq_sidebar')
									)).style.top = '0';
									(<HTMLElement>document.querySelector('.faq-box1')).style.top =
										'0';
								} else if (ws <= top_offset) {
									document
										.querySelector('.faq_sidebar')
										.classList.remove('fix');
									(<HTMLElement>(
										document.querySelector('.faq_sidebar')
									)).style.top = 'auto';
									(<HTMLElement>document.querySelector('.faq-box1')).style.top =
										'0';
								}
								if (ws >= side_height) {
									document
										.querySelector('.faq_sidebar')
										.classList.add('pos_side');
									(<HTMLElement>document.querySelector('.faq-box1')).style.top =
										'0';
								} else {
									document
										.querySelector('.faq_sidebar')
										.classList.remove('pos_side');
								}

								if (scroll > 500) {
									document
										.querySelector('.faq_sidebar')
										.classList.add('headerSpace');
								} else {
									document
										.querySelector('.faq_sidebar')
										.classList.remove('headerSpace');
								}
							}
						},
						{ passive: true }
					);
					document.addEventListener('scroll', onScroll, { passive: true });
					document.querySelector('a[href^="#"]').addEventListener(
						'click',
						function (e) {
							e.preventDefault();
							document.removeEventListener('scroll', onScroll);
							Array.prototype.map.call(
								document.querySelectorAll('a'),
								function (el) {
									ClientUtility.parent(el, 'li').classList.remove('active-faq');
									// $(this).parent('li').removeClass('active-faq');
								}
							);
							ClientUtility.parent(this, 'li').classList.add('active-faq');
							let target = this.hash;
							//  menu = target;
							target = document.querySelector(target);
							ClientUtility.scrollToTop(600, ClientUtility.offset(target).top);
						},
						{ passive: true }
					);

					function onScroll(event) {}
				},
				false
			);

			if (window.outerWidth >= 768) {
				setTimeout(() => {
					this.footerService.setFooterObj({ footerData: true });
					this.footerService.footerChangeSubject.next(
						this.footerService.getFooterObj()
					);
				}, 1000);
			} else {
				this.footerService.setMobileFoooters();
			}
		}
		if (this.isServer) {
			this.footerService.setFooterObj({ footerData: true });
			this.footerService.footerChangeSubject.next(
				this.footerService.getFooterObj()
			);
		}
		//this.showFaqData();
	}

	ngAfterViewInit() {
		this.setScroll();
		if (this.defaultIndex == 1 && this.crpElement) {
			setTimeout(() => {
				this.crpElement.nativeElement.click();
				if (document.getElementById('open1')) {
					document.getElementById('open1').style.display = 'block';
				}
			}, 50);
		}
	}

	scrollTo(selector, index) {
		if (selector && document.querySelector(selector)) {
			Array.prototype.map.call(
				document.querySelectorAll('ul.faqUllist li'),
				(li, i) => {
					li.classList.remove('active-faq');
					if (i === index) {
						li.classList.add('active-faq');
					}
				}
			);
			ClientUtility.scrollToTop(
				600,
				ClientUtility.offset(document.querySelector(selector)).top - 50
			);
		}
	}

	setScroll() {
		if (this.isBrowser) {
			setTimeout(() => {
				document
					.querySelector('ul.faqUllist li')
					.addEventListener('click', function () {
						Array.prototype.map.call(
							document.querySelectorAll('ul.faqUllist li'),
							(li) => {
								li.classList.remove('active-faq');
							}
						);
						document
							.querySelector('ul.faqUllist li')
							.classList.remove('active-faq');
						this.classList.add('active-faq');
						ClientUtility.scrollToTop(
							600,
							ClientUtility.offset(
								document.querySelector(this.getAttribute('data-target'))
							).top - 50
						);
					});
			}, 0);
		}
	}

	cleartext() {
		let inputval = <HTMLInputElement>document.getElementById('searchvalue');
		inputval.value = '';
		this.resetArray();
	}

	suggestionArr: Array<string> = [];
	showSearchSuggestion(searchText, event) {
		searchText = <String>searchText.toLowerCase();
		this.noResults = false;
		if (searchText.length == 0) {
			this.showSideMenu = true;
		}
		if (searchText.length > 3 && searchText.toLowerCase() !== -1) {
			this.suggestionArr = this._filterPipe.transform(this.faqData, searchText);
			this.showSideMenu = false;
			this.hideSuggestionInMobile = false;
			this.overlaysuggestion = true;
			if (this.suggestionArr && this.suggestionArr.length == 0) {
				this.noResults = true;
			} else {
				this.noResults = false;
			}
		} else {
			this.filteredArray = [];
			this.suggestionArr = [];
			this.overlaysuggestion = false;
		}
	}

	searchFaq(searchText) {
		if (searchText.length != 0 && searchText.toLowerCase() !== -1) {
			searchText = <String>searchText.toLowerCase();
			this.suggestionArr = this._filterPipe.transform(this.faqData, searchText);
			this.showSideMenu = false;
			this.hideSuggestionInMobile = false;
			this.overlaysuggestion = true;
			if (this.suggestionArr && this.suggestionArr.length == 0) {
				this.noResults = true;
			} else {
				this.noResults = false;
			}
		}
	}

	filteredArray: Array<String>;

	showQuestion(question: String) {
		this.filteredArray = this._getQuesPipe.transform(this.faqData, question);
		this.showSideMenu = false;
		this.hideSuggestionInMobile = true;
		this.overlaysuggestion = false;
	}

	resetArray() {
		this.filteredArray = [];
		this.showSideMenu = true;
		this.setScroll();
		this.hideSuggestionInMobile = true;
		this.overlaysuggestion = false;
		this.noResults = false;
	}
}
