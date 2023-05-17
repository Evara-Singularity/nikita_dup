import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
    selector: "product-v1",
    templateUrl: "./product-v1.component.html",
    styleUrls: ["./product-v1.component.scss"],
})
export class ProductV1Component implements OnInit, OnDestroy {
    productNotFound:boolean;
    constructor(
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        console.log('I am new')
        this.route.data.subscribe((rawData) => {
            console.log(rawData);
        })
    }
    ngOnDestroy() {}
}