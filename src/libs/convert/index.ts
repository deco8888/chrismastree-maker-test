export const convertDataUrlToFile = async ( dataURL: string, filename: string, type: FileImageType ): Promise<File> => {

	// 指定したURLからデータを取得 ➡︎ Blob形式(画像やファイルなどを扱うためのデータ形式)に変換
	const blob = await ( await fetch( dataURL ) ).blob();
	return new File( [ blob ], filename, { type: type } );

};
