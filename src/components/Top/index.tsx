'use client'

import Link from 'next/link'

import style from './index.module.scss'

export default function TopPage() {
	return (
		<div className={style.container}>
			<h2 className={style.title}>Christmas Tree Maker</h2>

			<div className={style.start}>
				<Link href="/create">START</Link>
			</div>
		</div>
	)
}
