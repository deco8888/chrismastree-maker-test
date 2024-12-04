'use client'

import { useContext, useEffect, useState } from 'react'

import { EditorContext, useEditor } from '~/hooks/useEditor'

import { AuthContext } from '~/components/functional/AuthProvider'

import { EditorPanel } from './Panel'
import { EditorPreview } from './Preview'
import { Loading } from '../Loading'

import style from './index.module.scss'

const MODEL_PATH = '/assets/models/christmasTree.glb'

export const Editor = () => {
	const { loading } = useContext(AuthContext)
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
			<div className={style.container}>
				{modelPath && !loading ? (
					<>
						{/* プレビュー */}
						<div className={style.preview}>
							<EditorPreview />
						</div>

						{/* パネル */}
						<div className={style.panel}>
							<EditorPanel />
						</div>
					</>
				) : (
					<Loading bg={true} />
				)}
			</div>
		</EditorContext.Provider>
	)
}
