export class HttpException extends Error {

  constructor(status: number, message: string, source?: string, sendEmail: boolean = false) {
    super(message);
  
    this.status = status;
    this.message = message;

    if (source) {
      this.source = source;
      this.sendEmail = sendEmail;
    }
  }

  public status: number;
  public message: string;
  public source?: string;
  public sendEmail?: boolean;

}
