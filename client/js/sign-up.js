$('body').Partial(function () {
$('#register').click(function (e) {
    var emailField = $('#sign_up_username');
    var passwordField = $('#sign_up_password');
    var repasswordField = $('#sign_up_repeat');


    var email = emailField.val();
    var password = passwordField.val();
    var repassword = repasswordField.val();

    //TODO:add validity

    $.post('/user/register',{
        email:email,
        password:password
    }).done(function (data) {
        if(data.success)
        {
            $('#sign_up_error').html('').append($('<div class="alert alert-success" style="margin-bottom: 5px" role="alert"> ' +
                '<span class="fa fa-warning"></span> Email verification sent to your email, please verify </div>'))
        }else{
            $('#sign_up_error').html('').append($('<div class="alert alert-danger" style="margin-bottom: 5px" role="alert"> ' +
                '<span class="fa fa-warning"></span> '+data.message+' </div>'))
        }
    })
})
});