import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
	selector: 'custom-return',
	templateUrl: './custom-return.component.html',
	styleUrls: ['faq.scss'],
})
export class CustomReturnComponent implements OnInit {
	constructor(private title: Title) {
		this.title.setTitle('Custom return-Moglix.com');
	}

	ngOnInit() {}
}
