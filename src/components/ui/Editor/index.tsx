'use client'

import { useContext, useEffect, useRef, useState } from 'react'

import { EditorContext, useEditor } from '~/hooks/useEditor'

import { AuthContext } from '~/components/functional/AuthProvider'

import { loadModelsUrl } from '~/libs/loadModels'

import { MODEL_DATA } from './data'
import { EditorPanel } from './Panel'
import { EditorPreview } from './Preview'
import { Loading } from '../Loading'

import style from './index.module.scss'

/**
 * 編集画面コンポーネント
 * @returns
 */
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

/**
 * 編集画面
 * @returns
 */
export const Editor = () => {
	const { loading } = useContext(AuthContext)

	const [modelUrl, setModelUrl] = useState<any | null>(null)
	const isLoading = useRef<boolean>(false)

	/*-------------------------------
		モデルを読み込む
	-------------------------------*/
	useEffect(() => {
		;(async () => {
			if (isLoading.current == false) {
				isLoading.current = true

				const modelsUrl = await loadModelsUrl(MODEL_DATA)
				setModelUrl(modelsUrl)
				isLoading.current = false
			}
		})()
	}, [])

	if (modelUrl == null || loading) return <Loading bg={true} isFixed={true} />

	return <EditorComponent />
}
