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
        path: 'covid-19-essentials',
        loadChildren: () => import('./covid19essentials/covid19.module').then(m => m.Covid19Module),
        data: {
          footer: false,
          logo: true,
          moreOpt: true,
          layoutId: 'cm661682'
        }
      },
      {
        path: 'corporate-gifting',
        loadChildren: () => import('./corporate/corporate.module').then(m => m.CorporateModule),
        data: {
          footer: false,
          logo: true,
          moreOpt: true,
          layoutId: 'cm918679'
        }
      },
      {
        path: 'about',
        loadChildren: () => import('./about/about.module').then(m => m.AboutModule),
        data: {
          footer: false,
          title: 'About Us',
          moreOpt: true
        }
      },
      {
        path: 'services',
        loadChildren: () => import('./installationService/installationService.module').then(m => m.InstallationModule),
        data: {
          footer: false,
          logo: true,
          moreOpt: true
        }
      },
      {
        path: 'career',
        loadChildren: () => import('./career/career.module').then(m => m.CareerModule),
        data: {
          footer: false,
          title: 'Career',
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
