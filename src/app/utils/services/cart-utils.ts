import CONSTANTS from "@app/config/constants";
import { ValidateDto } from "../models/cart.initial";

export const PaymentMode =
{
    "CC": { paymentBlock: CONSTANTS.GLOBAL.creditDebitCard, mode: "creditDebitCard", section: "creditDebitCardSection" },
    "DC": { paymentBlock: CONSTANTS.GLOBAL.creditDebitCard, mode: "creditDebitCard", section: "creditDebitCardSection" },
    "NB": { paymentBlock: CONSTANTS.GLOBAL.netBanking, mode: "netBanking", section: "netBankingSection" },
    "WALLET": { paymentBlock: CONSTANTS.GLOBAL.wallet, mode: "wallet", section: "walletSection" },
    "EMI": { paymentBlock: CONSTANTS.GLOBAL.emi, mode: "emi", section: "emiSection" },
    "COD": { paymentBlock: CONSTANTS.GLOBAL.cashOnDelivery, mode: "cashOnDelivery", section: "cashOnDeliverySection" },
    "NEFT": { paymentBlock: CONSTANTS.GLOBAL.neftRtgs, mode: "netBanking", section: "netBankingSection" },
    "card_mode": { paymentBlock: CONSTANTS.GLOBAL.savedCard, mode: "", section: "" },
    "TEZ": { paymentBlock: CONSTANTS.GLOBAL.upi, mode: "upi", section: "upiSection" },
    "UPI": { paymentBlock: CONSTANTS.GLOBAL.upi, mode: "upi", section: "upiSection" },
}

export class CartUtils
{
    //dont ever write constructor in this to inject any service.
    //this should plane function which takes input returns desired formatted value.
    static walletTaxRetail = [];
    static oKeys = Object.keys;

    static verifyMatchingWallet(mode)
    {
        if (CartUtils.walletTaxRetail.length) {
            return CartUtils.walletTaxRetail.includes(mode);
        }
        const wTax = CONSTANTS.GLOBAL.walletMap.tax;
        const wRetail = CONSTANTS.GLOBAL.walletMap.retail;
        const wTaxKeys = CartUtils.oKeys(wTax);
        const wRetailKeys = CartUtils.oKeys(wRetail);
        wTaxKeys.forEach((key) => { CartUtils.walletTaxRetail.push(wTax[key]['type']); });
        wRetailKeys.forEach((key) => { CartUtils.walletTaxRetail.push(wRetail[key]['type']); });
        return CartUtils.walletTaxRetail.includes(mode);;
    }

    static generateGenericCartSession(cartSessionFromAPI)
    {
        const modifiedCartSessionObject = {
            cart: Object.assign({}, cartSessionFromAPI['cart']),
            itemsList: (cartSessionFromAPI["itemsList"] ? [...cartSessionFromAPI["itemsList"]] : []),
            addressList: (cartSessionFromAPI["addressList"] ? [...cartSessionFromAPI["addressList"]] : []),
            payment: cartSessionFromAPI["payment"],
            offersList: cartSessionFromAPI["offersList"],
            extraOffer: cartSessionFromAPI["extraOffer"]
        }
        let totalAmount: number = 0;
        let tawot: number = 0; // totalAmountWithOutTax
        let tpt: number = 0; //totalPayableTax
        let itemsList = modifiedCartSessionObject.itemsList ? modifiedCartSessionObject.itemsList : [];
        for (let item of itemsList) {
            if (item["bulkPrice"] == null) {
                item["totalPayableAmount"] = CartUtils.getTwoDecimalValue(item["productUnitPrice"] * item["productQuantity"]);
                item['tpawot'] = CartUtils.getTwoDecimalValue(item['priceWithoutTax'] * item['productQuantity']);
                item['tax'] = CartUtils.getTwoDecimalValue(item["totalPayableAmount"] - item["tpawot"]);
            }
            else {
                item["totalPayableAmount"] = (item["bulkPrice"]) ? CartUtils.getTwoDecimalValue(item["bulkPrice"] * item["productQuantity"]) : 0;
                item['tpawot'] = (item['bulkPriceWithoutTax']) ? CartUtils.getTwoDecimalValue(item['bulkPriceWithoutTax'] * item['productQuantity']) : 0;
                item['tax'] = CartUtils.getTwoDecimalValue(item["totalPayableAmount"] - item["tpawot"]);
            }
            totalAmount = CartUtils.getTwoDecimalValue(totalAmount + item.totalPayableAmount);
            tawot = CartUtils.getTwoDecimalValue(tawot + item.tpawot);
            tpt = tpt + item['tax'];
        };
        modifiedCartSessionObject.cart.totalAmount = totalAmount;
        modifiedCartSessionObject.cart.totalPayableAmount = (totalAmount + modifiedCartSessionObject.cart['shippingCharges']) - (modifiedCartSessionObject.cart['totalOffer'] || 0);
        modifiedCartSessionObject.cart.tawot = tawot;
        modifiedCartSessionObject.cart.tpt = tpt;
        modifiedCartSessionObject.itemsList = itemsList;
        return modifiedCartSessionObject;
    }

