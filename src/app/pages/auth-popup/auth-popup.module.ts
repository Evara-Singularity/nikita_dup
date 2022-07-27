import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthPopUpComponent } from './auth-popup.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedAuthModule } from '@app/modules/shared-auth-v1/shared-auth.module';
import { BottomMenuModule } from '@app/modules/bottomMenu/bottom-menu.module';

const routes: Routes = [
    {
        path: '',
        component: AuthPopUpComponent,
    }
];

@NgModule({
    declarations: [AuthPopUpComponent],
    imports: [
        CommonModule,
        SharedAuthModule,
        RouterModule,
        RouterModule.forChild(routes),
        BottomMenuModule
    ],
    exports:[
        AuthPopUpComponent
    ]
})
export class AuthPopUpModule { 

    
}
