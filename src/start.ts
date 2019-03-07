#!/usr/bin/env node

import { Request, Response } from 'express';
import { writeFile, writeFileSync } from 'fs';
// require('./server').start();
import { Codec, StillCamera, StreamCamera } from 'pi-camera-connect';

// import { createWriteStream, readFileSync, writeFileSync } from 'fs';
// import { Codec, StillCamera, StreamCamera } from 'pi-camera-connect';
// import { Socket } from 'socket.io';
// import * as stream from 'stream';
// import Timer = NodeJS.Timer;
//
// // Take still image and save to disk
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

    // const writeStream = createWriteStream('video-stream.mjpeg');

    // Pipe the video stream to our video file
    // videoStream.pipe(writeStream);

    await streamCamera.startCapture();

    // const img = await streamCamera.takeImage();
    //
    // console.log(img);

    // We can also listen to data events as they arrive
    videoStream.once('data', (data: Buffer) => {
        writeFile('still-image.jpg', data, () => {
            streamCamera.stopCapture();
        });
    });
    // videoStream.on('end', (data: Buffer) => console.log('Video stream has ended'));

    // Wait for 5 seconds
    // await new Promise(resolve => setTimeout(() => resolve(), 5000));
    //
    // await streamCamera.stopCapture();
};

// runCamera();
// runVideo();
//
//
// const appWithStreams = () => {
//
//     const app = require('express')();
//     const http = require('http').Server(app);
//     const io = require('socket.io')(http);
//
//     let interval: Timer;
//     let bufferIndex = 1;
//     const buffers = [
//         readFileSync('./imgs/0.jpg'),
//         readFileSync('./imgs/1.jpg'),
//         readFileSync('./imgs/2.jpg'),
//         readFileSync('./imgs/3.jpg'),
//         readFileSync('./imgs/4.jpg'),
//         readFileSync('./imgs/5.jpg'),
//         readFileSync('./imgs/6.jpg'),
//         readFileSync('./imgs/7.jpg'),
//         readFileSync('./imgs/8.jpg'),
//         readFileSync('./imgs/9.jpg'),
//         readFileSync('./imgs/10.jpg'),
//         readFileSync('./imgs/11.jpg'),
//         readFileSync('./imgs/12.jpg'),
//         readFileSync('./imgs/13.jpg'),
//         readFileSync('./imgs/14.jpg'),
//         readFileSync('./imgs/15.jpg'),
//         readFileSync('./imgs/16.jpg'),
//         readFileSync('./imgs/17.jpg'),
//         readFileSync('./imgs/18.jpg'),
//         readFileSync('./imgs/19.jpg'),
//         readFileSync('./imgs/20.jpg')
//     ];
//
//     let newStream: stream.Readable;
//
//     io.on('connection', (socket: Socket) => {
//         console.log('A user connected');
//
//         startStreaming();
//
//         newStream.on('data', (data: Buffer) => {
//             socket.emit('image', data.toString('base64'));
//         });
//
//         socket.on('disconnect', () => {
//             console.log('User disconnected');
//
//             stopStreaming();
//         });
//     });
//
//     // Catch all urls not defined and serve Frontend
//     app.get('/', (req: any, res: any) => {
//         res.sendFile(__dirname + '/index.html');
//     });
//
//     http.listen(1234, () => {
//         console.log('Listening on 1234');
//     });
//
//     const startStreaming = () => {
//         if (!newStream) {
//             newStream = new stream.Readable({
//                 read: () => {
//                 }
//             });
//         }
//
//         console.log('Stream starting');
//
//         interval = setInterval(() => {
//             if (bufferIndex >= buffers.length) {
//                 bufferIndex = 0;
//             }
//
//             newStream.push(buffers[bufferIndex]);
//
//             bufferIndex++;
//         }, 300);
//     };
//
//     const stopStreaming = () => {
//         clearInterval(interval);
//         newStream.push(null);
//         newStream = null;
//
//         console.log('Stream stopped');
//     };
// };
//
// appWithStreams();
// import { Codec, StreamCamera } from 'pi-camera-connect';

