import cookieParser = require('cookie-parser');
import RateLimit = require('express-rate-limit');
import session = require('express-session');
import helmet = require('helmet');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

export function start() {
    const port = 8080;

    const limiter = new RateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        delayMs: 0 // disable delaying - full speed until the max limit is reached
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

    app.listen(port, () => {
        console.log(`Express app listening on port ${port}!`);
    });
}
