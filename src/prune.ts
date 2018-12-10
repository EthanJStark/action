const identity = (value: any) => value;
const always = (value: any) => () => value;
const T = always(true);
const F = always(false);
const isObject = (value: any) => typeof value === "object" && value !== null;
const isUndefined = (value: any) => value === undefined;

type CondClause = [(value: any) => boolean, (value: any) => any];

const cond = (clauses: CondClause[]) => {
  return (value: any) => {
    let result;

    for (const clause of clauses) {
      if (Array.isArray(clause)) {
        const [conditionFn, resultFn] = clause;

        if (conditionFn(value)) {
          result = resultFn(value);
          break;
        }
      }
    }

    return result;
  };
};

const anyPass = (clauses: Array<(value: any) => boolean>) => {
  const conditions = clauses.map<CondClause>(clause => [clause, T]);

  return cond([...conditions, [T, F]]);
};

const isEmptyArray = (value: unknown) => {
  const arrayCheck = (arr: any): arr is [] =>
    !!arr && typeof arr === "object" && "constructor" in arr && "length" in arr;

  if (arrayCheck(value)) {
    return value.constructor === Array && value.length === 0;
  }

  return false;
};

const isEmptyObject = (value: unknown) => {
  const objCheck = (obj: any): obj is {} =>
    !!obj && typeof obj === "object" && "constructor" in obj;

  if (objCheck(value)) {
    return value.constructor === Object && Object.keys(value).length === 0;
  }

  return false;
};

const isEmptyString = (value: any) => value === "";

const reject = (predicate: (value: any) => boolean) => (values: any[]) =>
  values.filter(v => !predicate(v));

const toPairs = (obj: Record<string, any>) => {
  const keys = Object.keys(obj);

  return keys.reduce<Array<[string, any]>>(
    (memo, key) => [...memo, [key, obj[key]]],
    []
  );
};

const isEmpty = anyPass([isEmptyArray, isEmptyObject, isEmptyString]);
const isEmptyOrUndefined = anyPass([isEmpty, isUndefined]);
const isNumTypeAndNaN = (value: any) =>
  typeof value === "number" && isNaN(value);

const pruneArray = reject(
  anyPass([isEmptyOrUndefined, isDeepValueIsEmptyOrUndefined])
);

/**
 * All empty values are scrubbed from the given object, recursively.
 *
 * This includes
 *
 * - "" // empty string
 * - [] // empty array
 * - {} // empty object
 *
 * Certain values are transformed into `null`:
 *
 * - undefined
 * - NaN
 *
 * Transformation happens so that the semantics of these value is roughly
 * translated when serializing to JSON.
 *
 * The function is an identity function if there are no deeper properties to
 * recurse through, with the exception of `undefined` and `NaN`, which if
 * provided will return `null`.
 *
 * @returns scrubbed copy of the given object
 */
export const prune = cond([
  [Array.isArray, pruneArray],
  [isObject, pruneObject],
  [isUndefined, always(null)],
  [isNumTypeAndNaN, always(null)],
  [T, identity]
]);

function pruneObject(current: Record<string, any>) {
  const pairs = toPairs(current);

  const reducer = (memo: {}, [key, value]: [string, any]) => {
    if (isEmptyOrUndefined(value)) {
      return memo;
    }

    if (isDeepValueIsEmptyOrUndefined(value)) {
      return memo;
    }

    return { ...memo, [key]: value };
  };

  return pairs.reduce(reducer, {});
}

function isDeepValueIsEmptyOrUndefined(value: any): boolean {
  if (isObject(value)) {
    const deepValue = prune(value);

    return isEmptyOrUndefined(deepValue);
  }

  return false;
}
