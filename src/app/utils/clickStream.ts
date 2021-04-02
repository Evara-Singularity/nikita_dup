import CONSTANTS from "../config/constants";

declare var ActiveXObject: (type: string) => void;

export var trackData = function (postData) {
    var trackData = {
        event: "",
        customerData: {},
        pageData: {
            pageType: "",
            data: postData
        }
    }

    if (navigator && navigator.userAgent.indexOf("Googlebot") === -1) {
        var path = location.pathname.split("/");
        if (location.pathname == "/") { //homepage
            xhrSend("home");
        } else if (path[path.length - 1].indexOf("msn") != -1) { //product page
            xhrSend("product");
        } else if (/^[0-9]*$/.test(path[path.length - 1])) { //category page
            xhrSend("category");
        }
    } else {
        trackData = null;
    }

    var xmlhttp;

    function xhrSend(pageType) {
        if ((<any>window).XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();
        } else {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        var basePath = CONSTANTS.NEW_MOGLIX_API;
        xmlhttp.open('POST', basePath + "/clickStream/setStreamData", true);
        xmlhttp.setRequestHeader('Content-Type', 'application/json');
        xmlhttp.onload = function () {
        };
        trackData.pageData.pageType = pageType;
        postData.url_link = location.href;

        xmlhttp.send(JSON.stringify(postData));
    }
}
