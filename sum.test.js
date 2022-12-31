const sum = require('./sum')

test('adding two numbers good', () => {
    expect(sum(1,2)).toBe(3)
})
