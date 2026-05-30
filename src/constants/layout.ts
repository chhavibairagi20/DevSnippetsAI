/** Base tab bar height before safe-area bottom inset */
export const TAB_BAR_BASE_HEIGHT = 56;

export const getTabBarHeight = (bottomInset: number): number =>
  TAB_BAR_BASE_HEIGHT + bottomInset;
