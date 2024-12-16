import { Anton, Josefin_Sans, Noto_Sans_JP, Yuji_Syuku } from 'next/font/google'

export const notoSansJP = Noto_Sans_JP({
	subsets: ['latin'],
	weight: ['400', '500', '700'],
	variable: '--font-notosans',
})

export const josefinSans = Josefin_Sans({
	subsets: ['latin'],
	weight: ['400', '500', '700'],
	variable: '--font-josefin',
})

export const anton = Anton({
	subsets: ['latin'],
	weight: ['400'],
	variable: '--font-anton',
})

export const yujiSyuku = Yuji_Syuku({
	subsets: ['latin'],
	weight: ['400'],
	variable: '--font-yujisyuku',
})
