import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

interface TreeData {
	treeColor: string
	starColor: string
	decorationsByType: Array<{
		slug: string
		setting?: {
			color?: string[]
			size?: number
		}
		list?: Array<{
			id: string
			position: { x: number; y: number; z: number }
			rotation?: { x: number; y: number; z: number }
		}>
	}>
}

class TreeViewer {
	private scene: THREE.Scene
	private camera: THREE.PerspectiveCamera
	private renderer: THREE.WebGLRenderer
	private controls: OrbitControls
	private composer: EffectComposer
	private modelGroup: THREE.Group
	private modelCache: { [key: string]: THREE.Mesh } = {}

	constructor(
		canvas: HTMLCanvasElement,
		private treeData: TreeData,
	) {
		// シーンの初期化
		this.scene = new THREE.Scene()
		this.modelGroup = new THREE.Group()
		this.scene.add(this.modelGroup)

		// レンダラーの設定
		this.renderer = new THREE.WebGLRenderer({
			canvas,
			antialias: true,
			alpha: true,
		})
		this.renderer.setSize(window.innerWidth, window.innerHeight)
		this.renderer.setPixelRatio(window.devicePixelRatio)

		// カメラの設定
		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
		this.camera.position.set(0, 0, 5)

		// コントロールの設定
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
		this.controls.enablePan = false
		this.controls.enableZoom = false
		this.controls.enableRotate = true
		this.controls.rotateSpeed = 0.5

		// ポストプロセス
		this.composer = new EffectComposer(this.renderer)
		const renderPass = new RenderPass(this.scene, this.camera)
		this.composer.addPass(renderPass)

		const bloomPass = new UnrealBloomPass(
			new THREE.Vector2(window.innerWidth, window.innerHeight),
			0.5, // intensity
			0, // threshold
			1.0, // smoothing
		)
		this.composer.addPass(bloomPass)

		// 初期設定
		this.setupLights()
		this.setupEventListeners()
		this.loadModels()
	}

	private setupLights(): void {
		const ambientLight = new THREE.AmbientLight(0xffffff, 1)
		this.scene.add(ambientLight)

		const createDirectionalLight = (intensity: number, position: THREE.Vector3) => {
			const light = new THREE.DirectionalLight(0xffffff, intensity)
			light.position.copy(position)
			return light
		}

		this.scene.add(createDirectionalLight(1, new THREE.Vector3(5, 5, 5))) // Front
		this.scene.add(createDirectionalLight(3, new THREE.Vector3(-5, 5, 5))) // Left
		this.scene.add(createDirectionalLight(0.5, new THREE.Vector3(5, 5, -5))) // Right
		this.scene.add(createDirectionalLight(1, new THREE.Vector3(-5, 5, -5))) // Back
	}

	private async loadModels(): Promise<void> {
		const loader = new GLTFLoader()

		try {
			// メインのツリーをロード
			const treeGLTF = await loader.loadAsync('/assets/models/christmasTree.glb')
			this.setupTreeModel(treeGLTF.scene)

			// デコレーションをロード
			await Promise.all(
				this.treeData.decorationsByType.map(async deco => {
					if (!deco.list) return

					const modelPath = `/assets/models/decoration/${deco.slug}.glb`
					try {
						const gltf = await loader.loadAsync(modelPath)
						const model = gltf.scene.children[0] as THREE.Mesh
						this.modelCache[deco.slug] = model

						// デコレーションを配置
						this.placeDecorations(deco)
					} catch (error) {
						console.error(`Error loading decoration ${deco.slug}:`, error)
					}
				}),
			)
		} catch (error) {
			console.error('Error loading models:', error)
		}
	}

	private setupTreeModel(treeModel: THREE.Group): void {
		treeModel.traverse(child => {
			if (child instanceof THREE.Mesh) {
				if (child.name.includes('Tree')) {
					child.material = new THREE.MeshStandardMaterial({
						color: this.treeData.treeColor,
					})
				}
				if (child.name.includes('Star')) {
					child.material = new THREE.MeshStandardMaterial({
						color: this.treeData.starColor,
						emissive: this.treeData.starColor,
						emissiveIntensity: 0.5,
					})
				}
			}
		})

		this.modelGroup.add(treeModel)
	}

	private placeDecorations(deco: TreeData['decorationsByType'][0]): void {
		if (!deco.list || !this.modelCache[deco.slug]) return

		deco.list.forEach(item => {
			const model = this.modelCache[deco.slug]?.clone()
			if (!model) return

			// 位置設定
			model.position.copy(new THREE.Vector3(item.position.x, item.position.y, item.position.z))

			// 回転設定
			if (item.rotation) {
				model.rotation.set(item.rotation.x, item.rotation.y, item.rotation.z)
			}

			// マテリアル設定
			if (model.material instanceof THREE.Material) {
				const material = new THREE.MeshStandardMaterial()
				const color = deco.setting?.color
					? deco.setting.color[Math.floor(Math.random() * deco.setting.color.length)]
					: '#9A9D9C'
				material.color = new THREE.Color(color)
				material.emissiveIntensity = 0
				model.material = material
			}

			// サイズ設定
			if (deco.setting?.size) {
				const scale = 1 + deco.setting.size * 0.1
				model.scale.set(scale, scale, scale)
			}

			this.modelGroup.add(model)
		})
	}

	private setupEventListeners(): void {
		window.addEventListener('resize', this.handleResize.bind(this))
	}

	private handleResize(): void {
		const width = window.innerWidth
		const height = window.innerHeight

		this.camera.aspect = width / height
		this.camera.updateProjectionMatrix()

		this.renderer.setSize(width, height)
		this.composer.setSize(width, height)
	}

	public animate(): void {
		requestAnimationFrame(this.animate.bind(this))
		this.controls.update()
		this.composer.render()
	}
}

// 初期化
window.addEventListener('DOMContentLoaded', () => {
	const canvas = document.getElementById('canvas') as HTMLCanvasElement
	if (!canvas) return

	const treeData = (window as any).TREE_DATA as TreeData
	const viewer = new TreeViewer(canvas, treeData)
	viewer.animate()
})
