module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // Reanimated plugin removed to avoid "react-native-worklets/plugin" resolution error.
    // Add "react-native-reanimated/plugin" back (must be last) after installing react-native-worklets if needed.
    plugins: [],
  };
};