const mjpegServerExpressWithCam = () => {
    const express = require('express');
    const bodyParser = require('body-parser');
    const mjpegServer = require('mjpeg-server');
    const app = express();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));

    const streamCamera = new StreamCamera({
        codec: Codec.MJPEG
    });

    app.get('/stream', (req: any, res: any) => {
        console.log('Got request');

        const videoStream = streamCamera.createStream();

        // const mjpegReqHandler = mjpegServer.createReqHandler(req, res);

        // streamCamera.startCapture().then(() => {
        //     console.log('start');
        //
        //     streamCamera.takeImage().then((buf: Buffer) => {
        //         console.log('image');
        //
        //         mjpegReqHandler.write(buf, () => {
        //             console.log('send');
        //             mjpegReqHandler.close();
        //
        //             streamCamera.stopCapture().then(() => {
        //                 console.log('stopped');
        //             });
        //         });
        //     }).catch(err => {
        //         console.log(err);
        //         streamCamera.stopCapture().then(() => {
        //             console.log('stopped err');
        //         });
        //     });
        // });

        streamCamera.startCapture().then(_ => {
            console.log('Stream started');
        });
        //

        // res.writeHead(200, {
        //     'Content-Type': 'multipart/x-mixed-replace; boundary=myboundary',
        //     'Cache-Control': 'no-cache',
        //     'Connection': 'close',
        //     'Pragma': 'no-cache'
        // });

        

        videoStream.pipe(res);
        // videoStream.on('data', (data: Buffer) => {
        // console.log(data);
        // mjpegReqHandler.write(data, () => {
        // });
        // });

        // videoStream.on('end', () => {
        // mjpegReqHandler.close();
        // res.close();
        // });
        //
        setTimeout(() => {
            streamCamera.stopCapture().then(_ => {
                console.log('Stream stopped');
            });
        }, 10000);
    });

    app.get('/status', (req: Request, res: Response) => {
        res.json({status: 'OK'});
    });

    app.listen(8080, () => {
        console.log(`Express app listening on port 8080!`);
    });
};

const mjpegServerExpress = () => {
    const express = require('express');
    const bodyParser = require('body-parser');
    const mjpegServer = require('mjpeg-server');
    const fs = require('fs');
    const app = express();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));

    app.get('/stream', (req: any, res: any) => {
        console.log('Got request');

        const mjpegReqHandler = mjpegServer.createReqHandler(req, res);

        let i = 0;

        const updateJPG = () => {
            fs.readFile(`./imgs/${i}.jpg`, sendJPGData);
            i++;
        };

        const sendJPGData = (err: any, data: any): void => {
            console.log(data);
            mjpegReqHandler.write(data, () => {
                checkIfFinished();
            });
        };

        const timer = setInterval(updateJPG, 1000);

        const checkIfFinished = () => {
            if (i > 20) {
                clearInterval(timer);
                mjpegReqHandler.close();
                console.log('End Request');
            }
        };
    });

    app.get('/status', (req: Request, res: Response) => {
        res.json({status: 'OK'});
    });

    app.listen(1234, () => {
        console.log(`Express app listening on port 1234!`);
    });
};

const mjpegServer = () => {
    const http = require('http');
    const fs = require('fs');
    const mjpegServer = require('mjpeg-server');

    http.createServer((req: any, res: any) => {
        console.log('Got request');

        const mjpegReqHandler = mjpegServer.createReqHandler(req, res);

        let i = 0;

        const updateJPG = () => {
            fs.readFile(`./imgs/${i}.jpg`, sendJPGData);
            i++;
        };

        const sendJPGData = (err: any, data: any): void => {
            mjpegReqHandler.write(data, () => {
                checkIfFinished();
            });
        };

        const timer = setInterval(updateJPG, 1000);

        const checkIfFinished = () => {
            if (i > 20) {
                clearInterval(timer);
                mjpegReqHandler.close();
                console.log('End Request');
            }
        };
    }).listen(12345, () => {
        console.log('Server started on 12345');
    });
};

// mjpegServer();
// mjpegServerExpress();
mjpegServerExpressWithCam();
