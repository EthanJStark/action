import nanoid from "nanoid";

export interface IMetaOpts {
  connectionId: string;
  correlationId: string;
}

export class Meta {
  public static assertMetaIsh = (meta: any): meta is Meta => {
    // {} ✔
    // { connectionId: 'whatever' } ✔
    // { correlationId: 'whatever' } ✔
    // { connectionId: 'whatever', correlationId: 'whatever' } ✔
    // any other object in existence ✘

    const isEmptyObject = (v: any) => JSON.stringify(v) === "{}";

    const hasOnlyCorrelationId = (v: any) =>
      Object.keys(v).length === 1 && v.hasOwnProperty("correlationId");

    const hasOnlyConnectionId = (v: any) =>
      Object.keys(v).length === 1 && v.hasOwnProperty("connectionId");

    const hasBothCorrelationAndConnectionIds = (v: any) =>
      Object.keys(v).length === 2 &&
      v.hasOwnProperty("connectionId") &&
      v.hasOwnProperty("correlationId");

    if (!meta) {
      return false;
    }

    return (
      isEmptyObject(meta) ||
      hasOnlyCorrelationId(meta) ||
      hasOnlyConnectionId(meta) ||
      hasBothCorrelationAndConnectionIds(meta)
    );
  };

  public static advance(meta: Meta, message: string) {
    const msg = fmtHistory(message, meta.appId);

    const opts = {
      connectionId: meta.connectionId,
      correlationId: meta.correlationId
    };

    return new Meta(meta.appId, [...meta.history, msg], opts);
  }

  public static augment(meta: Meta, props: Partial<IMetaOpts>) {
    const opts = {
      connectionId: props.connectionId || meta.connectionId,
      correlationId: props.correlationId || meta.correlationId
    };

    return new Meta(meta.appId, meta.history, opts);
  }

  public static merge(metas: Meta[]) {
    const firstMeta = metas[0];

    const opts = {
      connectionId: firstMeta.connectionId,
      correlationId: firstMeta.correlationId
    };

    const history = metas.reduce((memo: string[], meta) => {
      memo = memo.concat(meta.history);

      memo.push(fmtHistory("merged", firstMeta.appId));

      return memo;
    }, []);

    if (metas.length > 1) {
      history.push(fmtHistory(`${metas.length} merged`, firstMeta.appId));
    }

    return new Meta(firstMeta.appId, history, opts);
  }

  public readonly appId: string;
  public readonly history: string[] = [];
  public readonly connectionId?: string;
  public readonly correlationId?: string;

  constructor(appId: string, history: string[], opts?: Partial<IMetaOpts>) {
    this.appId = appId;
    this.history = history;
    this.correlationId = (opts && opts.correlationId) || nanoid();
    this.connectionId = opts && opts.connectionId;
  }

  public toJSON(slim = false) {
    return {
      connectionId: slim ? undefined : this.connectionId,
      correlationId: this.correlationId,
      history: slim ? undefined : this.history
    };
  }
}

function fmtHistory(message: string, appId: string) {
  return [Date.now(), appId, message].join(",");
}
