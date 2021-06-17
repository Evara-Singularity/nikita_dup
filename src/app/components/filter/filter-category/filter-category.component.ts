import { EventEmitter, Component, Input, Output } from '@angular/core';

@Component({
    selector: 'filter-category-list',
    templateUrl: './filter-category.component.html',
    styleUrls: ['./filter-category.component.scss']
})
export class FilterCategoryComponent {
    @Input('categoryFilterData') categoryFilterData: any;

    @Output() selectedCategoryLink: EventEmitter<any> = new EventEmitter();

    constructor() {
    }

    ngOnInit(){
    }

    emitCategoryClickEvent(item) {
        this.selectedCategoryLink.emit(item);
    }
}