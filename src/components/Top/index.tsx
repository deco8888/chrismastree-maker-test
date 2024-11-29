'use client'

import Link from 'next/link'

import { anton } from '../fonts'

import style from './index.module.scss'

export default function TopPage() {
	return (
		<div className={style.container}>
			<div className={style.inner}>
				<h2 className={`${style.title} ${anton.className}`}>
					{'Christmas Tree'.split('').map((char, i) => {
						return (
							<span className={style.title_splitChar} data-char={(i % 3) + 1} key={i}>
								{char}
							</span>
						)
					})}
					<br />
					<span className={style.title_char}>Maker</span>
				</h2>

				<div className={`${style.start} ${anton.className}`}>
					<Link href="/create">START</Link>
				</div>
			</div>
		</div>
	)
}
