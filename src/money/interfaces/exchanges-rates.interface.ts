import {getValueFromKeyIfTypeCompatibleMandatory} from '../../parsing/parsing';

export interface ExchangesRatesInterface {
    currency_in: string;
    currency_out: string;
    rate: number;
}

export function exchangesRatesParser(jsonData: {}[]): ExchangesRatesInterface[]|undefined {
    return jsonData?.map(entry => {
        const parsed: ExchangesRatesInterface = {
            currency_in: getValueFromKeyIfTypeCompatibleMandatory<string>('currency_in', entry, 'string'),
            currency_out: getValueFromKeyIfTypeCompatibleMandatory<string>('currency_out', entry, 'string'),
            rate: getValueFromKeyIfTypeCompatibleMandatory<number>('rate', entry, 'number')
        };
        return parsed;
    });
}
