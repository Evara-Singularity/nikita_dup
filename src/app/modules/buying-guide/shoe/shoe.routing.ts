import { Routes, RouterModule } from "@angular/router";
import { SafetyShoeComponent } from "./shoe.component";

const routes: Routes = [
  {
    path: "",
    component: SafetyShoeComponent,
  },
];

export const routing = RouterModule.forChild(routes);