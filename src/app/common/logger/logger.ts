import { LogLevel } from './log-level.enum';
import { ILogger } from './logger.interface';


export class Logger implements ILogger {
  private readonly logLevelMap = new Map([
    [LogLevel.Debug, 4],
    [LogLevel.Info, 3],
    [LogLevel.Warn, 2],
    [LogLevel.Error, 1],
  ]);


  public constructor(private readonly logLevel: LogLevel, private readonly instancePrefix: string) {
  }

  public error(msg: () => string, prefix?: string): void {
    const level = LogLevel.Error;
    this.writeLog(msg, level, s => this.logError(s), prefix);
  }

  public warning(msg: () => string, prefix?: string): void {
    const level = LogLevel.Warn;
    this.writeLog(msg, level, s=>this.logWarning(s), prefix);
  }

  public info(msg: () => string, prefix?: string): void {
    const level = LogLevel.Info;
    this.writeLog(msg, level, s=> this.logInfo(s), prefix);
  }

  public debug(msg: () => string, prefix?: string): void {
    const level = LogLevel.Debug;
    this.writeLog(msg, level, s => this.logDebug(s), prefix);
  }

  public time(msg: () => string, prefix?: string): void {
    if (this.logLevelFulfilled(LogLevel.Debug)) {
      // eslint-disable-next-line no-console
      console.time(`${ this.getPrefix(prefix) } | ${ msg() }`.trim());
    }
  }

  public timeEnd(msg: () => string, prefix?: string): void {
    if (this.logLevelFulfilled(LogLevel.Debug)) {
      // eslint-disable-next-line no-console
      console.timeEnd(`${ this.getPrefix(prefix) } | ${ msg() }`.trim());
    }
  }

  private writeLog(msg: () => string, level: LogLevel, loggingFunction: (msg: string) => void, prefix?: string): void {
    if (this.logLevelFulfilled(level)) {
      const log = this.formatLog(msg(), level, prefix);
      loggingFunction(log);
    }
  }


  private logInfo(log: string): void {
    // eslint-disable-next-line no-console
    console.log(log);
  }

  private logDebug(log: string): void {
    // eslint-disable-next-line no-console
    console.debug(log);
  }

  private logWarning(log: string): void {
    // eslint-disable-next-line no-console
    console.warn(log);
  }

  private logError(log: string): void {
    // eslint-disable-next-line no-console
    console.error(log);
  }

  private logLevelFulfilled(level: LogLevel): boolean {
    const currentLogLevel = (this.logLevelMap.get(this.logLevel) ?? this.logLevelMap.get(LogLevel.Debug)) ?? 0;
    const logMsgLevel = this.logLevelMap.get(level) as number;
    return currentLogLevel >= logMsgLevel;
  }

  private formatLog(message: string, level: LogLevel, prefix?: string): string {
    const dt = new Date();
    const timestampDate = dt.getFullYear().toString() + (dt.getMonth() + 1).toString().padStart(2, '0') + dt.getDate().toString().padStart(2, '0');
    const timestampHours = dt.getHours().toString().padStart(2, '0') + dt.getMinutes().toString().padStart(2, '0') + dt.getSeconds().toString().padStart(2, '0') + '.' + dt.getMilliseconds();
    const timestamp = `${ timestampDate }-${ timestampHours }`;
    const levelPadMaxLength = Math.max(...Object.values(LogLevel).map(l => l.length));
    const formattedLogLevel = level.toUpperCase().padEnd(levelPadMaxLength, ' ');
    prefix = prefix?.trim().replace(/\s/g, '-').toUpperCase();
    const formattedLogMsg = `${ this.getPrefix(prefix) } | ${ message }`.trim();
    return `${ timestamp } | ${ formattedLogLevel } | ${ formattedLogMsg }`;
  }

  private getPrefix(localPrefix?: string): string {
    return localPrefix || this.instancePrefix;
  }
}
