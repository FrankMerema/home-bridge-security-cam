#!/usr/bin/env node

// require('./server').start();


import * as fs from 'fs';
import { Codec, StillCamera, StreamCamera } from 'pi-camera-connect';

// Take still image and save to disk
const runApp = async () => {

    const stillCamera = new StillCamera();

    const image = await stillCamera.takeImage();

    fs.writeFileSync('still-image.jpg', image);
};

const runApp1 = async () => {

    const streamCamera = new StreamCamera({
        codec: Codec.MJPEG
    });

    const videoStream = streamCamera.createStream();

    const writeStream = fs.createWriteStream('video-stream.mjpeg');

    // Pipe the video stream to our video file
    videoStream.pipe(writeStream);

    await streamCamera.startCapture();

    // We can also listen to data events as they arrive
    videoStream.on('data', (data: any) => console.log('New data', data));
    videoStream.on('end', (data: any) => console.log('Video stream has ended'));

    // Wait for 5 seconds
    await new Promise(resolve => setTimeout(() => resolve(), 5000));

    await streamCamera.stopCapture();
};

runApp();
runApp1();
