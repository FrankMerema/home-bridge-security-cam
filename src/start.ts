#!/usr/bin/env node

// require('./server').start();

import { createWriteStream, readFileSync, writeFileSync } from 'fs';
import { Codec, StillCamera, StreamCamera } from 'pi-camera-connect';
import { Socket } from 'socket.io';
import * as stream from 'stream';
import Timer = NodeJS.Timer;

// Take still image and save to disk
const runCamera = async () => {

    const stillCamera = new StillCamera();

    const image = await stillCamera.takeImage();

    writeFileSync('still-image.jpg', image);
};

const runVideo = async () => {

    const streamCamera = new StreamCamera({
        codec: Codec.MJPEG
    });

    const videoStream = streamCamera.createStream();

    const writeStream = createWriteStream('video-stream.mjpeg');

    // Pipe the video stream to our video file
    videoStream.pipe(writeStream);

    await streamCamera.startCapture();

    // We can also listen to data events as they arrive
    videoStream.on('data', (data: Buffer) => console.log('New data', data.toString('base64')));
    videoStream.on('end', (data: Buffer) => console.log('Video stream has ended'));

    // Wait for 5 seconds
    await new Promise(resolve => setTimeout(() => resolve(), 5000));

    await streamCamera.stopCapture();
};

// runCamera();
runVideo();


const appWithStreams = () => {

    const app = require('express')();
    const http = require('http').Server(app);
    const io = require('socket.io')(http);

    let interval: Timer;
    let bufferIndex = 1;
    const buffers = [
        readFileSync('./imgs/0.jpg'),
        readFileSync('./imgs/1.jpg'),
        readFileSync('./imgs/2.jpg'),
        readFileSync('./imgs/3.jpg'),
        readFileSync('./imgs/4.jpg'),
        readFileSync('./imgs/5.jpg'),
        readFileSync('./imgs/6.jpg'),
        readFileSync('./imgs/7.jpg'),
        readFileSync('./imgs/8.jpg'),
        readFileSync('./imgs/9.jpg'),
        readFileSync('./imgs/10.jpg'),
        readFileSync('./imgs/11.jpg'),
        readFileSync('./imgs/12.jpg'),
        readFileSync('./imgs/13.jpg'),
        readFileSync('./imgs/14.jpg'),
        readFileSync('./imgs/15.jpg'),
        readFileSync('./imgs/16.jpg'),
        readFileSync('./imgs/17.jpg'),
        readFileSync('./imgs/18.jpg'),
        readFileSync('./imgs/19.jpg'),
        readFileSync('./imgs/20.jpg')
    ];

    let newStream: stream.Readable;

    io.on('connection', (socket: Socket) => {
        console.log('A user connected');

        startStreaming();

        newStream.on('data', (data: Buffer) => {
            socket.emit('image', data.toString('base64'));
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');

            stopStreaming();
        });
    });

    // Catch all urls not defined and serve Frontend
    app.get('/', (req: any, res: any) => {
        res.sendFile(__dirname + '/index.html');
    });

    http.listen(1234, () => {
        console.log('Listening on 1234');
    });

    const startStreaming = () => {
        if (!newStream) {
            newStream = new stream.Readable({
                read: () => {
                }
            });
        }

        console.log('Stream starting');

        interval = setInterval(() => {
            if (bufferIndex >= buffers.length) {
                bufferIndex = 0;
            }

            newStream.push(buffers[bufferIndex]);

            bufferIndex++;
        }, 300);
    };

    const stopStreaming = () => {
        clearInterval(interval);
        newStream.push(null);
        newStream = null;

        console.log('Stream stopped');
    };
};

// appWithStreams();