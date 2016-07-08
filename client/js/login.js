$('body').Partial(function () {
    var authInstance = new OAuth();
    authInstance.onLogged(function(){
        $('#login_panel').modal('hide');
        $('#showmenu').css('display','block');
        $('#login-popup').css('display','none')
    })
});