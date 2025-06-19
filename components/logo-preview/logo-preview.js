import { CASHIER_COOKIE, CASHIER_URL } from "/constants";
import { request } from "/utils/request";

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
    imageFilter: '',
    aiGeneratedLogoUrl: '',
    isProcessingPayment: false,
    isPurchased: false
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
      
      console.log('Props changed, updating logo preview:', {
        prevUrl: prevProps.aiGeneratedLogoUrl,
        newUrl: this.props.aiGeneratedLogoUrl,
        show: this.props.show
      });
      
      // If the modal is being shown, ensure we update the logo URL
      if (this.props.show && !prevProps.show) {
        // Force update the URL when modal is opened
        this.setData({
          aiGeneratedLogoUrl: this.props.aiGeneratedLogoUrl || ''
        }, () => {
          this.checkForAiLogo();
        });
      } else {
        this.checkForAiLogo();
      }
    }
  },
  
  methods: {  
    checkForAiLogo() {
      // Check if this is an AI-generated logo preview
      if (this.props.aiGeneratedLogoUrl) {
        console.log('AI logo URL detected:', this.props.aiGeneratedLogoUrl);
        
        // Update both isAiGenerated flag and the internal aiGeneratedLogoUrl
        this.setData({
          isAiGenerated: true,
          aiGeneratedLogoUrl: this.props.aiGeneratedLogoUrl
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
          imageFilter: '',
          aiGeneratedLogoUrl: ''
        });
      } else {
        console.log('Setting default to AI logo mode with empty URL');
        // Default to AI logo mode if background is transparent
        this.setData({
          isAiGenerated: true,
          imageFilter: '',
          aiGeneratedLogoUrl: this.props.aiGeneratedLogoUrl || ''
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
    
    async onDownloadTap() {
      // If already purchased, download directly without payment
      if (this.data.isPurchased) {
        console.log('Logo already purchased, downloading directly');
        // Call the parent component's download handler directly
        this.props.onDownload && this.props.onDownload();
        return;
      }
      
      // Set loading state
      this.setData({
        isProcessingPayment: true
      });
      
      // Show loading indicator
      my.showLoading({
        content: 'Processing payment...',
        delay: 0
      });
      
      // Generate unique order ID
      const orderId = this.generateUUID();
      
      // Prepare payment data
      const paymentData = {
        'order_id': orderId,
        'amount': '5000.00', // Fixed amount for logo download
      };
      
      try {
        // Call cashier API
        const response = await request({
          url: CASHIER_URL,
          method: 'POST',
          data: paymentData,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Cookie ${CASHIER_COOKIE}`,
          }
        });
        
        // Hide loading indicator
        my.hideLoading();
        
        // Process API response
        if (response.data && response.data.success) {
          // Initiate payment flow
          this.processPayment(response.data);
        } else {
          // Handle unsuccessful API response
          this.handlePaymentError('Payment initialization failed');
        }
      } catch (error) {
        // Handle API errors
        console.error('Payment API error:', error);
        my.hideLoading();
        this.handlePaymentError('Payment service unavailable');
      }
    },
    
    processPayment(paymentData) {
      my.tradePay({
        orderStr: paymentData.payment_id,
        paymentUrl: paymentData.redirection_url,
        success: (result) => {
          console.log('Payment successful:', result);
          // Set isPurchased to true so future downloads don't require payment
          this.setData({
            isPurchased: true
          });
          this.handlePaymentSuccess();
        },
        fail: (error) => {
          console.error('Payment failed:', error);
          this.handlePaymentError('Payment was not completed');
        },
        complete: () => {
          // Reset loading state
          this.setData({
            isProcessingPayment: false
          });
        }
      });
    },
    
    handlePaymentSuccess() {
      // Show success message
      my.showToast({
        type: 'success',
        content: 'Payment successful! Downloading logo...',
        duration: 2000
      });
      
      // Call the parent component's download handler
      this.props.onDownload && this.props.onDownload();
    },
    
    handlePaymentError(message) {
      // Reset loading state
      this.setData({
        isProcessingPayment: false
      });
      
      // Show error message
      my.showToast({
        type: 'fail',
        content: message || 'Payment failed',
        duration: 3000
      });
    },
    generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  }
  
});
