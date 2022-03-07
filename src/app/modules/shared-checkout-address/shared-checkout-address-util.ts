export class SharedCheckoutAddressUtil
{
    static filterAddressesById(addresses:any[], idAddress)
    {
        const MATCHED_INDEX = addresses.findIndex(address => address['idAddress'] === idAddress);
        return MATCHED_INDEX >-1 ? addresses[MATCHED_INDEX]:null
    }

    static getStateId(stateList:any[], stateId)
    {
        let idState = -1;
        stateList.forEach(element =>
        {
            if (element.idState === parseInt(stateId)) {
                idState = element.idState
            }
        });
        return idState;
    }
}