import { LibertyService } from './liberty.service';
import { RouterModule } from '@angular/router';
import { LibertyComponent } from './liberty.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './liberty.routing';
import { SiemaCarouselModule } from '@app/modules/siemaCarousel/siemaCarousel.module';
@NgModule({
	declarations: [LibertyComponent],
	imports: [CommonModule, routing, RouterModule, SiemaCarouselModule],
	exports: [LibertyComponent],
	providers: [LibertyService],
})
export class LibertyModule {}
