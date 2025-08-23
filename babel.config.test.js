// إعدادات Babel للاختبارات فقط
module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        "modules": "commonjs",
        "targets": {
          "node": "current"
        }
      }
    ],
    [
      "@babel/preset-react",
      {
        "runtime": "automatic"
      }
    ],
    [
      "@babel/preset-typescript",
      {
        "jsx": "react-jsx"
      }
    ]
  ]
};
