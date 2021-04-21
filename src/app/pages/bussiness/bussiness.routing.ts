import {Routes, RouterModule} from '@angular/router';
import {DashboardBussinessComponent} from './bussiness.component';

const routes: Routes = [
    {
        path: '',
        component: DashboardBussinessComponent,
        children: [
            {path: '', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.BusinessDashboardModule)},
            {path: 'business-detail',
            loadChildren: () => import('./dashboard/bussiness-detail/businessDetail.module').then(m => m.BusinessDeatailDashboardModule),
            data: {title: 'My Business Details', menuBar : true}},
            {path: 'address',
            loadChildren: () => import('./dashboard/bussiness-address/businessAddress.module').then(m => m.BusinessAddressModule),
            data: {title: 'My Address', menuBar : true}},
            {path: 'order',
            loadChildren: () => import('./dashboard/bussiness-order/businessOrder.module').then(m => m.BusinessOrderModule),
            data: {title: 'My Order', menuBar : true}},
            {path: 'insight',
            loadChildren: () => import('./dashboard/bussiness-insight/businessInsight.module').then(m => m.BusinessInsightModule)},
            {path: 'password',
            loadChildren: () => import('./dashboard/bussiness-password/businessPassword.module').then(m => m.BusinessPasswordModule),
            data:{title:'Change Password'}},
            {path: 'info',
            loadChildren: () => import('./dashboard/bussiness-personal-info/businessInfo.module').then(m => m.BusinessInfoModule),
            data:{title:'My Profile', menuBar : true}},
            {path: 'purchase-list',
            loadChildren: () => import('./dashboard/bussiness-purchase-list/businessPurchaseList.module').then(m => m.BusinessPurchaseListModule),
            data: {title: 'My  Wishlist', menuBar : true}},
            {path: 'rfq',
            loadChildren: () => import('./dashboard/bussiness-rfq/businessRfq.module').then(m => m.BusinessRfqModule),
            data: {title: 'My RFQ', addRfq: true, menuBar : true}},
            {path: 'business-insight',
            loadChildren: () => import('./dashboard/bussiness-insight/businessInsight.module').then(m => m.BusinessInsightModule)},
            {path: 'order-detail',
            loadChildren: () => import('./dashboard/order-detail/order-detail.module').then(m => m.OrderDetailModule),
            data: {title: 'Order Detail'}}
        ]
    },
];

export const routing = RouterModule.forChild(routes);
