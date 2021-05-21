import { Routes, RouterModule } from '@angular/router';
import { DashboardBussinessComponent } from './bussiness.component';

const routes: Routes = [
    {
        path: '',
        component: DashboardBussinessComponent,
        children: [
            {
                path: 'business-detail',
                loadChildren: () => import('../../modules/dashboard/bussiness-detail/businessDetail.module').then(m => m.BusinessDeatailDashboardModule),
                data: { title: 'My Business Details', menuBar: true }
            },
            {
                path: 'address',
                loadChildren: () => import('../../modules/dashboard/bussiness-address/businessAddress.module').then(m => m.BusinessAddressModule),
                data: { title: 'My Address', menuBar: true }
            },
            {
                path: 'order',
                loadChildren: () => import('../../modules/dashboard/bussiness-order/businessOrder.module').then(m => m.BusinessOrderModule),
                data: { title: 'My Order', menuBar: true }
            },
            {
                path: 'password',
                loadChildren: () => import('../../modules/dashboard/bussiness-password/businessPassword.module').then(m => m.BusinessPasswordModule),
                data: { title: 'Change Password' }
            },
            {
                path: 'info',
                loadChildren: () => import('../../modules/dashboard/bussiness-personal-info/businessInfo.module').then(m => m.BusinessInfoModule),
                data: { title: 'My Profile', menuBar: true }
            },
            {
                path: 'purchase-list',
                loadChildren: () => import('../../modules/dashboard/bussiness-purchase-list/businessPurchaseList.module').then(m => m.BusinessPurchaseListModule),
                data: { title: 'My  Wishlist', menuBar: true }
            },
            {
                path: 'rfq',
                loadChildren: () => import('../../modules/dashboard/bussiness-rfq/businessRfq.module').then(m => m.BusinessRfqModule),
                data: { title: 'My RFQ', addRfq: true, menuBar: true }
            },
            {
                path: 'order-detail',
                loadChildren: () => import('../../modules/dashboard/order-detail/order-detail.module').then(m => m.OrderDetailModule),
                data: { title: 'Order Detail' }
            },
            {
				path: '**',
				loadChildren: () =>
					import('../pageNotFound/pageNotFound.module').then(
						(m) => m.PageNotFoundModule
					),
				data: {
					footer: true,
					logo: true,
					menuBar: true,
					moreOpt: false,
				}
			}
        ]
    },
];

export const routing = RouterModule.forChild(routes);
