import { isPlatformBrowser, isPlatformServer, Location } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, ElementRef, EventEmitter, Inject, Injector, NgZone, OnDestroy, OnInit, PLATFORM_ID, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { of } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';
import { CartService } from '../../utils/services/cart.service';
import { LocalAuthService } from '../../utils/services/auth.service';
import { GlobalLoaderService } from '../../utils/services/global-loader.service';
import { GlobalState } from '../../utils/global.state';
import { CheckoutLoginService } from '@app/utils/services/checkout-login.service';

@Component({
	selector: 'header-nav',
	templateUrl: './header-nav.component.html',
	styleUrls: ['./header-nav.component.scss'],
})
export class HeaderNavComponent implements OnInit, OnDestroy, AfterViewInit {
	isHomePage: boolean;
	routerData: any = null;
	user: any = null;
	isServer: boolean = true; // by default server setting is enabled for SSR
	isBrowser: boolean = false;
	noOfCart: number = 0;
	backRedirectUrl: string = null;
	sideNavInstance = null;
	isUserLogin: any;
	isScrolledHeader: boolean = false;
	@ViewChild('sideMenu', { read: ViewContainerRef })
	sideMenuContainerRef: ViewContainerRef;
	searchBarInstance = null;
	@ViewChild('searchBar', { read: ViewContainerRef })
	searhNavContainerRef: ViewContainerRef;
	bottomSheetInstance = null;
	@ViewChild('bottomSheet', { read: ViewContainerRef })
	bottomSheetContainerRef: ViewContainerRef;
	hideElLogin: boolean = false;
	searhNav: any;
	cartHeaderText: string = '';
	currentUrl: string;
	checkoutTabMap = {
		1: 'Login',
		2: 'Checkout',
		3: 'Product Summary',
		4: 'Payment',
	};
	staticPages = [
		'/faq',
		'/max',
		'/diwali-deals',
		'/deals',
		'/brand-store',
		'/buyer-guide',
		'/copyright',
		'/privacy',
		'/terms',
		'/testimonials',
		'/compliance',
		'/press',
		'/about',
		'/corporate-gifting',
		'/services',
		'/career',
		'/affiliate',
		'/moglix-originals',
		'/contact',
	];
	isLoginPage: boolean = false;

	constructor(
		@Inject(PLATFORM_ID) platformId,
		public router: Router,
		private route: ActivatedRoute,
		private localAuthService: LocalAuthService,
		private cartService: CartService,
		private location: Location,
		private checkoutLoginService: CheckoutLoginService,
		private cfr: ComponentFactoryResolver,
		private injector: Injector,
		private ngZone: NgZone,
		private changeDetectorRef: ChangeDetectorRef,
		private globalLoader: GlobalLoaderService,
		private _state: GlobalState
	) {
		this.isServer = isPlatformServer(platformId);
		this.isBrowser = isPlatformBrowser(platformId);

		this.commonSubcribers();
	}

	ngOnInit() {
		if (this.isBrowser) {
			this.browserCalc();
			this.refreshIcon();
			this.addBrowserSubcribers();
		}
	}

	ngAfterViewInit() {
		if (this.isBrowser) {
			window.addEventListener('scroll', (event) => {
				let scrollE = document.scrollingElement || document.documentElement;
				if (scrollE['scrollTop'] > 120) {
					this.isScrolledHeader = true;
				} else {
					this.isScrolledHeader = false;
				}
			});
		}
	}

	ngOnDestroy() {
		this.sideNavInstance = null;
		this.searchBarInstance = null;
	}

	async loadSideNav() {
		if (!this.sideNavInstance) {
			this.globalLoader.setLoaderState(true);
			const { SideNavComponent } = await import(
				'./../../components/side-nav/side-nav.component'
			).finally(() => {
				this.globalLoader.setLoaderState(false);
			});
			const factory = this.cfr.resolveComponentFactory(SideNavComponent);
			this.sideNavInstance = this.sideMenuContainerRef.createComponent(
				factory,
				null,
				this.injector
			);
		} else {
			//toggle side menu
			this.sideNavInstance.instance['sideMenuOpen'] = !this.sideNavInstance[
				'sideMenuOpen'
			];
			this.sideNavInstance.instance[
				'user'
			] = this.localAuthService.getUserSession();
		}
	}

	async loadSearchNav() {
		if (!this.searchBarInstance) {
			this.globalLoader.setLoaderState(true);
			const { SearchBarComponent } = await import(
				'./../../components/searchBar/search-bar.component'
			).finally(() => {
				this.globalLoader.setLoaderState(false);
			});
			const factory = this.cfr.resolveComponentFactory(SearchBarComponent);
			this.searchBarInstance = this.sideMenuContainerRef.createComponent(
				factory,
				null,
				this.injector
			);
			this.searchBarInstance.instance['data'] = {
				type: 'home',
				className: 'secondScroll',
			};
			this.searchBarInstance.instance['showSuggestionBlock'] = false;
			(
				this.searchBarInstance.instance['out'] as EventEmitter<boolean>
			).subscribe((status) => {
				this.searchBarInstance = null;
				this.sideMenuContainerRef.detach();
			});
		} else {
			setTimeout(() => {
				document.getElementById('search-input').focus();
				document.getElementById('search-input')['value'] = '';
			}, 350);
			this.searchBarInstance.instance['data'] = {
				type: 'home',
				className: 'secondScroll',
			};
			this.searchBarInstance.instance['showSuggestionBlock'] = false;
			this.searchBarInstance.instance['ssp'] = true;
		}
	}

