import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GeneralFeedbackResolver } from '@app/utils/resolvers/general-feedback.resolver';
import { FeedbackComponent } from './feedback/feedback.component';
import { SuccessComponent } from './success/success.component';

const routes: Routes = [
    {
        path: 'item/:itemid',
        component: FeedbackComponent,
        runGuardsAndResolvers: 'always',
        resolve: {
            feedback: GeneralFeedbackResolver
        }
    },
    {
        path: 'status/:status',
        component: SuccessComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GeneralFeedbackRoutingModule { }
