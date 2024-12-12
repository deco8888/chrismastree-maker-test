'use client'

import React, { useState } from 'react'
import EventEmitter from 'wolfy87-eventemitter'

import { getUserAgent } from '~/libs/getUserAgent'

type GlobalContextProps = ReturnType<typeof useGlobal>

export const GlobalContext = React.createContext<GlobalContextProps>({
	eventEmitter: undefined,
	ua: undefined,
	saveCompleteContext: {
		state: undefined,
		dispatchEvent: () => {},
	},
})

export const useGlobal = () => {
	const [eventEmitter] = useState<EventEmitter | undefined>(new EventEmitter())
	const [ua] = useState(getUserAgent())
	const [saveCompleteContext, setSaveCompleteContext] = useState<any>()

	return {
		eventEmitter: eventEmitter ?? undefined,
		ua: ua ?? undefined,
		saveCompleteContext: {
			state: saveCompleteContext,
			dispatchEvent: setSaveCompleteContext,
		},
	}
}
