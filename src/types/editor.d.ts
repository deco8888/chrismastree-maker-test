import * as THREE from 'three'

export interface DecorationSettings {
	size?: number
	color?: string
}
export interface DecorationsByType {
	slug: string
	label: string
	path: string
	// size?: number
	// color?: string
	count?: number
	list?: Decoration[]
	setting?: DecorationSettings
}

export interface Decoration {
	id: string
	slug: string
	position?: THREE.Vector3
}

export interface SelectedDecoration {
	slug: string
	label: string
	path: string
}

export interface DecoPositionItem {
	id?: string
	slug: string
	position: THREE.Vector3
	isAvailable: boolean
	usedBy?: string // 使われている装飾品のID
}
