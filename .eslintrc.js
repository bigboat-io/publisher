module.exports = {
    "env": {
        "browser": false,
        "commonjs": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "globals": {
      "process": true,
      "console": true,
      "setTimeout": true,
      "setInterval": true,
      "describe": true,
      "it": true,
      "beforeEach": true,
    },
    "rules": {
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "never"
        ],
        "no-console": [
          "error",
          { allow: [
            "log",
            "warn",
            "error"
          ]}
        ],
    }
};
