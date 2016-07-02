$(function () {

    $('body').Partial(function(){
        var sidebar = $('#sidebar');
        var original = $('#original');
        var translate = $('#translated');

        //activate tooltip
        $('[data-toggle="tooltip"]').tooltip({
            template:'<div class="tooltip" style="width: 100px" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
        });

        function showElement(selector,inAnimation,outAnimation,duration,callback){
            var $element = $(selector);

            var hide = function()
            {
                $element.removeClass(inAnimation);
                $element.addClass('animated');
                $element.addClass(outAnimation);
                $element.data('showed',false);
                $element.data('modify',true);
                $element.css('-webkit-animation-duration',duration);
                $element.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                    $element.css('display','none')
                    $element.data('modify',false);
                    $element.unbind('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend')
                    callback(false);
                });
            };

            var show = function()
            {

                $element.css('display','block')
                $element.removeClass(outAnimation);
                $element.addClass('animated');
                $element.addClass(inAnimation);
                $element.css('-webkit-animation-duration',duration);
                $element.data('modify',true);
                $element.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                    $element.data('modify',false);
                    $element.data('showed',true);
                    $element.unbind('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend')
                    callback(true)
                });
            }

            if($element.data('modify') == undefined || $element.data('modify') == false)
                if($element.data('showed') == undefined || $element.data('showed') == false){
                    show();
                }else{
                    hide();
                }
        }


        $('#showmenu').click(function(e){
            showElement('#sidebar','fadeInRight','fadeOutRight','0.1s',function(isShowed){
                if(isShowed){
                    $('#showmenu').removeClass('btn-primary').addClass('btn-warning');
                    original.css('width','calc( 100vw - 30vw - 150px )');
                    translate.css('width','calc( 100vw - 30vw - 150px )');
                }else {
                    $('#showmenu').removeClass('btn-warning').addClass('btn-primary');
                    original.css('width','calc( 100vw - 30vw  )');
                    translate.css('width','calc( 100vw - 30vw  )');
                }
            })
        });

        $('#bookfinder').children('.media')
            .css('cursor', 'pointer')
            .css('margin-top', '0px')
            .css('padding-top', '7px')
            .css('padding-bottom', '7px')
            .css('padding-left', '5px')
            .css('padding-right', '5px')
            .click(function (e) {
                $('#bookfinder').children('.media').removeClass('bg-warning');
                $(this).addClass('bg-warning');
            })
            .mouseover(function () {
                $(this).addClass('bg-info')
            })
            .mouseleave(function () {
                $(this).removeClass('bg-info')
            });


        //javascript for upload kitab

        $('#login-popup').click(function(){
            $('#login_panel').modal();
        });
        $('#show_upload_kitab').click(function(){
            $('#upload_kitab_panel').modal();
        });
        $('#filename, #show_get_file').click(function(){
            var evt = document.createEvent("MouseEvents");
            evt.initEvent("click", true, false);
            document.getElementById('theFile').dispatchEvent(evt);
        });

        $('#theFile').change(function(){
            $('#filename').val($(this).val())
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

        $('#upload_form').on(
            'drop',
            function(e){
                if(e.originalEvent.dataTransfer){
                    if(e.originalEvent.dataTransfer.files.length) {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log(e.originalEvent.dataTransfer.files);
                        $('#upload_drop_zone').css('display','none');
                    }
                }
            }
        );
    });

});
