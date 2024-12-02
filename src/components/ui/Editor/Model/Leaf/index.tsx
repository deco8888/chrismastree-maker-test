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
		console.log(nodes.LeafBottom?.material)
		return new THREE.MeshStandardMaterial({
			...nodes.LeafBottom?.material,
			color: new THREE.Color(color),
			emissiveIntensity: 0,
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
