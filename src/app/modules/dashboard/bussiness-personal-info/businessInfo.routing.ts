import { Routes, RouterModule } from "@angular/router";
import { BussinessInfoComponent } from "./bussinessPersonalInfo.component";

const routes: Routes = [
  {
    path: "",
    component: BussinessInfoComponent,
  },
];

export const routing = RouterModule.forChild(routes);
