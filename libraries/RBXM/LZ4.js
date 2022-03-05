function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}
function getElements(list, i, j) {
    let k = 0;
    let m = 0;
    let result = [];
    let len = list.length;
    while (m < len && k < j) {
      if (k >= i) {
        result.push(list[m]);
      }
      m++;
      k++;
    }
    return result;
}
const decodeLZ4 = (streamOrString) => {
    let data
    if (typeof streamOrString == "string") {
        data = new Stream(streamOrString)
    } else {
        data = streamOrString
    }
    const compressedLength = Binary.decodeInt(data.read(4), true)
    const uncompressedLength = Binary.decodeInt(data.read(4), true)
    assert(Binary.decodeInt(data.read(4), true) == 0, "LZ4 E001: Invalid LZ4 header")

    const uncompressedData = new Array(uncompressedLength).fill(-1)
    let uncompressedPosition = 0

    function addUncompressed(str) {
        for (let i = 1; i<=str.length; i++) {
            assert(uncompressedPosition + i <= uncompressedLength, "LZ4 E004: Too much uncompressed data")
            uncompressedData[uncompressedPosition + i - 1] = str.charCodeAt(i - 1)
        }
        uncompressedPosition += str.length - 1
    }

    function readMatchData(offset, matchLength) {
        const startPos = (uncompressedPosition - offset) + 1
        const endPos = uncompressedPosition + matchLength + 1
        let pos = startPos
        let idx = uncompressedPosition - 1

        while (idx < endPos) {
            uncompressedData[idx] = uncompressedData[pos]
            //console.log(uncompressedData[idx])
            idx += 1
            pos += 1
        }
        uncompressedPosition = idx - 1
    }
    data = new Stream(data.read(compressedLength))
    while (true) {
        const one = data.read(1)
        if (!one) break;
        const token = Binary.decodeInt(one)
        let literalLength = Math.floor(token/16)
        let matchLength = token % 16
        if (literalLength == 15) {
            let nextByte = 255
            while (nextByte == 255) {
                nextByte = Binary.decodeInt(data.read(1))
                literalLength += nextByte
            }
        }
        if (literalLength > 0) {
            addUncompressed(data.read(literalLength))
        }
        if (data.hasData()) {
            const offset = Binary.decodeInt(data.read(2), true)
            assert(offset != 0, "LZ4 E006: Offset can not be 0")
            if (matchLength == 15) {
                let nextByte = 255
                while (nextByte == 255) {
                    nextByte = Binary.decodeInt(data.read(1))
                    matchLength += nextByte
                }
            }
            matchLength += 4
            readMatchData(offset, matchLength)
        } else {
            break
        }
    }
    //console.log(uncompressedPosition,uncompressedLength)
    //assert(uncompressedPosition == uncompressedLength, "LZ4 E005: Uncompressed length is incorrect; expected " + uncompressedLength + ", got " + uncompressedPosition)
    return String.fromCharCode(...getElements(uncompressedData, 0, uncompressedLength))
    // SLOW METHOD:
    // const output = []
    // for (let i = 0; i < 255; i+=uncompressedLength) {
    //     const append = String.fromCharCode(...getElements(uncompressedData, i, Math.min(i + 255, uncompressedLength)))
    //     output.push(append)
    // }
    // return output.join('')
}