/* T1とT2が構造的に同じなら true、違えばfalse */
type IsSame<T1, T2> = (<T>() => T extends T1 ? 1 : 2) extends <T>() => T extends T2 ? 1 : 2 ? true : false;

// readonlyを削除
type RemoveReadonlyProperty<T> = Pick<T, {
	[K in keyof T]-?:IsSame<
	{ [K2 in K]: T[K2] },
	{ -readonly [K2 in K]: T[K2] }
	> extends true ? K : never;
}[keyof T]>;

type RemoveFunction<T> = Pick<T, {
    [K in keyof T]-?: T[K] extends Function ? never : K;
}[keyof T]>;