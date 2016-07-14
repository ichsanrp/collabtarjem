module.exports = function(io){
    var namespaceIO = {};

    io.on('connect',function(socket){

        socket.on('bindNamespace', function(namespace,fn) {
            if(!namespaceIO.hasOwnProperty(namespace.replace('/',''))){
                var nsp = io.of(namespace);
                namespaceIO[namespace.replace('/','')] = nsp;
                nsp.on('connection',function(socket){
                    socket.on('joinRoom', function(room){
                        socket.join(room);
                        socket.room = room;
                    });

                    socket.on('changeRoom', function(room){
                        socket.leave(room.old);
                        socket.join(room.new);
                        socket.room = room;
                    });

                    socket.on('broadcast', function(payload){
                        socket.to(socket.room).emit(payload.event,payload.payload)
                    });
                });
            }
            fn();
        });
    })
};