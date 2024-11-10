import { InspectOptions } from "util";

class Logger {

  public static instance: Logger = new Logger();

  public emailFunction!: Function | null;

  private dateFormatOptions: Intl.DateTimeFormatOptions = {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Europe/Sofia',
  };

  public info(message: string, color: string = '37'): void {
    const logMessage = `\x1b[32m${this.getTime()}\x1b[0m ` + `\x1b[${color}m${message}\x1b[0m`;
  
    console.log(logMessage);
  }

  public error(message: string, source: string, sendEmail: boolean = true, color: string = '37'): void {
    const logMessage = `\x1b[31m${this.getTime()}\x1b[0m ` + `\x1b[${color}m${source}` + ` \u2728  ${message}\x1b[0m`;

    if(sendEmail) {
      if(this.emailFunction) {
        this.emailFunction(source, message);
      } else {
        this.error("emailFunction is not set", "LoggerUtil -> emailFunction", false);
      }
  
    }
  
    console.log(logMessage);
  }

  public debug(obj: any, options?: InspectOptions): void {
    const debugOptions = {
      depth: null, 
      breakLength: 250
    }

    const mergedOptions = { ...debugOptions, ...options}

    console.dir(obj, mergedOptions);
  }

  private getTime(): string {
    const currentTime = new Date();

    return `[${currentTime.toLocaleString('en', this.dateFormatOptions)}]`;
  }

}

declare global {
  var logger: Logger;
}

globalThis.logger = Logger.instance;
export default globalThis.logger;
