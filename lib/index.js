const int128 = require('bindings')('addon').Int128;
const COMPARE_STATUS = {
    BIGGER: 1,
    EQUAL: 0,
    SMALLER: -1
};
/**
 * @param {String | Number} num 
 */
const parseNumber = function (num) {
    const ret = {
        safe: true,
        num
    };
    const absNum = +num;
    if (absNum < Number.MAX_SAFE_INTEGER && absNum > Number.MIN_SAFE_INTEGER) {        
        return ret;
    }
    ret.safe = false;
    ret.num = `${num}`;
    return ret;
}

class Int128 {
    constructor(bottom, top = undefined) {
        this.safeNumber = undefined;        

        this.isPositiveNumber = true;
        this.isDecimal = false;
        this.multiple = 0; //扩大的倍数 multiple * 10
        this.value = undefined;

        if (top === undefined || top == '0') {
            this._initValue(bottom);
        } else {
            let bottomParse = parseNumber(bottom);
            let topParse = parseNumber(top);

            this.value = new int128(bottomParse.num, topParse.num);
        }
    }
    /**
     * @param {string} value 
     * @param {boolean} safeCheck
     * @returns 
     */
    _initValue(value, safeCheck = true) {
        // value = +value || 0;
        const numParse = parseNumber(value);
        if (numParse.safe && safeCheck) {
            this.safeNumber = numParse.num;            
        } else {
            value = '' + value;
            if (value.charAt(0) === '-') {
                this.isPositiveNumber = false;
                value = value.substr(1);
            }
            const decimalPointIndex = value.indexOf('.');
            if (decimalPointIndex !== -1) {
                this.isDecimal = true;
                this.multiple = (value.length - decimalPointIndex - 1);
                value = value.replace('.', '').replace(/^0+/g, '');
            }
            this.value = new int128(value);
        }
    }
    /**
     * @returns {String}
     */
    get valueS() {
        if (this.safeNumber !== undefined) {
            return `${this.safeNumber}`;
        }

        if (this.value.compare(new int128(0)) === COMPARE_STATUS.EQUAL) {
            return '0';
        }

        let int128Str = this.value.value;
        if (this.isDecimal) {
            let temp = '';
            let multiple = this.multiple;
            for (let i = int128Str.length - 1; i >= 0; i--) {
                if (multiple === 0) {
                    temp = '.' + temp;
                }
                temp = int128Str.charAt(i) + temp;
                if (multiple >= 0) {
                    multiple--;
                }
            }
            int128Str = temp;
            for (let i = multiple; i >= 0; --i) {
                if (i === 0) {
                    int128Str = '0.' + int128Str;
                } else {
                    int128Str = '0' + int128Str;
                }
            }
        }
        if (!this.isPositiveNumber) {
            int128Str = '-' + int128Str;
        }
        return int128Str;
    }

