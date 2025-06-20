Page({
  data: {},
  onLoad() {
    setTimeout(() => {
      my.redirectTo({
        url: '/pages/index/index'
      });
    }, 1500);
  },
});
