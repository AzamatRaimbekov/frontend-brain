export const notificationEventSelector = (state: RootState) =>
  state.globalNotification.events[0] ?? null

export const notificationPropsSelector = (state: RootState) =>
  notificationEventSelector(state)?.props ?? null
