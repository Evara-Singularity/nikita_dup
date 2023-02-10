import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { moglixInsightPdpResolver } from '@app/utils/resolvers/moglix-insight-pdp-resolver';
import { MoglixInsightPdpComponent } from './moglix-insight-pdp.component';

const routes: Routes = [
  {
    path: '',
    component: MoglixInsightPdpComponent,
    runGuardsAndResolvers: 'always',
    resolve: {
        category: moglixInsightPdpResolver
    },

}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MoglixInsightPdpRoutingModule { }
