module.exports = {
  extends: ['react-app', 'prettier', 'plugin:prettier/recommended'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'no-redeclare': 0,
    'prettier/prettier': 0,
  },
};
