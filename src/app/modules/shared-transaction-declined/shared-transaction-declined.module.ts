import { CommonModule } from '@angular/common';
import { ComponentFactory, ComponentFactoryResolver, NgModule } from '@angular/core';
import { BottomMenuModule } from '@app/modules/bottomMenu/bottom-menu.module';
import { SharedTransactionDeclinedComponent } from './shared-transaction-declined.component';
@NgModule({
	declarations: [SharedTransactionDeclinedComponent],
	imports: [
		CommonModule,
		BottomMenuModule
	],
	exports: [SharedTransactionDeclinedComponent]
})
export class SharedTransactionDeclinedModule
{
	constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

	public resolveComponent(): ComponentFactory<SharedTransactionDeclinedComponent>
	{
		return this.componentFactoryResolver.resolveComponentFactory(SharedTransactionDeclinedComponent);
	}
}
