import { Routes, RouterModule } from "@angular/router";
import { BusinessDashboardComponent } from "./dashboard.component";

const routes: Routes = [
  {
    path: "",
    component: BusinessDashboardComponent,
  },
];

export const routing = RouterModule.forChild(routes);