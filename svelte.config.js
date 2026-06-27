import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			precompress: true,
			strict: true
		}),
		prerender: {
			handleMissingId: 'warn',
			// Belt-and-suspenders: the /activity load catches every fetch failure
			// and degrades to an error state instead of throwing, but keep a failed
			// build-time fetch from ever aborting a deploy of the whole site.
			handleHttpError: 'warn'
		}
	}
};

export default config;
