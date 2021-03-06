module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '/node_modules/',
    '(/__tests__/.*|(\\.|/)(test|spec))\\.[t]sx?$'
  ],
  clearMocks: true
}
