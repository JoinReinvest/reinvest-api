export namespace Investments {
  export type Config = {
    database: {
      connectionString: string;
    };
  };

  export function boot(config: Config): void {
    // console.log(config);
  }
}
