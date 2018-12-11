import cookieParser = require('cookie-parser');
import RateLimit = require('express-rate-limit');
import session = require('express-session');
import helmet = require('helmet');
import { Request, Response } from 'express';
import { createWriteStream } from 'fs';
import { Codec, StreamCamera } from 'pi-camera-connect';
import { Socket } from 'socket.io';
import * as stream from 'stream';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http);


export function start() {
    const port = 8080;

    const limiter = new RateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        delayMs: 0 // disable delaying - full speed until the max limit is reached
    });

    const streamCamera = new StreamCamera({
        codec: Codec.MJPEG
    });

    app.use(helmet());
    app.use(limiter);

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));

    app.use(cookieParser());
    app.use(session({
        secret: 'some',
        resave: false,
        saveUninitialized: false
    }));

    io.on('connection', (socket: Socket) => {
        console.log('A user connected');

        const videoStream = streamCamera.createStream();

        startStreaming(videoStream);

        videoStream.on('data', (data: Buffer) => {
            socket.emit('image', data.toString('base64'));
        });

        videoStream.on('end', () => {
            console.log('Video stream has ended');
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');

            stopStreaming();
        });
    });

    app.get('/', (req: any, res: any) => {
        res.sendFile(__dirname + '/index.html');
    });

    app.get('/status', (req: Request, res: Response) => {
        res.json({status: 'OK'});
    });

    http.listen(port, () => {
        console.log(`Express app listening on port ${port}!`);
    });

    const startStreaming = (videoStream: stream.Readable) => {
        const writeStream = createWriteStream('video-stream.mjpeg');

        // Pipe the video stream to our video file
        videoStream.pipe(writeStream);

        streamCamera.startCapture().then(_ => {
            console.log('Stream started');
        });
    };

    const stopStreaming = () => {
        streamCamera.stopCapture().then(_ => {
            console.log('Stream stopped');
        });
    };
}
