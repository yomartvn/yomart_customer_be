import { IRoute } from "@core/interfaces";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import errorMiddleware from "@core/middleware/error.middleware";
import Logger from "@core/utils/logger";
import path from "path";
const multer = require('multer');
import database from "@core/config/database";
import * as fs from 'fs';
import * as https from 'https';
import messages from "@core/config/constants";
import { setupSwagger } from "./swagger";

class App {
    public app: express.Application
    public port: number | string
    public environment: string
    public https_config_path: string

    constructor(routes: IRoute[]) {
        this.environment = this.envConfig();
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.https_config_path = process.env.HTTPS_CONFIG_PATH || "";
        this.connectMySql();
        this.initialMiddlewares()
        this.initialRoutes(routes)
        setupSwagger(this.app, "/api-docs")
        this.initializeNotFoundMiddleware()
        this.initialErrorMidlleware()
    }
    private async initialRoutes(routes: IRoute[]) {
        routes.forEach(route => {
            this.app.use(process.env.API_VERSION!, route.router)
        })
    }
    public listen() {
        if (this.environment === 'production') { // config sv SSL
            // const privateKey = fs.readFileSync('/etc/letsencrypt/live/crmsv.optechdemo.com/privkey.pem');
            // const certificate = fs.readFileSync('/etc/letsencrypt/live/crmsv.optechdemo.com/fullchain.pem');
            // const privateKey = fs.readFileSync(path.join(__dirname, '../certs/privkey.pem'), 'utf8');
            // const certificate = fs.readFileSync(path.join(__dirname, '../certs/fullchain.pem'), 'utf8');
            const privateKey = fs.readFileSync(`${this.https_config_path}privkey.pem`);
            const certificate = fs.readFileSync(`${this.https_config_path}fullchain.pem`);
            const credentials = { key: privateKey, cert: certificate };

            const httpsServer = https.createServer(credentials, this.app);
            httpsServer.listen(this.port, () => Logger.info(`Server is running on port ${this.port}`));
        } else { // config sv none SSL
            this.app.listen(this.port, () => {
                Logger.info(`Server is running on port ${this.port}`)
            })
        }
    }
    private initialMiddlewares() {
        if (this.environment === 'production') {
            this.app.use(morgan('combined'))
            this.app.use(cors({ origin: true, credentials: true }))
            this.app.use(helmet({
                crossOriginResourcePolicy: false,
            }))
            this.app.use(hpp())
        } else {
            this.app.use(morgan('dev'))
            this.app.use(cors({ origin: true, credentials: true }))
        }
        this.app.use(express.json())
        this.app.use(express.urlencoded({ extended: true }))
        this.app.use('/uploads', express.static(path.resolve('uploads/')));
    }
    private initialErrorMidlleware() {
        this.app.use(errorMiddleware);
        this.app.use(multer().single('file'));
    }
    private connectMySql() {
        database.connectDB();
    }
    private envConfig() {
        const env = (process.env.NODE_ENV || 'development').trim();
        require('dotenv').config({ path: path.resolve(process.cwd(), `.env_${env}`) });
        return env;
    }
    private initializeNotFoundMiddleware() {
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            res.status(404).json({
                statusCode: 404,
                message: messages.ROUTE_NOT_FOUND
            });
        });
    }
}

export default App;