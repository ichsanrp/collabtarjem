(function ($) {

    const OAUTH_API = 'OAuth';

    function OAuth() {

        if(OAuth.instance == null || OAuth.instance == undefined)
        {  this.isLogged = false;
            this.authInfo = {};
            this._init();
            OAuth.instance = this;
        }

        return OAuth.instance;
    }

    OAuth.prototype = {
        facebookButton : 'sign-in-with-facebook',
        googleButton:'sign-in-with-google',
        twitterButton:'sign-in-with-twitter',
        facebookAppId: '1753970918219206',
        googleAppId: '636588253510-366mc2v483vc8o3f2p3ngicno2idhu2u.apps.googleusercontent.com',
        _init: function () {
            this.getFacebookSDK();
            this.getGoogleSDK();
            this.onLoggedHandler = [];
        },
        getGoogleSDK: function () {
            var self = this;
            var js, fjs = document.getElementsByTagName('script')[0];
            if (document.getElementById('google-jssdk')) return;
            js = document.createElement('script');
            js.id = 'facebook-jssdk';
            js.src = "//apis.google.com/js/api:client.js";
            fjs.parentNode.insertBefore(js, fjs);

            $(function () {
                $('body').Partial(function(){
                    self.googleAuthAPI = null;
                    /**
                     * Initializes the Sign-In client.
                     */
                    var initClient = function() {
                        gapi.load('auth2', function(){
                            /**
                             * Retrieve the singleton for the GoogleAuth library and set up the
                             * client.
                             */
                            self.googleAuthAPI = gapi.auth2.init({
                                client_id: self.googleAppId
                            });

                            // Attach the click handler to the sign-in button
                            self.googleAuthAPI.attachClickHandler(self.googleButton, {}, onSuccess, onFailure);
                        });
                    };

                    /**
                     * Handle successful sign-ins.
                     */
                    var onSuccess = function(user) {
                        var data = user.getBasicProfile();
                        data.type = 'google';
                        self.statusChange(data)
                    };

                    /**
                     * Handle sign-in failures.
                     */
                    var onFailure = function(error) {
                        console.log(error);
                    };

                    setTimeout(initClient,10)
                })
            });

        },
        getFacebookSDK: function () {
            var self = this;
            var js, fjs = document.getElementsByTagName('script')[0];
            if (document.getElementById('facebook-jssdk')) return;
            js = document.createElement('script');
            js.id = 'facebook-jssdk';
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);

            window.fbAsyncInit = function () {
                FB.init({
                    appId: self.facebookAppId,
                    cookie: true,
                    xfbml: true,  // parse social plugins on this page
                    version: 'v2.5' // use graph api version 2.5
                });
                FB.getLoginStatus(function (response) {
                    response.type = 'facebook';
                    self.statusChange(response);
                });
            };

            $(function () {
                $('body').Partial(function(){
                    $('#'+self.facebookButton).click(function(){
                        FB.login(function(response) {
                            response.type = 'facebook';
                            self.statusChange(response)
                        }, {scope: 'public_profile, email'});
                    })
                })
            })
        },
        statusChange: function (response) {
            var self = this;
            if(response.type == 'facebook'){
                if(response.status == 'connected'){
                    this.accessToken = response.authResponse.accessToken;
                    this.userId = response.authResponse.userID;
                    this.username = response.authResponse.name;
                    this.signature = response.authResponse.signedRequest;
                    this.APIResponse = response;
                    this.isLogged = true;
                    this.email = response.authResponse.email | '';
                    this.AuthType = 'facebook';
                    this.invokeLogged();
                }
            }else if(response.type == 'google')
            {
                this.isLogged =  self.googleAuthAPI.isSignedIn.hg;
                var user =  self.googleAuthAPI.currentUser.get();
                var basicProfile = user.getBasicProfile();
                this.userId = user.getId();
                this.username = basicProfile.getName();
                this.email = basicProfile.getEmail();
                this.invokeLogged();
            }
        },

        invokeLogged : function(){
          this.onLoggedHandler.forEach(function(cb){
              cb();
          });
        },

        onLogged : function(cb){
            if(!this.isLogged){
                this.onLoggedHandler.push(cb);
            }else{
                cb(this)
            }
        },

        loginFail : function(err){

        }
    };

    window.OAuth = OAuth;
    var instance = new OAuth();
}(jQuery));

