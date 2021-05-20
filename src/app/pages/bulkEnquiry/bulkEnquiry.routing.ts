import {Routes, RouterModule} from '@angular/router';
import {BulkEnquiryComponent} from "./bulkEnquiry.component";
import { CreateEnquiryComponent } from '../../components/createEnquiry/createEnquiry.component';


const routes: Routes = [
    {
        path: '',
        component: BulkEnquiryComponent,children:[
            {
                path:'',component:CreateEnquiryComponent
            }
        ]
    }
];

export const routing = RouterModule.forChild(routes);
