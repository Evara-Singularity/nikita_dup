import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LayoutResolver } from "@app/utils/resolvers/layout.resolver";
import { SlipSafetyComponent } from "./slipSafety.component";

const routes: Routes = [
  {
    path: "",
    component: SlipSafetyComponent,
    resolve: {
      data: LayoutResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SlipSafetyRoutingModule { }