import { Routes, RouterModule } from "@angular/router";
import { BussinessServerComponent } from "./bussinessServer.component";

const routes: Routes = [
  {
    path: "",
    component: BussinessServerComponent,
  },
];

export const routing = RouterModule.forChild(routes);
