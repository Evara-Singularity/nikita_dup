import { NgModule } from '@angular/core';
import { Routes, RouterModule, UrlSegment } from '@angular/router';
import { IsNotAuthenticatedGuard } from '../utils/guards/is-not-authenticated.guard';
import { PagesComponent } from './pages.component';

const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
        data: {
          footer: true,
          logo: true,
          moreOpt: true
        }
      },
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
        path: 'brand-store',
        loadChildren: () => import('./static/brand/brand.module').then(m => m.BrandModule),
        data: {
          footer: false,
          title: 'Brand Store',
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
