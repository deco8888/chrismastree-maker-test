import { useGLTF } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

type DecorationPreviewProps = {
	position: THREE.Vector3
	modelPath: string
	onDragEnd?: any
}

const LoadedDecorationPreview = (props: DecorationPreviewProps) => {
	const { position, modelPath, onDragEnd } = props
	const { nodes } = useGLTF(`/assets/models/decoration/${modelPath}`)
	useGLTF.setDecoderPath('/node_modules/three/examples/jsm/libs/draco/')

	const meshRef = useRef<THREE.Mesh>(null)

	return (
		<mesh ref={meshRef} position={position}>
			{nodes.Ball && (
				<group {...props} dispose={null}>
					<mesh
						castShadow
						receiveShadow
						geometry={(nodes.Ball as THREE.Mesh).geometry}
						material={(nodes.Ball as THREE.Mesh).material}
					/>
				</group>
			)}
		</mesh>
	)
}

export const DecorationPreview = (props: DecorationPreviewProps) => {
	if (!props.modelPath) return null

	return <LoadedDecorationPreview {...props} />
}
