(function($){

    var options = {
        namespace : 'collaboration'
    };
    var eventSystem = new eventBroadcaster(options);
    eventSystem.on('modify_phrase',function(phrase){
        $('phrase[phrase_id='+phrase.id+']')
            .html(phrase.text)
            .addClass('remote_edit');
    })

    eventSystem.on('remote_select',function(phrase){
        $('phrase[remote_user='+phrase.user+']').removeClass('remote_select');
        $('phrase[phrase_id='+phrase.id+']')
            .addClass('remote_select')
            .attr('remote_user',phrase.user)
    });

    //TODO:add project id
    eventSystem.on('local_select',function(phrase){
        var phrase = $('phrase[phrase_id='+phrase.id+']');
        $('#phrase_text').html(phrase.html());
        
        $.get('/project/getTranslation/'+phrase.id+'/')
        
    });

    // <div class="media">
    //     <div class="media-left">
    //     <button type="button" class="btn btn-default" ><span
    // class="fa fa-check-square-o"/></button>
    //     <button type="button" class="btn btn-default" ><span
    // class="fa fa-remove"/></button>
    //     <button type="button" class="btn btn-default" ><span
    // class="fa fa-pencil"/></button>
    //     </div>
    //     <div class="media-body">
    //     <h5 class="media-heading">ini perlu diubah dikarenakan blablabla pernyataan diatas adalah contoh dari penggunaan log phrase</h5>
    // <b>Abu Ahmad</b><br/>
    // <i>12 agustus 2015</i>
    // </div>
    // <div class="media-right">
    //     <span class="fa fa-check-square-o" style="color: green"/>
    //     <span class="fa fa-exclamation-triangle" style="opacity: 0.3"/>
    //     <span class="fa fa-minus-circle" style="opacity: 0.3"/>
    //     </div>
    //     </div>

})(jQuery);

