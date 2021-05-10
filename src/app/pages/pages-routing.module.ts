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
        matcher: categoriesMatcher,
        loadChildren: () => import('./category/category.module').then(m => m.CategoryModule),
        data: {
          footer: false,
          logo: true,
          moreOpt: true
        }
      },
      {
        path: 'brands/:brand',
        loadChildren: () => import('./brand/brand.module').then(m => m.BrandModule),
        data: {
          footer: false,
          title: 'Brands',
          moreOpt: true
        }
      },
      {
        matcher: brandCategoriesMatcher,
        loadChildren: () => import('./brand/brand.module').then(m => m.BrandModule),
        data: {
          footer: false,
          title: 'Brand',
          moreOpt: true
        }
      },
      {
        path: 'search',
        loadChildren: () => import('./search/search.module').then(m => m.SearchModule),
        data: {
          footer: false,
          logo: true,
          moreOpt: true
        }
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


export function categoriesMatcher(url: UrlSegment[]): any {
  const urlLength = url.length;
  if (urlLength > 0) {
    const lastParam = url[urlLength - 1].toString();
    const brandParam = url[0].toString();
    if (lastParam.match(/^\d{9}$/) && brandParam !== 'brands') {
      return ({ consumed: url, posParams: { id: url[urlLength - 1] } });
    }
  }
}

export function brandCategoriesMatcher(url: UrlSegment[]): any {
  const urlLength = url.length;
  if (urlLength > 0) {
    const lastParam = url[urlLength - 1].toString();
    const brandParam = url[0].toString();
    if (lastParam.match(/^\d{9}$/) && brandParam === 'brands') {
      return ({ consumed: url, posParams: { category: url[urlLength - 1], brand: url[1] } });
    }
  }
}