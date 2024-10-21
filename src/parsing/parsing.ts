export function getValueFromKeyIfTypeCompatibleMandatory<T>(key: string, jsonObject: {[key: string]: any}, type: any, isArray: boolean = false): T {
    if (!jsonObject.hasOwnProperty(key)) {
        throw new Error('Missing key "' + key + '" in input');
    }
    return <T>getValueFromKeyIfTypeCompatible<T>(key, jsonObject, type, isArray);
}

export function getValueFromKeyIfTypeCompatible<T>(key: string, jsonObject: {[key: string]: any}, type: any, isArray: boolean = false): T|undefined {
    let jsonValue = jsonObject[key];
    if (jsonValue === undefined) {
        return undefined;
    }
    if (jsonValue === null) {
        return null;
    }
    if (isArray) {
        try {
            return jsonValue.map((iteration: any) => getValueFromKeyIfTypeCompatible<T>('key', {key: iteration}, type));
        } catch (e) {
            throw e;
        }
    } else if (jsonValue instanceof Array) {
        if (jsonValue.length > 1) {
            throw new Error('Wrong type for key "' + key + '", is an array but should not be.');
        }
        jsonValue = jsonValue[0];
    }
    if (typeof type !== 'function') {
        if (typeof jsonValue !== type) {
            try {
                if (type === 'number') {
                    const ret = Number(jsonValue);
                    if (isNaN(ret)) { throw new Error(); }
                    return <T><unknown>ret;
                }
                if (type === 'boolean') {
                    const ret = Boolean(JSON.parse(typeof jsonValue === 'string' ? jsonValue.toLowerCase() : jsonValue));
                    return <T><unknown>ret;
                }
                if (typeof type === 'object') {
                    if (Object.values(type).slice(Object.values(type).length / 2).every(value => typeof value === 'number')) {
                        const ret = Number(jsonValue);
                        if (isNaN(ret)) { throw new Error(); }
                        return <T><unknown>ret;
                    }
                }
                if (type === 'string') {
                    return <T><unknown>String(jsonValue);
                }
            } catch (e) {
                throw new Error('Wrong type for key "' + key + '", should be: ' + type);
            }
        }
    } else if (!(jsonValue instanceof type)) {
        try {
            if (type === Date) {
                let val = jsonValue;
                if (!isNaN(Number(val))) {
                    val = Number(val);
                }
                const ret = new Date(val);
                if (isNaN(ret.getTime())) { throw new Error(); }
                return <T><unknown>ret;
            }
        } catch (e) {
            throw new Error('Wrong type for key "' + key + '", should be: ' + type);
        }
    }
    return <T>jsonValue;
}
