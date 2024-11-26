export const getUserAgent: () => userAgent | undefined = () => {

	if ( typeof window === 'undefined' ) {

		return undefined;

	}

	const ua = window.navigator.userAgent.toLowerCase();
	//browser
	const ie = !! ua.match( /(msie|trident)/i );
	const edge = !! ua.match( /edge/i );
	const chrome = edge ? false : !! ua.match( /(chrome|crios)/i );
	const safari = edge || chrome ? false : !! ua.match( /safari/i );
	const firefox = !! ua.match( /firefox/i );
	//mobile device and os
	const iPhone = ua.indexOf( 'iphone' ) >= 0;
	const iPod = ua.indexOf( 'ipod' ) >= 0;
	const iPad = ua.indexOf( 'ipad' ) > - 1 || ( ua.indexOf( 'macintosh' ) > - 1 && 'ontouchend' in document );
	const iOS = iPhone || iPod || iPad;
	const Android = ua.indexOf( 'android' ) >= 0;
	const TB = iPad || ( Android && ua.indexOf( 'mobile' ) < 0 );
	const SP = ! TB && ( iOS || Android );
	const Mobile = TB || SP;
	return {
		IE: ie,
		Edge: edge,
		Chrome: chrome,
		Safari: safari,
		Firefox: firefox,
		iOS: iOS,
		iOS_SP: iOS && SP,
		iOS_TB: iOS && TB,
		Android: Android,
		Android_SP: Android && SP,
		Android_TB: Android && TB,
		TB: TB,
		SP: SP,
		iOS_Android: iOS || Android,
		Mobile,
	};

};

export const checkOS = () => {

	if ( typeof window === 'undefined' ) {

		return false;

	}

	const ua = window.navigator.userAgent.toLowerCase();

	if ( ua.indexOf( 'windows nt' ) !== - 1 ) {

		return 'windows';

	} else if ( ua.indexOf( 'mac os x' ) !== - 1 ) {

		return 'mac';

	} else {

		return false;

	}

};
