
function compareByteArrays(array0, array1) {
    //Disqualify any cases where array  lengths are not the same
    if (array0.length != array1.length) { return false; }

    //Compare byte arrays as strings
    var str0 = String.fromCharCode.apply(null, array0);
    var str1 = String.fromCharCode.apply(null, array1);
    return str0 == str1;
}

function readString(data) {
    const length = Binary.decodeInt(data.read(4), true)
    if (length == 0) return "";
    return data.read(length)
}

function setPropertyDirect(instance, name, value) {
    instance[name] = value
}

const PROPERTY_NAME_FIX = {
    "size": "Size",
    "Color3uint8": "Color"
}

function setProperty(instance, name, value) {
    name = PROPERTY_NAME_FIX[name] || name;
    var ok = true, errorStr = "";
    try {
        setPropertyDirect(instance, name, value);
    } catch (e) {
        ok = false;
    }
    if (!ok) {
        if (name == "Source") {
            console.log("Source: ");
            console.log(value);
        }
    }
}
function readInterleaved(stream, valueLength, valueCount) {
    var values = new Array(valueCount).fill(0);

    //Fill with new tables with the correct length
    for (var i = 0; i < valueCount; i++) {
        values[i] = new Array(valueLength).fill(0);
    }

    for (var i = 0; i < valueLength; i++) {
        //Read byte for each value
        for (var j = 0; j < valueCount; j++) {
            values[j][i] = stream.read(1);
        }
    }

    //Concatenate all the values
    for (var i = 0; i < valueCount; i++) {
        values[i] = values[i].join('');
    }

    return values;
}

function readRobloxInt(strInput, littleEndian) {
    const int = Binary.decodeInt(strInput, littleEndian)

    if (int % 2 == 0) {
        return int / 2
    } else {
        return -(int + 1) / 2
    }
}

function readRobloxFloat(strInput) {
    const int = Binary.decodeInt(strInput, false)
    const sign = int % 2
    const str = Binary.encodeInt(sign * 0x80000000 + (int - sign) / 2, 4)

    return Binary.decodeFloat(str, false)
}

const NORMAL_IDS = {
    [0x01]: "Enum.NormalId.Front",
    [0x02]: "Enum.NormalId.Bottom",
    [0x04]: "Enum.NormalId.Left",
    [0x08]: "Enum.NormalId.Back",
    [0x10]: "Enum.NormalId.Top",
    [0x20]: "Enum.NormalId.Right",
}

