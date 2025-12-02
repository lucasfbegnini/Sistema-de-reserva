module.exports = {
  moduleFileExtensions: [
    "js",
    "json",
    "ts"
  ],
  rootDir: ".",
  // Regex para encontrar arquivos de teste (.spec.ts ou .test.js)
  testRegex: ".*\\.(spec\\.ts|test\\.js)$",
  transform: {
    // Usa ts-jest para transformar arquivos ts e js
    "^.+\\.(t|j)s$": "ts-jest"
  },
  collectCoverageFrom: [
    "**/*.(t|j)s"
  ],
  coverageDirectory: "./coverage",
  testEnvironment: "node",
  // Garante que o Jest olhe nas pastas corretas, incluindo packages
  roots: [
    "<rootDir>/src",
    "<rootDir>/test",
    "<rootDir>/packages"
  ]
};