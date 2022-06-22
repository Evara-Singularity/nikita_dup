import { LocalStorageService } from 'ngx-webstorage';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Inject, Input, NgModule, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '@app/utils/services/common.service';
import { DOCUMENT } from "@angular/common";
@Component({
	selector: 'product-get-quote',
	templateUrl: './product-get-quote.component.html',
	styleUrls: ['./product-get-quote.component.scss']
})
export class ProductGetQuoteComponent implements OnInit, AfterViewInit
{

	@Input() productMrp: any;
	@Input() productOutOfStock: any;
	@Input() productCategoryDetails: any;
	@Input() productName: any;
	@Input() productAllImages: any;
	@Input() rfqQuoteRaised: boolean;
	@Output() raiseRFQQuote$: EventEmitter<any> = new EventEmitter<any>();
	initialMouse;
	slideMovementTotal;
	mouseIsDown;
	sliderBackground: HTMLDivElement = null;
	animateSlider: HTMLDivElement = null;

	constructor(public commonService: CommonService, @Inject(DOCUMENT) private _document,
		private _localAuthService: LocalAuthService, public _localStorageService:LocalStorageService) { }

	ngOnInit(): void
	{
	}

	ngAfterViewInit()
	{
		if (this.commonService.isBrowser) {
			this.sliderBackground = this._document.getElementById('slider-background');
			this.animateSlider = this._document.getElementById('animate-slider');
			if (this.sliderBackground && this.animateSlider) { this.attachSwipeEvents();}
		}
	}

	raiseRFQQuote()
	{
		this.raiseRFQQuote$.emit();
	}

	attachSwipeEvents()
	{
		console.log("Testing")
		this.initialMouse = 0;
		this.slideMovementTotal = 0;
		this.mouseIsDown = false;
		// Custom events on slider
		this.animateSlider.addEventListener('mouseup', (e) => this.mouseUpTouched(e), false);
		this.animateSlider.addEventListener('touchend', (e) => this.mouseUpTouched(e), false);
		// Custom events on Body
		this._document.body.addEventListener('mousemove', (e) => this.mouseMoveTouchMoveEvent(e), false);
		this._document.body.addEventListener('touchmove', (e) => this.mouseMoveTouchMoveEvent(e), false);
	}

	sliderAnimation()
	{
		let id = null;
		let pos = 0;
		clearInterval(id);
		id = setInterval(() =>
		{
			if (pos == 100) {
				clearInterval(id);
			} else {
				pos++;
				this.animateSlider.style.left = 0 + 'px';
			}
		}, 5);
	}

	mouseUpTouched(event)
	{
		if (!this.mouseIsDown) {
			return;
		}
		this.mouseIsDown = false;
		let currentMouse = event.clientX || event.changedTouches[0].pageX;
		let relativeMouse = currentMouse - this.initialMouse;
		console.log('currentMouse -> ' + currentMouse);
		console.log('relativeMouse -> ' + relativeMouse);

		if (relativeMouse < this.slideMovementTotal) {
			// $('.slide-text').fadeTo(300, 1);
			this.sliderAnimation();
			return;
		}
		this.animateSlider.classList.add('unlocked');
		this.raiseRFQQuote();
	}

	toggleSliderClasses(event)
	{
		if (!this.animateSlider.classList.contains('unlocked')) {
			return;
		}
		this.animateSlider.classList.remove('unlocked');
		this.animateSlider.removeEventListener('click', this.toggleSliderClasses);
		this.animateSlider.removeEventListener('tap', this.toggleSliderClasses);
	}

	mouseMoveTouchMoveEvent(event)
	{
		if (!this.mouseIsDown) {
			return;
		}

		let currentMouse = event.clientX || (event.originalEvent ? event.originalEvent.touches[0].pageX : 0);
		let relativeMouse = currentMouse - this.initialMouse;
		let slidePercent = 1 - (relativeMouse / this.slideMovementTotal);
		// $('.slide-text').fadeTo(0, slidePercent);

		if (relativeMouse <= 0) {
			this.animateSlider.style.left = '0px';
			return;
		}
		if (relativeMouse >= this.slideMovementTotal + 10) {
			this.animateSlider.style.left = this.slideMovementTotal + 'px';
			return;
		}
		this.animateSlider.style.left = relativeMouse - 10 + 'px';
	}

	sliderMouseDownEvent(event)
	{
		if (this.sliderBackground && this.animateSlider) {
			this.mouseIsDown = true;
			this.slideMovementTotal = (this.sliderBackground.offsetWidth) - (this.animateSlider.offsetWidth);
			this.initialMouse = event.clientX || (event.originalEvent ? (event.originalEvent.touches[0].pageX) : 0);
		}
	}
}


@NgModule({
	declarations: [
		ProductGetQuoteComponent
	],
	imports: [
		CommonModule
	],
	exports: [
		ProductGetQuoteComponent
	]
})
export class ProductGetQuoteModule { }

