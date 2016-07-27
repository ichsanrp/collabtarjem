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
    
    $('#login').click(function (e) {
        var usernameField = $('#username');
        var passwordField = $('#password');
        //TODO add validation
        //TODO remember me
        $.post('/user/login',{
            username:usernameField.val(),
            password:passwordField.val()
        }).done(function (data) {
            if(data.error){
                var errorContiner = $('#login_error');
                errorContiner.html('');
                    if( typeof data.message == 'string'){
                        errorContiner.append($('<div class="alert alert-danger" style="margin-bottom: 5px" role="alert"> ' +
                            '<span class="fa fa-warning"></span> Error! '+data.message+' </div>'))
                    }else {
                        data.message.forEach(function (message) {
                            errorContiner.append($('<div class="alert alert-danger" style="margin-bottom: 5px" role="alert"> ' +
                                '<span class="fa fa-warning"></span> Error! '+data.message+' </div>'))
                        })
                    }

            }else{
                $('#login_panel').modal('hide')
            }
        })
    })

    $('#sign_up').click(function (e) {
        $('#login_panel').modal('hide');
        $('#sign_up_panel').modal('show');

    })
});