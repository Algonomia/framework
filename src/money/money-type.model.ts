import { BigNumber } from 'mathjs';
import * as math from 'mathjs';
import { CurrencyChange } from './currency-exchange.model';

export class MoneyType {
    constructor(public amount: BigNumber, public currency?: string) {}

    static moneyTypeParser(key: string, jsonObject: {[key: string]: any}): MoneyType | undefined {
        const value = jsonObject[key];
        if (value === undefined) {
            return undefined;
        }
        if (typeof value === 'number' || !isNaN(Number(value))) {
            return new MoneyType(math.bignumber(value));
        }
        if (Object.keys(value).includes('amount')) {
            return new MoneyType(math.bignumber(value.amount), String(value.currency));
        }
        throw new Error(`Wrong type for key "${key}", should be: MoneyType or number`);
    }

    toJSON() {
        return {
            amount: math.number(this.amount),
            currency: this.currency
        };
    }

    public copy() {
        return new MoneyType(this.amount, this.currency);
    }

    public add(money: (MoneyType | undefined)[], options?: { currencyChange?: CurrencyChange, targetCurrency?: string }): MoneyType {
        const addFunc = (a: any, b: any) => math.add(a, b);
        return this._modify(addFunc, options?.currencyChange, options?.targetCurrency, ...money);
    }

    public subtract(money: (MoneyType | undefined)[], options?: { currencyChange?: CurrencyChange, targetCurrency?: string }): MoneyType {
        const subtractFunc = (a: any, b: any) => math.subtract(a, b);
        return this._modify(subtractFunc, options?.currencyChange, options?.targetCurrency, ...money);
    }

    public invert(): MoneyType {
        return new MoneyType(math.prod(math.bignumber(-1), this.amount), this.currency);
    }

    public weight(coefficient: BigNumber): MoneyType {
        return new MoneyType(math.prod(coefficient, this.amount), this.currency);
    }

    private _modify(operatorFunc: (a: any, b: any) => BigNumber, currencyChange?: CurrencyChange, targetCurrency?: string, ...money: (MoneyType | undefined)[]): MoneyType {
        const currChange = currencyChange ?? CurrencyChange.getDefaultCurrencyChange();
        const homogenizeMoneyPBT = currChange.homogenizeMoney(targetCurrency ?? this.currency,
            [this, ...money].reduce((a: any, b, idx) => {
                a[idx] = b;
                return a;
            }, {})
        );
        let amount = math.bignumber(this.amount);
        Object.keys(homogenizeMoneyPBT.convertedMoney).slice(1).forEach(k => {
            amount = operatorFunc(amount, homogenizeMoneyPBT.convertedMoney[k].amount);
        });
        return new MoneyType(amount, homogenizeMoneyPBT.sharedCurrency);
    }
}
