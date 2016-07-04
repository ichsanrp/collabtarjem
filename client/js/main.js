$(function () {

    $('body').Partial(function(){
        var sidebar = $('#sidebar');
        var original = $('#original');
        var translate = $('#translated');

        //activate tooltip
        $('[data-toggle="tooltip"]').tooltip({
            template:'<div class="tooltip" style="width: 100px" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
        });

        window.showElement = function(selector,inAnimation,outAnimation,duration,callback){
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



    });

});
