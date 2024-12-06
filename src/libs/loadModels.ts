
type ModelData = {
	slug: string
	path: string
}[]

export const loadModelsUrl = async ( modelData: ModelData ) => {

	try {

		const models = await Promise.all(
			modelData.map( async ( data ) => {

				const modelPath = `/assets/models/${data.path}`;
				const response = await fetch( modelPath );
				const blob = await response.blob();
				const url = URL.createObjectURL( blob );
				return {
					[ data.slug ]: url,
				};

			} ),
		);
		return models;

	} catch ( error ) {

		console.error( error );
		throw error instanceof Error ? error : new Error( 'モデルの読み込みに失敗しました' );

	}

};
