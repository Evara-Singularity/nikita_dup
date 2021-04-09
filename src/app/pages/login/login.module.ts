import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedAuthModule } from '../../modules/shared-auth/shared-auth.module';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';

@NgModule({
    declarations: [LoginComponent],
    imports: [
        CommonModule,
        LoginRoutingModule,
        SharedAuthModule
    ],
    providers: []
})
export class LoginModule { }
