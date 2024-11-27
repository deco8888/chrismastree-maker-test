'use client'

import { Editor } from '../ui/Editor'

import style from './index.module.scss'

export default function CreatePage() {
	return (
		<div className={style.container}>
			<Editor />
		</div>
	)
}
