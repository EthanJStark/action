import nanoid from "nanoid";

export interface IMetaOpts {
  connectionId: string;
  correlationId: string;
  jwt?: string;
  origin?: string;
}

export class Meta {
  public static assertMetaIsh = (meta: any): meta is Meta => {
    const isObj = (v: any) =>
      Object.prototype.toString.call(v) === "[object Object]";

    return isObj(meta);
  };

  public static advance(meta: Meta, message: string) {
    const msg = fmtHistory(message, meta.appId);

    const opts = {
      connectionId: meta.connectionId,
      correlationId: meta.correlationId,
      jwt: meta.jwt,
      origin: meta.origin
    };

    return new Meta(meta.appId, [...meta.history, msg], opts);
  }

  public static augment(meta: Meta, props: Partial<IMetaOpts>) {
    const opts = {
      connectionId: props.connectionId || meta.connectionId,
      correlationId: props.correlationId || meta.correlationId,
      jwt: props.jwt || meta.jwt,
      origin: props.origin || meta.origin
    };

    return new Meta(meta.appId, meta.history, opts);
  }

  public static merge(metas: Meta[]) {
    const firstMeta = metas[0];

    const opts = {
      connectionId: firstMeta.connectionId,
      correlationId: firstMeta.correlationId,
      jwt: firstMeta.jwt,
      origin: firstMeta.origin
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
  public readonly jwt?: string;
  public readonly origin?: string;

  constructor(appId: string, history: string[], opts?: Partial<IMetaOpts>) {
    this.appId = appId;
    this.history = history;
    this.correlationId = (opts && opts.correlationId) || nanoid();
    this.connectionId = opts && opts.connectionId;
    this.jwt = opts && opts.jwt;
    this.origin = opts && opts.origin;
  }

  public toJSON(slim = false) {
    return {
      connectionId: slim ? undefined : this.connectionId,
      correlationId: this.correlationId,
      history: slim ? undefined : this.history,
      jwt: this.jwt,
      origin: this.origin
    };
  }
}

function fmtHistory(message: string, appId: string) {
  return [Date.now(), appId, message].join(",");
}
