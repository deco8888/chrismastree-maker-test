import { useMemo } from 'react'
import * as THREE from 'three'

import { ChristmasTreeGLTF } from '~/types/christmasTree'

type StarProps = {
	nodes: ChristmasTreeGLTF['nodes']
	color?: string
}

const meshOptions = {
	castShadow: true,
	receiveShadow: true,
}

/**
 * 星
 * @param nodes
 * @param color
 * @returns
 */
export const Star = ({ nodes, color = '#FFCC00' }: StarProps) => {
	const starMaterial = useMemo(() => {
		return new THREE.MeshStandardMaterial({
			...nodes.Star?.material,
			color: new THREE.Color(color),
		})
	}, [color])

	return (
		<group dispose={null}>
			<mesh {...meshOptions} geometry={nodes.Star?.geometry} material={starMaterial} />
		</group>
	)
}
