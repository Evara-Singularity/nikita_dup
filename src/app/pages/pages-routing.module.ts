import { NgModule } from '@angular/core';
import { Routes, RouterModule, UrlSegment } from '@angular/router';
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
      }
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
