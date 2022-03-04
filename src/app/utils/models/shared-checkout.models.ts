export interface AddressListModel
{
    deliveryAddressList: any[],
    billingAddressList: any[]
}

export interface AddressListActionModel
{
    action: string,
    idAddress: number
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

export interface DeliveryAddressModel
{
    idAddress: any;
    addressCustomerName: any;
    phone: any
    alternatePhone: any;
    postCode: any;
    landmark: any;
    addressLi: any;
    city: any
    idCountry: any;
    idState: any
    email: any;
    phoneVerified: any;
}



