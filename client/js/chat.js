$(function () {
    $('body').Partial(function(){
        var showmore = $('#show_more_chat');
        showmore.click(function(){
            showElement('#show_more_chat_panel','fadeIn','fadeOut','0.2s',function(isShowed){

            })
        });

        function showChatRoom(contact){
            var panel = $('<div class="col-lg-2" style="float: right;"><div class="chat-panel"> <div  class="chat-panel-header bg-primary">' +
                contact.username +'<div style="float: right"> <span class="fa fa-phone fa-fw " style="color: #aaaaaa;cursor: not-allowed"/> <span class="fa fa-video-camera fa-fw" style="color: #aaaaaa;cursor: not-allowed"/> ' +
                '<span class="fa fa-remove fa-fw" style="cursor: pointer"/> </div> </div> <div class="chat-panel-body"> </div> <div class="chat-panel-footer"> ' +
                '<div contenteditable="true" class="chat-message-text"  placeholder="Type a message..."></div> ' +
                '<div style="position: absolute;bottom: 0px;padding-left: 10px"> ' +
                '<span class="fa fa-camera fa-fw "/> <span class="fa fa-paperclip fa-fw"/> <input type="file" style="display: none" class="attachment" /> ' +
                '<input type="file" style="display: none" class="picture" /></div> </div> </div> </div>');

            var separator = $('<div class="chat-room-separator"></div>');

            var close_button = panel.find('.fa-remove').click(function(){
                panel.remove();
            });

            var sound_stream = panel.find('.fa-phone').click(function(){

            });

            var video_stream = panel.find('.fa-video-camera').click(function(){

            });

            var add_picture = panel.find('.fa-camera').click(function(){
                panel.find('.picture').click();
            });

            var attach_file = panel.find('.fa-paperclip').click(function(){
                panel.find('.attachment').click();
            });

            var room_list = $('#chat_contact_room_list');

            if ( room_list.find('.chat-panel').length > 4) {

                showmore.css('display','block');
                if(showmore.data('chat_list') == undefined){
                    showmore.data('chat_list',1);
                }else{
                    showmore.data('chat_list',showmore.data('chat_list')+1)
                }
                showmore.find('b').html(showmore.data('chat_list'));
                //console.log(showmore.data('chat_list'))

                var accessbutton = $('<li role="presentation"><a href="#" style="vertical-align: middle">'+contact.username+'<span style="float: right" class="fa fa-remove"/></a></li>');
                accessbutton.find('fa-remove').mouseover(function(){
                    $(this).css('color','#000000')
                }).click(function(){
                    accessbutton.remove();
                });

                accessbutton.click(function(){

                });

                $('#show_more_chat_panel_container').append(accessbutton);


            } else {
                room_list.append(panel);
                room_list.append(separator);
            }
        }

        function addContacttoList(contact){
            var status = 'grey';
            switch(contact.status){
                case 'online' :
                    status = 'green';
                    break;
                case 'busy' :
                    status = 'orange';
                    break;
                case 'nodisturb':
                    status = 'red';
                    break;
            }

            var contactlistitem = $('<div class="media" style="padding: 5px"> ' +
                '<div class="media-left media-middle"> <a href="#"> <img src="img/generic-profile-pic.png" style="width: 32px; height: 32px;"> </a> </div> ' +
                '<div class="media-body" style="vertical-align: middle"> ' +
                '<span style="vertical-align: middle;height: 30px; line-height: 32px">'+contact.username+'</span> ' +
                '<svg width="30" height="30" style="float: right;"> ' +
                '<circle cx="15" cy="15" r="5"  fill="'+status+'" /> ' +
                '</svg> </div> </div>');
            contactlistitem.click(function(){
                showChatRoom(contact)
            }).mouseover(function(){
                $(this).addClass('bg-info')
            }).mouseleave(function(){
                $(this).removeClass('bg-info')
            }).css('cursor','pointer');

            $('#chat_contact_list').prepend(contactlistitem)
        }

        $('#show_chat_module, #hide_contact_module').click(function(){
            showElement('#chat_contact_list','fadeInRight','fadeOutRight','0.2s',function(isShowed){
                if(isShowed){
                    $element = $('#show_chat_module');
                    $element.removeClass('fadeIn');
                    $element.addClass('animated');
                    $element.addClass('fadeOut');
                    $element.css('-webkit-animation-duration','0.1s');
                    $element.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                        $element.unbind('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend')
                        $element.css('display','block');
                    });
                }else {
                    $element = $('#show_chat_module');
                    $element.removeClass('fadeOut');
                    $element.addClass('animated');
                    $element.addClass('fadeIn');
                    $element.css('-webkit-animation-duration','0.1s');
                    $element.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                        $element.unbind('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend')
                        $element.css('display','block');
                    });
                }
            });
            showElement('#chat_contact_list_bar','fadeInRight','fadeOutRight','0.1s',function(isShowed){
                if(isShowed){

                }else {

                }
            })

        });



        //testing
        var testdata = {
            username : 'ichsan',
            status : 'online'
        };

        for(var i =0 ; i <50;i++){
            addContacttoList(testdata);
        }
    });
});