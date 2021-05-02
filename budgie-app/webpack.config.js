const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async (env, argv) => {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: ['@ui-kitten/components'],
    },
  }, argv);

  config.resolve.alias['victory-native'] = 'victory';

  return config;
};