    static getShippingObj(cartSessions)
    {
        let sro = { itemsList: [], totalPayableAmount: 0 };
        if (cartSessions && cartSessions['itemsList'] && cartSessions['itemsList'].length > 0) {
            let itemsList: Array<{}> = cartSessions['itemsList'];
            itemsList.map((item) =>
            {
                sro.itemsList.push({ "productId": item["productId"], "categoryId": item["categoryCode"], "taxonomy": item["taxonomyCode"] });
            });
        }
        if (cartSessions && cartSessions['cart']) {
            sro['totalPayableAmount'] = cartSessions['cart']['totalPayableAmount'];
        }
        return sro;
    }

    static getValidateDto(validateDto: ValidateDto)
    {
        const cartSession = validateDto.cartSession;
        const shippingAddress = validateDto.shippingAddress;
        const billingAddress = validateDto.billingAddress;
        const invoiceType = validateDto.invoiceType;
        const isBuyNow = validateDto.isBuyNow;
        let cart = cartSession.cart;
        let returnValue = {
            "shoppingCartDto": {
                "cart":
                {
                    "cartId": cart["cartId"],
                    "sessionId": cart["sessionId"],
                    "userId": cart["userId"],
                    "agentId": cart["agentId"] ? cart["agentId"] : null,
                    "isPersistant": true,
                    "createdAt": null,
                    "updatedAt": null,
                    "closedAt": null,
                    "orderId": null,
                    "totalAmount": cart["totalAmount"] == null ? 0 : cart["totalAmount"],
                    "totalOffer": cart["totalOffer"] == null ? 0 : cart["totalOffer"],
                    "totalAmountWithOffer": cart["totalAmountWithOffer"] == null ? 0 : cart["totalAmountWithOffer"],
                    "taxes": cart["taxes"] == null ? 0 : cart["taxes"],
                    "totalAmountWithTaxes": cart["totalAmountWithTax"],
                    "shippingCharges": cart["shippingCharges"] == null ? 0 : cart["shippingCharges"],
                    "currency": cart["currency"] == null ? "INR" : cart["currency"],
                    "isGift": cart["gift"] == null ? false : cart["gift"],
                    "giftMessage": cart["giftMessage"],
                    "giftPackingCharges": cart["giftPackingCharges"] == null ? 0 : cart["giftPackingCharges"],
                    "totalPayableAmount": cart["totalAmount"] == null ? 0 : cart["totalAmount"]
                },
                "itemsList": cartSession.itemsList,
                "addressList": [
                    {
                        "addressId": shippingAddress.idAddress,
                        "type": "shipping",
                        "invoiceType": invoiceType
                    }
                ],
                "payment": null,
                "deliveryMethod": { "deliveryMethodId": 77, "type": "kjhlh" },
                "offersList": (cartSession.offersList != undefined && cartSession.offersList.length > 0) ? cartSession.offersList : null
            }
        };
        if (isBuyNow) { returnValue['shoppingCartDto']['cart']['buyNow'] = true; }
        if (billingAddress) {
            returnValue.shoppingCartDto.addressList.push({
                "addressId": billingAddress.idAddress,
                "type": "billing",
                "invoiceType": invoiceType

            })
        }
        return returnValue
    }

