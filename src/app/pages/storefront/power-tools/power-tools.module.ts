import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { routing } from './power-tools.routing';
import { PowerToolsComponent } from './power-tools.component';

@NgModule({
	imports: [CommonModule, routing, RouterModule],
	declarations: [PowerToolsComponent],
})
export class PowerToolsModule {}
