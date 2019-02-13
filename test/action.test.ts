import { useFakeTimers } from "sinon";
import test, { Test } from "tape";
import { Action } from "../src/action";
import { Meta } from "../src/meta";

test("new assigns properties, defaults meta", (t: Test) => {
  const appId = "app";
  const type = "type";
  const payload = { a: "payload" };

  let action = new Action(appId, type, payload);

  t.equal(action.appId, appId, "app id is correct");
  t.equal(action.type, type, "type is correct");
  t.deepEqual(action.payload, payload, "payload is correct");
  t.notEqual(action.meta, undefined, "meta is set");

  t.throws(() => {
    action = new Action(appId, type, payload, { aKey: "bob" });
  }, "throws with bad input meta");

  action = new Action(appId, type, payload, { connectionId: "bob" });

  t.ok(action.meta instanceof Meta, "meta is Meta");
  t.deepEqual(action.meta.history, [], "history is empty");
  t.equal(action.meta.connectionId, "bob", "meta.connection id is correct");

  t.end();
});

test("merge works correctly", (t: Test) => {
  t.plan(6);

  const clock = useFakeTimers();
  const appId = "test";
  const meta1 = new Meta(appId, ["logA1", "logA2"]);
  const meta2 = new Meta(appId, ["logB1", "logB2", "logB3"]);
  const meta3 = new Meta(appId, ["logC1"]);
  const action1 = new Action(appId, "test1", "apple", meta1);
  const action2 = new Action(appId, "test2", "banana", meta2);
  const action3 = new Action(appId, "test3", "kiwi", meta3);

  let nextAction = Action.merge({
    test1: action1,
    test2: action2,
    test3: action3
  });

  t.equal(nextAction.appId, appId, "app id is correct");
  t.equal(nextAction.type, "test1<>test2<>test3", "type is correct");

  t.deepEqual(
    nextAction.meta.history,
    [
      "logA1",
      "logA2",
      "0,test,merged",
      "logB1",
      "logB2",
      "logB3",
      "0,test,merged",
      "logC1",
      "0,test,merged",
      "0,test,3 merged"
    ],
    "history is correct"
  );

  nextAction = Action.merge({ test1: action1 });

  t.equal(nextAction.appId, appId, "app id is correct");
  t.equal(nextAction.type, "test1.merged", "type is correct");

  t.deepEqual(
    nextAction.meta.history,
    ["logA1", "logA2", "0,test,merged"],
    "history is correct"
  );

  clock.restore();
});

test("string representation", (t: Test) => {
  t.plan(3);

  const clock = useFakeTimers();
  const appId = "test";

  const meta = new Meta(appId, ["log1", "log2"], {
    correlationId: "correlation id"
  });

  let action = new Action(
    appId,
    "test1",
    { name: "apple", unDef: undefined, empty: [], empty2: {}, empty3: "" },
    meta
  );

  t.equal(
    `${action}`,
    '{"meta":{"correlationId":"correlation id","history":["log1","log2"]},"payload":{"name":"apple"},"type":"test1"}'
  );

  action = new Action(appId, "test2", "melons", meta);

  t.equal(
    `${action}`,
    '{"meta":{"correlationId":"correlation id","history":["log1","log2"]},"payload":"melons","type":"test2"}'
  );

  action = new Action(
    appId,
    "test3",
    "rargh",
    new Meta(appId, ["log1", "log2"], {
      connectionId: "connect",
      correlationId: "correlate"
    })
  );

  action.slim = true;

  t.equal(
    `${action}`,
    '{"meta":{"correlationId":"correlate"},"payload":"rargh","type":"test3"}'
  );

  clock.restore();
});

test("next with undefined", (t: Test) => {
  t.plan(4);

  const clock = useFakeTimers();
  const appId = "test";

  let action: Action | undefined;

  t.throws(() => {
    action = Action.next(undefined, "test1", "apple");
  }, "throws if no app id provided");

  action = Action.next(undefined, "test1", "apple", appId);

  t.ok(action instanceof Action, "action is an action");
  t.equal(action.appId, appId, "app id is correct");
  t.notEqual(action.meta.correlationId, undefined, "correlation id is set");

  clock.restore();
});
