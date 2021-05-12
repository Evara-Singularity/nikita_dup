import { Routes, RouterModule } from "@angular/router";
import { BussinessPasswordComponent } from "./bussinessPassword.component";

const routes: Routes = [
  {
    path: "",
    component: BussinessPasswordComponent,
  },
];

export const routing = RouterModule.forChild(routes);
