// Version: 1.1.0
// Update Time: 21/11/2019 1:00PM


(function (window) {
    // 'use strict';
    function webViewBridge() {
        var _webViewBridge = {};

        _webViewBridge.platform = function () {
            var userAgent = window.navigator.userAgent.toLowerCase();
            var isIos = /iphone|ipod|ipad/.test(userAgent);
            var isAndroid = userAgent.indexOf("android") > -1;

            return isIos ? "iOS" : isAndroid ? "Android" : "None";
        }();

        _webViewBridge.redirectToCardToBkash = function(actionUrl) {
            window.cardTobKashUrl = actionUrl;
            _webViewBridge.getAuthToken();
        }

        _webViewBridge.getAuthToken = function () {
            try {
                tokenChannel.postMessage('');
            } catch (err) {
                console.log("Fetch access token error occured");
            }

            if (_webViewBridge.platform === "iOS") {
                getAccessTokenForiOS()
            } else if (_webViewBridge.platform === "Android") {
                this.accessToken = getAccessTokenForAndroid();
                this.setAccessToken(this.accessToken);
            }
        };

        _webViewBridge.setAccessToken = function (token) {
            _webViewBridge.onAccessTokenChange(token);
        };

        _webViewBridge.onAccessTokenChange = function(accessToken){
            if (accessToken) {
                window.location.href = window.cardTobKashUrl + accessToken;
            }
        }

        _webViewBridge.goBackHome = function (featureName) {
            try {
                backToHomeChannel.postMessage('');
            } catch (err) {
                console.log("Go Back home error for next app");
            }
            if (_webViewBridge.platform === "iOS") {
                goBackHomeForIOS(featureName)
            } else if (_webViewBridge.platform === "Android") {
                goBackHomeForAndroid(featureName)
            }
        };

        _webViewBridge.disableBackButton = function (featureName) {
            if (_webViewBridge.platform === "iOS") {
                disableBackButtonForIOS(featureName)
            } else if (_webViewBridge.platform === "Android") {
                disableBackButtonForAndroid(featureName)
            }
        };

        _webViewBridge.keepSessionAlive = function (featureName) {
            if (_webViewBridge.platform === "iOS") {
                keepSessionAliveForIOS();
            } else if (_webViewBridge.platform === "Android") {
                keepSessionAliveForAndroid();
            }
        };

        _webViewBridge.logOutUser = function (featureName) {
            if (_webViewBridge.platform === "iOS") {
                logOutUserForIOS();
            } else if (_webViewBridge.platform === "Android") {
                logOutUserForAndroid();
            }
        };

        _webViewBridge.getElementsAndBindEvents = function(){
            console.log('keepSessionAliveForAndroid');
            var bindSessionEventsFunc = null;
            if(_webViewBridge.platform === "iOS"){
                bindSessionEventsFunc = keepSessionAliveForIOS;
            }
            else if (_webViewBridge.platform === "Android") {
                bindSessionEventsFunc = keepSessionAliveForAndroid;
            }

            var elems = document.querySelectorAll('a');
            bindSessionEvents(elems, 'click', bindSessionEventsFunc);
            var elems = document.querySelectorAll('button');
            bindSessionEvents(elems, 'click', bindSessionEventsFunc);
            var elems = document.querySelectorAll('select');
            bindSessionEvents(elems, 'change', bindSessionEventsFunc);
            var elems = document.querySelectorAll('input');
            bindSessionEventsWithDebounce(elems, 'input', bindSessionEventsFunc, 1000);
        }

        return _webViewBridge;
    }

    function bindSessionEvents(elements, event, keepSessionCallback){
        for(var i=0;i<elements.length;i++){
            elements[i].addEventListener(event, keepSessionCallback);
        }
    }

    function bindSessionEventsWithDebounce(elements, event, keepSessionCallback, debounceTime){
        for(var i=0;i<elements.length;i++){
            elements[i].addEventListener(event, function() {
              clearTimeout(this.tick);
              this.tick = setTimeout(function(){
                keepSessionCallback();
              }, debounceTime);
            });
        }
    }

    function disableBackButtonForIOS(featureName) {
        try {
            webkit.messageHandlers.disableBackButton.postMessage({
                featureName: featureName
            });

        } catch (err) {
            console.log("Go Back home error for iOS");
        }
    }

    function disableBackButtonForAndroid(featureName) {
        try {
            webViewBridgeAndroid.disableBackButton(featureName);
        } catch (err) {
            console.log("Go Back home error for Android");
        }
    }

    function keepSessionAliveForAndroid() {
        try{
            webViewBridgeAndroid.keepSessionAlive();
        } catch (e) {
            console.log("Keep session alive error for Android");
        }
    }

    function keepSessionAliveForIOS() {
        try{
            webkit.messageHandlers.keepSessionAlive.postMessage('');
        } catch (e) {
            console.log("Keep session alive error for iOS");
        }
    }

    function logOutUserForAndroid() {
        try{
            webViewBridgeAndroid.userLoggedOut();
        } catch (e) {
            console.log("User log out error ");
        }
    }

    function logOutUserForIOS() {
        try{
            webkit.messageHandlers.userLoggedOut.postMessage('');
        } catch (e) {
            console.log("User log out error ");
        }
    }

    function goBackHomeForIOS(featureName) {
        try {
            webkit.messageHandlers.goToHomeScreen.postMessage({
                featureName: featureName
            });
            console.log("Go back home for iOS from Javascript");

        } catch (err) {
            console.log("Go Back home error for iOS");
        }
    }

    function goBackHomeForAndroid(featureName) {
        try {
            webViewBridgeAndroid.goBackHome(featureName);
        } catch (err) {
            console.log("Go Back home error for Android");
        }
    }

    function getAccessTokenForiOS() {
        try {
            webkit.messageHandlers.getAccessToken.postMessage({});
        } catch (err) {
            console.log("access token error for iOS from webview");
        }
    }

    function getAccessTokenForAndroid() {
        try {
            return webViewBridgeAndroid.getAccessToken();
        } catch (err) {
            console.log('access token error for Android');
        }
    }

    if (typeof (window.webViewJSBridge) === 'undefined') {
        console.log('bridge created');
        window.webViewJSBridge = webViewBridge();
        window.onload = window.webViewJSBridge.getElementsAndBindEvents;
    }
})(window);