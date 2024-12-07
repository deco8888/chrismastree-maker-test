'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Fragment, useContext, useRef, useState } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { EditorContext } from '~/hooks/useEditor'
import { useFirestoreService } from '~/hooks/useFirestoreService'

import { AuthContext } from '~/components/functional/AuthProvider'

import { TreeService } from '~/libs/firebase/service/tree'
import { TreeData, treeDataSchema } from '~/libs/schema/treeData'

import { notoSansJP } from '~/components/fonts'

import { DECORATIONS_BY_TYPE, TREE_COLORS } from '../data'

import style from './index.module.scss'

const useEditorPanel = () => {
	const context = useContext(EditorContext)
	const { user } = useContext(AuthContext)
	const treeService = useFirestoreService(TreeService)

	// 送信中フラグ
	const [isSending, setIsSending] = useState<boolean>(false)
	const isSendingRef = useRef<boolean>(false)
	isSendingRef.current = isSending

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
		ツリーデータ送信
	-------------------------------*/
	const submitHandler: SubmitHandler<TreeData> = async (data: TreeData) => {
		if (isSendingRef.current || !user || !user.id) return
		setIsSending(true)

		try {
			const result = await treeService.saveTree(data, user.id)

			if (result.success) {
				toast.success('ツリーを保存しました')
				// 必要に応じてリダイレクトなど
				// router.push(`/trees/${result.treeId}`);
			} else {
				toast.error(result.error || '保存に失敗しました')
			}
			setIsSending(false)
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : '更新に失敗しました'
			toast.error(errorMessage)
			setIsSending(false)
		}
	}

	return {
		context,
		methods,
		isSending,
		submitHandler,
	}
}

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
