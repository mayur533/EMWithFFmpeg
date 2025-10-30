import { Frame, FramePlaceholder } from '../data/frames';
import { BusinessProfile } from '../services/businessProfile';

export interface FrameContent {
  [key: string]: string;
}

export const mapBusinessProfileToFrameContent = (profile: BusinessProfile): FrameContent => {
  const content: FrameContent = {
    // Company/Brand identifiers
    companyName: profile.name || 'Your Company',
    brandName: profile.name || 'Your Brand',
    name: profile.name || 'Your Name',
    
    // Descriptions
    companyDescription: profile.description || 'Company description',
    
    // Logo and images
    logo: profile.companyLogo || profile.logo || '',
    companyLogo: profile.companyLogo || profile.logo || '',
    profileImage: profile.companyLogo || profile.logo || '',
    
    // Individual contact fields with icons
    phone: profile.phone ? `📞 ${profile.phone}` : '',
    email: profile.email ? `📧 ${profile.email}` : '',
    website: profile.website ? `🌐 ${profile.website}` : '',
    address: profile.address ? `📍 ${profile.address}` : '',
    
    // Company-prefixed fields (for backward compatibility with some frames)
    companyPhone: profile.phone ? `📞 ${profile.phone}` : '',
    companyEmail: profile.email ? `📧 ${profile.email}` : '',
    companyWebsite: profile.website ? `🌐 ${profile.website}` : '',
    companyAddress: profile.address ? `📍 ${profile.address}` : '',
    
    // Legacy contact field (for backward compatibility)
    contact: [
      profile.phone ? `📞 ${profile.phone}` : '',
      profile.email ? `📧 ${profile.email}` : '',
      profile.website ? `🌐 ${profile.website}` : '',
      profile.address ? `📍 ${profile.address}` : '',
    ].filter(Boolean).join('\n'),
    
    // Category and title
    title: profile.category || 'Business',
    category: profile.category || 'Business',
    
    // Event-specific fields (with fallbacks)
    eventTitle: profile.name || 'Event Title',
    eventDate: new Date().toLocaleDateString(),
    organizer: profile.name || 'Organizer',
  };

  console.log('📋 Mapped business profile to frame content:', Object.keys(content).length, 'fields');
  console.log('📞 Phone:', content.companyPhone);
  console.log('📧 Email:', content.companyEmail);
  console.log('🌐 Website:', content.companyWebsite);
  console.log('📍 Address:', content.companyAddress);
  return content;
};

export const generateLayersFromFrame = (
  frame: Frame,
  content: FrameContent,
  canvasWidth: number,
  canvasHeight: number
) => {
  const layers: any[] = [];
  let zIndex = 10; // Start at z-index 10 to ensure layers are above frame overlay (z-index 0)

  // Standard frame dimensions (frames are designed for this size)
  const standardWidth = 720;
  const standardHeight = 487.2;
  
  // Calculate scaling factors to adapt frame placeholders to actual canvas size
  const scaleX = canvasWidth / standardWidth;
  const scaleY = canvasHeight / standardHeight;

  frame.placeholders.forEach((placeholder) => {
    const contentValue = content[placeholder.key];
    
    // Skip if no content value provided for this placeholder
    if (!contentValue) {
      console.log(`⚠️ No content value for placeholder key: ${placeholder.key}`);
      return;
    }

    if (placeholder.type === 'text') {
      // Scale position and size based on canvas dimensions
      const scaledX = placeholder.x * scaleX;
      const scaledY = placeholder.y * scaleY;
      const scaledWidth = (placeholder.maxWidth || 300) * scaleX;
      const scaledFontSize = (placeholder.fontSize || 16) * Math.min(scaleX, scaleY);
      
      layers.push({
        id: `frame-${placeholder.key}`,
        type: 'text',
        content: contentValue,
        position: {
          x: scaledX,
          y: scaledY,
        },
        size: {
          width: scaledWidth,
          height: scaledFontSize * 3, // Height based on font size for proper wrapping
        },
        rotation: 0,
        zIndex: zIndex++,
        fieldType: placeholder.key,
        style: {
          fontSize: scaledFontSize,
          color: placeholder.color || '#FFFFFF',
          fontFamily: placeholder.fontFamily || 'System',
          fontWeight: placeholder.fontWeight || 'normal',
          textAlign: placeholder.textAlign || 'left',
        },
      });
      console.log(`✅ Added text layer for ${placeholder.key}: position (${scaledX.toFixed(1)}, ${scaledY.toFixed(1)}), fontSize: ${scaledFontSize.toFixed(1)}`);
    } else if (placeholder.type === 'image') {
      // Scale position and size based on canvas dimensions
      const scaledX = placeholder.x * scaleX;
      const scaledY = placeholder.y * scaleY;
      const scaledWidth = (placeholder.width || 80) * scaleX;
      const scaledHeight = (placeholder.height || 80) * scaleY;
      
      layers.push({
        id: `frame-${placeholder.key}`,
        type: 'logo',
        content: contentValue,
        position: {
          x: scaledX,
          y: scaledY,
        },
        size: {
          width: scaledWidth,
          height: scaledHeight,
        },
        rotation: 0,
        zIndex: zIndex++,
        fieldType: placeholder.key,
      });
      console.log(`✅ Added image layer for ${placeholder.key}: position (${scaledX.toFixed(1)}, ${scaledY.toFixed(1)}), size: ${scaledWidth.toFixed(1)}x${scaledHeight.toFixed(1)}`);
    }
  });

  console.log(`🎨 Generated ${layers.length} layers from frame "${frame.name}" (Canvas: ${canvasWidth}x${canvasHeight}, Scale: ${scaleX.toFixed(2)}x${scaleY.toFixed(2)})`);
  return layers;
};

export const getFrameBackgroundStyle = (frame: Frame) => {
  return {
    width: '100%',
    height: '100%',
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  };
};

export const getFrameBackgroundSource = (frame: Frame) => {
  return frame.background;
};
