import ky, { type Options } from "ky";

export const api = {
  get: <TResponse>(url: string, opt?: Options) =>
    ky.get(url, opt).json<TResponse>(),
  post: <TResponse>(url: string, opt?: Options) =>
    ky.post(url, opt).json<TResponse>(),
};