    get isSafeNumber() {
        return this.safeNumber !== undefined;
    }
    get isPositive(){
        if(this.isSafeNumber){
            return this.safeNumber >= 0;
        }
        return this.isPositiveNumber;
    }
    /**
     * 针对1.00 去掉小数状态
     */
    _fixDecimal() {
        if (!this.isDecimal || this.safeNumber !== undefined) {
            return;
        }
        const numStr = this.value.value;
        const len = numStr.length;
        let flag = true;
        for (let i = 0; i < this.multiple && i < len; ++i) {
            if (numStr.charAt(len - 1 - i) !== '0') {
                flag = false;
                break;
            }
        }
        if (flag) {
            this.isDecimal = false;
            this.value.div(new int128(Math.pow(10, this.multiple)));
            this.multiple = 0;
        }
    }
    /**
     * from safeNumber
     */
    toInt128() {
        if (!this.isSafeNumber) {
            return;
        }
        this._initValue(this.safeNumber, false);        
        this.safeNumber = undefined;
    }
    /**
     * from int128
     */
    toSafeNumber() {
        if (this.isSafeNumber) {
            return;
        }
        const value = this.valueS;
        if (value < Number.MAX_SAFE_INTEGER && value > Number.MIN_SAFE_INTEGER) {
            this.safeNumber = +value;
            this.value = undefined;
            this.isPositiveNumber = true;
            this.isDecimal = false;
            this.multiple = 0;
            this.value = undefined;
        }
    }
    /**
     * 
     */
    getInt64s(){
        return [this.value.bottom, this.value.top]
    }
    /**
     * @returns {Int128}
     */
    clone(){
        if(this.isSafeNumber){
            return new Int128(this.safeNumber);
        }
        const ret = new Int128(this.value.bottom, this.value.top);
        ret.isPositiveNumber = this.isPositiveNumber;
        ret.isDecimal = this.isDecimal;
        ret.multiple = this.multiple;
        return ret;
    }
    /**
     * @param {String|Number|Int128} num 
     */
    plus(num = 0) {
        if (num instanceof Int128) {
            Plus(this, num);
        } else {
            const add = new Int128(num);
            Plus(this, add);
        }
        this.toSafeNumber();
        this._fixDecimal();
        return this;
    }
    /**
     * @param {String|Number|Int128} num 
     */
    sub(num = 0) {
        if (num instanceof Int128) {
            Sub(this, num);
        } else {            
            Sub(this, new Int128(num));
        }
        this.toSafeNumber();
        this._fixDecimal();
        return this;
    }
    /**
     * @param {String|Number|Int128} num 
     */
    mult(num = 0) {
        if (num instanceof Int128) {
            Mult(this, num);
        } else {            
            Mult(this, new Int128(num));
        }
        this.toSafeNumber();
        this._fixDecimal();
        return this;
    }
    /**
     * @param {String|Number|Int128} num
     * @param {Number} fixed
     */
    div(num = 1, fixed = 0) {
        if (num == '0') {
            throw new Error('Div 0');
        }
        if (this.safeNumber == 0) {
            return;
        }
        if (num instanceof Int128) {
            Div(this, num, fixed);
        } else {            
            Div(this, new Int128(num), fixed);
        }
        this.toSafeNumber();
        this._fixDecimal();
        return this;
    }
    /**
     * @param {String|Number|Int128} num 
     */
    compare(num){
        let ret = null;
        if (num instanceof Int128) {
            ret = Compare(this, num);
        } else {            
            ret = Compare(this, new Int128(num));
        }
        return ret;
    }
}
/**
 * @param {Int128} x 
 * @param {Int128} y 
 */
const Plus = function (x, y) {
    if (x.isSafeNumber && y.isSafeNumber) {
        const sum = x.safeNumber + y.safeNumber;

        if (sum < Number.MAX_SAFE_INTEGER && sum > Number.MIN_SAFE_INTEGER) {
            x.safeNumber = sum;
            return;
        }
    }
    x.toInt128();
    y.toInt128();

    if (y.multiple > x.multiple) {
        x.value.mult((new int128(Math.pow(10, (y.multiple - x.multiple)))));
        x.multiple = y.multiple;
    } else if (y.multiple < x.multiple) {
        y.value.mult((new int128(Math.pow(10, (x.multiple - y.multiple)))));
        y.multiple = x.multiple;
    }
    x.isDecimal = x.multiple > 0;

    if (x.isPositiveNumber === y.isPositiveNumber) {
        x.value.plus(y.value);
    } else {
        //比较大小
        const compareRet = x.value.compare(y.value);
        if (compareRet === COMPARE_STATUS.BIGGER) {
            x.value.sub(y.value);
        } else {
            x.isPositiveNumber = y.isPositiveNumber;
            const newValue = new int128(y.value.bottom, y.value.top);
            newValue.sub(x.value);
            x.value = newValue;
        }
    }
}
/**
 * @param {Int128} x 
 * @param {Int128} y 
 */
