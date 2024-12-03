import { useMemo } from 'react'
import * as THREE from 'three'

import { ChristmasTreeGLTF } from '~/types/christmasTree'

type TreeLeafProps = {
	nodes: ChristmasTreeGLTF['nodes']
	color?: string
}

const meshOptions = {
	castShadow: true,
	receiveShadow: true,
}

export const TreeLeaf = ({ nodes, color = '#9A9D9C' }: TreeLeafProps) => {
	const leafMaterial = useMemo(() => {
		return new THREE.MeshStandardMaterial({
			...nodes.LeafBottom?.material,
			color: new THREE.Color(color),
			emissiveIntensity: 0.0,
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
