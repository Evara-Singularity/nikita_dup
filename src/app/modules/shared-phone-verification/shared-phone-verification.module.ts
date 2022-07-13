import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ComponentFactory, ComponentFactoryResolver, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedPhoneVerificationComponent } from './shared-phone-verification.component';
import { BottomMenuModule } from '../bottomMenu/bottom-menu.module';

@NgModule({
  declarations: [SharedPhoneVerificationComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BottomMenuModule
  ]
})
export class SharedPhoneVerificationModule
{
  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }
  public resolveComponent(): ComponentFactory<SharedPhoneVerificationComponent>
  {
    return this.componentFactoryResolver.resolveComponentFactory(SharedPhoneVerificationComponent);
  }
}
