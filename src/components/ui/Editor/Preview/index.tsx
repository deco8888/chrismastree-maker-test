'use client'

import { Environment, OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing'
import { CSSProperties, useCallback, useContext, useEffect, useMemo } from 'react'
import * as THREE from 'three'

import { EditorContext, EditorContextType } from '~/hooks/useEditor'

import { ChristmasTreeGLTF } from '~/types/christmasTree'
import { DecorationsByType, DisplayedDecoration } from '~/types/editor'

import { Decoration } from './Decoration'
import { TreeLeaf } from './Leaf'
import { Star } from './Star'

const MODEL_PATH = '/assets/models/christmasTree.glb'

const DEG_TO_RAD = Math.PI / 180

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
				// 装飾品(キャンディ)の初期回転位置を取得
				let rotation: THREE.Euler | undefined = undefined

				const candyRotation = value.userData.candyRotation
				if (candyRotation) {
					rotation = new THREE.Euler(
						candyRotation[0] * DEG_TO_RAD,
						candyRotation[2] * DEG_TO_RAD,
						-candyRotation[1] * DEG_TO_RAD,
						'ZYX',
					)
				}

				return {
					slug: key,
					position: new THREE.Vector3(value.position.x * 0.5, value.position.y * 0.5, value.position.z * 0.5),
					rotation: rotation,
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

/**
 * キャプチャハンドラー
 * @returns
 */
const CaptureHandler = () => {
	const context = useContext(EditorContext)
	const { gl, scene, camera } = useThree()

	/*-------------------------------
		完成モデルのキャプチャ
	-------------------------------*/
	useEffect(() => {
		if (context?.captureRequested) {
			gl.render(scene, camera)
			const imageUrl = gl.domElement.toDataURL('image/png')
			context.onCaptureComplete(imageUrl)
		}
	}, [context?.captureRequested, gl, scene, camera])

	return null
}

type ChristmasTreeModelSceneProps = {
	data: ReturnType<typeof useEditorPreviewScene>
	context: EditorContextType
	children: React.ReactNode
}

/**
 * クリスマスツリーモデルシーン
 * @param {ChristmasTreeModelSceneProps} props
 * @returns
 */
const EditorPreviewScene = (props: ChristmasTreeModelSceneProps) => {
	const { nodes, camera, verticalFov, initDecoPositions } = props.data
	const context = props.context

	/*-------------------------------
		装飾品の位置情報を取得
	-------------------------------*/
	useEffect(() => {
		if (!context?.decoPositionList || context.decoPositionList.length > 0) return
		const positions = initDecoPositions()
		context?.setDecoPositionList(positions)
	}, [context?.decoPositionList, initDecoPositions])

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
			{/* キャプチャハンドラー */}
			<CaptureHandler />

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
			{props.children}

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

type ChristmasTreeModelProps = {
	data: ReturnType<typeof useEditorPreviewScene>
	context: EditorContextType
}

/**
 * クリスマスツリーモデル
 * @returns
 */
const ChristmasTreeModel = (props: ChristmasTreeModelProps) => {
	const { nodes, materials } = props.data
	const context = props.context

	const TreeBase = useMemo(
		() => (
			<>
				{/* 星 */}
				<Star nodes={nodes} color={context?.starColor} />

				{/* 葉っぱ */}
				<group ref={context?.treeRef}>
					<TreeLeaf nodes={nodes} color={context?.treeColor} />
				</group>

				{/* 木の幹 */}
				<mesh {...meshOptions} geometry={nodes.Tree.geometry} material={materials.tree} />
			</>
		),
		[nodes, materials, context?.starColor, context?.treeColor],
	)

	return (
		<group position={[0, -1.5, 0]}>
			{/* ツリー + 基本パーツ */}
			{TreeBase}

			{/* 装飾品 */}
			{context.displayedDecorations && context.decorationsByType && (
				<ChristmasTreeDecoration
					decorations={context.displayedDecorations}
					decorationsByType={context.decorationsByType}
					modelList={context.modelList}
				/>
			)}
		</group>
	)
}

type ChristmasTreeDecorationProps = {
	decorations: DisplayedDecoration[]
	decorationsByType: DecorationsByType[]
	modelList: {
		[slug: string]: THREE.Mesh
	}
}

/**
 * クリスマスツリー装飾品
 * @returns
 */
const ChristmasTreeDecoration = (props: ChristmasTreeDecorationProps) => {
	const { decorations, decorationsByType, modelList } = props
	if (decorations.length === 0 || decorationsByType.length === 0) return null

	return (
		<group>
			{decorations.map((decoration, i) => {
				const targetDecoration = decorationsByType.find(v => v.slug === decoration.slug)
				if (!targetDecoration) return null

				return (
					<Decoration
						key={i}
						position={decoration.position ?? new THREE.Vector3()}
						rotation={decoration.rotation ?? undefined}
						modelPath={targetDecoration.path ?? ''}
						setting={targetDecoration.setting}
						objType={targetDecoration.objType ?? ''}
						model={modelList[targetDecoration.objType]?.clone() ?? null}
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
	const data = useEditorPreviewScene()
	const context = useContext(EditorContext)

	if (!context) return null

	return (
		<EditorPreviewScene data={data} context={context}>
			<ChristmasTreeModel data={data} context={context} />
		</EditorPreviewScene>
	)
}
