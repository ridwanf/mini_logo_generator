import { HERMES_KEY, HERMES_URL, HERMES_USER } from "/constants";
import { request } from "/utils/request";

Component({
  // Define the component template to include the loading mask
  props: {},
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
    currentApiLogoIndex: -1,
    showLoadingMask: false,
    loadingMessage: '',
    formIsValid: false,
    dailyGenerationsLeft: 3,
    dailyGenerationsTotal: 3,
    lastGenerationDate: '',
    // Fields that have been blurred/touched
    touchedFields: {
      businessName: false,
      description: false,
      businessType: false,
      color: false,
      logoStyle: false
    },
    // Error messages for form fields
    errors: {
      businessName: '',
      description: '',
      businessType: '',
      color: '',
      logoStyle: '',
      generationLimit: ''
    }
  },

  didMount() {
    // Check and initialize daily generation limit when component mounts
    this._initDailyGenerationLimit();
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
      }, () => {
        // Only validate but don't show errors until blur
        this._checkFormValidity(false);
      });
    },
    
    onBusinessNameBlur() {
      this.setData({
        'touchedFields.businessName': true
      }, () => {
        this._checkFormValidity(true);
      });
    },

    onSloganInput(e) {
      const slogan = e.detail.value;
      this.setData({
        slogan: slogan
      }, () => {
        this._checkFormValidity(false);
      });
    },
    
    onSloganBlur() {
      // Slogan is optional, so no need to mark as touched
      this._checkFormValidity(false);
    },

    onDescriptionInput(e) {
      const description = e.detail.value;
      this.setData({
        description: description
      }, () => {
        this._checkFormValidity(false);
      });
    },
    
    onDescriptionBlur() {
      this.setData({
        'touchedFields.description': true
      }, () => {
        this._checkFormValidity(true);
      });
    },

    onBusinessTypeChange(e) {
      this.setData({
        businessTypeIndex: e.detail.value,
        'touchedFields.businessType': true
      }, () => {
        this._checkFormValidity(true);
      });
    },

    onColorSelect(e) {
      const color = e.target.dataset.color;
      this.setData({
        selectedColor: color,
        logoBackground: color,
        'touchedFields.color': true
      }, () => {
        this._checkFormValidity(true);
      });
    },
    
    onColorInput(e) {
      const color = e.detail.value;
      this.setData({
        selectedColor: color,
        logoBackground: color
      }, () => {
        this._checkFormValidity(false);
      });
    },
    
    onColorBlur() {
      this.setData({
        'touchedFields.color': true
      }, () => {
        this._checkFormValidity(true);
      });
    },

    onStyleSelect(e) {
      const style = e.target.dataset.style;
      this.setData({
        logoStyle: style,
        'touchedFields.logoStyle': true
      }, () => {
        this._checkFormValidity(true);
      });
    },

    // Helper method to check if all required form fields are filled
    // showErrors: if true, will show errors for touched fields
    _checkFormValidity(showErrors = true) {
      const { 
        businessName, 
        slogan, 
        businessTypeIndex, 
        selectedColor, 
        logoBackground,
        logoStyle,
        description, 
        dailyGenerationsLeft,
        touchedFields
      } = this.data;

      // Initialize error messages object
      const errors = {
        businessName: '',
        description: '',
        businessType: '',
        color: '',
        logoStyle: '',
        generationLimit: ''
      };

      // Business name validation - required and min length 2 characters
      const isBusinessNameValid = !!businessName && businessName.trim().length >= 2;
      if (!isBusinessNameValid && (showErrors && touchedFields.businessName)) {
        if (!businessName || businessName.trim() === '') {
          errors.businessName = 'Business name is required';
        } else {
          errors.businessName = 'Business name must be at least 2 characters';
        }
      }
      
      // Description validation - required and min length 10 characters
      const isDescriptionValid = !!description && description.trim().length >= 10;
      if (!isDescriptionValid && (showErrors && touchedFields.description)) {
        if (!description || description.trim() === '') {
          errors.description = 'Description is required';
        } else {
          errors.description = 'Description must be at least 10 characters';
        }
      }
      
      // Business type validation - must be selected
      const isBusinessTypeValid = businessTypeIndex >= 0;
      if (!isBusinessTypeValid && (showErrors && touchedFields.businessType)) {
        errors.businessType = 'Please select a business type';
      }
      
      // Color validation - must have valid color values
      const isColorValid = !!selectedColor && selectedColor.startsWith('#') && 
                          !!logoBackground && logoBackground.startsWith('#');
      if (!isColorValid && (showErrors && touchedFields.color)) {
        errors.color = 'Please select valid colors for your logo';
      }
      
      // Logo style validation - must be one of the valid options
      const isLogoStyleValid = ['modern', 'classic', 'minimalist'].includes(logoStyle);
      if (!isLogoStyleValid && (showErrors && touchedFields.logoStyle)) {
        errors.logoStyle = 'Please select a valid logo style';
      }
      
      // Daily generation limit validation - always show this error
      const hasGenerationsLeft = dailyGenerationsLeft > 0;
      if (!hasGenerationsLeft) {
        errors.generationLimit = 'Daily generation limit reached. Try again tomorrow.';
      }
      
      // Combine all validations
      const isValid = isBusinessNameValid && 
                     isDescriptionValid && 
                     isBusinessTypeValid && 
                     isColorValid && 
                     isLogoStyleValid && 
                     hasGenerationsLeft;

      this.setData({
        formIsValid: isValid,
        errors: errors
      });
      
      return {
        isBusinessNameValid,
        isDescriptionValid,
        isBusinessTypeValid,
        isColorValid,
        isLogoStyleValid,
        hasGenerationsLeft,
        errors,
        isValid
      };
    },

    // Initialize and check daily generation limit
    _initDailyGenerationLimit() {
      // Get stored generation data
      my.getStorage({
        key: 'logoGenerationData',
        success: (res) => {
          const { data } = res;
          const today = new Date().toDateString();

          // Check if we have data and if it's from today
          if (data && data.date === today) {
            // Data exists for today, use stored values
            this.setData({
              dailyGenerationsLeft: data.generationsLeft,
              lastGenerationDate: data.date
            }, () => {
              this._checkFormValidity();
            });
          } else {
            // No data or it's a new day, reset counter
            const newData = {
              date: today,
              generationsLeft: this.data.dailyGenerationsTotal
            };

            my.setStorage({
              key: 'logoGenerationData',
              data: newData,
              success: () => {
                this.setData({
                  dailyGenerationsLeft: this.data.dailyGenerationsTotal,
                  lastGenerationDate: today
                }, () => {
                  this._checkFormValidity();
                });
              }
            });
          }
        },
        fail: () => {
          // No data exists yet, initialize with default values
          const today = new Date().toDateString();
          const newData = {
            date: today,
            generationsLeft: this.data.dailyGenerationsTotal
          };

          my.setStorage({
            key: 'logoGenerationData',
            data: newData,
            success: () => {
              this.setData({
                dailyGenerationsLeft: this.data.dailyGenerationsTotal,
                lastGenerationDate: today
              }, () => {
                this._checkFormValidity();
              });
            }
          });
        }
      });
    },

    // Update the generation count after successful generation
    _updateGenerationCount() {
      // Only decrease if we have generations left
      if (this.data.dailyGenerationsLeft <= 0) {
        return; // Already at zero, don't update
      }

      const generationsLeft = Math.max(0, this.data.dailyGenerationsLeft - 1);
      const today = new Date().toDateString();

      // Update local state
      this.setData({
        dailyGenerationsLeft: generationsLeft,
        lastGenerationDate: today
      }, () => {
        this._checkFormValidity();
      });

      // Update storage
      my.setStorage({
        key: 'logoGenerationData',
        data: {
          date: today,
          generationsLeft: generationsLeft
        }
      });
    },

    async generateLogo() {
      // Run validation and get detailed results
      const validationResults = this._checkFormValidity();
      
      if (!validationResults.isValid) {
        let errorMessage = 'Please fill in all required fields';

        // Show specific error message based on validation results
        if (!validationResults.isBusinessNameValid) {
          errorMessage = 'Business name must be at least 2 characters';
        } else if (!validationResults.isDescriptionValid) {
          errorMessage = 'Description must be at least 10 characters';
        } else if (!validationResults.isBusinessTypeValid) {
          errorMessage = 'Please select a business type';
        } else if (!validationResults.isColorValid) {
          errorMessage = 'Please select valid colors for your logo';
        } else if (!validationResults.isLogoStyleValid) {
          errorMessage = 'Please select a valid logo style';
        } else if (!validationResults.hasGenerationsLeft) {
          errorMessage = 'Daily generation limit reached. Try again tomorrow.';
        }

        my.showToast({
          type: 'fail',
          content: errorMessage,
          duration: 2000
        });
        return;
      }

      // Decrease the generation count
      this._updateGenerationCount();

      // Show loading indicator
      this.setData({
        isLoading: true,
        showLoadingMask: true,
        loadingMessage: 'Generating logo...'
      });

      // Show loading dialog with mask
      my.showLoading({
        content: 'Generating logo...',
        delay: 0,
        mask: true
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

        if (response.data) {
          console.log('API Response:', JSON.stringify(response.data, null, 2));
          if (response.data.data.status === 'succeeded') {
            if (response.data.data.outputs.text) {
              console.log('API Response outputs:', JSON.stringify(response.data.data.outputs, null, 2));
              // Initialize or clear the generatedLogos array
              let generatedLogos = [];

              // Add the text output to the generatedLogos array
              // Check if the output is already an array
              if (Array.isArray(response.data.data.outputs.text)) {
                console.log('API returned an array of URLs:', response.data.data.outputs.text);
                generatedLogos = response.data.data.outputs.text;
              } else if (typeof response.data.data.outputs.text === 'string') {
                // If it's a single string, try to parse it as JSON if it looks like an array
                if (response.data.data.outputs.text.startsWith('[') && response.data.data.outputs.text.endsWith(']')) {
                  try {
                    const parsedUrls = JSON.parse(response.data.data.outputs.text);
                    if (Array.isArray(parsedUrls)) {
                      console.log('Parsed text as JSON array:', parsedUrls);
                      generatedLogos = parsedUrls;
                    }
                  } catch (e) {
                    console.error('Failed to parse text as JSON:', e);
                    // Fall back to treating it as a single URL
                    generatedLogos = [response.data.data.outputs.text];
                  }
                } else {
                  // It's just a single URL string
                  generatedLogos = [response.data.data.outputs.text];
                }
              }

              console.log('Processed logos:', generatedLogos);

              // Update the component state with the generated logo
              this.setData({
                generatedLogos: generatedLogos,
                aiGeneratedLogoUrl: generatedLogos.length > 0 ? generatedLogos[0] : '',
                showAiGeneratedLogo: generatedLogos.length > 0,
                isLoading: false
              }, () => {
                // After state is updated, scroll to the logos section
                if (generatedLogos.length > 0) {
                  this.scrollToLogosSection();
                }
              });
              console.log('Updated generatedLogos in state:', this.data.generatedLogos);
            }
          } else {
            my.showToast({
              type: 'fail',
              content: 'Failed to generate logo',
              duration: 2000
            });
          }
        }
        // Hide loading indicator and mask
        my.hideLoading();
        this.setData({
          showLoadingMask: false
        });
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
          isLoading: false,
          showLoadingMask: false
        });
      }

      this.setData({
        showPreview: true,
        logoTextColor
      });

      my.showToast({
        type: 'success',
        content: 'Logo generated!',
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
        content: `Downloading logo #${parseInt(index) + 1}`,
        duration: 2000
      });
    },

    previewLogo(e) {
      const index = e.target.dataset.index;
      let logoIndex = parseInt(index);
      let filter = '';
      let background = this.data.logoBackground;

      // Apply different filters based on the index
      switch (logoIndex) {
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
        const logoUrl = this.data.generatedLogos[this.data.currentApiLogoIndex];
        console.log(logoUrl)
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

    previewAiLogo(e) {
      // Show the AI-generated logo in the preview modal
      if (this.data.generatedLogos && this.data.generatedLogos.length > 0) {
        // Get the logo index from the data attribute if available, otherwise use the first logo
        let logoIndex = 0;

        if (e && e.target && e.target.dataset && e.target.dataset.index !== undefined) {
          logoIndex = parseInt(e.target.dataset.index);
          console.log('Selected logo index:', logoIndex);
        }

        // Make sure the index is valid
        if (logoIndex >= this.data.generatedLogos.length) {
          logoIndex = 0;
        }

        const logoUrl = this.data.generatedLogos[logoIndex];
        console.log('Previewing AI logo from generatedLogos:', logoUrl);

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
            currentApiLogoIndex: logoIndex         // Set to the selected logo index
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
          showActionSheet: true,
          success: () => {
            my.showToast({
              type: 'success',
              content: 'Logo saved successfully',
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
    },

    scrollToLogosSection() {
      // Add a small delay to ensure the DOM has updated
      setTimeout(() => {
        // Use the Alipay Mini Program API to scroll to the logos section
        my.createSelectorQuery()
          .select('.preview-container')
          .boundingClientRect()
          .exec((ret) => {
            if (ret && ret[0]) {
              my.pageScrollTo({
                scrollTop: ret[0].top - 20, // Scroll a bit above the section for better visibility
                duration: 300
              });
            }
          });
      }, 300);
    }
  }
});
