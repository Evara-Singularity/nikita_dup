import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { routing } from './view.routing';
import { ViewComponent } from './view.component';
import { ViewService } from '../view/view.service';
import { LazyLoadImageModule } from 'ng-lazyload-image';

@NgModule({
	imports: [CommonModule, routing, RouterModule, LazyLoadImageModule],
	declarations: [ViewComponent],
	providers: [ViewService],
})
export class ViewModule {}
