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

import { TreeService } from '~/libs/firebase/service/tree'
import { TreeData, treeDataSchema } from '~/libs/schema/treeData'

import { notoSansJP } from '~/components/fonts'

import { DECORATIONS_BY_TYPE, TREE_COLORS } from '../data'

import style from './index.module.scss'

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
	const formatData = (data: TreeData, captureUrl: string) => {
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
			previewUrl: captureUrl,
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
				const treeSaveData = formatData(treeData, captureUrl)
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
