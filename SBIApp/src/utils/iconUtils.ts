// src/utils/iconUtils.ts
export const getValidIconName = (name: string): string => {
  const validIcons: Record<string, string> = {
    // Navigation
    'home': 'home',
    'dashboard': 'dashboard',
    'store': 'store',
    'school': 'school',
    'person': 'person',
    'people': 'people',
    'folder': 'folder',
    'settings': 'settings',
    'notifications': 'notifications',
    
    // Actions
    'search': 'search',
    'add': 'add',
    'edit': 'edit',
    'delete': 'delete',
    'close': 'close',
    'check': 'check',
    'arrow-back': 'arrow-back',
    'arrow-forward': 'arrow-forward',
    'chevron-right': 'chevron-right',
    
    // Status
    'check-circle': 'check-circle',
    'error': 'error',
    'info': 'info',
    'warning': 'warning',
    'verified': 'verified',
    
    // Business
    'work': 'work',
    'business': 'business',
    'storefront': 'storefront',
    'shopping-cart': 'shopping-cart',
    'attach-money': 'attach-money',
    'account-balance': 'account-balance',
    
    // Communication
    'email': 'email',
    'message': 'message',
    'phone': 'phone',
    'chat': 'chat',
    
    // Media
    'play-circle': 'play-circle',
    'play-circle-outline': 'play-circle-outline',
    'pause-circle': 'pause-circle',
    'videocam': 'videocam',
    'image': 'image',
    
    // Files
    'description': 'description',
    'picture-as-pdf': 'picture-as-pdf',
    'file-copy': 'file-copy',
    
    // Social
    'facebook': 'facebook',
    'twitter': 'twitter',
    'linkedin': 'linkedin',
    'instagram': 'instagram',
    
    // Default fallback
    'default': 'circle'
  };
  
  return validIcons[name] || 'circle';
};