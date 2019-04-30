export const noop = () => { };

export function createNumList(num) {
    const result = [];

    for (let i = 0; i < num; i++) {
        result.push(i);
    }

    return result;
}


export function diffListItem(num, list) {
    const result = [],
        len = list.length,
        max = len + num;

    for (let i = num; i < max; i++) {
        result.push(i);
    }

    const { diffIndex, diff } = difference(list, result);

    return {
        newList: result,
        diff,
        diffIndex
    };
}

export function difference(prev, next) {
    const result = [],
        diffIndex = [],
        lists = prev.concat(next);

    for (let val of lists) {
        if (!prev.includes(val)) {
            result.push({
                index: val,
                visible: true
            });
            diffIndex.push(val);
        }

        if (!next.includes(val)) {
            result.push({
                index: val,
                visible: false
            });
            diffIndex.push(val);
        }
    }

    return { diff: result, diffIndex };
}