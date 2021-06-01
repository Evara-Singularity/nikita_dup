import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialLoginComponent } from "./socialLogin.component";
import { SocialLoginService } from "./socialLogin.service";
import CONSTANTS from '../../config/constants';
import { SocialLoginModule as Angular2SocialLoginModule, SocialAuthServiceConfig, GoogleLoginProvider, FacebookLoginProvider } from 'angularx-social-login';

@NgModule({
    imports: [CommonModule, Angular2SocialLoginModule],
    declarations: [
        SocialLoginComponent
    ],
    exports: [
        SocialLoginComponent
    ],
    providers: [
        {
            provide: 'SocialAuthServiceConfig',
            useValue: {
                autoLogin: false,
                providers: [
                    {
                        id: GoogleLoginProvider.PROVIDER_ID,
                        provider: new GoogleLoginProvider(
                            CONSTANTS.SOCIAL_LOGIN.google.clientId
                        )
                    },
                    {
                        id: FacebookLoginProvider.PROVIDER_ID,
                        provider: new FacebookLoginProvider(CONSTANTS.SOCIAL_LOGIN.facebook.clientId)
                    }
                ]
            } as SocialAuthServiceConfig,
        },
        SocialLoginService,
    ]
})
export class SocialLoginModule {

}
