const Binary = {}
function toUTF8Array(str) {
    var utf8 = [];
    for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6), 
                      0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12), 
                      0x80 | ((charcode>>6) & 0x3f), 
                      0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                      | (str.charCodeAt(i) & 0x3ff))
            utf8.push(0xf0 | (charcode >>18), 
                      0x80 | ((charcode>>12) & 0x3f), 
                      0x80 | ((charcode>>6) & 0x3f), 
                      0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
}
Binary.bitwiseOr = (a, b) => {
    return a | b
}
Binary.bitwiseAnd = (a, b) => {
    return a & b
}
Binary.bitwiseXor = (a, b) => {
    return a ^ b
}
Binary.bitwiseNot = (a) => {
    return ~a
}
Binary.byteNot = (a) => {
    return 255 - a
}

Binary.leftShift = (a, n) => {
    return a << n
}
Binary.rightShift = (a, n) => {
    return a >> n
}
Binary.encodeInt = (number, nBytes) => {
    number = Math.floor(number) % Math.pow(256, nBytes);

    var bytesOut = [];
    for (var i = 0; i < nBytes; i++) {
        bytesOut[nBytes - i] = String.fromCharCode(number % 256);
        number = Math.floor(number / 256);
    }

    return bytesOut.join('');
}
Binary.decodeInt = (str, useLittleEndian) => {
    //Reverse the string if we're using little endian
    if (useLittleEndian) { str = str.split('').reverse().join(''); }

    //Decode
    var out = str.charCodeAt(0);
    for (var i = 1; i < str.length; i++) {
        out = (out * 256) + (str.charCodeAt(i));
    }
    return out > 256 ? toUTF8Array(str)[0] + 1 : out;
}
Binary.decodeSignedInt = (str, useLittleEndian) => {
    // Get basic string first
    var unsigned = Binary.decodeInt(str, useLittleEndian);
    var max_value = Math.pow(256, str.length);

    // If the sign (first bit) is 0, just return the number
    if (unsigned < max_value / 2) { return unsigned; }

    // Otherwise, get the bitwise NOT of the value and negate
    return -(max_value - unsigned);
}

const log2 = Math.log(2)
const pow2to52 = Math.pow(2, 52)
const pow2to23 = Math.pow(2, 23)
const f08 = Math.pow(2, 8)
const f16 = Math.pow(2, 16)
const f24 = Math.pow(2, 24)
const f32 = Math.pow(2, 32)
const f40 = Math.pow(2, 40)
const f48 = Math.pow(2, 48)
Binary.encodeDouble = (number) => {
    //IEEE double-precision floating point number
    //Specification: https://en.wikipedia.org/wiki/Double-precision_floating-point_format

    //Separate out the sign, exponent and fraction
    var sign = number < 0 && 1 || 0
    var exponent = Math.ceil(Math.log(Math.abs(number)) / log2) - 1
    var fraction = Math.abs(number) / Math.pow(2, exponent) - 1

    //Make sure the exponent stays in range - allowed values are -1023 through 1024
    if (exponent < -1023) {
        //We allow this case for subnormal numbers and just clamp the exponent and re-calculate the fraction
        //without the offset of 1
        exponent = -1023
        fraction = Math.abs(number) / Math.pow(2, exponent)
    } else if (exponent > 1024) {
        //If the exponent ever goes above this value, something went horribly wrong and we should probably stop
        throw new Error("Exponent out of range: " + exponent)
    }

    //Handle special cases
    if (number == 0) {
        //Zero
        exponent = -1023
        fraction = 0
    } else if (Math.abs(number) == Math.huge) {
        //Infinity
        exponent = 1024
        fraction = 0
    } else if (number !== number) {
        //NaN
        exponent = 1024
        fraction = (pow2to52 - 1) / pow2to52
    }

    //Prepare the values for encoding
    var expOut = exponent + 1023                              //The exponent is an 11 bit offset-binary
    var fractionOut = fraction * pow2to52                     //The fraction is 52 bit, so multiplying it by 2^52 will give us an integer


    //Combine the values into 8 bytes and return the result
    return String.fromCharCode(
        128 * sign + floor(expOut / 16),                        //Byte 0: Sign and then shift exponent down by 4 bit
        (expOut % 16) * 16 + floor(fractionOut / f48),            //Byte 1: Shift fraction up by 4 to give most significant bits, and fraction down by 48
        floor(fractionOut / f40) % 256,                         //Byte 2: Shift fraction down 40 bit
        floor(fractionOut / f32) % 256,                         //Byte 3: Shift fraction down 32 bit
        floor(fractionOut / f24) % 256,                         //Byte 4: Shift fraction down 24 bit
        floor(fractionOut / f16) % 256,                         //Byte 5: Shift fraction down 16 bit
        floor(fractionOut / f08) % 256,                         //Byte 6: Shift fraction down 8 bit
        floor(fractionOut % 256)                            //Byte 7: Last 8 bits of the fraction
    )
}
Binary.decodeDouble = (str, useLittleEndian) => {
    //Reverse the string if we're using little endian
    if (useLittleEndian) {
        str = str.split('').reverse().join('');
    }

    //Get the bytes into an array
    var byte0 = str.charCodeAt(0);
    var byte1 = str.charCodeAt(1);
    var byte2 = str.charCodeAt(2);
    var byte3 = str.charCodeAt(3);
    var byte4 = str.charCodeAt(4);
    var byte5 = str.charCodeAt(5);
    var byte6 = str.charCodeAt(6);
    var byte7 = str.charCodeAt(7);

    //Separate out the bits
    var sign = (byte0 & 0x80) >> 7;
    var exponent = ((byte0 & 0x7f) << 4) + ((byte1 & 0xf0) >> 4);
    var fraction = ((byte1 & 0xf) << 48) + (byte2 << 40) + (byte3 << 32) + (byte4 << 24) + (byte5 << 16) + (byte6 << 8) + byte7;

    //Handle special cases
    if (exponent == 2047) {
        if (fraction == 0) {
            return Math.pow(-1, sign) * Infinity;
        } else if (fraction == pow2to52 - 1) {
            return NaN;
        }
    }

    //Combine the bits and return the result
    if (exponent == 0) {
        //Handle subnormal numbers
        return Math.pow(-1, sign) * Math.pow(2, -1023) * (fraction / pow2to52);
    } else {
        //Handle normal numbers
        return Math.pow(-1, sign) * Math.pow(2, exponent - 1023) * (fraction / pow2to52 + 1);
    }
}
Binary.decodeFloat = (str, useLittleEndian) => {
    //Reverse the string if we're using little endian
    if (useLittleEndian) { str = str.split('').reverse().join(''); }

    var byte0 = str.charCodeAt(0);
    var byte1 = str.charCodeAt(1);
    var byte2 = str.charCodeAt(2);
    var byte3 = str.charCodeAt(3);

    var sign = (byte0 >= 128) ? 1 : 0;
    var exponent = ((byte0 % 128) * 2) + Math.floor(byte1 / 128);
    var fraction = ((byte1 % 128) * 65536) + (byte2 * 256) + byte3;

    if (exponent == 255) {
        if (fraction == 0) { return Math.pow(-1, sign) * Number.POSITIVE_INFINITY; }
        else if (fraction == 2097151) { return Number.NaN; }
    }

    if (exponent == 0) {
        //Handle subnormal numbers
        return Math.pow(-1, sign) * Math.pow(2, -126) * (fraction / 2097152);
    } else {
        //Handle normal numbers
        return Math.pow(-1, sign) * Math.pow(2, -126) * (fraction / 2097152 + 1);
    }
}