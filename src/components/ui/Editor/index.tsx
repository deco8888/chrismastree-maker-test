'use client'

import { useContext, useEffect, useRef, useState } from 'react'

import { EditorContext, useEditor } from '~/hooks/useEditor'

import { AuthContext } from '~/components/functional/AuthProvider'

import { EditorPanel } from './Panel'
import { EditorPreview } from './Preview'
import { Loading } from '../Loading'

import style from './index.module.scss'

const MODEL_PATH = '/assets/models/christmasTree.glb'

const EditorComponent = () => {
	const context = useEditor()

	return (
		<EditorContext.Provider value={context}>
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
		</EditorContext.Provider>
	)
}

export const Editor = () => {
	const { loading } = useContext(AuthContext)
	const [modelPath, setModelPath] = useState<string | null>(null)
	const isLoading = useRef<boolean>(false)

	/*-------------------------------
		モデルを読み込む
	-------------------------------*/
	useEffect(() => {
		if (modelPath !== null || isLoading.current == true) return
		isLoading.current = true

		const loadModel = async () => {
			try {
				const response = await fetch(MODEL_PATH)
				const blob = await response.blob()
				const url = URL.createObjectURL(blob)
				setModelPath(url)
				isLoading.current = false
			} catch (error) {
				console.error('Error loading model:', error)
				isLoading.current = false
			}
		}

		loadModel()
	}, [])

	if (modelPath == null || loading) return <Loading bg={true} />

	return <EditorComponent />
}
