import Transport from "winston-transport";
import axios from "axios";

interface HttpTransportOptions extends Transport.TransportStreamOptions {
  url: string;
}

export class HttpTransport extends Transport {
  private readonly url: string;

  constructor(opts: HttpTransportOptions) {
    super(opts);
    this.url = opts.url;
  }

  log(info, callback: () => void) {
    setImmediate(async () => {
      this.emit("logged", info);

      try {
        await axios.post(this.url, info);
      } catch (error) {
        // To prevent an infinite loop if the logging service is down,
        // we log this error to the console instead of using the logger itself.
        console.error("Failed to send log to logging service:", error);
      }
    });

    callback();
  }
}
