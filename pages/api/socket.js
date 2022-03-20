// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { Server } from 'Socket.IO';

export default function handler(req, res) {
    if (res.socket.server.io) {
        console.log('Socket is already running');
    } else {
        console.log('Socket is initializing');
        const io = new Server(res.socket.server);
        res.socket.server.io = io;
        
        io.on('connection', socket => {
            // for future possible use
        });
    }

    res.end();
}
