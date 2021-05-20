import { Routes, RouterModule } from '@angular/router';
import { TableComponent } from "./table.component";

const routes: Routes = [
    {
        path: '',
        component: TableComponent
    }
];

export const routing = RouterModule.forChild(routes);