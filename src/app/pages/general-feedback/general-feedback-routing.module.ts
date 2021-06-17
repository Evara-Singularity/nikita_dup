import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GeneralFeedbackResolver } from '@app/utils/resolvers/general-feedback.resolver';
import { GeneralFeedbackComponent } from './general-feedback.component';

const routes: Routes = [
    {
        path: '',
        component: GeneralFeedbackComponent,
        runGuardsAndResolvers: 'always',
        resolve: {
            feedback: GeneralFeedbackResolver
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GeneralFeedbackRoutingModule { }
