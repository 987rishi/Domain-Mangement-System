"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpTransport = void 0;
const winston_transport_1 = __importDefault(require("winston-transport"));
const axios_1 = __importDefault(require("axios"));
class HttpTransport extends winston_transport_1.default {
    constructor(opts) {
        super(opts);
        this.url = opts.url;
    }
    log(info, callback) {
        setImmediate(() => __awaiter(this, void 0, void 0, function* () {
            this.emit("logged", info);
            try {
                yield axios_1.default.post(this.url, info);
            }
            catch (error) {
                // To prevent an infinite loop if the logging service is down,
                // we log this error to the console instead of using the logger itself.
                console.error("Failed to send log to logging service:", error);
            }
        }));
        callback();
    }
}
exports.HttpTransport = HttpTransport;
