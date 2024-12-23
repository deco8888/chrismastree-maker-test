import { getDownloadURL, ref, uploadBytes, UploadMetadata } from 'firebase/storage';

import { storage } from './config';

/**
 * 画像をCloudStorageにアップロードしてそのURLを取得する
 * @param file
 * @returns CloudStorageからのダウンロードURL
 */
export const uploadImage = async ( file: File, userId: string ) => {

	try {

		const storageRef = ref( storage, `images/${userId}/${file.name}` );

		// メタデータの設定
		const metadata: UploadMetadata = {
			contentType: file.type,
		};

		// JSの[File API]or[Blob API]経由でファイルを取得
		const uploadResult = await uploadBytes( storageRef, file, metadata );

		return await getDownloadURL( uploadResult.ref );

	} catch ( error ) {

		console.error( 'Image upload error', error );
		throw new Error( '画像のアップロードに失敗しましたs' );

	}

};