const Sub = function (x, y) {
    if (x.isSafeNumber && y.isSafeNumber) {
        const sum = x.safeNumber - y.safeNumber;
        if (sum < Number.MAX_SAFE_INTEGER && sum > Number.MIN_SAFE_INTEGER) {
            x.safeNumber = sum;
            return;
        }
    }
    y.toInt128();
    y.isPositiveNumber = !y.isPositiveNumber;
    Plus(x, y);
}
/**
 * @param {Int128} x 
 * @param {Int128} y 
 */
const Mult = function (x, y) {
    if (x.isSafeNumber && y.isSafeNumber) {
        const total = x.safeNumber * y.safeNumber
        if (total < Number.MAX_SAFE_INTEGER && total > Number.MIN_SAFE_INTEGER) {
            x.safeNumber = total;
            return;
        }
    }
    x.toInt128();
    y.toInt128();

    if (x.value.compare(new int128(0)) === COMPARE_STATUS.EQUAL) {
        x.safeNumber = 0;
        x.isPositiveNumber = true;
        x.isDecimal = false;
        x.multiple = 0;
        return;
    }
    if (y.value.compare(new int128(0)) === COMPARE_STATUS.EQUAL) {
        x.safeNumber = 0;
        x.isPositiveNumber = true;
        x.isDecimal = false;
        x.multiple = 0;
        return;
    }
    x.isPositiveNumber = x.isPositiveNumber === y.isPositiveNumber;
    x.multiple += y.multiple;
    x.isDecimal = x.multiple > 0;

    x.value.mult(y.value);
}
/**
 * @param {Int128} x 
 * @param {Int128} y  
 * @param {Number} fixed
 */
const Div = function (x, y, fixed) {
    if(x.isSafeNumber && y.isSafeNumber){
        const total = x / y;
        if(total < Number.MAX_SAFE_INTEGER && total > Number.MIN_SAFE_INTEGER){
            x.safeNumber = total;
            return;
        }
    }
    x.toInt128();
    y.toInt128();

    const fix = fixed - x.multiple;
    if (fix > 0) {
        x.value.mult(new int128(Math.pow(10, fix)));
        x.multiple += fix;
        x.isDecimal = true;
    }
    x.isPositiveNumber = x.isPositiveNumber === y.isPositiveNumber;
    if (y.isDecimal) {
        x.value.mult(new int128(Math.pow(10, y.multiple)));
    }
    x.value.div(y.value);
}
/**
 * @param {Int128} x 
 * @param {Int128} y 
 */
const Compare = function(x, y){    
    if(x.isSafeNumber && y.isSafeNumber){
        if(x.safeNumber > y.safeNumber){
            return COMPARE_STATUS.BIGGER;
        }
        if(x.safeNumber < y.safeNumber){
            return COMPARE_STATUS.SMALLER;
        }
        return COMPARE_STATUS.EQUAL;
    }
    x.toInt128();
    y.toInt128();
    if(x.isPositive && !y.isPositive){
        return COMPARE_STATUS.BIGGER;
    }else if(!x.isPositive && y.isPositive){
        return COMPARE_STATUS.SMALLER;
    }
    
    if(!x.isDecimal && !y.isDecimal){
        return _CompareInteger(x, y);
    }
    return _CompareDecimal(x, y);
}
/**
 * 比较同符号整数
 * @param {Int128} x 
 * @param {Int128} y 
 */
const _CompareInteger = function(x, y){
    let status = x.value.compare(y.value);
    if(status === COMPARE_STATUS.EQUAL){
        return status
    }
    if(!x.isPositive){
        status = status === COMPARE_STATUS.BIGGER ? COMPARE_STATUS.SMALLER:COMPARE_STATUS.BIGGER;
    }
    return status;
}
/**
 * 比较同符号整数
 * @param {Int128} x 
 * @param {Int128} y 
 */
const _CompareDecimal = function(x, y){
    const mul = Math.pow(10, Math.max(x.multiple, y.multiple));
    const tempX = new Int128(1);
    tempX.mult(x).mult(mul);
    const tempY = new Int128(1);
    tempY.mult(y).mult(mul);
    return _CompareInteger(tempX, tempY);
}

module.exports ={
    Int128,
    COMPARE_STATUS
};