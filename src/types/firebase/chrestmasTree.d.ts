export interface ChristmasTreeData {
	userId: string
	treeColor: string
	starColor: string
	decorations: ChristmasTreeDecorations[]
	createdAt: Timestamp
	updatedAt: Timestamp
}

export interface ChristmasTreeDecorations {
	slug: string
	count: number
	setting?: ChristmasTreeDecorationsSettings
	list?: ChristmasTreeDecorationsItem[]
}

export interface ChristmasTreeDecorationsSettings {
	color: string | null
	size: number | null
}

export interface ChristmasTreeDecorationsItem {
	id: string;
	slug: string;
    position: {
        x: number;
        y: number;
        z: number;
    };
    rotation: {
        x: number;
        y: number;
        z: number;
    } | null;
    objType: string | null;
}