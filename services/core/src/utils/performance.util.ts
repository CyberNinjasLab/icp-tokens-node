import { performance } from 'perf_hooks';

export default class PerformanceUtil {

  private static instance: PerformanceUtil;

  public static getInstance(): PerformanceUtil {
    if (!PerformanceUtil.instance) {
      PerformanceUtil.instance = new PerformanceUtil();
    }

    return PerformanceUtil.instance;
  }

  public getPerformance(milliSeconds: number): string {
    return this.convertMilliSecondsToMinutesSeconds(performance.now() - milliSeconds);
  }
  
  public convertMilliSecondsToMinutesSeconds(milliSeconds: number): string {
    const minutes = Math.floor(milliSeconds / 60000);
    const seconds = Math.round((milliSeconds % 60000) / 1000);
  
    return seconds === 60
      ? `${minutes + 1}:00`
      : `${minutes}:${this.secondsTo2Digits(seconds)}`;
  }
  
  private secondsTo2Digits(seconds: number): string {
    return seconds.toString().padStart(2, '0');
  }

}
