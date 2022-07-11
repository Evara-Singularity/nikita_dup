import { Routes, RouterModule } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { DashboardBussinessComponent } from './bussiness.component';

const routes: Routes = [
    {
        path: '',
        component: DashboardBussinessComponent,
        children: [
            {
                path: '',
                loadChildren: () => import('../../modules/dashboard/bussiness-personal-info/businessInfo.module').then(m => m.BusinessInfoModule),
                data: { title: 'My Profile', menuBar: true, moduleName: CONSTANTS.MODULE_NAME.DASHBOARD }
            },
            {
                path: 'business-detail',
                loadChildren: () => import('../../modules/dashboard/bussiness-detail/businessDetail.module').then(m => m.BusinessDeatailDashboardModule),
                data: { title: 'Business Details', menuBar: true, moduleName: CONSTANTS.MODULE_NAME.DASHBOARD }
            },
            {
                path: 'address',
                loadChildren: () => import('../../modules/dashboard/bussiness-address/businessAddress.module').then(m => m.BusinessAddressModule),
                data: { title: 'My Address', menuBar: true, moduleName: CONSTANTS.MODULE_NAME.DASHBOARD }
            },
            {
                path: 'order',
                loadChildren: () => import('../../modules/dashboard/bussiness-order/businessOrder.module').then(m => m.BusinessOrderModule),
                data: { title: 'My Order', menuBar: true, moduleName: CONSTANTS.MODULE_NAME.DASHBOARD }
            },
            {
                path: 'password',
                loadChildren: () => import('../../modules/dashboard/bussiness-password/businessPassword.module').then(m => m.BusinessPasswordModule),
                data: { title: 'Change Password', moduleName: CONSTANTS.MODULE_NAME.DASHBOARD }
            },
            {
                path: 'info',
                loadChildren: () => import('../../modules/dashboard/bussiness-personal-info/businessInfo.module').then(m => m.BusinessInfoModule),
                data: { title: 'My Profile', menuBar: true, moduleName: CONSTANTS.MODULE_NAME.DASHBOARD }
            },
            {
                path: 'purchase-list',
                loadChildren: () => import('../../modules/dashboard/bussiness-purchase-list/businessPurchaseList.module').then(m => m.BusinessPurchaseListModule),
                data: { title: 'Wishlist', menuBar: true, moduleName: CONSTANTS.MODULE_NAME.DASHBOARD }
            },
            {
                path: 'rfq',
                loadChildren: () => import('../../modules/dashboard/bussiness-rfq/businessRfq.module').then(m => m.BusinessRfqModule),
                data: { title: 'My RFQ', addRfq: true, menuBar: true, moduleName: CONSTANTS.MODULE_NAME.DASHBOARD }
            },
            {
                path: 'order-detail',
                loadChildren: () => import('../../modules/dashboard/order-detail/order-detail.module').then(m => m.OrderDetailModule),
                data: { title: 'Order Detail', moduleName: CONSTANTS.MODULE_NAME.DASHBOARD }
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
