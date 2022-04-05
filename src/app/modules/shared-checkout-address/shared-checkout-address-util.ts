import { addressList } from './../deliveryAddress/deliveryAddress';
export class SharedCheckoutAddressUtil
{
    static filterAddressesById(addresses: any[], idAddress)
    {
        const MATCHED_INDEX = addresses.findIndex(address => address['idAddress'] === idAddress);
        return MATCHED_INDEX > -1 ? addresses[MATCHED_INDEX] : null
    }

    static getStateId(stateList: any[], stateId)
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

    static getSuccessCount(responses: any[])
    {
        const FILTERED = responses.filter((response) =>
        {
            console.log(response)
            return response['status'] || response['statusCode'] === 200
        });
        return FILTERED.length
    }

    static getFormattedAddressLine(addressLineKeys: any[], billingAddress)
    {
        let temp = '';
        addressLineKeys.forEach((name) =>
        {
            let key = (billingAddress[name] as string).trim();
            if (key && key.length > 0) {
                temp = temp + key + ', ';
            }
        });
        return temp.substring(0, temp.lastIndexOf(','));
    }

    static getVerifiedPhones(userSession, addressList: any[]): any[]
    {
        let verifiedPhones = [];
        if (userSession && userSession['phoneVerified']) {
            verifiedPhones.push(userSession['phone']);
        }
        if (addressList.length) {
            const filtered = addressList.filter((address) => { return address.phoneVerified });
            const phones = filtered.map((address) => address.phone);
            verifiedPhones = [...verifiedPhones, ...phones];
        }
        return verifiedPhones;
    }

    static getCountry(countryList, address)
    {
        if (address && address['country'] && address['country']['idCountry']) {
            return parseInt(address['country']['idCountry']);
        } else {
            return countryList[0]['idCountry'];
        }
    }

    static getState(stateList, address)
    {
        if (address && address['state'] && address['state']['idState']) {
            return parseInt(address['state']['idState']);
        } else {
            return stateList[0]['idState'];
        }
    }

    static verifyCheckoutAddress(addressList: any[], checkoutAddress)
    {
        const length = addressList.length-1;
        if (checkoutAddress)
        {
            const index = addressList.findIndex((address) => { address.idAddress === checkoutAddress.idAddress });
            if (index > -1) { return checkoutAddress; }
            return addressList[length];
        }
        return addressList[length];
    }
}