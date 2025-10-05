// Ad Network Configuration
// Update these URLs with your actual ad network scripts

export const AD_CONFIG = {
  // Primary Adsterra configuration
  adsterra: {
    script: 'https://pl27290084.profitableratecpm.com/d0/41/1a/d0411aa965c9eae2ef7ce1a2dc760583.js',
    enabled: true,
    priority: 1
  },
  
  // Backup Adsterra iframe method
  adsterraIframe: {
    script: 'https://pl27290084.profitableratecpm.com/d0/41/1a/d0411aa965c9eae2ef7ce1a2dc760583.js',
    enabled: true,
    priority: 2
  },
  
  // Google AdSense (if you have it)
  googleAdsense: {
    script: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
    enabled: false, // Set to true if you have AdSense
    priority: 3
  },
  
  // Add more ad networks here
  // Example:
  // mediaNet: {
  //   script: 'https://your-medi-net-script.js',
  //   enabled: false,
  //   priority: 4
  // }
};

// Ad display settings
export const AD_SETTINGS = {
  minViewTime: 5000, // Minimum time to show ad (5 seconds)
  maxWaitTime: 20000, // Maximum time to wait for ad to load (20 seconds)
  timeoutPerMethod: 5000, // Timeout per ad method (5 seconds)
  fallbackEnabled: true // Show fallback message if all ads fail
};
