$('body').Partial(function () {

    var authInstance = new OAuth();
    authInstance.onLogged(function(info){
        $('#login_panel').modal('hide');
        $('#showmenu').css('display','block');
        $('#login-popup').css('display','none');
        if(info.type == 'facebook'){
            $.post('/user/loginWithFacebook',info.response).done(function(err,result){
                console.log(result)
            })
        }else if(info.type == 'google'){
            var token = info.response.getAuthResponse().id_token;
            $.post('/user/loginWithGoogle',{token:token}).done(function(err,result){
                console.log(result)
            })
        }

    })
});