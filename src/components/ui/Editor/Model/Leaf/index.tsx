import { useMemo } from 'react'
import * as THREE from 'three'

import { ChristmasTreeGLTF } from '~/types/christmasTree'

type TreeLeafProps = {
	nodes: ChristmasTreeGLTF['nodes']
	materials: ChristmasTreeGLTF['materials']
	color?: string
}

const meshOptions = {
	castShadow: true,
	receiveShadow: true,
}

export const TreeLeaf = ({ nodes, materials, color = '#9A9D9C' }: TreeLeafProps) => {
	const leafMaterial = useMemo(() => {
		return new THREE.MeshStandardMaterial({
			color: new THREE.Color(color),
			roughness: 0.8,
			metalness: 0.2,
		})
	}, [color])

	return (
		<group dispose={null}>
			<mesh {...meshOptions} geometry={nodes.LeafBottom?.geometry} material={leafMaterial} />
			<mesh {...meshOptions} geometry={nodes.LeafMiddle?.geometry} material={leafMaterial} />
			<mesh {...meshOptions} geometry={nodes.LeafTop?.geometry} material={leafMaterial} />
		</group>
	)
}
