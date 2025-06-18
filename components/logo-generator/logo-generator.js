Component({
  data: {
    businessName: '',
    businessNameInitial: '',
    slogan: '',
    description: '',
    showPreviewModal: false,
    previewLogoBackground: '',
    previewLogoTextColor: '',
    previewLogoIndex: 0,
    businessTypes: ['Retail', 'Food & Beverage', 'Technology', 'Healthcare', 'Education', 'Finance', 'Other'],
    businessTypeIndex: 0,
    logoStyle: 'modern',
    showPreview: false,
    selectedColor: '#1677ff',
    logoBackground: '#1677ff',
    logoTextColor: '#ffffff'
  },

  methods: {
    onBusinessNameInput(e) {
      const name = e.detail.value;
      let initial = '';
      
      if (name && name.length > 0) {
        initial = name.charAt(0).toUpperCase();
      }
      
      this.setData({
        businessName: name,
        businessNameInitial: initial,
        showPreview: name.length > 0
      });
    },
    
    onSloganInput(e) {
      const slogan = e.detail.value;
      this.setData({
        slogan: slogan
      });
    },

    onDescriptionInput(e) {
      const description = e.detail.value;
      this.setData({
        description: description
      });
    },

    onBusinessTypeChange(e) {
      this.setData({
        businessTypeIndex: e.detail.value
      });
    },

    onColorSelect(e) {
      const hexColor = e.target.dataset.color;
      
      this.setData({
        selectedColor: hexColor,
        logoBackground: hexColor
      });
    },
    
    onColorInput(e) {
      let hexColor = e.detail.value;
      
      // Validate hex color format
      if (/^#[0-9A-Fa-f]{6}$/.test(hexColor)) {
        this.setData({
          selectedColor: hexColor,
          logoBackground: hexColor
        });
      }
    },

    onStyleSelect(e) {
      const style = e.target.dataset.style;
      this.setData({
        logoStyle: style
      });

      // If preview is already showing, update it with the new style
      if (this.data.showPreview) {
        this.generateLogo();
      }
    },

    generateLogo() {
      if (!this.data.businessName) {
        my.showToast({
          type: 'fail',
          content: 'Please enter a business name',
          duration: 2000
        });
        return;
      }

      // Generate logo based on selected options
      const logoTextColor = this._getContrastColor(this.data.logoBackground);

      this.setData({
        showPreview: true,
        logoTextColor
      });

      my.showToast({
        type: 'success',
        content: 'Logo generated successfully!',
        duration: 2000
      });
    },

    // Helper function to determine text color based on background color
    _getContrastColor(hexColor) {
      // Convert hex to RGB
      const r = parseInt(hexColor.substr(1, 2), 16);
      const g = parseInt(hexColor.substr(3, 2), 16);
      const b = parseInt(hexColor.substr(5, 2), 16);
      
      // Calculate luminance
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      
      // Return black or white based on luminance
      return luminance > 0.5 ? '#000000' : '#ffffff';
    },

    downloadLogo(e) {
      // Get the logo index from the data attribute
      const index = e.target.dataset.index;
      
      // In a real app, this would generate and download the specific logo
      my.showToast({
        content: `Downloading logo variation #${parseInt(index) + 1}`,
        duration: 2000
      });
    },

    previewLogo(e) {
      // Get the logo index from the data attribute
      const index = e.target.dataset.index;
      const logoIndex = parseInt(index);
      
      // Determine background color and filter based on index
      let background = this.data.logoBackground;
      let filter = '';
      
      switch(logoIndex) {
        case 0:
          // Original color, no filter
          break;
        case 1:
          filter = 'brightness(0.9)';
          break;
        case 2:
          filter = 'brightness(1.1)';
          break;
        case 3:
          filter = 'saturate(1.5)';
          break;
        case 4:
          filter = 'saturate(0.7)';
          break;
        case 5:
          filter = 'hue-rotate(15deg)';
          break;
      }
      
      // Calculate background color with filter applied for preview
      const previewBackground = filter ? `${background}` : background;
      
      // Show the preview modal
      this.setData({
        showPreviewModal: true,
        previewLogoBackground: previewBackground,
        previewLogoTextColor: this.data.logoTextColor,
        previewLogoIndex: logoIndex,
        previewLogoFilter: filter
      });
    },
    
    onPreviewClose() {
      this.setData({
        showPreviewModal: false
      });
    },
    
    onPreviewDownload() {
      // Download button clicked
      this.downloadLogo({
        target: {
          dataset: {
            index: this.data.previewLogoIndex
          }
        }
      });
    }
  }
});
