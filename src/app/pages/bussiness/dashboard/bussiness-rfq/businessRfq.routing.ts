import { Routes, RouterModule } from "@angular/router";
import { BussinessRfqComponent } from "./bussinessRfq.component";

const routes: Routes = [
  {
    path: "",
    component: BussinessRfqComponent,
  },
];

export const routing = RouterModule.forChild(routes);
