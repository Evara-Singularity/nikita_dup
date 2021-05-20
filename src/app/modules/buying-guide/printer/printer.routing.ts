import { Routes, RouterModule } from '@angular/router';
import { PrinterComponent } from "./printer.component";

const routes: Routes = [
    {
        path: '',
        component: PrinterComponent
    }
];

export const routing = RouterModule.forChild(routes);