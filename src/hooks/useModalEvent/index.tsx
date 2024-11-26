import { useContext } from 'react'

import { GlobalContext } from '../useGlobal'

export const useModalEvent = (id: string) => {
	const { eventEmitter } = useContext(GlobalContext)

	const open = () => {
		if (eventEmitter) {
			eventEmitter.emit(`${id}.open`)
			eventEmitter.emit(`modalCheck`, [id])
		}
	}

	const close = () => {
		if (eventEmitter) {
			eventEmitter.emit(`${id}.close`)
		}
	}

	return { open, close }
}
