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
    logoFilter: '',
    aiGeneratedLogoUrl: '',
    currentApiLogoIndex: -1
  },
  
  data: {
    isAiGenerated: false,
    imageFilter: ''
  },
  
  didMount() {
    // Initial check for AI-generated logo
    this.checkForAiLogo();
  },
  
  didUpdate(prevProps) {
    // Check if any relevant props changed
    if (this.props.aiGeneratedLogoUrl !== prevProps.aiGeneratedLogoUrl ||
        this.props.logoBackground !== prevProps.logoBackground ||
        this.props.show !== prevProps.show) {
      this.checkForAiLogo();
    }
  },
  
  methods: {  
    checkForAiLogo() {
      // Check if this is an AI-generated logo preview
      if (this.props.aiGeneratedLogoUrl) {
        console.log('AI logo URL detected:', this.props.aiGeneratedLogoUrl);
        this.setData({
          isAiGenerated: true
        });
        
        // If we have a current API logo index, check if we need to apply a filter
        if (this.props.currentApiLogoIndex >= 0) {
          // Apply filter based on index if needed
          const filters = ['', 'brightness(0.9)', 'brightness(1.1)', 'grayscale(100%)', 'contrast(120%)', 'sepia(50%)'];
          if (this.props.currentApiLogoIndex < filters.length) {
            this.setData({
              imageFilter: filters[this.props.currentApiLogoIndex]
            });
          }
        }
      } else if (this.props.logoBackground !== 'transparent') {
        console.log('Text-based logo detected');
        this.setData({
          isAiGenerated: false,
          imageFilter: ''
        });
      } else {
        console.log('Setting default to AI logo mode with empty URL');
        // Default to AI logo mode if background is transparent
        this.setData({
          isAiGenerated: true,
          imageFilter: ''
        });
      }
    },
    
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
