'use client'

import { Environment, OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing'
import { CSSProperties, Suspense, useCallback, useContext, useEffect } from 'react'
import * as THREE from 'three'

import { EditorContext } from '~/hooks/useEditor'

import { ChristmasTreeGLTF } from '~/types/christmasTree'

import { Decoration } from './Decoration'
import { TreeLeaf } from './Leaf'
import { Star } from './Star'

const MODEL_PATH = '/assets/models/christmasTree.glb'

const meshOptions = {
	castShadow: true,
	receiveShadow: true,
}

const useEditorPreviewScene = () => {
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
const EditorPreviewScene = ({ children }: ChristmasTreeModelSceneProps) => {
	const data = useEditorPreviewScene()
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
			gl={{ antialias: true, alpha: true }}
		>
			{/* ライト */}
			<ambientLight intensity={1} />
			<directionalLight intensity={1} position={nodes.FrontLight?.position} rotation={nodes.FrontLight?.rotation} />
			<directionalLight intensity={3} position={nodes.LeftLight?.position} rotation={nodes.LeftLight?.rotation} />
			<directionalLight intensity={0.5} position={nodes.RightLight?.position} rotation={nodes.RightLight?.rotation} />
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

			{/* エフェクト */}
			<EffectComposer>
				<Bloom
					intensity={0.5} // ブルームの強さ
					luminanceThreshold={0} // 輝度しきい値
					luminanceSmoothing={1.0} // 輝度しきい値の滑らかさ
				/>
				<ToneMapping adaptive={true} />
			</EffectComposer>
		</Canvas>
	)
}

/**
 * クリスマスツリーモデル
 * @returns
 */
const ChristmasTreeModel = () => {
	const data = useEditorPreviewScene()
	const { nodes, materials } = data
	const context = useContext(EditorContext)

	return (
		<group position={[0, -1.5, 0]}>
			{/* 星 */}
			<Star nodes={nodes} color={context?.starColor} />

			{/* 葉っぱ */}
			<group ref={context?.treeRef}>
				<TreeLeaf nodes={nodes} color={context?.treeColor} />
			</group>

			{/* 木の幹 */}
			<mesh {...meshOptions} geometry={nodes.Tree!.geometry} material={materials.tree} />

			{/* 装飾品 */}
			{context?.decorations.map((decoration, i) => {
				const targetDecoration = context?.decorationsByType.find(v => v.slug === decoration.slug)
				if (!targetDecoration) return null

				return (
					<Decoration
						key={i}
						position={decoration.position ?? new THREE.Vector3()}
						modelPath={targetDecoration.path ?? ''}
						setting={targetDecoration.setting}
						objType={targetDecoration.objType ?? ''}
					/>
				)
			})}
		</group>
	)
}

/**
 * クリスマスツリーコンポーネント
 * @returns
 */
export function EditorPreview() {
	return (
		<EditorPreviewScene>
			<ChristmasTreeModel />
		</EditorPreviewScene>
	)
}
