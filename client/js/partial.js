(function(window,$){

    function Partial(element){
        var $element = $(element);
        $element.data('instance', this);
        this.init();
        return this;
    };

    Partial.prototype = {
        ready : function(cb){
            if(!this.readyCalled)
                this.handler.push(cb);
            else
                cb();
        },
        init : function(){
            this.segments = $('partial');
            this.size = this.segments.length;
            this.loaded = 0;
            this.handler = [];
            this.readyCalled = false;
            this.convert();
        },

        convert : function(){
            var self = this;
            this.segments.each(function(index){
                var $elemnt = $(this);
                self.replace($elemnt);
            })
        },

        replace : function(elemnt){
            var self = this;
            $.get(elemnt.attr('src'), function (data) {
                var html = $.parseHTML(data);
                var tempdom = $('<output>').append(html);
                var part = $('partial',tempdom);
                elemnt.replaceWith(html);
                if(part.length > 0){
                    self.size += part.length;
                    part.each(function(index){
                        self.replace($(this));
                    });
                }
                self.loaded++;
                if (self.loaded >= self.size) {
                    self.invokeReady();
                }
            });
        },

        invokeReady : function(){
            this.readyCalled = true;
            this.handler.forEach(function(cb){
                cb()
            })
        }
    };

    window.Partial = Partial;
    $.fn.Partial = function(cb) {
        var $element = $(this),
            instance = $element.data('instance');

        if(!instance) {
            instance = new Partial($element);
        }

        instance.ready(cb);

        return instance;
    };
})(window,jQuery);