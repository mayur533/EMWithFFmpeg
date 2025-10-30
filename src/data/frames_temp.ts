export interface FramePlaceholder {
  type: 'text' | 'image';
  key: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  maxWidth?: number;
  maxHeight?: number;
}

export interface Frame {
  id: string;
  name: string;
  background: any; // Image source
  placeholders: FramePlaceholder[];
  category: 'business' | 'event' | 'personal' | 'creative';
  description: string;
}

export const frames: Frame[] = [
  {
    id: 'frame1',
    name: 'Frame 1',
    background: require('../assets/frames/frame1.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        width: 80,
        height: 80
      },
      {
        type: 'text',
        key: 'companyName',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 24,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'right',
        maxWidth: 100
      },
      {
        type: 'text',
        key: 'phone',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      }
    ],
    category: 'business',
    description: 'Modern business frame with bold red accents and strategic positioning'
  },
  {
    id: 'frame2',
    name: 'Frame 2',
    background: require('../assets/frames/frame2.png'),
    placeholders: [
      {
        type: 'text',
        key: 'companyName',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 28,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'left',
        maxWidth: 300
      },
      {
        type: 'image',
        key: 'logo',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        width: 100,
        height: 100
      },
      {
        type: 'text',
        key: 'phone',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      }
    ],
    category: 'business',
    description: 'Modern business frame with centered layout'
  },
  {
    id: 'frame3',
    name: 'Frame 3',
    background: require('../assets/frames/frame3.png'),
    placeholders: [
      {
        type: 'text',
        key: 'companyName',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 32,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'left',
        maxWidth: 300
      },
      {
        type: 'image',
        key: 'logo',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        width: 100,
        height: 100
      },
      {
        type: 'text',
        key: 'phone',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      }
    ],
    category: 'business',
    description: 'Modern business frame with elegant layout'
  },
  {
    id: 'frame4',
    name: 'Frame 4',
    background: require('../assets/frames/frame4.png'),
    placeholders: [
      {
        type: 'text',
        key: 'companyName',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 26,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'left',
        maxWidth: 300
      },
      {
        type: 'image',
        key: 'logo',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        width: 90,
        height: 90
      },
      {
        type: 'text',
        key: 'phone',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      }
    ],
    category: 'business',
    description: 'Modern business frame with creative layout'
  },
  {
    id: 'frame5',
    name: 'Frame 5',
    background: require('../assets/frames/frame5.png'),
    placeholders: [
      {
        type: 'text',
        key: 'companyName',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 28,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'left',
        maxWidth: 320
      },
      {
        type: 'image',
        key: 'logo',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        width: 100,
        height: 100
      },
      {
        type: 'text',
        key: 'phone',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      }
    ],
    category: 'business',
    description: 'Modern business frame with centered layout'
  },
  {
    id: 'frame6',
    name: 'Frame 6',
    background: require('../assets/frames/frame6.png'),
    placeholders: [
      {
        type: 'text',
        key: 'companyName',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 26,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'left',
        maxWidth: 300
      },
      {
        type: 'image',
        key: 'logo',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        width: 80,
        height: 80
      },
      {
        type: 'text',
        key: 'phone',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      }
    ],
    category: 'business',
    description: 'Professional business frame'
  },
  {
    id: 'frame7',
    name: 'Frame 7',
    background: require('../assets/frames/frame7.png'),
    placeholders: [
      {
        type: 'text',
        key: 'companyName',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 30,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'left',
        maxWidth: 300
      },
      {
        type: 'image',
        key: 'logo',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        width: 90,
        height: 90
      },
      {
        type: 'text',
        key: 'phone',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      }
    ],
    category: 'business',
    description: 'Modern business frame with center focus'
  },
  {
    id: 'frame8',
    name: 'Frame 8',
    background: require('../assets/frames/frame8.png'),
    placeholders: [
      {
        type: 'text',
        key: 'companyName',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 28,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'left',
        maxWidth: 300
      },
      {
        type: 'image',
        key: 'logo',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        width: 100,
        height: 100
      },
      {
        type: 'text',
        key: 'phone',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      }
    ],
    category: 'business',
    description: 'Modern business frame 8'
  },
  {
    id: 'frame9',
    name: 'Frame 9',
    background: require('../assets/frames/frame9.png'),
    placeholders: [
      {
        type: 'text',
        key: 'companyName',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 28,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'left',
        maxWidth: 300
      },
      {
        type: 'image',
        key: 'logo',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        width: 100,
        height: 100
      },
      {
        type: 'text',
        key: 'phone',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      }
    ],
    category: 'business',
    description: 'Modern business frame 9'
  },
  {
    id: 'frame10',
    name: 'Frame 10',
    background: require('../assets/frames/frame10.png'),
    placeholders: [
      {
        type: 'text',
        key: 'companyName',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 28,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'left',
        maxWidth: 300
      },
      {
        type: 'image',
        key: 'logo',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        width: 100,
        height: 100
      },
      {
        type: 'text',
        key: 'phone',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      }
    ],
    category: 'business',
    description: 'Modern business frame 10'
  },
  {
    id: 'frame11',
    name: 'Frame 11',
    background: require('../assets/frames/frame11.png'),
    placeholders: [
      {
        type: 'text',
        key: 'companyName',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 28,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'left',
        maxWidth: 300
      },
      {
        type: 'image',
        key: 'logo',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        width: 100,
        height: 100
      },
      {
        type: 'text',
        key: 'phone',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      }
    ],
    category: 'business',
    description: 'Modern business frame 11'
  },
  {
    id: 'frame12',
    name: 'Frame 12',
    background: require('../assets/frames/frame12.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        width: 90,
        height: 90
      },
      {
        type: 'text',
        key: 'companyName',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 28,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'right',
        maxWidth: 300
      },
      {
        type: 'text',
        key: 'phone',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      }
    ],
    category: 'business',
    description: 'Modern business frame 12'
  },
  {
    id: 'frame13',
    name: 'Frame 13',
    background: require('../assets/frames/frame13.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        width: 90,
        height: 90
      },
      {
        type: 'text',
        key: 'companyName',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 28,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'left',
        maxWidth: 300
      },
      {
        type: 'text',
        key: 'phone',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      }
    ],
    category: 'business',
    description: 'Modern business frame 13'
  },
  {
    id: 'frame14',
    name: 'Frame 14',
    background: require('../assets/frames/frame14.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        width: 100,
        height: 100
      },
      {
        type: 'text',
        key: 'companyName',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 28,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'right',
        maxWidth: 300
      },
      {
        type: 'text',
        key: 'phone',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      }
    ],
    category: 'business',
    description: 'Modern business frame 14'
  },
  {
    id: 'frame15',
    name: 'Frame 15',
    background: require('../assets/frames/frame15.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        width: 90,
        height: 90
      },
      {
        type: 'text',
        key: 'companyName',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 28,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'left',
        maxWidth: 300
      },
      {
        type: 'text',
        key: 'phone',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      }
    ],
    category: 'business',
    description: 'Modern business frame 15'
  },
  {
    id: 'frame16',
    name: 'Frame 16',
    background: require('../assets/frames/frame16.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        width: 90,
        height: 90
      },
      {
        type: 'text',
        key: 'companyName',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 28,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'left',
        maxWidth: 300
      },
      {
        type: 'text',
        key: 'phone',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      }
    ],
    category: 'business',
    description: 'Modern business frame 16'
  },
  {
    id: 'frame17',
    name: 'Frame 17',
    background: require('../assets/frames/frame17.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        width: 100,
        height: 100
      },
      {
        type: 'text',
        key: 'companyName',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 28,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'right',
        maxWidth: 300
      },
      {
        type: 'text',
        key: 'phone',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      }
    ],
    category: 'business',
    description: 'Modern business frame 17'
  },
  {
    id: 'frame18',
    name: 'Frame 18',
    background: require('../assets/frames/frame18.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        width: 90,
        height: 90
      },
      {
        type: 'text',
        key: 'companyName',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 28,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 300
      },
      {
        type: 'text',
        key: 'phone',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      }
    ],
    category: 'business',
    description: 'Modern business frame 18'
  },
  {
    id: 'frame19',
    name: 'Frame 19',
    background: require('../assets/frames/frame19.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        width: 90,
        height: 90
      },
      {
        type: 'text',
        key: 'companyName',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 28,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'left',
        maxWidth: 300
      },
      {
        type: 'text',
        key: 'phone',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      }
    ],
    category: 'business',
    description: 'Modern business frame 19'
  },
  {
    id: 'frame20',
    name: 'Frame 20',
    background: require('../assets/frames/frame20.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        width: 100,
        height: 100
      },
      {
        type: 'text',
        key: 'companyName',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 28,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'left',
        maxWidth: 300
      },
      {
        type: 'text',
        key: 'phone',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      }
    ],
    category: 'business',
    description: 'Modern business frame 20'
  },
  {
    id: 'frame21',
    name: 'Frame 21',
    background: require('../assets/frames/frame21.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        width: 90,
        height: 90
      },
      {
        type: 'text',
        key: 'companyName',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 28,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'right',
        maxWidth: 300
      },
      {
        type: 'text',
        key: 'phone',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      }
    ],
    category: 'business',
    description: 'Modern business frame 21'
  },
  {
    id: 'frame22',
    name: 'Frame 22',
    background: require('../assets/frames/frame22.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        width: 80,
        height: 80
      },
      {
        type: 'text',
        key: 'companyName',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 24,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 250
      },
      {
        type: 'text',
        key: 'phone',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      }
    ],
    category: 'business',
    description: 'Professional business frame 22'
  },
  {
    id: 'frame23',
    name: 'Frame 23',
    background: require('../assets/frames/frame23.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        width: 85,
        height: 85
      },
      {
        type: 'text',
        key: 'companyName',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 26,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'left',
        maxWidth: 280
      },
      {
        type: 'text',
        key: 'phone',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      }
    ],
    category: 'event',
    description: 'Event frame 23'
  },
  {
    id: 'frame24',
    name: 'Frame 24',
    background: require('../assets/frames/frame24.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        width: 90,
        height: 90
      },
      {
        type: 'text',
        key: 'companyName',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 25,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'right',
        maxWidth: 240
      },
      {
        type: 'text',
        key: 'phone',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      }
    ],
    category: 'business',
    description: 'Elegant business frame 24'
  },
  {
    id: 'frame25',
    name: 'Frame 25',
    background: require('../assets/frames/frame25.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        width: 80,
        height: 80
      },
      {
        type: 'text',
        key: 'companyName',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 24,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'left',
        maxWidth: 260
      },
      {
        type: 'text',
        key: 'phone',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      }
    ],
    category: 'personal',
    description: 'Personal frame 25'
  },
  {
    id: 'frame26',
    name: 'Frame 26',
    background: require('../assets/frames/frame26.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        width: 85,
        height: 85
      },
      {
        type: 'text',
        key: 'companyName',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 26,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'right',
        maxWidth: 270
      },
      {
        type: 'text',
        key: 'phone',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      }
    ],
    category: 'event',
    description: 'Event celebration frame 26'
  },
  {
    id: 'frame27',
    name: 'Frame 27',
    background: require('../assets/frames/frame27.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        width: 90,
        height: 90
      },
      {
        type: 'text',
        key: 'companyName',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 27,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'left',
        maxWidth: 270
      },
      {
        type: 'text',
        key: 'phone',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      }
    ],
    category: 'creative',
    description: 'Creative design frame 27'
  },
  {
    id: 'frame28',
    name: 'Frame 28',
    background: require('../assets/frames/frame28.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        width: 85,
        height: 85
      },
      {
        type: 'text',
        key: 'companyName',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 25,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'right',
        maxWidth: 260
      },
      {
        type: 'text',
        key: 'phone',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      }
    ],
    category: 'business',
    description: 'Modern business frame 28'
  },
  {
    id: 'frame29',
    name: 'Frame 29',
    background: require('../assets/frames/frame29.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        width: 88,
        height: 88
      },
      {
        type: 'text',
        key: 'companyName',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 26,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'left',
        maxWidth: 270
      },
      {
        type: 'text',
        key: 'phone',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      }
    ],
    category: 'personal',
    description: 'Personal greeting frame 29'
  },
  {
    id: 'frame30',
    name: 'Frame 30',
    background: require('../assets/frames/frame30.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        width: 82,
        height: 82
      },
      {
        type: 'text',
        key: 'companyName',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 25,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'right',
        maxWidth: 265
      },
      {
        type: 'text',
        key: 'phone',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      }
    ],
    category: 'event',
    description: 'Festive event frame 30'
  },
  {
    id: 'frame31',
    name: 'Frame 31',
    background: require('../assets/frames/frame31.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        width: 86,
        height: 86
      },
      {
        type: 'text',
        key: 'companyName',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 26,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'left',
        maxWidth: 268
      },
      {
        type: 'text',
        key: 'phone',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: [int]($matches[0] * 1.8),
        y: [int]($matches[0] * 0.812),
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      }
    ],
    category: 'creative',
    description: 'Creative design frame 31'
  }
];

export const getFramesByCategory = (category: string): Frame[] => {
  return frames.filter(frame => frame.category === category);
};

export const getFrameById = (id: string): Frame | undefined => {
  return frames.find(frame => frame.id === id);
};

