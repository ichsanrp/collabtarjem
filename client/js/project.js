$(function () {
    $('body').Partial(function () {

        var projectfinder = $('#projectfinder');
        var options = {
            namespace : 'project'
        };
        var eventSystem = new eventBroadcaster(options);

        eventSystem.on('kitab_selected',function(kitab){
            $('#create_translation_project_kitab').val(kitab.title);
            $('#create_translation_project_kitab_id').val(kitab._id);
        });
        
        $('#create_project_button').click(function (e) {
            if($('#create_translation_project_kitab').val() == ''){
                alert('Please select kitab first')
                e.preventDefault();
                e.stopPropagation();
            }else{

            }

        });

        $('#create_translation_project_finish').click(function (e) {
            var name = $('#create_translation_project_name').val();
            var kitab = $('#create_translation_project_kitab_id').val();
            var language = $('#create_translation_project_language').val();
            var Oauth  = new OAuth();
            var data = {
              book : kitab,
              language : language,
              name: name,
              admin:[Oauth.userId]
            };
            $.post('/project/create',data).done(function (data) {
                $('#create_translation_project_name').val('');
            })
        })


    })

});