import { clearAllBodyScrollLocks, disableBodyScroll } from 'body-scroll-lock'
import { RefObject, useEffect } from 'react'

export function useDisableScroll(ref: RefObject<HTMLElement>, isOpen: boolean): void {
	useEffect(() => {
		if (!isOpen || ref.current === null) {
			return
		}

		disableBodyScroll(ref.current, {
			allowTouchMove: el => {
				let elm: HTMLElement | Element | null = el
				while (elm && elm !== document.body) {
					if (elm.getAttribute('data-ignore-scroll-lock') !== null) {
						return true
					}
					elm = elm.parentElement
				}
				return false
			},
		})

		const scrollpos = window.pageYOffset
		document.body.style.top = scrollpos * -1 + 'px'

		return clearAllBodyScrollLocks
	}, [ref, isOpen])
}