    static getPayableRequest(cartSession, billingAddress, userId, invoiceType, extra, parentOrderId?)
    {
        const cart = cartSession["cart"];
        const cartItems = cartSession["itemsList"];
        const offersList = Object.assign([], cartSession["offersList"]);;
        if (offersList != undefined && offersList.length > 0) {
            for (let key in offersList) {
                delete offersList[key]["createdAt"];
                delete offersList[key]["updatedAt"];
            }
        }
        let returnValue = {
            shoppingCartDto: {
                cart: {
                    cartId: cart["cartId"],
                    sessionId: cart["sessionId"],
                    userId: userId,
                    agentId: cart["agentId"] ? cart["agentId"] : null,
                    isPersistant: true,
                    createdAt: null,
                    updatedAt: null,
                    closedAt: null,
                    orderId: null,
                    totalAmount: cart["totalAmount"] == null ? 0 : cart["totalAmount"],
                    totalOffer: cart["totalOffer"] == null ? 0 : cart["totalOffer"],
                    totalAmountWithOffer: cart["totalAmountWithOffer"] == null ? 0 : cart["totalAmountWithOffer"],
                    taxes: cart["taxes"] == null ? 0 : cart["taxes"],
                    totalAmountWithTaxes: cart["totalAmountWithTax"],
                    shippingCharges: cart["shippingCharges"] == null ? 0 : cart["shippingCharges"],
                    currency: cart["currency"] == null ? "INR" : cart["currency"],
                    isGift: cart["gift"] == null ? false : cart["gift"],
                    giftMessage: cart["giftMessage"],
                    giftPackingCharges: cart["giftPackingCharges"] == null ? 0 : cart["giftPackingCharges"],
                    totalPayableAmount: cart["totalAmount"] == null ? 0 : cart["totalAmount"],
                    noCostEmiDiscount: extra.noCostEmiDiscount == 0 ? 0 : extra.noCostEmiDiscount,
                },
                itemsList: CartUtils.getItemsList(cartItems),
                addressList: [{
                    addressId: extra.addressList.idAddress,
                    type: "shipping",
                    invoiceType: invoiceType,
                }],
                payment: {
                    paymentMethodId: extra.paymentId,
                    type: extra.mode,
                    bankName: extra.bankname,
                    bankEmi: extra.bankcode,
                    emiFlag: extra.emitenure,
                    gateway: extra.gateway,
                },
                deliveryMethod: {
                    deliveryMethodId: 77,
                    type: "kjhlh",
                },
                offersList: offersList != undefined && offersList.length > 0 ? offersList : null,
                extraOffer: cartSession["extraOffer"] ? cartSession["extraOffer"] : null,
                device: CONSTANTS.DEVICE.device,
            },
        };
        if (cart["buyNow"]) {
            returnValue["shoppingCartDto"]["cart"]["buyNow"] = cart["buyNow"];
        }
        if (billingAddress !== undefined && billingAddress !== null) {
            returnValue.shoppingCartDto.addressList.push({
                addressId: billingAddress['idAddress'],
                type: "billing",
                invoiceType: invoiceType,
            });
        }
        if (parentOrderId) {
            cart["parentOrderId"] = parentOrderId;
        }
        return returnValue;
    }

    static getItemsList(cartItems)
    {
        let itemsList = [];
        if (cartItems != undefined && cartItems != null && cartItems.length > 0) {
            for (let i = 0; i < cartItems.length; i++) {
                let item = {
                    productId: cartItems[i]["productId"],
                    productName: cartItems[i]["productName"],
                    brandName: cartItems[i]["brandName"],
                    productImg: cartItems[i]["productImg"],
                    amount: cartItems[i]["amount"],
                    offer: cartItems[i]["offer"],
                    amountWithOffer: cartItems[i]["amountWithOffer"],
                    taxes: cartItems[i]["taxes"],
                    amountWithTaxes: cartItems[i]["amountWithTaxes"],
                    totalPayableAmount: cartItems[i]["totalPayableAmount"],
                    isPersistant: true,
                    productQuantity: cartItems[i]["productQuantity"],
                    productUnitPrice: cartItems[i]["productUnitPrice"],
                    expireAt: cartItems[i]["expireAt"],
                    bulkPriceMap: cartItems[i]["bulkPriceMap"],
                    bulkPrice: cartItems[i]["bulkPrice"],
                    priceWithoutTax: cartItems[i]["priceWithoutTax"],
                    bulkPriceWithoutTax: cartItems[i]["bulkPriceWithoutTax"],
                    taxPercentage: cartItems[i]["taxPercentage"],
                    categoryCode: cartItems[i]["categoryCode"],
                    taxonomyCode: cartItems[i]["taxonomyCode"],
                };
                if (cartItems[i]["buyNow"]) {
                    item["buyNow"] = true;
                }
                itemsList.push(item);
            }
        }
        return itemsList;
    }

    static getPaymentInfo(mode)
    {
        if (PaymentMode[mode]) {
            return PaymentMode[mode];
        }
        if (CartUtils.verifyMatchingWallet(mode)) {
            return PaymentMode["WALLET"];
        }
        return null;
    }

    static getTwoDecimalValue(a) { return Math.floor(a * 100) / 100; }
}