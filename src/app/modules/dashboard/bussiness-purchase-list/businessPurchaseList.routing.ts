import { Routes, RouterModule } from "@angular/router";
import { BussinessPurchaseListComponent } from "./bussinessPurchaseList.component";

const routes: Routes = [
  {
    path: "",
    component: BussinessPurchaseListComponent,
  },
];

export const routing = RouterModule.forChild(routes);