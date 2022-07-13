import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { routing } from './view.routing';
import { ViewComponent } from './view.component';
import { ViewService } from '../view/view.service';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import CategoryCardModule from '@app/components/category-card/category-card.component';

@NgModule({
	imports: [CommonModule, routing, RouterModule, LazyLoadImageModule, CategoryCardModule],
	declarations: [ViewComponent],
	providers: [ViewService],
})
export class ViewModule {}
