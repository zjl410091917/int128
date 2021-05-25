const int128 = require('bindings')('addon').Int128;
const COMPARE_STATUS = {
    BIGGER: 1,
    EQUAL: 0,
    SMALLER: -1
};
class Int128 {
    constructor(bottom, top = undefined) {
        this.isPositiveNumber = true;
        this.isDecimal = false;
        this.multiple = 0; //扩大的倍数 multiple * 10

        this.value = undefined;
        if (top === undefined) {
            this._initValue(`${bottom}`);
        } else {
            this.value = new int128(`${bottom}`, `${top}`);
        }
    }
    /**
     * @param {string} value 
     * @returns 
     */
    _initValue(value) {
        if (isNaN(value)) {
            this.value = new int128(0);
            return;
        }
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
    /**
     * @returns {String}
     */
    get valueS() {
        if(this.value.compare(new int128(0)) === COMPARE_STATUS.EQUAL){
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
    /**
     * 针对1.00 去掉小数状态
     */
    _fixDecimal(){
        if(!this.isDecimal){
            return;
        }
        const numStr = this.value.value;
        const len = numStr.length;
        let flag = true;
        for(let i = 0; i < this.multiple && i < len; ++i){
            if(numStr.charAt(len - 1 - i) !== '0'){
                flag = false;
                break;
            }
        }
        if(flag){
            this.isDecimal = false;
            this.value.div(new int128(Math.pow(10, this.multiple)));
            this.multiple = 0;
        }
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
        this._fixDecimal();
        return this;
    }
    /**
     * @param {String|Number|Int128} num 
     */
    sub(num = 0){
        if (num instanceof Int128) {
            num.isPositiveNumber  = !num.isPositiveNumber;
            Plus(this, num);
        } else {
            const add = new Int128(num);
            add.isPositiveNumber = !add.isPositiveNumber;
            Plus(this, add);
        }
        this._fixDecimal();
        return this;
    }
    /**
     * @param {String|Number|Int128} num 
     */
    mult(num = 0){
        if (num instanceof Int128) {
            Mult(this, num);
        } else {
            const add = new Int128(num);
            Mult(this, add);
        }
        this._fixDecimal();
        return this;
    }
    /**
     * @param {String|Number|Int128} num
     * @param {Number} fixed
     */
    div(num = 1, fixed = 0){
        if(num == '0'){
            throw new Error('Div 0');
        }
        if(this.value.compare(new int128(0)) === COMPARE_STATUS.EQUAL){
            return;
        }
        const fix = fixed - this.multiple;
        if(fix > 0){            
            this.value.mult(new int128(Math.pow(10, fix)));
            this.multiple += fix;
            this.isDecimal = true;
        }
        if (num instanceof Int128) {
            Div(this, num);
        } else {
            const add = new Int128(num);
            Div(this, add);
        }

        this._fixDecimal();
        return this;
    }
}
/**
 * @param {Int128} x 
 * @param {Int128} y 
 */
const Plus = function(x, y){
    if (y.multiple > x.multiple) {
        x.value.mult((new int128(Math.pow(10, (y.multiple - x.multiple)))));
        x.multiple = y.multiple;
    } else if (y.multiple < x.multiple) {
        y.value.mult((new int128(Math.pow(10, (x.multiple - y.multiple) ))));
        y.multiple = x.multiple;
    }
    x.isDecimal = x.multiple > 0;

    if (x.isPositiveNumber === y.isPositiveNumber) {
        x.value.plus(y.value);
    } else {
        //比较大小
        const compareRet = x.value.compare(y.value);
        if(compareRet === COMPARE_STATUS.BIGGER){
            x.value.sub(y.value);
        }else{
            x.isPositiveNumber = y.isPositiveNumber;
            const newValue = new int128(y.value.bottom,y.value.top);
            newValue.sub(x.value);
            x.value = newValue;                
        }
    }    
}
/**
 * @param {Int128} x 
 * @param {Int128} y 
 */
const Mult = function(x, y){
    if(x.value.compare(new int128(0)) === COMPARE_STATUS.EQUAL){
        return;
    }
    if(y.value.compare(new int128(0)) === COMPARE_STATUS.EQUAL){
        x.value = new int128(0);
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
 */
const Div = function(x, y){
    x.isPositiveNumber = x.isPositiveNumber === y.isPositiveNumber;
    if(y.isDecimal){
        x.value.mult(new int128(Math.pow(10, y.multiple)));
    }
    x.value.div(y.value);
}
module.exports = Int128;