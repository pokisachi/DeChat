declare module 'argon2-browser' {
  export interface Argon2BrowserOptions {
    pass: string | Uint8Array;
    salt: string | Uint8Array;
    opts?: {
      time?: number;
      mem?: number;
      hashLen?: number;
      parallelism?: number;
      type?: number;
    };
  }

  export interface Argon2Result {
    hash: Uint8Array;
    hashHex: string;
    encoded: string;
  }

  export function argon2i(options: Argon2BrowserOptions): Promise<Argon2Result>;
  export function argon2d(options: Argon2BrowserOptions): Promise<Argon2Result>;
  export function argon2id(options: Argon2BrowserOptions): Promise<Argon2Result>;
}