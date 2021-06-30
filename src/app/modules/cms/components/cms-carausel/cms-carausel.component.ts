import { Component, Input, SimpleChange } from "@angular/core";
import { Router } from '@angular/router';

@Component({
    selector: 'cms-carausel',
    templateUrl: './cms-carausel.component.html',
    styleUrls: ['./cms-carausel.component.scss']
})
export class CmsCarauselComponent {
 
    constructor(private router: Router){
    }

    naivgateTo(link){
        this.router.navigate([link]);
    }
}