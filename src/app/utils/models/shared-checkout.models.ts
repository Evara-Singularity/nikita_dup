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
    action: string,
    address: any,
}

export interface StateListModel
{
    idState: number,
    idCountry: number,
    name: string
}

export interface CountryLisModel
{
    idCountry: number, 
    name: string
}



