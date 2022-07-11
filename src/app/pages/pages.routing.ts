import { NgModule } from '@angular/core';
import { PagesComponent } from './pages.component';
import { Routes, RouterModule, UrlSegment } from '@angular/router';
import { MyAccountGuard } from '@utils/guards/myAccount.guard';
import { IsNotAuthenticatedGuard } from '@utils/guards/is-not-authenticated.guard';
import RoutingMatcher from '@utils/routing.matcher';
import CONSTANTS from '@app/config/constants';

const _routingMatcher = new RoutingMatcher();

const routes: Routes = [
	{
		path: '',
		component: PagesComponent,
		children: [
			{
				path: '',
				loadChildren: () =>
					import('./home/home.module').then((m) => m.HomeModule),
				data: {
					footer: true,
					logo: true,
					moreOpt: true,
					pageName: 'home',
					moduleName: CONSTANTS.MODULE_NAME.HOME
				},
			},
			{
				matcher: _routingMatcher.productMatch,
				loadChildren: () =>
					import('./product/product.module').then((m) => m.ProductModule),
				data: {
					pageName: 'pdp',
					moduleName: CONSTANTS.MODULE_NAME.PRODUCT
				},
			},
			{
				matcher: _routingMatcher.categoriesMatcher,
				loadChildren: () =>
					import('./category/category.module').then((m) => m.CategoryModule),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
					pageName: 'listing',
					moduleName: CONSTANTS.MODULE_NAME.PRODUCT_LISTING_PAGE
				},
			},
			// {
			// 	matcher: categoriesMatcher,
			// 	loadChildren: () =>
			// 		import('./category/category.module').then((m) => m.CategoryModule),
			// 	data: {
			// 		footer: false,
			// 		logo: true,
			// 		moreOpt: true,
			// 	},
			// },
			{
				path: 'alp/:attribute',
				loadChildren: () => import('./alp/alp.module').then(m => m.AlpModule),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
					pageName: 'listing:alp',
					moduleName: CONSTANTS.MODULE_NAME.PRODUCT_LISTING_PAGE
				}
			},
			{
				matcher: _routingMatcher.popularProductsMatcher,
				loadChildren: () =>
					import('./popular/popularProduct/popularProduct.module').then(
						(m) => m.PopularProductModule
					),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
					pageName: 'listing:popular',
					moduleName: CONSTANTS.MODULE_NAME.PRODUCT_LISTING_PAGE
				},
			},
			{
				path: 'categorystore/safety/safetyshoes',
				loadChildren: () =>
					import('@pages/storefront/shoe/shoe.module').then(
						(m) => m.ShoeModule
					),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
					layoutId: 'cm226668',
				},
			},
			{
				path: 'brands/:brand',
				loadChildren: () =>
					import('./brand/brand.module').then((m) => m.BrandModule),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
					pageName: 'listing:brand',
					moduleName: CONSTANTS.MODULE_NAME.PRODUCT_LISTING_PAGE
				},
			},
			{
				matcher: _routingMatcher.brandCategoriesMatcher,
				loadChildren: () =>
					import('./brand/brand.module').then((m) => m.BrandModule),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
					pageName: 'listing:brandCategory',
					moduleName: CONSTANTS.MODULE_NAME.PRODUCT_LISTING_PAGE
				},
			},
			// {
			// 	path: 'search',
			// 	loadChildren: () =>
			// 		import('./search/search.module').then((m) => m.SearchModule),
			// 	data: {
			// 		footer: false,
			// 		logo: true,
			// 		moreOpt: true,
			// 	},
			// },
			{
				path: 'search',
				loadChildren: () =>
					import('./search/search.module').then((m) => m.SearchModule),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
					pageName: 'listing:search',
					moduleName: CONSTANTS.MODULE_NAME.PRODUCT_LISTING_PAGE
				},
			},
			{
				path: 'quickorder',
				loadChildren: () =>
					import('./quickOrder/quickOrder.module').then(
						(m) => m.QuickOrderModule
					),
				data: {
					footer: false,
					title: 'My Cart',
					moreOpt: true,
					moduleName: CONSTANTS.MODULE_NAME.QUICKORDER
				},
			},
			{
				path: 'checkout',
				loadChildren: () =>
					import('./checkout-v2/checkout-v2.module').then(
						(m) => m.CheckoutV2Module
					),
				data: {
					footer: false,
					title: 'Checkout',
					moreOpt: true,
					moduleName: CONSTANTS.MODULE_NAME.CART
				},
			},
			{
				path: 'login',
				loadChildren: () =>
					import('./auth/auth.module').then((m) => m.AuthModule),
				data: {
					footer: false,
					title: 'Welcome',
					moreOpt: true,
					hideHeader: true,
				},
				canActivate: [IsNotAuthenticatedGuard],
			},
			{
				path: 'otp',
                loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
				data: {
					title: 'Sign In',
					footer: false,
					moreOpt: true,
					hideHeader: true,
				},
				canActivate: [IsNotAuthenticatedGuard],
			},
			{
				path: 'forgot-password',
				loadChildren: () =>import('./auth/auth.module').then((m) => m.AuthModule),
				data: {
					footer: false,
					title: 'Forgot Password',
					moreOpt: false,
					hideHeader: true,
				},
				canActivate: [IsNotAuthenticatedGuard],
			},
			{
				path: 'sign-up',
                loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
				data: {
					footer: false,
					title: 'Sign Up',
					moreOpt: true,
					hideHeader: true,
				},
				canActivate: [IsNotAuthenticatedGuard],
			},
			{
				path: 'order-failure',
				loadChildren: () =>
					import('./orderFailure/orderFailure.module').then(
						(m) => m.OrderFailureModule
					),
				data: {
					footer: false,
					title: 'Order Failure',
					logo: true,
					menuBar: true,
					moduleName: CONSTANTS.MODULE_NAME.ORDER_FAILURE
				},
			},
			{
				path: 'order-confirmation',
				loadChildren: () =>
					import('./orderConfirmation/orderConfirmation.module').then(
						(m) => m.OrderConfirmationModule
					),
				data: {
					footer: false,
					logo: true,
					menuBar: true,
					moduleName: CONSTANTS.MODULE_NAME.ORDER_CONFIRMATION
				},
			},
			{
				path: 'dashboard',
				loadChildren: () =>
					import('./bussiness/bussiness.module').then((m) => m.BusinessModule),
				canActivate: [MyAccountGuard],
				data: {
					moduleName: CONSTANTS.MODULE_NAME.DASHBOARD
				}
			},
			{
				path: 'brand-store',
				loadChildren: () =>
					import('./static/brand-store/brand-store.module').then((m) => m.BrandStoreModule),
				data: {
					footer: false,
					logo: true,
				},
			},
			{
				path: 'articles/:name',
				loadChildren: () =>
					import('./article/article.module').then((m) => m.ArticleModule),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
					pageName: 'article'
				},
			},
			{
				path: 'articles',
				loadChildren: () =>
					import('./articles/articles.module').then((m) => m.ArticlesModule),
				data: {
					footer: true,
					logo: true,
					moreOpt: true,
					pageName: 'articles'
				},
			},
			{
				path: 'all-categories',
				loadChildren: () =>
					import('./view/view.module').then((m) => m.ViewModule),
				data: {
					footer: false,
					logo: true,
				},
			},
			{
				path: 'industrystore',
				loadChildren: () =>
					import('./static/industryStore/industryStore.module').then(
						(m) => m.IndustryStoreModule
					),
				data: {
					footer: true,
					title: 'Industry Store',
					moreOpt: true,
				},
			},
			{
				path: 'manufacturer-store/:manufacturer',
				loadChildren: () =>
					import('./static/manufacturer-store/liberty/liberty.module').then(
						(m) => m.LibertyModule
					),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
				},
			},
			{
				path: 'store/:type',
				loadChildren: () =>
					import('./clusterStore/cluster-store.module').then(
						(m) => m.ClusterStoreModule
					),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
					pageName: 'store'
				},
			},
			{
				path: 'brand-store/bosch',
				loadChildren: () =>
					import('../components/brand-store/store.module').then(
						(m) => m.StoreModule
					),
				data: {
					footer: false,
					title: 'Bosch',
					moreOpt: true,
					layoutId: 'cm755792',
				},
			},
			{
				path: 'brand-store/godrej',
				loadChildren: () =>
					import('../components/brand-store/store.module').then(
						(m) => m.StoreModule
					),
				data: {
					footer: false,
					title: 'Godrej',
					moreOpt: true,
					layoutId: 'cm104867',
				},
			},
			{
				path: 'brand-store/3m',
				loadChildren: () =>
					import('../components/brand-store/store.module').then(
						(m) => m.StoreModule
					),
				data: {
					footer: false,
					title: '3M',
					moreOpt: true,
					layoutId: 'cm909874',
				},
			},
			{
				path: 'brand-store/philips',
				loadChildren: () =>
					import('../components/brand-store/store.module').then(
						(m) => m.StoreModule
					),
				data: {
					footer: false,
					title: 'Philips',
					moreOpt: true,
					layoutId: 'cm645889',
				},
			},
			{
				path: 'brand-store/havells',
				loadChildren: () =>
					import('../components/brand-store/store.module').then(
						(m) => m.StoreModule
					),
				data: {
					footer: false,
					title: 'Havells',
					moreOpt: true,
					layoutId: 'cm484415',
				},
			},
			{
				path: 'brand-store/vguard',
				loadChildren: () =>
					import('../components/brand-store/store.module').then(
						(m) => m.StoreModule
					),
				data: {
					footer: false,
					title: 'VGuard',
					moreOpt: true,
					layoutId: 'cm987844',
				},
			},
			{
				path: 'brand-store/eveready',
				loadChildren: () =>
					import('../components/brand-store/store.module').then(
						(m) => m.StoreModule
					),
				data: {
					footer: false,
					title: 'Eveready',
					moreOpt: true,
					layoutId: 'cm604845',
				},
			},
			{
				path: 'brand-store/luminous',
				loadChildren: () =>
					import('../components/brand-store/store.module').then(
						(m) => m.StoreModule
					),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
					layoutId: 'cm849659',
				},
			},
			{
				path: 'brand-store/makita',
				loadChildren: () =>
					import('../components/brand-store/store.module').then(
						(m) => m.StoreModule
					),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
					layoutId: 'cm106721',
				},
			},
			{
				path: 'brand-store/karam',
				loadChildren: () =>
					import('../components/brand-store/store.module').then(
						(m) => m.StoreModule
					),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
					layoutId: 'cm338483',
				},
			},
			{
				path: 'brand-store/dewalt',
				loadChildren: () =>
					import('../components/brand-store/store.module').then(
						(m) => m.StoreModule
					),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
					layoutId: 'cm709642',
				},
			},
			{
				path: 'brand-store/stanley',
				loadChildren: () =>
					import('../components/brand-store/store.module').then(
						(m) => m.StoreModule
					),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
					layoutId: 'cm523993',
				},
			},
			{
				path: 'brand-store/black-decker',
				loadChildren: () =>
					import('../components/brand-store/store.module').then(
						(m) => m.StoreModule
					),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
					layoutId: 'cm105550',
				},
			},
			{
				path: 'covid-19-essentials',
				loadChildren: () =>
					import('./covid19essentials/covid19.module').then(
						(m) => m.Covid19Module
					),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
					layoutId: 'cm661682',
				},
			},
			{
				path: 'store-front/shoe',
				loadChildren: () =>
					import('./storefront/shoe/shoe.module').then((m) => m.ShoeModule),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
					layoutId: 'cm226668',
				},
			},
			{
				path: 'store-front/power-tools',
				loadChildren: () =>
					import('./storefront/power-tools/power-tools.module').then(
						(m) => m.PowerToolsModule
					),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
					layoutId: 'cm400124',
				},
			},
			{
				path: 'faq',
				loadChildren: () =>
					import('../modules/faq/faq.module').then((m) => m.FaqModule),
				data: {
					footer: true,
					logo: true,
					moreOpt: true,
					title:"FAQ's",
					moduleName: CONSTANTS.MODULE_NAME.DASHBOARD
				},
			},
			{
				path: 'corporate-gifting',
				loadChildren: () =>
					import('./corporate-gifting/corporate-gifting.module').then((m) => m.CorporateGiftingModule),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
					// layoutId: 'cm918679',
				},
			},
			{
				path: 'about',
				loadChildren: () =>
					import('./about/about.module').then((m) => m.AboutModule),
				data: {
					footer: false,
					title: 'About Us',
					moreOpt: true,
				},
			},
			{
				path: 'services',
				loadChildren: () =>
					import('./installationService/installationService.module').then(
						(m) => m.InstallationModule
					),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
				},
			},
			{
				path: 'career',
				loadChildren: () =>
					import('./career/career.module').then((m) => m.CareerModule),
				data: {
					footer: true,
					title: 'Career',
					moreOpt: true,
				},
			},
			{
				path: 'affiliate',
				loadChildren: () =>
					import('./affiliate/affiliate.module').then((m) => m.AffiliateModule),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
				},
			},
			{
				path: 'moglix-originals',
				loadChildren: () =>
					import('./originals/originals.module').then((m) => m.OriginalsModule),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
				},
			},
			{
				path: 'contact',
				loadChildren: () =>
					import('./contact/contact.module').then((m) => m.ContactModule),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
					title: 'Contact Us',
					moduleName: CONSTANTS.MODULE_NAME.DASHBOARD
				},
			},
			{
				path: 'press',
				loadChildren: () =>
					import('./press/press.module').then((m) => m.PressModule),
				data: {
					footer: true,
					title: 'Press',
					moreOpt: true,
				},
			},
			{
				path: 'compliance',
				loadChildren: () =>
					import('./compliance/compliance.module').then(
						(m) => m.complianceModule
					),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
				},
			},
			{
				path: 'testimonials',
				loadChildren: () =>
					import('./testimonials/testimonials.module').then(
						(m) => m.TestimonialsModule
					),
				data: {
					footer: true,
					title: 'Testimonials',
					moreOpt: true,
				},
			},
			{
				path: 'terms',
				loadChildren: () =>
					import('./terms/terms.module').then((m) => m.TermsModule),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
				},
			},
			{
				path: 'privacy',
				loadChildren: () =>
					import('./privacy/privacy.module').then((m) => m.PrivacyModule),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
				},
			},
			{
				path: 'copyright',
				loadChildren: () =>
					import('./copyright/copyright.module').then((m) => m.CopyrightModule),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
				},
			},
			{
				path: 'max',
				loadChildren: () => import('./max/max.module').then((m) => m.MaxModule),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
				},
			},
			{
				path: 'moglixhaina',
				loadChildren: () =>
					import('./campaign/campaign.module').then((m) => m.CampaignModule),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
				},
			},
			{
				path: 'diwali-deals',
				loadChildren: () =>
					import('./diwali-deals/deals.module').then((m) => m.DealsModule),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
					layoutId: 'cm221273',
				},
			},
			{
				path: 'deals',
				loadChildren: () =>
					import('./deals/deals.module').then((m) => m.DealsModule),
				data: {
					footer: false,
					title: 'Deals',
					moreOpt: true,
				},
			},
			{
				path: 'popular-search',
				loadChildren: () =>
					import('./popular-search/popular-search.module').then(
						(m) => m.PopularSearchModule
					),
				data: {
					footer: false,
					logo: true,
					moreOpt: true,
				},
			},
			{
				path: 'buyer-guide',
				loadChildren: () =>
					import('./buyer/buyer.module').then((m) => m.BuyerModule),
				data: {
					footer: false,
					title: 'Buying Guide',
					moreOpt: true,
				},
			},
			{
				path: 'rfq',
				loadChildren: () =>
					import('./bulkEnquiry/bulkEnquiry.module').then(
						(m) => m.BulkEnquiryModule
					),
				data: {
					footer: false,
					moreOpt: false,
					logo: true,
				},
			},
			{
				path: 'feedback',
				loadChildren: () =>
					import('./general-feedback/general-feedback.module').then((m) => m.GeneralFeedbackModule),
				data: {
					title: 'Feedback',
					menuBar: true,
					footer: false,
				},
			},
			{
				path: 'assist-verification-success',
				loadChildren: () => import('@pages/assist-verification-success/assist-verification-success.module').then(m => m.AssistVerificationSuccessModule),
				data: {
					hideHeader: true,
				},
			},
			{
				path: 'e-gift-voucher',
				loadChildren: () => import('@pages/e-gift-voucher/e-gift-voucher.module').then(m => m.EGiftVoucherModule),
				data: {
					footer: false,
					moreOpt: false,
					cart: false,
					menuBar: false,
					searchBar: false,
					pageName: 'E-Gift'
				},
			},
			{
				path: 'assist-verification-failure',
				loadChildren: () => import('@pages/assist-verification-failure/assist-verification-failure.module').then(m => m.AssistVerificationFailureModule),
				data: {
					hideHeader: true,
				},
			},
			{
				path: 'feedback',
				loadChildren: () =>
					import('./general-feedback/general-feedback.module').then((m) => m.GeneralFeedbackModule),
				data: {
					title: 'Feedback',
					menuBar: true,
					footer: false,
				},
			},
			{
				path: 'utr-confirmation',
				loadChildren: () =>
					import('./utr-confirmation/utr-confirmation.module').then((m) => m.UTRConfirmationModule),
				data: {
					footer: false,
					moreOpt: false,
					cart: false,
					menuBar: false,
					searchBar: false,
					pageName: 'Payment Confirmation'
				},
			},
			{
				path: '**',
				loadChildren: () =>
					import('./pageNotFound/pageNotFound.module').then(
						(m) => m.PageNotFoundModule
					),
				data: {
					footer: true,
					logo: true,
					menuBar: true,
					moreOpt: false,
				},
			},
		],
	},
];
@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class PagesRoutingModule { }