const AXIS_VALUES = {
    [0x00]: "Vector3.new( 0, 0, 0)",
    [0x01]: "Vector3.new( 0, 0, 1)",
    [0x02]: "Vector3.new( 0, 1, 0)",
    [0x03]: "Vector3.new( 0, 1, 1)",
    [0x04]: "Vector3.new( 1, 0, 0)",
    [0x05]: "Vector3.new( 1, 0, 1)",
    [0x06]: "Vector3.new( 1, 1, 0)",
    [0x07]: "Vector3.new( 1, 1, 1)",
}
const CF000 = 0
const CF090 = Math.PI / 2
const CF180 = Math.PI
const CF270 = -Math.PI / 2
const CFRAME_SPECIAL_ANGLES = {
    [0x02]: `CFrame.Angles(${CF000}, ${CF000}, ${CF000})`,
    [0x03]: `CFrame.Angles(${CF090}, ${CF000}, ${CF000})`,
    [0x05]: `CFrame.Angles(${CF180}, ${CF000}, ${CF000})`,
    [0x06]: `CFrame.Angles(${CF270}, ${CF000}, ${CF000})`,
    [0x07]: `CFrame.Angles(${CF180}, ${CF000}, ${CF270})`,
    [0x09]: `CFrame.Angles(${CF090}, ${CF090}, ${CF000})`,
    [0x0A]: `CFrame.Angles(${CF000}, ${CF000}, ${CF090})`,
    [0x0C]: `CFrame.Angles(${CF270}, ${CF270}, ${CF000})`,

    [0x0D]: `CFrame.Angles(${CF270}, ${CF000}, ${CF270})`,
    [0x0E]: `CFrame.Angles(${CF000}, ${CF270}, ${CF000})`,
    [0x10]: `CFrame.Angles(${CF090}, ${CF000}, ${CF090})`,
    [0x11]: `CFrame.Angles(${CF180}, ${CF090}, ${CF000})`,
    [0x14]: `CFrame.Angles(${CF180}, ${CF000}, ${CF180})`,
    [0x15]: `CFrame.Angles(${CF270}, ${CF000}, ${CF180})`,
    [0x17]: `CFrame.Angles(${CF000}, ${CF000}, ${CF180})`,
    [0x18]: `CFrame.Angles(${CF090}, ${CF000}, ${CF180})`,

    [0x19]: `CFrame.Angles(${CF000}, ${CF000}, ${CF270})`,
    [0x1B]: `CFrame.Angles(${CF090}, ${CF270}, ${CF000})`,
    [0x1C]: `CFrame.Angles(${CF180}, ${CF000}, ${CF090})`,
    [0x1E]: `CFrame.Angles(${CF270}, ${CF090}, ${CF000})`,
    [0x1F]: `CFrame.Angles(${CF090}, ${CF000}, ${CF270})`,
    [0x20]: `CFrame.Angles(${CF000}, ${CF090}, ${CF000})`,
    [0x22]: `CFrame.Angles(${CF270}, ${CF000}, ${CF090})`,
    [0x23]: `CFrame.Angles(${CF180}, ${CF270}, ${CF000})`,
}
const PROPERTY_FUNCTIONS = {
	//String
    [0x01]: function (nInstances, stream) {
        const values = new Array(nInstances).fill("");

        for (let i = 0; i < nInstances; i++) values[i] = readString(stream);

        return values;
    },

    //Boolean
    [0x02]: function (nInstances, stream) {
        const values = new Array(nInstances).fill(false);

        for (var i = 0; i < nInstances; i++) values[i] = !!(stream.read(1) !== "\0");

        return values;
    },
    //Int32
    [0x03]: function (nInstances, stream) {
        var valuesRaw = readInterleaved(stream, 4, nInstances)
        var values = new Array(nInstances).fill(0);

        for (var i = 0; i < nInstances; i++) values[i] = readRobloxInt(valuesRaw[i]);

        return values;
    },

    //Float
    [0x04]: function (nInstances, stream) {
        var valuesRaw = readInterleaved(stream, 4, nInstances)
        var values = new Array(nInstances).fill(0);

        for (var i = 0; i < nInstances; i++) values[i] = readRobloxFloat(valuesRaw[i]);

        return values;
    },

    //Double
    [0x05]: function (nInstances, stream) {
        var valuesRaw = readInterleaved(stream, 8, nInstances)
        var values = new Array(nInstances).fill(0);

        for (var i = 0; i < nInstances; i++) values[i] = Binary.decodeDouble(valuesRaw[i].reverse());

        return values;
    },
    //UDim
    [0x06]: function (nInstances, stream) {
        var floatsRaw = readInterleaved(stream, 4, nInstances)
        var int32sRaw = readInterleaved(stream, 4, nInstances)
        var values = new Array(nInstances).fill(0);

        for (var i = 0; i < nInstances; i++) {
            var udim = `UDim.new(${readRobloxFloat(floatsRaw[i])}, ${readRobloxInt(int32sRaw[i])})`;

            values[i] = udim;
        }

        return values;
    },

    //UDim2
    [0x07]: function (nInstances, stream) {
        var scalesX = readInterleaved(stream, 4, nInstances);
        var scalesY = readInterleaved(stream, 4, nInstances);
        var offsetsX = readInterleaved(stream, 4, nInstances);
        var offsetsY = readInterleaved(stream, 4, nInstances);
        var values = new Array(nInstances).fill(0);

        for (var i = 0; i < nInstances; i++) {
            var udim = `UDim2.new(
                ${readRobloxFloat(scalesX[i])},
                ${readRobloxInt(offsetsX[i])},
                ${readRobloxFloat(scalesY[i])},
                ${readRobloxInt(offsetsY[i])}
            )`;

            values[i] = udim;
        }

        return values;
    },

    //Ray
    [0x08]: function (nInstances, stream) {
        var values = new Array(nInstances).fill(0);

        for (var i = 0; i < nInstances; i++) {
            var originX = Binary.decodeFloat(stream.read(4).reverse());
            var originY = Binary.decodeFloat(stream.read(4).reverse());
            var originZ = Binary.decodeFloat(stream.read(4).reverse());
            var dirX = Binary.decodeFloat(stream.read(4).reverse());
            var dirY = Binary.decodeFloat(stream.read(4).reverse());
            var dirZ = Binary.decodeFloat(stream.read(4).reverse());

            var ray = `Ray.new(
                Vector3.new(${originX}, ${originY}, ${originZ}),
                Vector3.new(${dirX}, ${dirY}, ${dirZ})
            )`;

            values[i] = ray;
        }

        return values;
    },

    //Faces
    [0x09]: function (nInstances, stream) {
        var values = new Array(nInstances).fill(0);

        for (var i = 0; i < nInstances; i++) {
            var index = Binary.decodeInt(stream.read(1));
            var surface = NORMAL_IDS[index];

            assert(surface != null, "RBXMReader E007: Unknown surface type: " + index);

            values[i] = surface;
        }

        return values;
    },

    //Axis
    [0x0A]: function (nInstances, stream) {
        var values = new Array(nInstances).fill(0);

        for (var i = 0; i < nInstances; i++) {
            var index = Binary.decodeInt(stream.read(1));
            var axis = AXIS_VALUES[index];

            assert(axis != null, "RBXMReader E008: Unknown axis type: " + index);

            values[i] = axis;
        }

        return values;
    },

    //BrickColor
    [0x0B]: function (nInstances, stream) {
        var values = new Array(nInstances).fill(0);

        for (var i = 0; i < nInstances; i++) {
            var color = `BrickColor.new(${Binary.decodeInt(stream.read(4))});`

            values[i] = color;
        }

        return values;
    },
    //Color3
    [0x0C]: function (nInstances, stream) {
        var valuesRawR = readInterleaved(stream, 4, nInstances);
        var valuesRawG = readInterleaved(stream, 4, nInstances);
        var valuesRawB = readInterleaved(stream, 4, nInstances);
        var values = Array(nInstances).fill(0);

        for (let i = 0; i < nInstances; i++) {
            values[i] = `Color3.fromRGB(
                ${readRobloxFloat(valuesRawR[i])},
                ${readRobloxFloat(valuesRawG[i])},
                ${readRobloxFloat(valuesRawB[i])}
            );`
        }

        return values;
    },

    //Vector2
    [0x0D]: function (nInstances, stream) {
        var valuesRawX = readInterleaved(stream, 4, nInstances);
        var valuesRawY = readInterleaved(stream, 4, nInstances);
        var values = Array(nInstances).fill(0);

        for (let i = 0; i < nInstances; i++) {
            values[i] = `Vector2.new(
                ${readRobloxFloat(valuesRawX[i])},
                ${readRobloxFloat(valuesRawY[i])}
            )`;
        }

        return values;
    },

    //Vector3
    [0x0E]: function (nInstances, stream) {
        var valuesRawX = readInterleaved(stream, 4, nInstances);
        var valuesRawY = readInterleaved(stream, 4, nInstances);
        var valuesRawZ = readInterleaved(stream, 4, nInstances);
        var values = Array(nInstances).fill(0);

        for (let i = 0; i < nInstances; i++) {
            values[i] = `Vector3.new(
                ${readRobloxFloat(valuesRawX[i])},
                ${readRobloxFloat(valuesRawY[i])},
                ${readRobloxFloat(valuesRawZ[i])}
            );`
        }

        return values;
    },

    //0x0F is invalid

    //CFrame
    [0x10]: function (nInstances, stream) {
        var cframeAngles = Array(nInstances).fill("CFrame.new()");
        var values = Array(nInstances).fill("CFrame.new()");

        //Get CFrame angles
        for (let i = 0; i < nInstances; i++) {
            //Check CFrame type
            let byteValue = Binary.decodeInt(stream.read(1));
            let specialAngle = CFRAME_SPECIAL_ANGLES[byteValue];

            //If we have a special value, store it. Otherwise, read 9 untransformed floats to get
            //the rotation matrix
            if (specialAngle == undefined) {
                let matrixValues = Array(9).fill(0);
                for (let j = 0; j < 9; j++) {
                    matrixValues[j] = Binary.decodeFloat(stream.read(4), true);
                }

                cframeAngles[i] = "CFrame.new(0, 0, 0, " + matrixValues + ")";
            } else {
                cframeAngles[i] = specialAngle;
            }
        }

        //Read position data - invoke function for Vector3s
        var positions = PROPERTY_FUNCTIONS[0x0E](nInstances, stream);

        //Generate final CFrames
        for (let i = 0; i < nInstances; i++) {
            values[i] = `CFrame.new(${positions[i]}) * ${cframeAngles[i]}`;
        }

        return values;
    },

    //Quaternion; unsure how this is implemented. Might require some experimentation later
    //TODO: Fix this
    [0x11]: function (nInstances, stream) {
        warn("RBXMReader W001: Using quaternions");
        return PROPERTY_FUNCTIONS[0x10](nInstances, stream);
    },

    //Enums - Roblox accepts EnumProperty = number so we can just return an array of numbers
    [0x12]: function (nInstances, stream) {
        var valuesRaw = readInterleaved(stream, 4, nInstances);
        var values = Array(nInstances).fill(0);

        for (let i = 0; i < nInstances; i++) {
            values[i] = Binary.decodeInt(valuesRaw[i]);
        }

        return values;
    },

    //Instance references
    [0x13]: function (nInstances, stream, instances) {
        var valuesRaw = readInterleaved(stream, 4, nInstances);
        var values = Array(nInstances).fill(0);

        var lastValue = 0;
        for (let i = 0; i < nInstances; i++) {
            var rawValue = readRobloxInt(valuesRaw[i]);
            var newValue = rawValue + lastValue;
            lastValue = newValue;
            values[i] = instances[newValue];
        }

        return values;
    },

    //Color3uint8
    [0x1A]: function (nInstances, stream) {
        var valuesR = Array(nInstances).fill(0);
        var valuesG = Array(nInstances).fill(0);
        var valuesB = Array(nInstances).fill(0);
        var values = Array(nInstances).fill(0);

        for (let i = 0; i < nInstances; i++) { valuesR[i] = Binary.decodeInt(stream.read(1)); }
        for (let i = 0; i < nInstances; i++) { valuesG[i] = Binary.decodeInt(stream.read(1)); }
        for (let i = 0; i < nInstances; i++) { valuesB[i] = Binary.decodeInt(stream.read(1)); }

        for (let i = 0; i < nInstances; i++) {
            values[i] = `Color3.fromRGB(
                ${readRobloxFloat(valuesR[i])},
                ${readRobloxFloat(valuesG[i])},
                ${readRobloxFloat(valuesB[i])}
            );`
        }

        return values;
    }
}
function unpack(str) {
    var bytes = [];
    for (var i = 0; i < str.length; i++) {
        var char = str.charCodeAt(i);
        bytes.push(char);
    }
    return bytes;
}
function readRBXM(binaryData) {
    const data = new Stream(binaryData);

    //Read & verify file header
    //First 16 bytes should be 3C 72 6F 62 6C 6F 78 21 89 FF 0D 0A 1A 0A 00 00
    const headerActualBytes = new Uint8Array(unpack(data.read(16)))
    headerActualBytes[8] = 0x89
    headerActualBytes[9] = 0xFF
    const headerExpectedBytes = new Uint8Array([0x3C, 0x72, 0x6F, 0x62, 0x6C, 0x6F, 0x78, 0x21, 0x89, 0xFF, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00]);

    //Check to make sure the header is valid
    //console.log(headerActualBytes, headerExpectedBytes)
    //console.log(data)
    assert(
        compareByteArrays(headerActualBytes, headerExpectedBytes),
        "RBXMReader E001: Invalid RBXM header"
    );

    //Read number of unique types
    const nUniqueTypes = Binary.decodeInt(data.read(4), true);
    const nObjects = Binary.decodeInt(data.read(4), true);

    //Verify that the next 8 bytes are 0
    assert(Binary.decodeInt(data.read(4), true) == 0, "RBXMReader E002: Invalid RBXM header");
    assert(Binary.decodeInt(data.read(4), true) == 0, "RBXMReader E002: Invalid RBXM header");

    //Create lookup tables for information
    const METADATA = {};
    const SHAREDSTRINGS = {};
    const TYPES = {};
    const INSTANCES = {};
    //Read header data
    while (true) {
        try {
            //Read type through look-ahead, once we get a PROP, exit
            let typeStr = data.lookAhead(4);
            if (typeStr == "PROP") { break; }
    
            //Read type bytes and compressed data
            const headerType = data.read(4);
            const headerData = new Stream(decodeLZ4(data));
    
            //Read META, SSTR and INST records
            if (headerType == "META") {
                //Read number of key/value pairs (possibly?); this *should* be 1 at the moment
                const length = Binary.decodeInt(headerData.read(4), true);
                for (let j = 0; j < length; j++) {
                    //Read key/value pairs, and store the result
                    const key = readString(headerData);
                    const value = readString(headerData);
                    METADATA[key] = value;
                }
            } else if (headerType == "SSTR") {
                //Read shared strings
                //TODO: Implement this; low priority currently
                const version = headerData.read(4)
                const stringCount = headerData.read(4)
                
                for(let i = 0; i < stringCount; i++) {
                    const md5 = headerData.read(16)
                    const length = Binary.decodeInt(headerData.read(4), true)
                    const value = readString(length)

                    SHAREDSTRINGS[i] = {md5, value}
                }
            } else if (headerType == "INST") {
                //Read INST thing
                const index = Binary.decodeInt(headerData.read(4), true);
                const className = readString(headerData);
                const isService = headerData.read(1) !== "\0";
                const nInstances = Binary.decodeInt(headerData.read(4), true);
                const referents = readInterleaved(headerData, 4, nInstances);
    
                //Reading RBXM, so we should never have a service
                //assert(!isService, "RBXMReader E004: File contains services");
    
                //Create the instances
                const instances = new Array(nInstances).fill(0);
                let referent = 0;
                for (let j = 0; j < nInstances; j++) {
                    referent = referent + readRobloxInt(referents[j]);
                    instances[j] = {};
                    INSTANCES[referent] = {};
                }
    
                //Store the type reference
                TYPES[index] = {
                    Index: index,
                    ClassName: className,
                    IsService: isService,
                    InstanceCount: nInstances,
                    Instances: instances
                };
            } else {
                //Error because of unexpected header type
                throw new Error("RBXMReader E003: Unexpected header object type: " + headerType);
            }
        } catch(e) {
            console.warn(e)
            break
        }
    }

    //Read actual body
    while (true) {
        try {
            //Read object type and decompress its data
            const objType = data.read(4);
            const decoded = decodeLZ4(data)
            const objData = new Stream(decoded);
    
            //These seem to all be PROP elements but we'll make this easily expandable for the future
            if (objType === "PROP") {
                //Handle property descriptor
                const classIndex = Binary.decodeInt(objData.read(4), true);
                const propertyName = readString(objData);
                const propertyType = Binary.decodeInt(objData.read(1));
                const descriptor = TYPES[classIndex];
                const nInstances = descriptor.InstanceCount;
                const instances = descriptor.Instances;
                if (PROPERTY_FUNCTIONS[propertyType]) {
                    const values = PROPERTY_FUNCTIONS[propertyType](nInstances, objData, INSTANCES);
        
                    //Iterate over instances with this function
                    for (let j = 0; j < nInstances; j++) {
                        setProperty(instances[j], propertyName, values[j]);
                    }
                }
            } else if (objType === "PRNT") {
                //Parent data
                //Read length of the list
                //May have to skip one character? We have an extra 0x00
                objData.read(1);
                const parentLength = Binary.decodeInt(objData.read(4), true);
                const referents = readInterleaved(objData, 4, parentLength);
                const parents = readInterleaved(objData, 4, parentLength);
    
                let cReferent = 0
                let cParent = 0
                for (let j = 0; j < parentLength; j++) {
                    cReferent += readRobloxInt(referents[j]);
                    cParent += readRobloxInt(parents[j]);

                    const instance = INSTANCES[cReferent];
                    if (!instance) continue;
                    if (cParent == -1) {
                        instance.Parent = null;
                    } else {
                        instance.Parent = INSTANCES[cParent];
                    }
                }
            } else {
                console.warn("RBXMReader E005: File contains unexpected body element: " + objType);
                break
            }
        }catch (e) {
            console.warn(e)
            break
        }
    }

    //Ending bytes
    const endExpectedBytes = new Uint8Array([0x45, 0x4E, 0x44, 0x00, 0x00, 0x00, 0x00, 0x00, 0x09, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3C, 0x2F, 0x72, 0x6F, 0x62, 0x6C, 0x6F, 0x78, 0x3E]);
    const footerBytes = data.read(25);

    //Check to make sure the footer is valid
    // assert(
    //     compareByteArrays(footerBytes, endExpectedBytes),
    //     "RBXMReader E007: Invalid RBXM footer"
    // );
    return TYPES
}
