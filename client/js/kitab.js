$(function () {
    $('body').Partial(function () {

        var bookfinder = $('#bookfinder');

        var createKitabSVG = function(){
            //todo need to fix svg creator
            function svgEl(tagName) {
                return document.createElementNS("http://www.w3.org/2000/svg", tagName);
            }

            var svg = $(' <svg width="64" height="100" xmlns="http://www.w3.org/2000/svg">');
            var svg_rect = $('<rect x="0" y="0" width="64" height="100" style="fill:#2b542c;stroke-width:1;stroke:rgb(225,225,225)"/>')
            svg.append(svg_rect);

            var svg_title = $('<text x="10" y="0" fill="white" font-size="12" >');
            var title_split = kitab.title.split(' ');
            var lastsplit = 0;
            var lastSentence = '';
            for(var i=0;i<parseInt(title_split.length/3);i++){
                var sentence = title_split[(i*3)] +' '+ title_split[(i*3)+1]+' '+ title_split[(i*3)+2];
                svg_title.append($('<tspan x="10" dy="10">'+sentence+'</tspan>'));
                lastsplit = (i*3)+2;
            }
            for(var i = lastsplit+1; i <= title_split.length;i++){
                lastSentence += title_split[i]+' ';
            }

            svg_title.append($('<tspan x="10" dy="10">'+lastSentence+'</tspan>'));
            svg.append(svg_title);
            media.find('img').replaceWith(svg);
        };

        var options = {
            namespace : 'collaboration'
        };
        var collaborationEvent = new eventBroadcaster(options);

        options = {
            namespace : 'project'
        };

        var projectEvent = new eventBroadcaster(options);

        var selectKitab = function(kitab){
            $.get('/kitab/totalPage/'+kitab._id,function(data){
                $('#original_total_pages').html('/ '+data.page);
                $('#original_current_page').val(1);
                $('#translated_total_pages').html('/ '+data.page);
                $('#translated_current_page').val(1);
            });
            projectEvent.invokeLocal('kitab_selected',kitab );
            

            var Oauth = new OAuth();

            var getTranslation = function(kalimats,langugage){
                var lang = langugage || 'id';
                var translatedContainer = $('#translated_content');
                translatedContainer.html('');

                var getTranslationAsync = function(originalKalimat){
                    return new Promise(function(resolve,reject){
                        $.get('/kitab/getTranslation/'+originalKalimat._id+'/'+lang,function(translation){
                            var phrase = $('<phrase translation_id="'+originalKalimat._id+'" phrase_id="'+translation._id+'">'+translation.text+'</phrase>');
                            if(translation.type == 'mid_sentence')
                                phrase.html(phrase.html()+', &nbsp');
                            else if(translation.type == 'end_sentence'){
                                phrase.html(phrase.html()+'. &nbsp');
                            }

                            phrase.mouseover(function(){
                                $(this).addClass('hover')
                                $('phrase[phrase_id='+originalKalimat._id+']').addClass('hover')
                            }).mouseleave(function(){
                                $(this).removeClass('hover')
                                $('phrase[phrase_id='+originalKalimat._id+']').removeClass('hover')
                            }).click(function(){
                                translatedContainer.children().removeClass('selected').removeClass('hover');
                                $('#original_content').children().removeClass('selected').removeClass('hover');
                                collaborationEvent.invokeRemote('remote_select',{id:translation._id, user:Oauth.username} )
                                collaborationEvent.invokeLocal('local_select',{id:originalKalimat._id} )
                                $(this).addClass('selected')
                                    .css('cursor','text')
                                    .attr('contenteditable',true)
                                    .bind("DOMSubtreeModified",function(){
                                       $(this)
                                           .unbind('keydown')
                                           .unbind('keyup')
                                           .keydown(function(e){
                                               if(e.which == 13) {
                                                   e.preventDefault();
                                                   e.stopPropagation();
                                               }
                                           })
                                           .keyup(function(e){
                                               if(e.keyCode == 13){
                                                   e.preventDefault();
                                                   e.stopPropagation();
                                                   $(this).attr('edited',true);
                                                   collaborationEvent.invokeRemote('modify_phrase',{text:$(this).html(),id:translation._id} )
                                               }
                                           });
                                    });


                                $('phrase[phrase_id='+originalKalimat._id+']').addClass('selected');
                            }).css('cursor','pointer');

                            translatedContainer.append(phrase);
                            resolve();
                        })
                    });
                };

                var chaining = function(b,cb){
                     return b.then(cb)
                };

                //make load in sequence
                var i = 0, buf, j = 0;
                var first = getTranslationAsync(kalimats[i]);
                while(i < kalimats.length - 1){
                    i++;
                    buf = function(){
                        j++;
                        return getTranslationAsync(kalimats[j]);
                    };
                    first = chaining(first,buf)
                }
            };

            var getKalimat = function(page){
                $.get('/kitab/getPage/'+kitab._id+'/'+page,function(data){
                    var originalContainer = $('#original_content');
                    originalContainer.html('');
                    data.forEach(function(kalimat){
                        var phrase = $('<phrase phrase_id="'+kalimat._id+'">'+kalimat.text+'</phrase>');
                        if(kalimat.type == 'mid_sentence')
                            phrase.html(phrase.html()+', &nbsp');
                        else if(kalimat.type == 'end_sentence'){
                            phrase.html(phrase.html()+'. &nbsp');
                        }

                        phrase.mouseover(function(){
                            $(this).addClass('hover')
                            $('phrase[translation_id='+kalimat._id+']').addClass('hover');
                        }).mouseleave(function(){
                            $(this).removeClass('hover');
                            $('phrase[translation_id='+kalimat._id+']').removeClass('hover');
                        }).click(function(){
                            collaborationEvent.invokeRemote('remote_select',{id:kalimat._id, user:Oauth.username} )
                            collaborationEvent.invokeLocal('local_select',{id:kalimat._id} )
                            originalContainer.children().removeClass('selected').removeClass('hover');
                            $('#translated_content').children().removeClass('selected').removeClass('hover');;
                            $(this).addClass('selected');
                            $('phrase[translation_id='+kalimat._id+']').addClass('selected');
                        }).css('cursor','pointer');

                        originalContainer.append(phrase);
                    });

                    getTranslation(data,'id');
                });
            };

            getKalimat(1);

            $('#original_current_page').unbind('keypress')
                .keypress(function(e){
                    if(e.charCode == 13){
                        getKalimat($('#original_current_page').val());
                        $('#translated_current_page').val($('#original_current_page').val())
                    }
                })
            $('#translated_current_page').unbind('keypress')
                .keypress(function(e){
                    if(e.charCode == 13){
                        getKalimat($('#translated_current_page').val());
                        $('#original_current_page').val($('#translated_current_page').val())
                    }
                })
        };

        var addKitabToFinder = function(kitab){

            var media = $('<div class="media"> <div class="media-left"> <a href="#">' +
                '<img style="width: 64px; height: 64px;">' +
                '</a> </div> <div class="media-body"> ' +
                '<h4 class="media-heading">'+kitab.title+'</h4> ' +
                kitab.creator+'<br/>'+kitab.publisher+
                '</div></div>')

            media.css('cursor', 'pointer')
                .css('margin-top', '0px')
                .css('padding-top', '7px')
                .css('padding-bottom', '7px')
                .css('padding-left', '5px')
                .css('padding-right', '5px')
                .click(function (e) {
                    $('#bookfinder').children('.media').removeClass('bg-warning');
                    $(this).addClass('bg-warning');
                    selectKitab(kitab);
                })
                .mouseover(function () {
                    $(this).addClass('bg-info')
                })
                .mouseleave(function () {
                    $(this).removeClass('bg-info')
                });

            bookfinder.append(media);
        };




        //load book
        $.get('/kitab/getAll',function(data){
            data.forEach(function(book){
                addKitabToFinder(book);
            })
        })

    })
});