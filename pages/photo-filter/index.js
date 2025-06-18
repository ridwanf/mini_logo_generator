Page({
  data: {
    pageTitle: 'Photo Filter',
    pageDescription: 'Apply beautiful filters to your photos'
  },

  onLoad() {
    console.info('Photo Filter page loaded');
  },

  onShareAppMessage() {
    return {
      title: this.data.pageTitle,
      desc: this.data.pageDescription,
      path: 'pages/photo-filter/index',
    };
  },
});
