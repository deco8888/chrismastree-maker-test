'use client'
import { useContext } from 'react'

import { EditorContext } from '~/hooks/useEditor'

import { notoSansJP } from '~/components/fonts'

import { DECORATIONS_BY_TYPE, TREE_COLORS } from '../data'
import { DecorationController } from '../DecorationPreview/Controller'

import style from './index.module.scss'

export const EditorPanel = () => {
	const context = useContext(EditorContext)

	return (
		<div className={style.container}>
			<div className={style.inner}>
				<div className={style.tree}>
					<p className={`${style.tree_title} ${notoSansJP.className}`}>ツリー</p>
					<ul className={style.tree_colors}>
						{TREE_COLORS.map((color, i) => (
							<li className={style.tree_colors_item} key={i}>
								<button
									onClick={() => context?.setTreeColor(color.code)}
									className={style.tree_colors_btn}
									aria-label={color.label}
									style={{ backgroundColor: color.code }}
								></button>
							</li>
						))}
					</ul>
				</div>

				<div className={style.decoration}>
					<ul className={style.decoration_list}>
						{DECORATIONS_BY_TYPE.map((decoration, i) => (
							<li className={style.decoration_item} key={i}>
								<button
									onClick={() => context?.setSelectedDecoration(decoration)}
									className={style.decoration_item_btn}
									aria-label={decoration.label}
								>
									{decoration.slug}
								</button>
							</li>
						))}
					</ul>
					{context?.selectedDecoration && <DecorationController />}
				</div>
			</div>
		</div>
	)
}
