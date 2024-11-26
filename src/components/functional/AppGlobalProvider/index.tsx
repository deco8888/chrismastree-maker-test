'use client'

import { GlobalContext, useGlobal } from '~/hooks/useGlobal'
import { useModalManager } from '~/hooks/useModalManager'

type Props = {
	children: React.ReactNode
}

export default function AppGlobalProvider({ children }: Props) {
	const globalContext = useGlobal()
	useModalManager()
	return <GlobalContext.Provider value={globalContext}>{children}</GlobalContext.Provider>
}
