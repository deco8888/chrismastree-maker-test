'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useContext, useEffect } from 'react'

import { GlobalContext } from '../useGlobal'

export const useModalManager = () => {
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const { eventEmitter } = useContext(GlobalContext)
	useEffect(() => {
		const clearModal = () => {
			if (eventEmitter) {
				eventEmitter.emit(`modalCheck`, [''])
			}
		}
		clearModal()
	}, [pathname, searchParams, eventEmitter])
}
