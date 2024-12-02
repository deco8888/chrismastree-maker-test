'use client'

import { Environment, OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei'
import { Canvas, extend, useThree } from '@react-three/fiber'
import { CSSProperties, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
// import { Bloom, EffectComposer } from '@react-three/postprocessing'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

extend({ EffectComposer, RenderPass, UnrealBloomPass })

import { EditorContext } from '~/hooks/useEditor'

import { ChristmasTreeGLTF } from '~/types/christmasTree'

import { TreeLeaf } from './Leaf'
import { DecorationPreview } from '../DecorationPreview'

const MODEL_PATH = '/assets/models/christmasTree.glb'

const Bloom = () => {
	const { gl, camera, size } = useThree()
	const [scene, setScene] = useState()
	const composer = useRef<any>()

	useEffect(() => {
		if (scene) {
			composer.current.setSize(size.width, size.height)
		}
	}, [size])

	return (
		<></>
		// <scene>
		// 	<effectComposer ref={composer} args={[gl]}>
		// 		<renderPass attachArray="passes" scene={scene} camera={camera} />
		// 		<shaderPass attachArray="passes" />
		// 	</effectComposer>
		// </scene>
	)
}

const meshOptions = {
	castShadow: true,
	receiveShadow: true,
}

const useChristmasTreeModelScene = () => {
	/*-------------------------------
		モデルを読み込む
	-------------------------------*/
	const { nodes, materials, cameras } = useGLTF(MODEL_PATH) as ChristmasTreeGLTF
	useGLTF.setDecoderPath('/node_modules/three/examples/jsm/libs/draco/')

	/*-------------------------------
		カメラの視野角を取得
	-------------------------------*/
	const camera = cameras[0] as THREE.PerspectiveCamera
	const verticalFov = ((camera.fov * Math.PI) / 180) * 2 // カメラの視野角をラジアンに変換

	const initDecoPositions = useCallback(() => {
		return Object.entries(nodes)
			.filter(([key, _]) => key.startsWith('decoPosition'))
			.map(([key, value]) => {
				return {
					slug: key,
					position: new THREE.Vector3(value.position.x * 0.5, value.position.y * 0.5, value.position.z * 0.5),
					isAvailable: true,
				}
			})
			.sort(() => Math.random() - 0.5)
	}, [nodes])

	return {
		nodes,
		materials,
		camera,
		verticalFov,
		initDecoPositions,
	}
}

type ChristmasTreeModelSceneProps = {
	children: React.ReactNode
}

/**
 * クリスマスツリーモデルシーン
 * @param children
 * @returns
 */
const ChristmasTreeModelScene = ({ children }: ChristmasTreeModelSceneProps) => {
	const data = useChristmasTreeModelScene()
	const { nodes, camera, verticalFov, initDecoPositions } = data
	const context = useContext(EditorContext)

	/*-------------------------------
		装飾品の位置情報を取得
	-------------------------------*/
	useEffect(() => {
		if (!context || context.decoPositionList.length > 0) return
		const positions = initDecoPositions()
		context?.setDecoPositionList(positions)
	}, [context, data])

	return (
		<Canvas
			style={
				{
					width: '100%',
					height: '100%',
					position: 'absolute',
					top: 0,
					left: 0,
					aspectRatio: 960 / 1080,
				} as CSSProperties
			}
			gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
		>
			{/* ライト */}
			<ambientLight intensity={1} />
			<directionalLight intensity={1} position={nodes.FrontLight?.position} rotation={nodes.FrontLight?.rotation} />
			<directionalLight intensity={1} position={nodes.BackLight?.position} rotation={nodes.BackLight?.rotation} />

			{/* 環境 */}
			<Environment preset="forest" />

			{/* カメラ */}
			<PerspectiveCamera
				makeDefault
				far={camera.far}
				near={camera.near}
				fov={camera.fov}
				position={camera.position}
				rotation={camera.rotation}
			/>

			{/* モデル */}
			<Suspense fallback={null}>{children}</Suspense>

			{/* カメラコントロール */}
			<OrbitControls
				enablePan={false}
				enableZoom={false}
				// 回転のみ許可
				enableRotate={true}
				// X軸回転はなし
				minPolarAngle={verticalFov}
				maxPolarAngle={verticalFov}
				// Y軸回転のみ許可
				maxAzimuthAngle={Infinity}
				minAzimuthAngle={-Infinity}
				// 回転速度の調整
				rotateSpeed={0.5}
				target={new THREE.Vector3(0, 0, 0)}
			/>

			{/* <EffectComposer>
				<Bloom
					intensity={0.5} // ブルームの強さ
					luminanceThreshold={0} // 輝度しきい値
					luminanceSmoothing={1.0} // 輝度しきい値の滑らかさ
				/>
			</EffectComposer> */}
		</Canvas>
	)
}

/**
 * クリスマスツリーモデル
 * @returns
 */
const ChristmasTreeModel = () => {
	const data = useChristmasTreeModelScene()
	const { nodes, materials } = data
	const context = useContext(EditorContext)

	const starMaterial = useMemo(() => {
		return new THREE.MeshStandardMaterial({
			...nodes.Star?.material,
		})
	}, [])

	return (
		<group position={[0, -1.5, 0]}>
			<mesh {...meshOptions} geometry={nodes.Star?.geometry} material={starMaterial} />

			<group ref={context?.treeRef}>
				<TreeLeaf nodes={nodes} materials={materials} color={context?.treeColor} />
			</group>

			{/* 木の幹 */}
			<mesh {...meshOptions} geometry={nodes.Tree!.geometry} material={materials.tree} />

			{/* 装飾品 */}
			{context?.decorations.map((decoration, i) => (
				<DecorationPreview
					key={i}
					position={decoration.position ?? new THREE.Vector3()}
					modelPath={context?.decorationsByType.find(v => v.slug === decoration.slug)?.path ?? ''}
					setting={context?.decorationsByType.find(v => v.slug === decoration.slug)?.setting}
				/>
			))}
		</group>
	)
}

/**
 * クリスマスツリーコンポーネント
 * @returns
 */
export function ChristmasTree() {
	return (
		<ChristmasTreeModelScene>
			<ChristmasTreeModel />
		</ChristmasTreeModelScene>
	)
}
