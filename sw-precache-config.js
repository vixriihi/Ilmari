module.exports = {
  cacheId: 'IL-1',
  navigateFallback: '/index.html',
  stripPrefix: 'dist',
  root: 'dist/',
  maximumFileSizeToCacheInBytes: 4194304,
  staticFileGlobs: [
    'dist/index.html',
    'dist/**.js',
    'dist/**.css',
    'dist/assets/**.*'
  ],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/apitest\.laji\.fi\/v0/,
      handler: 'fastest'
    },
    {
      urlPattern: /^https:\/\/api\.laji\.fi\/v0/,
      handler: 'fastest'
    },
    {
      urlPattern: /\/assets\//,
      handler: 'fastest'
    }
  ]
};
