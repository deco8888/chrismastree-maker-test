import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { storage } from './config';

/**
 * 画像をCloudStorageにアップロードしてそのURLを取得する
 * @param file
 * @returns CloudStorageからのダウンロードURL
 */
export const uploadData = async ( path: string, data: Blob | Uint8Array | ArrayBuffer ) => {

	try {

		const storageRef = ref( storage, path );

		// JSの[File API]or[Blob API]経由でファイルを取得
		const uploadResult = await uploadBytes( storageRef, data );

		return await getDownloadURL( uploadResult.ref );

	} catch ( error ) {

		console.error( 'Image upload error', error );
		throw new Error( 'アップロードに失敗しました' );

	}

};
