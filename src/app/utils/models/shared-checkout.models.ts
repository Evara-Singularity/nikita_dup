export interface AddressListModel
{
    deliveryAddressList: any[],
    billingAddressList: any[]
}
export interface AddressListActionModel
{
    action: string,
    address: any
}

export interface CreateEditAddressModel
{
    aType:string
    action: string,
    address: any,
}

export interface StateListModel
{
    idState: number,
    idCountry: number,
    name: string
}

export interface CountryListModel
{
    idCountry: number,
    name: string
}

export interface SelectedAddressModel
{
    invoiceType:string;
    deliveryAddress:any;
    billingAddress:any;
}

export interface CheckoutHeaderModel
{
    label:string;
    status:boolean;
}

