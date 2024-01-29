export type ResponseTypeGenerator<T extends (...args: any) => any> = Exclude<
  Awaited<ReturnType<T>>,
  { ok: boolean; code: number }
>;

export type ResponseDataGenerator<T extends (...args: any) => any> = Exclude<
  ResponseTypeGenerator<T>["data"],
  undefined
>;
