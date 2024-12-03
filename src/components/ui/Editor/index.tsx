'use client'

import { useEffect, useState } from 'react'

import { EditorContext, useEditor } from '~/hooks/useEditor'

import { EditorPanel } from './Panel'
import { EditorPreview } from './Preview'

import style from './index.module.scss'

const MODEL_PATH = '/assets/models/christmasTree.glb'

export const Editor = () => {
	const context = useEditor()
	const [modelPath, setModelPath] = useState<string | null>(null)

	/*-------------------------------
		モデルを読み込む
	-------------------------------*/
	useEffect(() => {
		const loadModel = async () => {
			try {
				const response = await fetch(MODEL_PATH)
				const blob = await response.blob()
				const url = URL.createObjectURL(blob)
				setModelPath(url)
			} catch (error) {
				console.error('Error loading model:', error)
			}
		}

		loadModel()
	}, [])

	return (
		<EditorContext.Provider value={context}>
			{modelPath ? (
				<div className={style.container}>
					{/* プレビュー */}
					<div className={style.preview}>
						<EditorPreview />
					</div>

					{/* パネル */}
					<div className={style.panel}>
						<EditorPanel />
					</div>
				</div>
			) : (
				<div>Loading...</div>
			)}
		</EditorContext.Provider>
	)
}
