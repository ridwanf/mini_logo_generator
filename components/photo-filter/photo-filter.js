Component({
  data: {
    tempFilePath: '', // Path to the original uploaded image
    filteredImagePath: '', // Path to the filtered image
    showImage: false, // Whether to show the image preview
    currentFilter: 'none', // Current selected filter
    filters: [
      { id: 'none', name: 'Original' },
      { id: 'grayscale', name: 'Grayscale' },
      { id: 'sepia', name: 'Sepia' },
      { id: 'blur', name: 'Blur' },
      { id: 'brightness', name: 'Brighten' },
      { id: 'contrast', name: 'Contrast' },
      { id: 'saturate', name: 'Saturate' },
      { id: 'invert', name: 'Invert' }
    ],
    filterIntensity: 50, // Default filter intensity (0-100)
    canvasWidth: 300, // Default canvas width
    canvasHeight: 300, // Default canvas height
    isProcessing: false, // Flag to indicate if image is being processed
    currentFilterCSS: '', // Current CSS filter string
    filterCSSMap: {
      none: '',
      grayscale: (intensity) => `grayscale(${intensity})`,
      sepia: (intensity) => `sepia(${intensity})`,
      blur: (intensity) => `blur(${intensity * 5}px)`,
      brightness: (intensity) => `brightness(${0.5 + intensity})`,
      contrast: (intensity) => `contrast(${0.5 + intensity})`,
      saturate: (intensity) => `saturate(${intensity * 2})`,
      invert: (intensity) => `invert(${intensity})`
    }
  },

  lifetimes: {
    attached() {
      // Get system info to set appropriate canvas size
      this._initCanvasSize();
      // Initialize filter CSS
      this._initFilterCSS();
    }
  },

  methods: {
    // Initialize canvas size based on device screen
    _initCanvasSize() {
      my.getSystemInfo({
        success: (res) => {
          const windowWidth = res.windowWidth;
          const canvasSize = windowWidth * 0.8; // 80% of screen width
          
          this.setData({
            canvasWidth: canvasSize,
            canvasHeight: canvasSize
          });
        }
      });
    },

    // Choose image from album or camera
    chooseImage() {
      my.chooseImage({
        count: 1,
        sourceType: ['camera', 'album'],
        success: (res) => {
          this._handleImageSelection(res.apFilePaths[0]);
        }
      });
    },

    // Handle the selected image
    _handleImageSelection(tempFilePath) {
      // Get image info to maintain aspect ratio
      my.getImageInfo({
        src: tempFilePath,
        success: (imageInfo) => {
          this._adjustImageDimensions(tempFilePath, imageInfo);
        }
      });
    },

    // Adjust image dimensions to maintain aspect ratio
    _adjustImageDimensions(tempFilePath, imageInfo) {
      // Calculate aspect ratio to fit in canvas
      let width = this.data.canvasWidth;
      let height = (imageInfo.height / imageInfo.width) * width;
      
      if (height > this.data.canvasWidth * 1.5) {
        // If image is too tall, constrain by height
        height = this.data.canvasWidth;
        width = (imageInfo.width / imageInfo.height) * height;
      }
      
      this.setData({
        tempFilePath,
        filteredImagePath: tempFilePath,
        showImage: true,
        canvasWidth: width,
        canvasHeight: height,
        currentFilter: 'none'
      }, () => {
        // Draw the original image on canvas
        this._drawImage();
      });
    },

    // Draw image on canvas
    _drawImage() {
      const ctx = my.createCanvasContext('imageCanvas', this);
      
      ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight);
      ctx.drawImage(this.data.tempFilePath, 0, 0, this.data.canvasWidth, this.data.canvasHeight);
      ctx.draw();
    },

    // Apply selected filter
    applyFilter(e) {
      const filterId = e.target.dataset.filter;
      
      this.setData({
        currentFilter: filterId,
        isProcessing: true
      }, () => {
        // Update the filter CSS
        this._updateFilterCSS();
        // Apply the selected filter
        this._processImage();
      });
    },

    // Change filter intensity
    onIntensityChange(e) {
      const intensity = e.detail.value;
      
      this.setData({
        filterIntensity: intensity
      }, () => {
        // Update the filter CSS
        this._updateFilterCSS();
        // Re-apply filter with new intensity
        if (this.data.showImage) {
          this._processImage();
        }
      });
    },

    // Calculate and update the CSS filter string
    _updateFilterCSS() {
      const filter = this.data.currentFilter;
      const intensity = this.data.filterIntensity / 100; // Convert to 0-1 range
      
      let filterCSS = '';
      if (filter !== 'none') {
        const filterFunction = this.data.filterCSSMap[filter];
        if (typeof filterFunction === 'function') {
          filterCSS = filterFunction(intensity);
        }
      }
      
      this.setData({
        currentFilterCSS: filterCSS
      });
    },

    // Process image with selected filter
    _processImage() {
      const ctx = my.createCanvasContext('imageCanvas', this);
      const filter = this.data.currentFilter;
      
      // Clear canvas and draw original image
      ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight);
      ctx.drawImage(this.data.tempFilePath, 0, 0, this.data.canvasWidth, this.data.canvasHeight);
      
      if (filter !== 'none') {
        // Apply filter (CSS filters are applied in the AXML via style binding)
        ctx.setGlobalAlpha(1);
        ctx.draw(false, () => {
          this._saveCanvasToTempFile();
        });
      } else {
        // No filter, just use original image
        ctx.draw(false, () => {
          this.setData({
            filteredImagePath: this.data.tempFilePath,
            isProcessing: false
          });
        });
      }
    },

    // Save canvas to temporary file
    _saveCanvasToTempFile() {
      my.canvasToTempFilePath({
        canvasId: 'imageCanvas',
        success: (res) => {
          this.setData({
            filteredImagePath: res.apFilePath,
            isProcessing: false
          });
        },
        fail: (error) => {
          console.error('Canvas to temp file failed:', error);
          this.setData({
            isProcessing: false
          });
        }
      }, this);
    },

    // Save filtered image to album
    saveImage() {
      if (!this.data.filteredImagePath) {
        my.showToast({
          type: 'fail',
          content: 'No image to save',
          duration: 2000
        });
        return;
      }

      my.saveImage({
        url: this.data.filteredImagePath,
        showActionSheet: true,
        success: () => {
          my.showToast({
            type: 'success',
            content: 'Image saved successfully!',
            duration: 2000
          });
        },
        fail: (error) => {
          console.error('Save image failed:', error);
          my.showToast({
            type: 'fail',
            content: 'Failed to save image',
            duration: 2000
          });
        }
      });
    },

    // Reset to original image
    resetImage() {
      if (this.data.tempFilePath) {
        this.setData({
          currentFilter: 'none',
          filterIntensity: 50,
          filteredImagePath: this.data.tempFilePath
        }, () => {
          this._drawImage();
        });
      }
    },

    // Initialize filter CSS when component is attached
    _initFilterCSS() {
      this._updateFilterCSS();
    }
  }
});
