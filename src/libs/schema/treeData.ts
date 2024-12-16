import { z } from 'zod';

export const treeDataSchema = z.object( {
	treeColor: z.string(),
	starColor: z.string(),
	decorationsByType: z.array(
		z.object( {
			slug: z.string(),
			count: z.number(),
			list: z
				.array(
					z.object( {
						id: z.string(),
						slug: z.string(),
						position: z.object( {
							x: z.number(),
							y: z.number(),
							z: z.number(),
						} ),
						rotation: z
							.object( {
								x: z.number(),
								y: z.number(),
								z: z.number(),
							} )
							.optional(),
						objType: z.string().optional(),
					} ),
				)
				.optional(),
			setting: z
				.object( {
					color: z.array( z.string() ).optional(),
					size: z.number().optional(),
				} )
				.optional(),
		} ),
	),
} );

export type TreeData = z.infer<typeof treeDataSchema>

export const treeTextDataSchema = z.object( {
	nickname: z.string().min( 1, '必須項目です' ).max( 20, '20文字以内で入力してください' ),
	comment: z.string().max( 100, '100文字以内で入力してください' ).optional(),
} );

export type TreeTextData = z.infer<typeof treeTextDataSchema>
