Page({
  data: {
    pageTitle: 'Merchant Logo Generator',
    pageDescription: 'Create a professional logo for your business'
  },

  onLoad(query) {
    console.info(`Logo Generator page loaded with query: ${JSON.stringify(query)}`);
  },

  onShareAppMessage() {
    return {
      title: this.data.pageTitle,
      desc: this.data.pageDescription,
      path: 'pages/index/index',
    };
  },
});
