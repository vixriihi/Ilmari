// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  version: '0.0.1',
  production: false,
  apiBase: 'https://apitest.laji.fi/v0',
  accessToken: 'sSV6YSTFvtQAZcRsdaWK99PGrfFWDI72wYy9jKs0hlgtDkGV85OIB8K5yYFPw4UF',
  login: 'https://fmnh-ws-test.it.helsinki.fi/laji-auth/login?target=KE.601&next=%2Fuser%2Flogin&allowUnapproved=false&redirectMethod=GET',
  mapsToken: 'AIzaSyAXsondK_Ruyf5NEDk_1Zy5IIB_LGb4L-M',
  imageForm: 'JX.111712',
  whiteListForms: ['JX.519', 'JX.652']
};
