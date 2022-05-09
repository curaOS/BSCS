const SIZE = 32
const HALF_SIZE = SIZE / 2
const ONE = 1
const SPACE = 0
const schema = [1, 2, 3, 4, 5]

export function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

export function generate(seed) {
    let encodedOutput = []

    let a = seed

    let x = 0
    let y = 0
    let v = 0
    let value = 0
    let mod = (a % 11) + 5

    for (let i = 0; i < SIZE; i++) {
        y = 2 * (i - HALF_SIZE) + 1
        if (a % 3 == 1) {
            y = -y
        } else if (a % 3 == 2) {
            y = Math.abs(y)
        }
        y = y * a
        for (let j = 0; j < SIZE; j++) {
            x = 2 * (j - HALF_SIZE) + 1
            if (a % 2 == 1) {
                x = Math.abs(x)
            }
            x = x * a
            v = Math.abs((x * y) / ONE) % mod
            if (v < 5) {
                value = schema[v]
            } else {
                value = SPACE
            }
            encodedOutput.push(value)
        }
    }
    return encodedOutput
}
