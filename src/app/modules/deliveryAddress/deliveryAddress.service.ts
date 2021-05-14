import {Injectable} from "@angular/core";
import { Observable, Subject } from 'rxjs';
import CONSTANTS from "src/app/config/constants";
import { DataService } from "../../utils/services/data.service";

@Injectable()
export class DeliveryAddressService{

    private addNewAddressFormSubject = new Subject<any>();
    private editBillingAddressFormSubject = new Subject<any>();

    constructor(private _dataService: DataService){
    }

    getBusinessDetail(id) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/businessdetails/getbyid?id="+id;
        return this._dataService.callRestful("GET", url);
    }

    openNewAddressForm(data){
        this.addNewAddressFormSubject.next(data);
    }

    addNewAddressAction(): Observable<any>{
       return this.addNewAddressFormSubject.asObservable();
    }

    openEditBillingAddressForm(data)    {
        this.editBillingAddressFormSubject.next(data);
    }

    editBillingAddressAction(): Observable<any>    {
        return this.editBillingAddressFormSubject.asObservable();
    }

    postAddress(address) {
        return this._dataService.callRestful("POST", CONSTANTS.NEW_MOGLIX_API + "/address/postAddress", { body: address });
    }


}