
class Stream {
    constructor (data) {
        this.Data = data;
        this.Position = 1;
    }
    read (nBytes) {
        if (this.Position > this.Data.length) return;
        if (nBytes == null) nBytes = 1;
        if (nBytes == Infinity) {
            const oldPos = this.Position
            this.Position = Infinity
            return this.Data.substring(oldPos)
        }
        const out = this.Data.substring(this.Position-1, this.Position+(nBytes-1))
        if (nBytes > 200) {throw new Error("Whattt?")}
        this.Position += nBytes
        return out
    }

    lookAhead (nBytes) {
        if (this.Position > this.Data.length) return;
        return this.Data.substring(this.Position-1, this.Position+(nBytes-1))
    }

    readUntil (pattern) {
        if (this.Position > this.Data.length) return;
        
        //Try to find the pattern
        let remaining = this.Data.substr(this.Position);
        let s = remaining.indexOf(pattern);
        if(s == -1){
            let pos = this.Position;
            this.Position = this.Data.length + 1;
            return this.Data.substr(pos);
        }
        
        //Otherwise, return data before the begging of the pattern, and the matched pattern
        //Position after this is the first character following the matched patterns
        let pos = this.Position;
        this.Position = this.Position + s;
        
        return [this.Data.substr(pos, pos+(s-2)), this.Data.substr(pos+(s-1), pos+(s-1)+pattern.length)];
    }

    readMatch (str) {
        str = this.lookAhead(str.length).match(/^(" + str + ")/gm)[0]
        this.Position += str.length
        return str
    }

    skip (nBytes) {
        this.Position += nBytes
    }

    jumpBack(nBytes) {
        this.Position = Math.max(this.Position - nBytes, 1)
    }

    checkNext(str) {
        return this.lookAhead(str.length).match(/^(" + str + ")/gm)[0]
    }

    hasData () {
        return this.Position <= this.Data.length
    }
}