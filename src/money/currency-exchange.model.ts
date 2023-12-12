import * as math from 'mathjs';
import {BigNumber} from 'mathjs';
import {ExchangesRatesInterface} from './interfaces/exchanges-rates.interface';
import {MoneyType} from './money-type.model';

export class CurrencyChange {

    constructor(exchangesRates?: ExchangesRatesInterface[]) {
        this._exchangesRates = exchangesRates ?? [];
    }

    readonly _exchangesRates: ExchangesRatesInterface[];

    public static getDefaultCurrencyChange: () => CurrencyChange = () => new CurrencyChange();

    public getRates(currency_in: string|undefined, currency_out: string|undefined, branch = new Set<ExchangesRatesInterface>()): BigNumber|undefined {
        if (currency_in === currency_out) {
            return math.bignumber(1);
        }
        const directs = this._exchangesRates.filter(exchangesRate => exchangesRate.currency_in === currency_in);
        const reverts = this._exchangesRates.filter(exchangesRate => exchangesRate.currency_out === currency_in);
        const foundDirect = directs.find(exchangesRate => exchangesRate.currency_out === currency_out);
        if (foundDirect) {
            return math.bignumber(foundDirect.rate);
        }
        const foundRevert = reverts.find(exchangesRate => exchangesRate.currency_in === currency_out);
        if (foundRevert) {
            return <BigNumber>math.divide(math.bignumber(1), math.bignumber(foundRevert.rate));
        }
        const recursiveDirects = directs.map(exchangesRate => {
            if (!branch.has(exchangesRate)) {
                const newBranch = new Set(branch);
                newBranch.add(exchangesRate);
                const otherRates = this.getRates(exchangesRate.currency_out, currency_out, newBranch);
                if (otherRates) {
                    return <BigNumber>math.multiply(math.bignumber(exchangesRate.rate), otherRates);
                }
            }
        }).find(x => x !== undefined);
        if (recursiveDirects) {
            return recursiveDirects;
        }
        const recursiveReverts = reverts.map(exchangesRate => {
            if (!branch.has(exchangesRate)) {
                const newBranch = new Set(branch);
                newBranch.add(exchangesRate);
                const otherRates = this.getRates(exchangesRate.currency_in, currency_out, newBranch);
                if (otherRates) {
                    return <BigNumber>math.multiply(math.divide(math.bignumber(1), math.bignumber(exchangesRate.rate)), otherRates);
                }
            }
        }).find(x => x !== undefined);
        if (recursiveReverts) {
            return recursiveReverts;
        }
    }

    public homogenizeMoney(
        localCurrency: string|undefined,
        inputsMoney: {[key: string]: MoneyType|undefined},
        forceLocalCurrency = false
    ): {sharedCurrency: string|undefined, convertedMoney: {[key: string]: MoneyType}} {
        const inputMoneyEntries = [...Object.entries(inputsMoney)];
        const originalMoneyType = inputMoneyEntries.find(([_, inputMoney]) => inputMoney?.currency !== undefined);
        const originalMoney = originalMoneyType ? originalMoneyType[1]?.currency : undefined;
        let keepOriginalMoney = inputMoneyEntries.every(([_, inputMoney]) => inputMoney?.currency === undefined || inputMoney.currency === originalMoney);
        if (forceLocalCurrency && keepOriginalMoney && originalMoney !== localCurrency && localCurrency) {
            keepOriginalMoney = false;
        }
        const convertedMoney: {[key: string]: MoneyType} = {};
        inputMoneyEntries.forEach(([key, inputMoney]) => {
            if (inputMoney !== undefined) {
                if (!keepOriginalMoney && !inputMoney.amount.equals(0) && inputMoney.currency !== undefined) {
                    const rate = this.getRates(inputMoney.currency, localCurrency);
                    if (rate) {
                        convertedMoney[key] = new MoneyType(<BigNumber>math.divide(inputMoney.amount, rate), localCurrency);
                    } else {
                        throw new Error('Missing rate for moneys: ' + localCurrency + ' | ' + inputMoney.currency);
                    }
                } else {
                    convertedMoney[key] = inputMoney;
                }
            } else {
                convertedMoney[key] = new MoneyType(math.bignumber(0));
            }
        });
        return {sharedCurrency: keepOriginalMoney ? originalMoney : localCurrency, convertedMoney};
    }
}
