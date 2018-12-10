import { ActionTypeMap, AugmentProps } from ".";
import { Meta } from "./meta";
import { prune } from "./prune";

export class Action {
  public static assert = (action: Action): action is Action => {
    return !!action && action instanceof Action;
  };

  public static next(
    action: Action | undefined,
    type: string,
    payload?: any,
    appId?: string
  ) {
    if (action === undefined) {
      if (appId === undefined) {
        throw new Error(
          "app ID cannot be undefined if no previous action given"
        );
      }

      return new Action(appId, type, payload, new Meta(appId, []));
    }

    const nextMeta = Meta.advance(action.meta, `created from ${action.type}`);

    return new Action(action.appId, type, payload, nextMeta);
  }

  public static augment(action: Action, properties: AugmentProps) {
    const nextMeta = Meta.augment(action.meta, properties);

    return new Action(action.appId, action.type, action.payload, nextMeta);
  }

  public static merge(actionMap: ActionTypeMap) {
    const types = Object.keys(actionMap);
    const firstAction = actionMap[types[0]];
    const type = types.length > 1 ? types.join("<>") : `${types[0]}.merged`;
    const payload = actionMap;
    const nextMeta = Meta.merge(types.map((t: string) => actionMap[t].meta));

    return new Action(firstAction.appId, type, payload, nextMeta);
  }

  public static shiftType(action: Action) {
    const { type } = action;
    const parts = type.split(".");

    parts.shift();

    const newType = parts.join(".");

    return new Action(action.appId, newType, action.payload, action.meta);
  }

  public readonly type: string;
  public readonly appId: string;
  public readonly payload?: any;
  public readonly meta: Meta;
  public slim: boolean = false;

  constructor(appId: string, type: string, payload?: any, meta?: Meta) {
    if (typeof appId !== "string" || appId.length === 0) {
      throw new Error("a valid app id must be provided");
    }

    this.appId = appId;
    this.type = type;
    this.payload = payload;
    this.meta = meta || new Meta(appId, []);
  }

  public toString() {
    return JSON.stringify(this.toJSON());
  }

  public toJSON() {
    return {
      meta: this.meta.toJSON(this.slim),
      payload: prune(this.payload),
      type: this.type
    };
  }
}
