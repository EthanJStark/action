import { Action } from "./action";
import { IMetaOpts } from "./meta";

export { Action };

export type AugmentProps = Partial<IMetaOpts>;
export type ActionTypeMap = Record<string, Action>;

export function make(appId: string) {
  return (type: string, payload?: any, meta?: any, metadata?: any) =>
    new Action(appId, type, payload, meta, metadata);
}

export function next(
  prevAction: Action,
  type: string,
  payload?: any,
  appId?: string
) {
  return Action.next(prevAction, type, payload, appId);
}

export function augment(action: Action, properties: AugmentProps) {
  return Action.augment(action, properties);
}

/**
 * Takes the history of each action and create a new history by
 *
 * 1. Append history
 * 2. Add new entry to reference merge
 * 3. Repeat for remaining histories
 * 4. Assign the merge to the last history entry
 *
 * Hopefully this can be reconstituted down the line
 *
 * @param actions {Record<string, Action>} map of actions to merge
 */
export function from(actionMap: ActionTypeMap) {
  return Action.merge(actionMap);
}

export function shiftType(action: Action) {
  return Action.shiftType(action);
}
