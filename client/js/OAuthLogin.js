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
                                client_id: self.googleAppId,
                                scope: 'profile'
                            });

                            self.googleAuthAPI.isSignedIn.listen(self.statusChange);

                            // Listen for changes to current user.
                            self.googleAuthAPI.currentUser.listen(self.statusChange)

                            $.get('/user/loggedWithGoogle', function(data){
                               if(data.isLogged){
                                   $.get('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token='+data.token,function(response){
                                       response.type = 'google';
                                       response.fromToken = true;
                                       self.statusChange(response)
                                   });
                                   //var options = new gapi.auth2.SigninOptionsBuilder();
                                   //options.setPrompt('none');
                                   //options.setScope('profile').setScope('email');
                                   //self.googleAuthAPI.signIn(options.get());
                                   //already logged with google just request access token
                               }

                            });

                            if (self.googleAuthAPI.isSignedIn.get() == true) {

                            };

                            // Attach the click handler to the sign-in button
                            self.googleAuthAPI.attachClickHandler(self.googleButton, {}, onSuccess, onFailure);
                        });
                    };

                    /**
                     * Handle successful sign-ins.
                     */
                    var onSuccess = function(user) {
                        user.type = 'google';
                        user.fromToken = false;
                        self.statusChange(user)
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
                if(!response.fromToken){
                    this.isLogged =  self.googleAuthAPI.isSignedIn.hg;
                    var user =  self.googleAuthAPI.currentUser.get();
                    var basicProfile = response.getBasicProfile();
                    this.userId = user.getId();
                    this.APIResponse = response;
                    this.username = basicProfile.getName();
                    this.email = basicProfile.getEmail();
                    this.AuthType = 'google';
                    this.invokeLogged();
                }else{
                    this.isLogged = true;
                    this.username = response.name;
                    this.email = response.email;
                    this.userId = response.sub;
                    this.AuthType = 'google-relogin';
                    this.invokeLogged();
                }

            }
        },

        invokeLogged : function(){
            var self = this;
          this.onLoggedHandler.forEach(function(cb){
              cb({type:self.AuthType,response:self.APIResponse});
          });
        },

        onLogged : function(cb){
            if(!this.isLogged){
                this.onLoggedHandler.push(cb);
            }else{
                cb({type:this.AuthType,response:this.APIResponse});
            }
        },

        loginFail : function(err){

        }
    };

    window.OAuth = OAuth;
    var instance = new OAuth();
}(jQuery));

