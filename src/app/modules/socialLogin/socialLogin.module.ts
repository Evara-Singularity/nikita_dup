import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialLoginComponent } from "./socialLogin.component";
import { SocialLoginService } from "./socialLogin.service";
import { Angular2SocialLoginModule } from 'angular2-social-login';
import CONSTANTS from '../../config/constants';

@NgModule({
    imports: [CommonModule, Angular2SocialLoginModule],
    declarations: [
        SocialLoginComponent
    ],
    exports: [
        SocialLoginComponent
    ],
    providers: [
        SocialLoginService,
    ]
})
export class SocialLoginModule {

}

Angular2SocialLoginModule.loadProvidersScripts(CONSTANTS.SOCIAL_LOGIN);

