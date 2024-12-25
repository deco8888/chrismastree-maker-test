'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Fragment, useContext, useEffect, useRef, useState } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { EditorContext } from '~/hooks/useEditor'
import { useFirestoreService } from '~/hooks/useFirestoreService'
import { GlobalContext } from '~/hooks/useGlobal'
import { useModalEvent } from '~/hooks/useModalEvent'

import { AuthContext } from '~/components/functional/AuthProvider'

import { convertDataUrlToFile } from '~/libs/convert'
import { TreeService } from '~/libs/firebase/service/tree'
import { uploadData } from '~/libs/firebase/storage'
import { TreeData, treeDataSchema } from '~/libs/schema/treeData'

import { notoSansJP } from '~/components/fonts'

import { DECORATIONS_BY_TYPE, TREE_COLORS } from '../data'

import style from './index.module.scss'

const HOSTING_URL = process.env.NEXT_PUBLIC_HOSTING_URL

/**
 *	EditorPanelのカスタムフック
 * @returns
 */
const useEditorPanel = () => {
	const context = useContext(EditorContext)
	const { user } = useContext(AuthContext)
	// 保存完了モーダルのコンテキスト
	const { saveCompleteContext } = useContext(GlobalContext)
	// Firestoreサービス
	const treeService = useFirestoreService(TreeService)

	const { open } = useModalEvent('save-complete-modal')

	// 送信中フラグ
	const [isSending, setIsSending] = useState<boolean>(false)
	const isSendingRef = useRef<boolean>(false)
	isSendingRef.current = isSending
	// キャプチャ保存フラグ
	const isSavingCaptureRef = useRef<boolean>(false)
	// ツリーの送信データ
	const [treeData, setTreeData] = useState<TreeData | null>(null)
	// ツリーID
	const [treeId, setTreeId] = useState<string | null>(null)

	// フォームメソッド
	const methods = useForm<TreeData>({
		resolver: zodResolver(treeDataSchema),
		defaultValues: {
			treeColor: context?.treeColor ?? '#00FF00',
			starColor: context?.starColor ?? '#FFCC00',
			decorationsByType: context?.decorationsByType ?? [],
		},
	})

	/*-------------------------------
		データ整形
	-------------------------------*/
	const formatData = (data: TreeData, previewImageUrl: string, treeUrl: string) => {
		const formattedData = {
			treeColor: data.treeColor,
			starColor: data.starColor,
			decorations: data.decorationsByType.map(d => ({
				slug: d.slug,
				count: d.count,
				setting: {
					color: d.setting?.color ?? null,
					size: Number(d.setting?.size?.toFixed(2)) ?? null,
				},
				list: d.list?.map(l => ({
					id: l.id,
					slug: d.slug,
					position: {
						x: Number(l.position.x.toFixed(2)),
						y: Number(l.position.y.toFixed(2)),
						z: Number(l.position.z.toFixed(2)),
					},
					rotation: l.rotation
						? {
								x: Number(l.rotation.x.toFixed(2)),
								y: Number(l.rotation.y.toFixed(2)),
								z: Number(l.rotation.z.toFixed(2)),
							}
						: null,
					objType: l.objType ?? null,
				})),
			})),
			previewImageUrl: previewImageUrl,
			treeUrl: treeUrl,
			createdAt: new Date(),
			updatedAt: new Date(),
		}

		return formattedData
	}

	/*-------------------------------
		ツリーデータ送信
	-------------------------------*/
	const submitHandler: SubmitHandler<TreeData> = async (data: TreeData) => {
		if (isSendingRef.current) return
		setIsSending(true)
		setTreeData(data)
		// キャプチャ画像を所望
		context?.setCaptureRequested(true)
	}

	/*-------------------------------
		プレビュー画像をアップロード
	-------------------------------*/
	const uploadPreviewImage = async (dataURL: string, userId: string) => {
		try {
			const file = await convertDataUrlToFile(dataURL, `preview_${Date.now()}.png`, 'image/png')

			if (file) {
				const path = `preview/${userId}/${file.name}`
				const imageUrl = await uploadData(path, file)
				return imageUrl
			}
			return null
		} catch (error) {
			console.error('Preview image upload error', error)
			throw new Error('プレビュー画像のアップロードに失敗しました')
		}
	}

	/*-------------------------------
		HTMLテンプレート取得
	-------------------------------*/
	const getHtmlTemplate = async () => {
		const templatePath =
			process.env.NODE_ENV === 'development' ? '/viewer/template.html' : `${HOSTING_URL}/viewer/template.html`

		try {
			const response = await fetch(templatePath)
			return await response.text()
		} catch (error) {
			console.error('Template load error', error)
			throw error
		}
	}

	/*-------------------------------
		HTMLコンテンツ生成
	-------------------------------*/
	const generateHtmlContent = async (data: TreeData) => {
		try {
			let template = await getHtmlTemplate()

			template = template
				.replace('VIEWER_URL', `${HOSTING_URL}/viewer/viewer.js`)
				// .replace('VIEWER_CSS_URL', `${HOSTING_URL}/viewer/viewer.css`)
				.replace('TREE_DATA_PLACEHOLDER', JSON.stringify(data))
			return template
		} catch (error) {
			console.error('HTML content generate error', error)
			throw error
		}
	}

	/*-------------------------------
		ツリーデータアップロード
	-------------------------------*/
	const uploadTreeData = async (data: TreeData, userId: string) => {
		const htmlContent = await generateHtmlContent(data)

		try {
			const path = `tree/${userId}/tree_${Date.now()}.html`
			const htmlBlob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
			const htmlUrl = await uploadData(path, htmlBlob)
			console.log(htmlUrl)
			return htmlUrl
		} catch (error) {
			console.error('Tree data upload error', error)
			throw new Error('ツリーデータのアップロードに失敗しました')
		}
	}

	/*-------------------------------
		ツリーデータ保存
	-------------------------------*/
	useEffect(() => {
		if (isSavingCaptureRef.current) return

		if (!treeData || !context?.capturedImage || context?.captureRequested || !user || !user.id) return
		const userId = user.id
		const captureUrl = context?.capturedImage

		const saveTreeData = async () => {
			isSavingCaptureRef.current = true

			try {
				const previewImageUrl = await uploadPreviewImage(captureUrl, userId)
				if (!previewImageUrl) {
					throw new Error('プレビュー画像のアップロードに失敗しました')
				}

				const treeUrl = await uploadTreeData(treeData, userId)
				if (!treeUrl) {
					throw new Error('ツリーデータのアップロードに失敗しました')
				}

				const treeSaveData = formatData(treeData, previewImageUrl, treeUrl)
				const result = await treeService.saveTree(treeSaveData, userId)

				if (result.success) {
					setTreeId(result.treeId)
					toast.success('ツリーを作成しました')
				} else {
					toast.error(result.error || '保存に失敗しました')
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : '更新に失敗しました'
				toast.error(errorMessage)
			} finally {
				setIsSending(false)
				isSavingCaptureRef.current = false
				context?.setCapturedImage(null) // キャプチャ保存データをリセット
				context?.setCaptureRequested(false) // キャプチャリクエストをリセット
			}
		}
		saveTreeData()
	}, [treeData, context?.capturedImage, context?.captureRequested])

	/*-------------------------------
		ツリーIDからデータ取得
	-------------------------------*/
	useEffect(() => {
		if (!treeId) return

		const fetchTreeData = async () => {
			try {
				const data = await treeService.getTreeData(treeId)

				if (data) {
					saveCompleteContext.dispatchEvent(data)
					open()
				} else {
					toast.error('保存データの取得に失敗しました')
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : '保存データの取得に失敗しました'
				toast.error(errorMessage)
			}
		}

		fetchTreeData()
	}, [treeId])

	return {
		context,
		methods,
		isSending,
		submitHandler,
	}
}

/**
 * 編集画面パネルコンポーネント
 * @returns
 */
export const EditorPanel = () => {
	const { context, methods, isSending, submitHandler } = useEditorPanel()

	return (
		<FormProvider {...methods}>
			<form className={style.container} onSubmit={methods.handleSubmit(submitHandler)}>
				<div className={style.inner}>
					{/* ツリー */}
					<div className={style.tree}>
						<p className={`${style.tree_title} ${notoSansJP.className}`}>ツリー</p>
						<ul className={style.tree_colors}>
							{TREE_COLORS.map((color, i) => (
								<li className={style.tree_colors_item} key={i}>
									<button
										type="button"
										onClick={() => context?.setTreeColor(color.code)}
										className={style.tree_colors_btn}
										aria-label={color.label}
										style={{ backgroundColor: color.code }}
										data-selected={context?.treeColor === color.code}
									></button>
								</li>
							))}
						</ul>
					</div>

					{/* 装飾 */}
					<div className={style.decoration}>
						<ul className={style.decoration_list}>
							{DECORATIONS_BY_TYPE.map((decoration, i) => (
								<li className={style.decoration_item} key={i}>
									<button
										type="button"
										onClick={() => context?.setSelectedDecoration(decoration)}
										className={style.decoration_item_btn}
										aria-label={decoration.label}
										data-selected={context?.selectedDecoration?.slug === decoration.slug}
									>
										{decoration.slug}
									</button>
								</li>
							))}
						</ul>
						{DECORATIONS_BY_TYPE.map(decoration => {
							if (context?.selectedDecoration?.slug !== decoration.slug) return null
							return <Fragment key={decoration.slug}>{decoration.controller}</Fragment>
						})}
					</div>

					{/* 保存ボタン */}
					<button type="submit" disabled={isSending} className={`${style.saveButton} ${notoSansJP.className}`}>
						{isSending ? '保存中...' : '保存する'}
					</button>
				</div>
			</form>
		</FormProvider>
	)
}
