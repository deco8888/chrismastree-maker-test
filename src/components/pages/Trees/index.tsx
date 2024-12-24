'use client'

import { useContext } from 'react'

import { AuthContext } from '../../functional/AuthProvider'

import style from './index.module.scss'

export default function TreesPage() {
	const { user, loading } = useContext(AuthContext)

	return (
		<div className={style.container}>
			<div className={style.inner}></div>
		</div>
	)
}
