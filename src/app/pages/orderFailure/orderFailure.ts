import { Routes, RouterModule } from "@angular/router";
import { OrderFailureComponent } from "./orderFailure.component";

const routes: Routes = [
  {
    path: "",
    component: OrderFailureComponent,
  },
];

export const routing = RouterModule.forChild(routes);
