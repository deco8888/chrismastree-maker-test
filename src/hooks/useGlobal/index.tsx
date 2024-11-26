'use client'

import React, { useState } from 'react'
import EventEmitter from 'wolfy87-eventemitter'

import { getUserAgent } from '~/libs/getUserAgent'

type GlobalContextProps = ReturnType<typeof useGlobal>

export const GlobalContext = React.createContext<GlobalContextProps>({
	eventEmitter: undefined,
	ua: undefined,
})

export const useGlobal = () => {
	const [eventEmitter] = useState<EventEmitter | undefined>(new EventEmitter())
	const [ua] = useState(getUserAgent())
	return {
		eventEmitter: eventEmitter ?? undefined,
		ua: ua ?? undefined,
	}
}
