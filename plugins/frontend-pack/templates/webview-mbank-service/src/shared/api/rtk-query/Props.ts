export interface PropsState<Body = unknown, Params = Record<string, unknown>> {
  body?: Body
  params?: Params
  uuid?: string
}

export interface PropsStateWithUuid<
  Body = unknown,
  Params = CommonQuery,
  Uuid = string | number,
> extends Omit<PropsState<Body, Params>, 'uuid'> {
  uuid: Uuid
}
