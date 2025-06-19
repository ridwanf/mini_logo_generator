import { HERMES_KEY, HERMES_URL, HERMES_USER } from "/constants";
import { request } from "/utils/request";

Component({
  data: {
    businessName: '',
    businessNameInitial: '',
    slogan: '',
    description: '',
    showPreview: false,
    logoBackground: '#1677ff',
    logoTextColor: '#ffffff',
    selectedColor: '#1677ff',
    logoStyle: 'modern',
    businessTypes: ['Retail', 'Food & Beverage', 'Technology', 'Health', 'Education', 'Finance', 'Travel', 'Entertainment', 'Other'],
    businessTypeIndex: 0,
    showPreviewModal: false,
    previewLogoBackground: '',
    previewLogoTextColor: '',
    previewLogoIndex: 0,
    showAiGeneratedLogo: false,
    aiGeneratedLogoUrl: '',
    previewLogoFilter: '',
    generatedLogos: [],
    currentApiLogoIndex: -1
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

    async generateLogo() {
      if (!this.data.businessName) {
        my.showToast({
          type: 'fail',
          content: 'Please enter a business name',
          duration: 2000
        });
        return;
      }
      
      // Show loading indicator
      this.setData({
        isLoading: true
      });
      
      // Show loading dialog
      my.showLoading({
        content: 'Generating logo...',
        delay: 0
      });

      // Generate logo based on selected options
      const logoTextColor = this._getContrastColor(this.data.logoBackground);
      try {
        const data = {
          inputs: {
            "business_name": this.data.businessName,
            "business_slogan": this.data.slogan,
            "image_style": this.data.logoStyle,
            "image_colour_theme": this.data.selectedColor,
            "business_type": this.data.businessTypes[this.data.businessTypeIndex],
            "business_description": this.data.description
          },
          response_mode: "blocking",
          user: HERMES_USER
        }
        const response = await request({
          url: HERMES_URL,
          method: 'POST',
          data,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${HERMES_KEY}`,
          }
        })
        console.log('Full API response:', JSON.stringify(response, null, 2));
        
        // Process the API response
        const processedLogos = [];
        
        if (response.data) {
          // Check if the response has data.outputs
          if (response.data.outputs) {
            console.log('API Response outputs:', JSON.stringify(response.data.outputs, null, 2));
            
            // Check for image in various possible locations
            if (response.data.outputs.image) {
              console.log('Found image in outputs.image');
              processedLogos.push({
                url: response.data.outputs.image,
                filter: ''
              });
            } else if (response.data.outputs.images && response.data.outputs.images.length > 0) {
              console.log('Found images array with length:', response.data.outputs.images.length);
              // Add each image from the array
              response.data.outputs.images.forEach((imageUrl, index) => {
                processedLogos.push({
                  url: imageUrl,
                  filter: ''
                });
              });
            } else if (response.data.outputs.logo) {
              console.log('Found image in outputs.logo');
              processedLogos.push({
                url: response.data.outputs.logo,
                filter: ''
              });
            } else if (response.data.outputs.url) {
              console.log('Found image in outputs.url');
              processedLogos.push({
                url: response.data.outputs.url,
                filter: ''
              });
            } else if (response.data.outputs.text) {
              // Check if the text contains a markdown image link
              const text = response.data.outputs.text;
              console.log('Found text in outputs.text:', text);
              
              // Extract image URL from markdown format: ![](url)
              const markdownImageRegex = /!\[.*?\]\((.*?)\)/g;
              const matches = [...text.matchAll(markdownImageRegex)];
              
              if (matches && matches.length > 0) {
                console.log('Found image URLs in markdown text:', matches.length);
                
                matches.forEach((match, index) => {
                  if (match[1]) {
                    const imageUrl = match[1].split('?')[0]; // Remove query parameters if any
                    console.log(`Extracted image URL ${index + 1}:`, imageUrl);
                    
                    processedLogos.push({
                      url: match[1], // Use the full URL with parameters
                      filter: ''
                    });
                  }
                });
              } else {
                // If no image URLs found in text, show the text as a toast
                my.alert({
                  title: 'AI Response',
                  content: text,
                  buttonText: 'OK'
                });
              }
            } else {
              console.log('No image or text found in the API response');
            }
          } else if (response.data.data && response.data.data.outputs) {
            // Handle nested data structure
            const outputs = response.data.data.outputs;
            console.log('Nested outputs:', JSON.stringify(outputs, null, 2));
            
            if (outputs.image) {
              processedLogos.push({
                url: outputs.image,
                filter: ''
              });
            } else if (outputs.images && outputs.images.length > 0) {
              outputs.images.forEach((imageUrl, index) => {
                processedLogos.push({
                  url: imageUrl,
                  filter: ''
                });
              });
            } else if (outputs.logo) {
              processedLogos.push({
                url: outputs.logo,
                filter: ''
              });
            } else if (outputs.url) {
              processedLogos.push({
                url: outputs.url,
                filter: ''
              });
            } else if (outputs.text) {
              // Check if the text contains a markdown image link
              const text = outputs.text;
              const markdownImageRegex = /!\[.*?\]\((.*?)\)/g;
              const matches = [...text.matchAll(markdownImageRegex)];
              
              if (matches && matches.length > 0) {
                matches.forEach((match, index) => {
                  if (match[1]) {
                    processedLogos.push({
                      url: match[1],
                      filter: ''
                    });
                  }
                });
              }
            }
          }
          
          // If we found logos, update the state
          if (processedLogos.length > 0) {
            this.setData({
              generatedLogos: processedLogos,
              aiGeneratedLogoUrl: processedLogos[0].url,
              showAiGeneratedLogo: true,
              isLoading: false
            });
          } else {
            this.setData({
              isLoading: false
            });
          }
        }
        
        // Hide loading indicator
        my.hideLoading();
      } catch (error) {
        console.error('Error:', error);
        my.showToast({
          type: 'fail',
          content: 'Failed to generate logo',
          duration: 2000
        });
        
        // Hide loading indicator and reset loading state
        my.hideLoading();
        this.setData({
          isLoading: false
        });
      }
   
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
      const index = e.target.dataset.index;
      let logoIndex = parseInt(index);
      let filter = '';
      let background = this.data.logoBackground;
      
      // Apply different filters based on the index
      switch(logoIndex) {
        case 0:
          filter = '';
          break;
        case 1:
          filter = 'brightness(0.9)';
          break;
        case 2:
          filter = 'brightness(1.1)';
          break;
        case 3:
          filter = 'grayscale(100%)';
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
    
    previewApiLogo(e) {
      const index = e.target.dataset.index;
      
      if (this.data.generatedLogos && this.data.generatedLogos[index]) {
        const logo = this.data.generatedLogos[index];
        
        this.setData({
          showPreviewModal: true,
          aiGeneratedLogoUrl: logo.url,
          currentApiLogoIndex: index
        });
      }
    },
    
    onPreviewClose() {
      this.setData({
        showPreviewModal: false
      });
    },
    
    onPreviewDownload() {
      // Handle download based on whether it's an AI-generated logo or text-based logo
      if (this.data.currentApiLogoIndex >= 0 && this.data.generatedLogos && this.data.generatedLogos[this.data.currentApiLogoIndex]) {
        // Download the AI-generated logo from the preview options
        const logoUrl = this.data.generatedLogos[this.data.currentApiLogoIndex].url;
        my.saveImage({
          url: logoUrl,
          success: () => {
            my.showToast({
              type: 'success',
              content: 'Logo saved to gallery',
              duration: 2000
            });
          },
          fail: (err) => {
            console.error('Failed to save image:', err);
            my.showToast({
              type: 'fail',
              content: 'Failed to save logo',
              duration: 2000
            });
          }
        });
      } else if (this.data.aiGeneratedLogoUrl) {
        // Download the main AI-generated logo
        this.downloadAiLogo();
      } else {
        // Download the text-based logo
        this.downloadLogo({
          target: {
            dataset: {
              index: this.data.previewLogoIndex
            }
          }
        });
      }
    },
    
    previewAiLogo() {
      // Show the AI-generated logo in the preview modal
      if (this.data.aiGeneratedLogoUrl) {
        const logoUrl = this.data.aiGeneratedLogoUrl;
        console.log('Previewing AI logo:', logoUrl);
        
        // First ensure the URL is set correctly
        this.setData({
          aiGeneratedLogoUrl: logoUrl
        }, () => {
          // Then show the modal with the correct settings
          this.setData({
            showPreviewModal: true,
            previewLogoBackground: 'transparent',  // Use transparent background for AI images
            previewLogoTextColor: '#000000',       // Default text color
            previewLogoIndex: -1,                  // Special index for AI-generated logo
            currentApiLogoIndex: -1                // Reset API logo index for main logo
          });
        });
      } else {
        my.showToast({
          type: 'fail',
          content: 'No AI-generated logo available',
          duration: 2000
        });
      }
    },
    
    downloadAiLogo() {
      // Download the AI-generated logo
      if (this.data.aiGeneratedLogoUrl) {
        my.saveImage({
          url: this.data.aiGeneratedLogoUrl,
          success: () => {
            my.showToast({
              type: 'success',
              content: 'Logo saved to gallery',
              duration: 2000
            });
          },
          fail: (err) => {
            console.error('Failed to save image:', err);
            my.showToast({
              type: 'fail',
              content: 'Failed to save logo',
              duration: 2000
            });
          }
        });
      }
    }
  }
});
