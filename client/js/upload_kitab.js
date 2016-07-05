//javascript for upload kitab
$('body').Partial(function () {

    var uploadKitab = function(formData,cb){
        var progressbar = $($('#upload_progress').children()[0]);

        var progessCheck = function(e){
            if(e.lengthComputable){
                $('#upload_progress').css('display','block');
                progressbar.attr('aria-valuenow', e.loaded);
                progressbar.attr('aria-valuemax', e.total);
                progressbar.css('width',( e.loaded/ e.total )*100 +'%')
            }
        };

        progressbar.addClass('active');
        progressbar.addClass('progress-bar-warning');
        progressbar.removeClass('progress-bar-success');
        progressbar.attr('aria-valuenow', 0);
        progressbar.attr('aria-valuemax', 100);
        progressbar.css('width','0%');

        $.ajax({
            url: 'kitab/upload',  //Server script to process data
            type: 'POST',
            xhr: function() {  // Custom XMLHttpRequest
                var myXhr = $.ajaxSettings.xhr();
                if(myXhr.upload){ // Check if upload property exists
                    myXhr.upload.addEventListener('progress',progessCheck, false); // For handling the progress of the upload
                }
                return myXhr;
            },
            //Ajax events
            success: function(xhr,data){
                progressbar.removeClass('active');
                progressbar.removeClass('progress-bar-warning');
                progressbar.addClass('progress-bar-success')
                $('#upload_kitab_done').css('display','block');
                $('#upload_kitab_cancel').css('display','none');

                if(typeof cb == 'function'){
                    cb()
                }
            },
            error: function(err){
                console.log(err)
            },
            // Form data
            data: formData,
            //Options to tell jQuery not to process data or worry about content-type.
            cache: false,
            contentType: false,
            processData: false
        });
    };

    $('#login-popup').click(function(){
        $('#login_panel').modal();
    });
    $('#show_upload_kitab').click(function(){
        $('#upload_kitab_panel').modal();
    });
    $('#filename').click(function(){
        var evt = document.createEvent("MouseEvents");
        evt.initEvent("click", true, false);
        document.getElementById('theFile').dispatchEvent(evt);
    });

    $('#shamela_url').keypress(function(e){
        if(e.charCode == 13){
            var error_container = $('#upload_shamela_error');
            error_container.html('');
            if($('#shamela_url').val().indexOf('http://shamela.ws/index.php/book/') >=0 ){
                var progressbar = $($('#upload_progress').children()[0]);
                $('#upload_progress').css('display','block');
                progressbar.attr('aria-valuenow', 100);
                progressbar.attr('aria-valuemax', 100);
                progressbar.css('width','100%');
                progressbar.addClass('active');
                progressbar.addClass('progress-bar-warning');
                progressbar.removeClass('progress-bar-success');

                $.post('kitab/uploadFromShamela', {url:$('#shamela_url').val()})
                    .done(function( data ) {
                        if(data.success)
                        {
                            progressbar.removeClass('active');
                            progressbar.removeClass('progress-bar-warning');
                            progressbar.addClass('progress-bar-success')
                            $('#upload_kitab_done').css('display','block');
                            $('#upload_kitab_cancel').css('display','none');

                        }
                    });
            }else{
                error_container.append($('<div class="alert alert-danger" style="margin-bottom: 5px" role="alert"> ' +
                    '<span class="fa fa-warning"></span> Warning! not from shamela book url </div>'))
            }
        }
    });

    $('#theFile').change(function(){
        //TODO: we need validator to determine if this epub belong to shamela.ws
        var file = this.files[0];
        var name = file.name;
        var size = file.size;
        var type = file.type;

        var errContainer = $('#upload_error');
        var haserror = false;

        if(type != 'application/epub+zip')
        {
            haserror = true;
            errContainer.append($('<div class="alert alert-danger" style="margin-bottom: 5px" role="alert"> ' +
                '<span class="fa fa-warning"></span> Warning! not an epub file </div>'))
        }

        if(!haserror)
        {
            $('#upload_file').removeAttr('disabled');
            $('#filename').val($(this).val())
        }else{
            $('#theFile').val('');
        }
    });

    $('#upload_file').click(function(){
        var formData = new FormData();
        formData.append("epub", $('#theFile').prop('files')[0]);
        uploadKitab(formData);
    });

    $('#upload_form').on(
        'dragover',
        function(e) {
            e.preventDefault();
            e.stopPropagation();
            $('#upload_drop_zone').css('display','block');
        }
    );

    $('#upload_form').on(
        'dragenter',
        function(e) {
            e.preventDefault();
            e.stopPropagation();

        }
    );

    $('#upload_kitab_done, #upload_kitab_cancel').click(function(){
        $('#upload_kitab_done').css('display','none');
        $('#upload_kitab_cancel').css('display','block');
        $('#upload_progress').css('display','none');
        $('#theFile').val('');
        $('#upload_file').attr('disabled','disabled');
        $('#filename').val();
        $('#upload_shamela_error').html('');
        $('#upload_error').html('');
        $('#upload_drop_zone').css('display','none');
    });

    $('#upload_form').on(
        'drop',
        function(e){
            if(e.originalEvent.dataTransfer){
                if(e.originalEvent.dataTransfer.files.length) {
                    e.preventDefault();
                    e.stopPropagation();
                    var formData = new FormData();
                    formData.append("epub", e.originalEvent.dataTransfer.files[0]);
                    uploadKitab(formData, function(){
                        $('#upload_drop_zone').css('display','none');
                    });
                }
            }
        }
    );
});
