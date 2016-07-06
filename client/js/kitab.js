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

        var selectKitab = function(kitab){
            $.get('/kitab/totalPage/'+kitab._id,function(data){
                $('#original_total_pages').html('/ '+data.page);
                $('#original_current_page').val(1);
                $('#translated_total_pages').html('/ '+data.page);
                $('#translated_current_page').val(1);
            })

            var getKalimat = function(page){
                $.get('/kitab/getPage/'+kitab._id+'/'+page,function(data){
                    var container = $('#original_content');
                    container.html('');
                    data.forEach(function(kalimat){
                        var phrase = $('<phrase phrase_id="'+kalimat._id+'">'+kalimat.text+'</phrase>');
                        if(kalimat.type == 'mid_sentence')
                            phrase.html(phrase.html()+', &nbsp');
                        else if(kalimat.type == 'end_sentence'){
                            phrase.html(phrase.html()+'. &nbsp');
                        }

                        phrase.mouseover(function(){
                            $(this).css('background-color','#fdf5ce')
                        }).mouseleave(function(){
                            $(this).css('background-color','#ffffff')
                        }).css('cursor','pointer')

                        container.append(phrase)
                    })
                });

                $.get('/kitab/getPage/'+kitab._id+'/'+page+'/id',function(data){
                    var container = $('#translated_content');
                    container.html('');

                    data.forEach(function(kalimat){
                        var phrase = $('<phrase phrase_id="'+kalimat._id+'">'+kalimat.text+'</phrase>');
                        if(kalimat.type == 'mid_sentence')
                            phrase.html(phrase.html+',');
                        else if(kalimat.type == 'end_sentence'){
                            phrase.html(phrase.html+'.');
                        }

                        phrase.mouseover(function(){
                            $(this).css('background-color','#fdf5ce')
                        }).mouseleave(function(){
                            $(this).css('background-color','#ffffff')
                        })
                    })
                })
            }

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