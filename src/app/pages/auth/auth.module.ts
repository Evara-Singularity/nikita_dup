import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthComponent } from './auth.component';
import { SharedAuthModule } from '@app/modules/shared-auth-v1/shared-auth.module';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        component: AuthComponent,
    }
];

@NgModule({
    declarations: [AuthComponent],
    imports: [
        CommonModule,
        SharedAuthModule,
        RouterModule,
        RouterModule.forChild(routes),
    ]
})
export class AuthModule { 

    
}
