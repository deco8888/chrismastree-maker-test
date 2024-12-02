import { useGLTF } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

import { DecorationSettings } from '~/types/editor'

type DecorationPreviewProps = {
	position: THREE.Vector3
	modelPath: string
	setting?: DecorationSettings
	onDragEnd?: any
}

const LoadedDecorationPreview = (props: DecorationPreviewProps) => {
	const { position, modelPath, setting, onDragEnd } = props
	const { nodes } = useGLTF(`/assets/models/decoration/${modelPath}`)
	useGLTF.setDecoderPath('/node_modules/three/examples/jsm/libs/draco/')

	const meshRef = useRef<THREE.Mesh>(null)

	const material = useMemo(() => {
		const material = (nodes.Ball as THREE.Mesh).material as THREE.MeshStandardMaterial
		material.color = new THREE.Color(setting?.color ?? '#9A9D9C')
		return material
	}, [setting?.color])

	return (
		<mesh ref={meshRef} position={position}>
			{nodes.Ball && (
				<group {...props} dispose={null}>
					<mesh castShadow receiveShadow geometry={(nodes.Ball as THREE.Mesh).geometry} material={material} />
				</group>
			)}
		</mesh>
	)
}

export const DecorationPreview = (props: DecorationPreviewProps) => {
	if (!props.modelPath) return null

	return <LoadedDecorationPreview {...props} />
}
