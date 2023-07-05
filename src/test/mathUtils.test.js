const { sum } = require('./mathUtils');

describe('sum', () => {
  it('should return the sum of two numbers', () => {
    // Arrange
    const a = 2;
    const b = 3;

    // Act
    const result = sum(a, b);

    // Assert
    expect(result).toBe(5);
  });

  it('should handle negative numbers', () => {
    // Arrange
    const a = -5;
    const b = 3;

    // Act
    const result = sum(a, b);

    // Assert
    expect(result).toBe(-2);
  });
});