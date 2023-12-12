import { CurrencyChange } from './money/currency-exchange.model';
import { ExchangesRatesInterface, exchangesRatesParser } from './money/interfaces/exchanges-rates.interface';
import { MoneyType } from './money/money-type.model';
import {getValueFromKeyIfTypeCompatible, getValueFromKeyIfTypeCompatibleMandatory } from './parsing/parsing';

export {
    getValueFromKeyIfTypeCompatibleMandatory,
    getValueFromKeyIfTypeCompatible,

    MoneyType,
    CurrencyChange,
    ExchangesRatesInterface,
    exchangesRatesParser
};
