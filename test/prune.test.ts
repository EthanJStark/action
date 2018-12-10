import { contains, has, pathEq } from "ramda";
import test, { Test } from "tape";
import { prune } from "../src/prune";

test("identity for atomic values", (t: Test) => {
  t.plan(7);

  let result = prune(0);

  t.deepEqual(result, 0, "0 -> 0");

  result = prune({});

  t.deepEqual(result, {}, "{} -> {}");

  result = prune([]);

  t.deepEqual(result, [], "[] -> []");

  result = prune("");

  t.deepEqual(result, "", "'' -> ''");

  result = prune("hello");

  t.deepEqual(result, "hello", "'hello' -> 'hello'");

  result = prune(null);

  t.deepEqual(result, null, "null -> null");

  result = prune(false);

  t.deepEqual(result, false, "false -> false");
});

test("transforms NaN to null", (t: Test) => {
  t.plan(1);

  const result = prune(NaN);

  t.deepEqual(result, null, "NaN -> null");
});

test("transforms undefined to null", (t: Test) => {
  t.plan(1);

  const result = prune(undefined);

  t.deepEqual(result, null, "undefined -> null");
});

test("prunes empty values from objects 1 level deep", (t: Test) => {
  t.plan(12);

  const obj = {
    emptyArray: [],
    emptyObject: {},
    emptyString: "",
    null: null,
    number: 1,
    string: "string",
    unDef: undefined,
    zero: 0
  };

  const result = prune(obj);

  t.ok(has("null", result), "has null");
  t.ok(has("number", result), "has number");
  t.ok(has("string", result), "has string");
  t.ok(has("zero", result), "has zero");
  t.notOk(has("unDef", result), "lacks unDef");
  t.notOk(has("emptyObject", result), "lacks emptyObject");
  t.notOk(has("emptyArray", result), "lacks emptyArray");
  t.notOk(has("emptyString", result), "lacks emptyString");
  t.deepEqual(result.null, null, "obj.null -> null");
  t.deepEqual(result.number, 1, "obj.number -> 1");
  t.deepEqual(result.string, "string", "obj.string -> 'string'");
  t.deepEqual(result.zero, 0, "obj.zero => 0");
});

test("prunes empty values from arrays 1 level deep", (t: Test) => {
  t.plan(9);

  const arr = [0, null, undefined, "", "string", 42, {}, [], false];
  const result = prune(arr);

  t.ok(contains(0, result), "includes 0");
  t.ok(contains("string", result), "includes 'string'");
  t.ok(contains(42, result), "includes 42");
  t.ok(contains(false, result), "includes false");
  t.ok(contains(null, result), "includes null");
  t.notOk(contains(undefined, result), "omits undefined");
  t.notOk(contains("", result), "omits ''");
  t.notOk(contains({}, result), "omits {}");
  t.notOk(contains([], result), "omits []");
});

test("prunes empty keys from objects recursively", (t: Test) => {
  t.plan(3);

  const obj = {
    has: {
      a: {
        b: {
          c: {
            value: "value"
          }
        }
      }
    },
    hasDeepArray: {
      a: {
        b: {
          c: [1, 2, 3]
        }
      }
    },
    lacks: {
      a: {
        b: {
          c: undefined
        }
      }
    }
  };

  const result = prune(obj);

  t.ok(pathEq(["has", "a", "b", "c", "value"], result), "has deep value");
  t.notOk(has("lacks", result), "lacks deep empty value");

  t.ok(
    pathEq(["hasDeepArray", "a", "b", "c"], [1, 2, 3], result),
    "has deep array"
  );
});

test("prunes deep objects in arrays", (t: Test) => {
  t.plan(1);

  const arr = [
    { present: true },
    [1, 2, 3],
    { a: { b: { c: { value: undefined } } } }
  ];

  const result = prune(arr);

  t.deepEqual(
    [{ present: true }, [1, 2, 3]],
    result,
    "omits objects that prune to empty"
  );
});
