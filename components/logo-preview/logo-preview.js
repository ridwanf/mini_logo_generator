Component({
  props: {
    show: false,
    businessName: '',
    businessNameInitial: '',
    slogan: '',
    description: '',
    logoBackground: '',
    logoTextColor: '',
    logoStyle: 'modern',
    logoFilter: ''
  },

  methods: {
    onModalClose() {
      this.props.onClose && this.props.onClose();
    },
    
    onModalButtonClick(e) {
      const index = e.index;
      
      if (index === 0) {
        // Download button clicked
        this.props.onDownload && this.props.onDownload();
      }
      
      // Close the modal
      this.props.onClose && this.props.onClose();
    },
    
    onDownloadTap() {
      // Call the parent component's download handler
      this.props.onDownload && this.props.onDownload();
    }
  }
});
