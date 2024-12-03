import { DecorationsByType } from '~/types/editor'

import { BallController } from './Panel/Controller/Ball'
import { CandyController } from './Panel/Controller/Candy'

export const TREE_COLORS = [
	{
		slug: 'green',
		code: '#28904B',
		label: '緑',
	},
	{
		slug: 'yellow-green',
		code: '#4e9b5f',
		label: '黄緑',
	},
	{
		slug: 'blue',
		code: '#0586A3',
		label: '青',
	},
]

export const DECORATIONS_BY_TYPE: DecorationsByType[] = [
	{
		slug: 'ball',
		path: 'ball.glb',
		label: 'ボール',
		objType: 'Ball',
		controller: <BallController />,
	},
	{
		slug: 'candy',
		path: 'candy.glb',
		label: 'キャンディ',
		objType: 'Candy',
		controller: <CandyController />,
	},
]
