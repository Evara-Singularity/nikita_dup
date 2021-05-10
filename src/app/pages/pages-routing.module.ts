import { NgModule } from '@angular/core';
import { Routes, RouterModule, UrlSegment } from '@angular/router';
import { IsNotAuthenticatedGuard } from '../utils/guards/is-not-authenticated.guard';
import { PagesComponent } from './pages.component';

const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      {
        matcher: productMatch,
        loadChildren: () => import('./product/product.module').then(m => m.ProductModule)
      },
      {
        path: 'quickorder',
        loadChildren: () => import('./quickOrder/quickOrder.module').then(m => m.QuickOrderModule),
        data: {
          footer: false,
          title: 'My Cart',
          moreOpt: true
        }
      },
      {
        path: 'login',
        loadChildren: () => import('./login/login.module').then(m => m.LoginModule),
        data: {
          footer: false,
          title: 'Welcome',
          moreOpt: true
        },
        canActivate: [IsNotAuthenticatedGuard]
      },
      {
        path: 'otp',
        loadChildren: () => import('./otp/otp.module').then(m => m.OtpModule),
        data: {
          title: 'Sign In',
          footer: false,
          moreOpt: true
        },
        canActivate: [IsNotAuthenticatedGuard]
      },
      {
        path: 'forgot-password',
        loadChildren: () => import('./forgot-password/forgot-password.module').then(m => m.ForgotPasswordModule),
        data: {
          footer: false,
          title: 'Forgot Password',
          moreOpt: false
        },
        canActivate: [IsNotAuthenticatedGuard]
      },
      {
        path: 'sign-up',
        loadChildren: () => import('./sign-up/sign-up.module').then(m => m.SignUpModule),
        data: {
          footer: false,
          title: 'Sign Up',
          moreOpt: true
        },
        canActivate: [IsNotAuthenticatedGuard]
      },
      {
        path: 'articles/:name',
        loadChildren: () => import('./articles/articles.module').then(m => m.ArticlesModule),
        data: {
          footer: false,
          logo: true,
          moreOpt: true
        }
      },
      {
        path: 'brand-store/bosch',
        loadChildren: () => import('../components/brand-store/store.module').then(m => m.StoreModule),
        data: {
          footer: false,
          title: 'Bosch',
          moreOpt: true
        }
      },
      {
        path: 'brand-store/godrej',
        loadChildren: () => import('../components/brand-store/store.module').then(m => m.StoreModule),
        data: {
          footer: false,
          title: 'Godrej',
          moreOpt: true
        }
      },
      {
        path: 'brand-store/3m',
        loadChildren: () => import('../components/brand-store/store.module').then(m => m.StoreModule),
        data: {
          footer: false,
          title: '3M',
          moreOpt: true
        }
      },
      {
        path: 'brand-store/philips',
        loadChildren: () => import('../components/brand-store/store.module').then(m => m.StoreModule),
        data: {
          footer: false,
          title: 'Philips',
          moreOpt: true
        }
      },
      {
        path: 'brand-store/havells',
        loadChildren: () => import('../components/brand-store/store.module').then(m => m.StoreModule),
        data: {
          footer: false,
          title: 'Havells',
          moreOpt: true
        }
      },
      {
        path: 'brand-store/vguard',
        loadChildren: () => import('../components/brand-store/store.module').then(m => m.StoreModule),
        data: {
          footer: false,
          title: 'VGuard',
          moreOpt: true
        }
      },
      {
        path: 'brand-store/eveready',
        loadChildren: () => import('../components/brand-store/store.module').then(m => m.StoreModule),
        data: {
          footer: false,
          title: 'Eveready',
          moreOpt: true
        }
      },
      {
        path: 'brand-store/luminous',
        loadChildren: () => import('../components/brand-store/store.module').then(m => m.StoreModule),
        data: {
          footer: false,
          logo: true,
          moreOpt: true
        }
      },
      {
        path: 'brand-store/makita',
        loadChildren: () => import('../components/brand-store/store.module').then(m => m.StoreModule),
        data: {
          footer: false,
          logo: true,
          moreOpt: true
        }
      },
      {
        path: 'brand-store/karam',
        loadChildren: () => import('../components/brand-store/store.module').then(m => m.StoreModule),
        data: {
          footer: false,
          logo: true,
          moreOpt: true
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }

export function productMatch(url: UrlSegment[]): any {
  const urlLength = url.length;
  if (urlLength > 2) {
    const secondURLStrig = url[1].toString();
    if (secondURLStrig === 'mp') {
      return ({ consumed: url, posParams: { msnid: url[2] } });
    }
  }
}
