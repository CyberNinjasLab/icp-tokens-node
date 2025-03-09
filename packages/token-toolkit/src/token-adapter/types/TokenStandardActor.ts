import { DIP20, EXT, ICRC1 } from "../actors";
export type DIP20Actor = DIP20._SERVICE;
export type ICRC1Actor = ICRC1._SERVICE;
export type ExtActor = EXT._SERVICE;
export type TokenActor = DIP20Actor | ICRC1Actor | ExtActor;