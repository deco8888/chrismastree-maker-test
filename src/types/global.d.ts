declare global {
	interface Window {
		dataLayer: any
	}
}

type valueOf<T> = T[keyof T]

type Undefineder<T> = {
	[P in keyof T]?: T[P]
}

type HooksContext<T> = Undefineder<ReturnType<T>>