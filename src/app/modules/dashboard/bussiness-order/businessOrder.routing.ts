import { Routes, RouterModule } from "@angular/router";
import { BussinessOrderComponent } from "./bussinessOrder.component";

const routes: Routes = [
  {
    path: "",
    component: BussinessOrderComponent,
  },
];

export const routing = RouterModule.forChild(routes);