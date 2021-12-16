import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UTRConfirmationComponent } from './utr-confirmation.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        component: UTRConfirmationComponent,
    }
];


@NgModule({
    declarations: [UTRConfirmationComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule
    ]
})
export class UTRConfirmationModule { }
