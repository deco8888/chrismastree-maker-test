import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useContext, useEffect, useRef, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { useFirestoreService } from '~/hooks/useFirestoreService'
import { GlobalContext } from '~/hooks/useGlobal'

import { TreeService } from '~/libs/firebase/service/tree'
import { treeTextDataSchema, TreeTextData } from '~/libs/schema/treeData'

import Modal from '..'

import style from './style.module.scss'

const modalId = 'save-complete-modal'

export const SaveCompleteModal = () => {
	const router = useRouter()
	const { saveCompleteContext } = useContext(GlobalContext)
	const data = saveCompleteContext.state
	// Firestoreサービス
	const treeService = useFirestoreService(TreeService)

	// 送信中フラグ
	const [isSending, setIsSending] = useState<boolean>(false)
	const isSendingRef = useRef<boolean>(false)
	isSendingRef.current = isSending

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<TreeTextData>({
		resolver: zodResolver(treeTextDataSchema),
	})

	useEffect(() => {
		console.log('SaveCompleteModal', data)
	}, [data])

	/*-------------------------------
		ニックネーム・コメントの送信
	-------------------------------*/
	const submitHandler: SubmitHandler<TreeTextData> = async (treeTextData: TreeTextData) => {
		if (isSendingRef.current || data == undefined || !data.treeId) return
		setIsSending(true)

		try {
			await treeService.updateTreeData(data.treeId, treeTextData)
			toast.success('クリスマスツリーを登録しました！', {
				duration: 2000,
				onDismiss: () => {
					close()
					router.push('/trees')
				},
			})
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : '登録に失敗しました'
			toast.error(errorMessage)
		} finally {
			setIsSending(false)
		}
	}

	return (
		<Modal id={modalId} options={{ 'aria-labelledby': modalId, 'aria-describedby': modalId }}>
			<div className={style.container}>
				{data && (
					<div className={style.scroll}>
						<div className={style.inner}>
							<h2 className={style.title}>
								{'Complete!!'.split('').map((char, i) => {
									return (
										<span className={style.title_splitChar} data-char={(i % 3) + 1} key={i}>
											{char}
										</span>
									)
								})}
							</h2>
							<form className={style.form} onSubmit={handleSubmit(submitHandler)}>
								{/* ニックネーム */}
								<div className={style.form_block}>
									<label htmlFor="nickname" className={style.form_label}>
										ニックネーム
										{errors?.nickname?.message && <span className={style.form_error}>※ {errors.nickname.message}</span>}
									</label>
									<input
										id="nickname"
										type="text"
										{...register('nickname')}
										className={style.form_input}
										placeholder="くたくん"
									/>
								</div>
								{/* コメント */}
								<div className={style.form_block}>
									<label htmlFor="comment" className={style.form_label}>
										コメント
									</label>
									<textarea
										id="comment"
										{...register('comment')}
										className={style.form_textarea}
										maxLength={100}
										rows={3}
										placeholder="メリクリ〜！"
									/>
								</div>

								<figure className={style.previewImage}>
									{data.previewImageUrl && <img src={data.previewImageUrl} alt="preview" />}
								</figure>

								<button type="submit" className={style.saveButton}>
									クリスマスツリーを登録する
								</button>
							</form>
						</div>
					</div>
				)}
			</div>
		</Modal>
	)
}
