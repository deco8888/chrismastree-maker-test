'use client'

import { EditorContext, useEditor } from '~/hooks/useEditor'

import { DECORATIONS_BY_TYPE, TREE_COLORS } from './data'
import { DecorationController } from './DecorationPreview/Controller'
import { ChristmasTree } from './Model'

import style from './index.module.scss'

export const Editor = () => {
	const context = useEditor()

	return (
		<EditorContext.Provider value={context}>
			<div className={style.container}>
				{/* モデル */}
				<div className={style.model}>
					<ChristmasTree />
				</div>

				{/* パネル */}
				<div className={style.panel}>
					<ul className={style.panel_colors}>
						{TREE_COLORS.map((color, i) => (
							<li className={style.panel_colors_item} key={i}>
								<button
									onClick={() => context?.setTreeColor(color.code)}
									className={style.panel_colors_btn}
									aria-label={color.label}
									style={{ backgroundColor: color.code }}
								>
									{color.label}
								</button>
							</li>
						))}
					</ul>

					<div>
						<ul className={style.decoration}>
							{DECORATIONS_BY_TYPE.map((decoration, i) => (
								<li className={style.decoration_item} key={i}>
									<button
										onClick={() => context?.setSelectedDecoration(decoration)}
										className={style.colors_item_btn}
										aria-label={decoration.label}
									>
										{decoration.slug}
									</button>
								</li>
							))}
						</ul>
						<DecorationController />
					</div>
				</div>
			</div>
		</EditorContext.Provider>
	)
}
