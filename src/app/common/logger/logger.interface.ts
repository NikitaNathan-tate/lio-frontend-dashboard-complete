export interface ILogger {
  error(msg: () => string, prefix?: string): void;
  warning(msg: () => string, prefix?: string): void;
  info(msg: () => string, prefix?: string): void;
  debug(msg: () => string, prefix?: string): void;

  time(msg: () => string, prefix?: string): void;
  timeEnd(msg: () => string, prefix?: string): void;
}
