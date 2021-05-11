import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DealsLayoutComponent } from './deals-layout.component';

const routes: Routes = [
    {
        path: '',
        component: DealsLayoutComponent,
        children: [
            {
                path: '',
                loadChildren: () => import('../../modules/deals/deals/deals.module').then(m => m.DealsModule),
                data: {
                    layoutId: 'cm910070'
                }
            },
            {
                path: 'amazing-deals',
                loadChildren: () => import('../../modules/deals/amazing-deals/amazing-deals.module').then(m => m.AmazingDealsModule),
                data: {
                    layoutId: 'cm557824'
                }
            },
        ]
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DealsRoutingModule { }
