export const JSONResponse = (data: unknown, options?: any) => {
  options.status = options.status ?? 200;

  if (options.headers === undefined) options.headers = {};
  options.headers["Content-Type"] =
    options.headers?.["Content-Type"] ?? "application/json";

  return new Response(JSON.stringify(data), options);
};
