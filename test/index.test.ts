import { useFakeTimers } from "sinon";
import test, { Test } from "tape";
import { augment, AugmentProps, make, next } from "../src";

test("make creates a new action", (t: Test) => {
  t.plan(3);

  const payload = { key: "value" };
  const action = make("app")("test", payload);

  t.equal(action.type, "test", "type is correct");
  t.equal(action.appId, "app", "app id is correct");
  t.deepEqual(action.payload, payload, "payload is correct");
});

test("next creates a new action advancing meta", (t: Test) => {
  t.plan(4);

  const clock = useFakeTimers();
  const prevAction = make("app")("test", { first: "payload" });
  const nextAction = next(prevAction, "nextTest", { second: "payload" });

  t.notEqual(nextAction, prevAction, "next action is new");
  t.equal(nextAction.appId, prevAction.appId, "app id is correct");
  t.equal(nextAction.type, "nextTest", "new type is correct");

  t.deepEqual(
    nextAction.meta.history,
    ["0,app,created from test"],
    "history is correct"
  );

  clock.restore();
});

test("augment adds connection and correlation ids", (t: Test) => {
  t.plan(2);

  const augmentProps: AugmentProps = {
    connectionId: "connect-1-2-3",
    correlationId: "correlate-1-2-3"
  };

  const action = make("app")("test");
  const augmentedAction = augment(action, augmentProps);

  t.equal(
    augmentedAction.meta.correlationId,
    augmentProps.correlationId,
    "correlation id is updated"
  );

  t.equal(
    augmentedAction.meta.connectionId,
    augmentProps.connectionId,
    "connection id is updated"
  );
});
