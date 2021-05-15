import { CommonModule } from '@angular/common';
import { IndustryStoreComponent } from './industryStore.component';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

const routes = [{ path: '', component: IndustryStoreComponent }];

@NgModule({
	declarations: [IndustryStoreComponent],
	imports: [RouterModule.forChild(routes), CommonModule],
	providers: [],
})
export class IndustryStoreModule {}
