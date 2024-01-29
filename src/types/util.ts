export type Simplify<T> = DrainOuterGeneric<{ [K in keyof T]: T[K] } & {}>;

export type DrainOuterGeneric<T> = [T] extends [unknown] ? T : never;
