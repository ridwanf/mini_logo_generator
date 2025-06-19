export const setCartListStorage = carts => {
  let globalData = getApp().globalData;
  globalData.cartList = carts;
};

export const getCartListStorage = () => {
  let globalData = getApp().globalData;
  return globalData.cartList || [];
};

export const setBearerToken = token => {
  let globalData = getApp().globalData;
  globalData.bearerToken = `Bearer ${token}`;
};

export const getBearerToken = () => {
  let globalData = getApp().globalData;
  return globalData.bearerToken || "";
};

export const setEnv = env => {
  let globalData = getApp().globalData;
  globalData.env = `${env}`;
};

export const setUserId = userId => {
  let globalData = getApp().globalData;
  globalData.userId = `${userId}`;
};

export const getUserId = () => {
  let globalData = getApp().globalData;
  return globalData.userId || "";
};

export const setPartnerId = partnerId => {
  let globalData = getApp().globalData;
  globalData.partnerId = `${partnerId}`;
};

export const getPartnerId = () => {
  let globalData = getApp().globalData;
  return globalData.partnerId || "";
};
  
