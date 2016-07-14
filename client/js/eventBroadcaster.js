(function ($) {

    function eventBroadcaster(config) {

        if (eventBroadcaster.instance == null || eventBroadcaster.instance == undefined) {
            eventBroadcaster.instance = {};
        }

        if (eventBroadcaster.instance.hasOwnProperty(config.namespace)) {
            return eventBroadcaster.instance[config.namespace]
        } else {
            this._init(config);
            eventBroadcaster.instance[config.namespace] = this;
            return this;
        }
    }

    eventBroadcaster.prototype = {
        _init: function (config) {
            var self = this;
            this.eventHandler = {};
            var host = config.server || 'http://localhost:8080';
            var ns = config.namespace || '/';
            var room = config.room || 'default';
            this.room = room;
            this.namespace = 'socket' + ns;
            this.controlSocket = io(host);
            this.readyHandler = [];
            this.controlSocket.emit('bindNamespace', this.namespace, function () {
                self.socket = io(host + '/' + self.namespace);
                self.socket.emit('joinRoom', room);
                self.ready = true;
                self.readyHandler.forEach(function (handler) {
                    handler();
                })
            });
            //report to control socket we open socket with namespace and room ..
        },

        changeRoom: function (room) {
            self.socket.emit('changeRoom', {old: this.room, new: room});
            this.room = room;
        },

        on: function (event, cb) {
            if (this.eventHandler.hasOwnProperty(event)) {
                this.eventHandler[event].push(cb);
            } else {
                this.eventHandler[event] = [];
                this.eventHandler[event].push(cb);
                this.listen(event);
            }
        },

        invokeLocal: function (event, payload) {
            if (this.eventHandler.hasOwnProperty(event)) {
                this.eventHandler[event].forEach(function (handler) {
                    handler(payload);
                });
            }
        },

        invokeRemote: function (event, payload) {
            this.socket.emit('broadcast',{event:event,payload:payload});
        },

        listen: function (event) {
            var self = this;

            var bind = function () {
                self.socket.on(event, function (payload) {
                    console.log(event + ' called');
                    self.invokeLocal(event, payload);
                });
            };

            if (this.ready) {
                bind();
            } else {
                this.readyHandler.push(bind);
            }
        }
    };

    window.eventBroadcaster = eventBroadcaster

})(jQuery);