	async loadBottomSheet() {
		if (!this.bottomSheetInstance) {
			const { NavBottomSheetComponent } = await import(
				'./../../components/nav-bottom-sheet/nav-bottom-sheet.component'
			);
			const factory = this.cfr.resolveComponentFactory(NavBottomSheetComponent);
			this.bottomSheetInstance = this.sideMenuContainerRef.createComponent(
				factory,
				null,
				this.injector
			);
			this.bottomSheetInstance.instance['sbm'] = true;
		} else {
			//toggle side menu
			this.bottomSheetInstance.instance['sbm'] = true;
		}
	}

	commonSubcribers() {
		this.router.events.subscribe((val) => {
			if (val instanceof NavigationEnd) {
				if (val['url'] === '/') {
					this.isHomePage = true;
				} else {
					this.isHomePage = false;
					// (<HTMLElement>document.querySelector('header-nav + div'))['style']['marginTop'] = '';
				}
				this.createHeaderData(this.route);
			}
		});
	}

	addBrowserSubcribers() {
		this.router.events
			.pipe(filter((event) => event instanceof NavigationEnd))
			.subscribe((evt: any) => {
				this.currentUrl = evt.url;
				this.backRedirectUrl = this.currentUrl || '';
				localStorage.setItem('backRedirectUrl', this.backRedirectUrl);
				if (evt instanceof NavigationEnd) {
					this.refreshIcon();
				}
			});

		this.cartService.cart.subscribe((data) => {
			if (data.count) {
				this.noOfCart = data.count;
			} else {
				this.noOfCart = data;
			}
			this.setHeader();
		});

		this.localAuthService.login$.subscribe((data) => {
			this.user = this.localAuthService.getUserSession();
			this.isUserLogin = true;
		});

		this.localAuthService.logout$.subscribe((data) => {
			this.user = this.localAuthService.getUserSession();
			this.isUserLogin = false;
		});
	}

	browserCalc() {
		// load user information
		this.user = this.localAuthService.getUserSession();
		this.isUserLogin =
			this.user && this.user.authenticated
				? (this.user.authenticated as boolean)
				: false;
	}

	createHeaderData(_aRoute) {
		of(_aRoute)
			.pipe(
				map((route) => {
					while (route.firstChild) {
						route = route.firstChild;
					}
					return route;
				}),
				filter((route) => route.outlet === 'primary'),
				mergeMap((route) => route.data)
			)
			.subscribe((rData) => {
				this.routerData = rData;
			});
	}

	goBack() {
		this.backRedirectUrl = localStorage.getItem('backRedirectUrl');
		if (this.backRedirectUrl && this.backRedirectUrl !== '/') {
			this.location.back();
		} else {
			if (this.staticPages.indexOf(window.location.pathname) !== -1) {
				this.router.navigate(['/']);
			} else if (
				(window.location.pathname == '/checkout' &&
					window.location.search == '?index=1') ||
				(window.location.pathname == '/checkout' &&
					window.location.search == '?index=2') ||
				window.location.pathname == '/checkout'
			) {
				if (this.checkoutLoginService.isAtFirstSection) {
					let route = parseInt(window.location.search.split('=')[1]);
					if (isNaN(route)) {
						this.location.back();
					} else if (route == 1) {
						this.location.back();
					} else if (route == 2) {
						this.location.back();
					} else {
						this._state.notifyData('routeChanged', route - 2);
					}
				} else {
					this.checkoutLoginService.enableResetTabSateSub(true);
				}
			} else if (
				window.location.pathname == '/checkout' &&
				window.location.search != '?index=2' &&
				window.location.search != '?index=1'
			) {
				let route = parseInt(window.location.search.split('=')[1]);
				this._state.notifyData('routeChanged', route - 2);
				this.refreshIcon();
			} else {
				/**
				 * Fix for ODP-57
				 * if user directly enter certain pages, we are sending user to home page on back button click
				 */
				this.router.navigate(['/']);
			}
		}
	}

	refreshIcon() {
		this.cartHeaderText = '';
		this.hideElLogin = true;
		this.setHeader();
	}

	setHeader() {
		this.isLoginPage = false;
		if (
			this.router.url.includes('/forgot-password') ||
			this.router.url.includes('/login') ||
			this.router.url.includes('/quickorder') ||
			this.router.url.includes('/checkout') ||
			this.router.url.includes('/online-assist') ||
			this.router.url.includes('/forgot-password') ||
			this.router.url.includes('/sign-up')
		) {
			this.isLoginPage = true;
			this.hideElLogin = false;
			this.changeDetectorRef.detectChanges();
			// console.log('refreshIcon 3', this.router.url);

			if (this.router.url.includes('/quickorder')) {
				if (this.noOfCart && this.noOfCart != 0) {
					this.cartHeaderText = `(${this.noOfCart})`;
				} else {
					this.cartHeaderText = '';
				}
			} else if (this.router.url.includes('/checkout')) {
				this.route.queryParams.subscribe((query) => {
					if (query['index'] && query['index'] == 4) {
						this.routerData['title'] = 'Payment';
					} else {
						this.cartHeaderText = '';
						this.routerData['title'] = 'Checkout';
					}
				});
			} else {
				this.cartHeaderText = '';
				this.hideElLogin = false;
			}
		} else {
			this.hideElLogin = true;
			this.changeDetectorRef.detectChanges();
			this.cartHeaderText = '';
		}
	}
}
