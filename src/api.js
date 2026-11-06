import { invoke as mockInvoke } from "./mock.js";

const tauri = window.__TAURI__?.core;

/** Call a Rust command by its name; outside Tauri (plain browser) use sample data. */
export const call = (cmd, args) => (tauri ? tauri.invoke(cmd, args) : mockInvoke(cmd, args));
