'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useContext, useEffect } from 'react'

import { Loading } from '~/components/ui/Loading'

import { AuthContext } from '../AuthProvider'

type AuthGuardProps = {
	children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
	const { user, loading } = useContext(AuthContext)
	const router = useRouter()
	const pathname = usePathname()

	/*---------------------------------
	  ユーザーがログインしていない場合、ログインページにリダイレクト
	 --------------------------------*/
	useEffect(() => {
		if (!loading && !user) {
			router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
		}
	}, [user, loading, router])

	if (loading) {
		return <Loading bg={true} />
	}

	if (!user) {
		return null
	}

	return <>{children}</>
}
