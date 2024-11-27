import { GLTF } from 'three-stdlib'

export interface ChristmasTreeNodes {
	[name: string]: THREE.Mesh
}
export interface ChristmasTreeMaterials {
	[name: string]: THREE.Material | undefined
}

export interface ChristmasTreeGLTF extends GLTF {
	nodes: ChristmasTreeNodes
	materials: ChristmasTreeMaterials
}
