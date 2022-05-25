import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AboutComponent } from "./about.component";
import { AboutResolver } from '@app/utils/resolvers/about.resolver';


const routes: Routes = [
    {
        path: '',
        component: AboutComponent,
        resolve: {
            aboutData: AboutResolver
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AboutRoutingModule { }
