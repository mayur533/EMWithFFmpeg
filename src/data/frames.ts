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
        x: 25,
        y: 43,
        width: 80,
        height: 80
      },
      {
        type: 'text',
        key: 'companyName',
        x: 280,
        y: 50,
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
        x: 179,
        y: 464,
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
        x: 258,
        y: 461,
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: 152,
        y: 513,
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
        x: 238,
        y: 525,
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
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
        x: 51,
        y: 55,
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
        x: 300,
        y: 11,
        width: 100,
        height: 100
      },
      {
        type: 'text',
        key: 'phone',
        x: 192,
        y: 512,
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
        x: 296,
        y: 540,
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
        x: 293,
        y: 509,
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
        x: 192,
        y: 543,
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
        x: 105,
        y: 60,
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
        x: 279,
        y: 50,
        width: 100,
        height: 100
      },
      {
        type: 'text',
        key: 'phone',
        x: 71,
        y: 479,
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
        x: 271,
        y: 471,
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
        x: 73,
        y: 514,
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
        x: 273,
        y: 507,
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
        x: 280,
        y: 61,
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
        x: 25,
        y: 45,
        width: 90,
        height: 90
      },
      {
        type: 'text',
        key: 'phone',
        x: 73,
        y: 499,
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
        x: 299,
        y: 514,
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
        x: 93,
        y: 540,
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
        x: 189,
        y: 542,
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
        x: 82,
        y: 64,
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
        x: 297,
        y: 13,
        width: 100,
        height: 100
      },
      {
        type: 'text',
        key: 'phone',
        x: 6,
        y: 512,
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
        x: 6,
        y: 556,
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
        x: 210,
        y: 533,
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
        x: 93,
        y: 553,
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
        x: 35,
        y: 62,
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
        x: 305,
        y: 73,
        width: 80,
        height: 80
      },
      {
        type: 'text',
        key: 'phone',
        x: 142,
        y: 516,
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
        x: 320,
        y: 516,
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
        x: 6,
        y: 493,
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
        x: 237,
        y: 516,
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
        x: 79,
        y: 78,
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
        x: 293,
        y: 41,
        width: 90,
        height: 90
      },
      {
        type: 'text',
        key: 'phone',
        x: 0,
        y: 527,
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
        x: 249,
        y: 523,
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
        x: 68,
        y: 525,
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
        x: 156,
        y: 529,
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
        x: 63,
        y: 42,
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
        x: 293,
        y: 10,
        width: 100,
        height: 100
      },
      {
        type: 'text',
        key: 'phone',
        x: 6,
        y: 511,
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
        x: 276,
        y: 519,
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
        x: 278,
        y: 491,
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
        x: 162,
        y: 480,
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
        x: 49,
        y: 78,
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
        x: 273,
        y: 59,
        width: 100,
        height: 100
      },
      {
        type: 'text',
        key: 'phone',
        x: 38,
        y: 513,
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
        x: 306,
        y: 534,
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
        x: 88,
        y: 536,
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
        x: 182,
        y: 534,
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
        x: 131,
        y: 78,
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
        x: 279,
        y: 49,
        width: 100,
        height: 100
      },
      {
        type: 'text',
        key: 'phone',
        x: 31,
        y: 512,
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
        x: 211,
        y: 513,
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
        x: 110,
        y: 509,
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
        x: 297,
        y: 504,
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
        x: 237,
        y: 75,
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
        x: 12,
        y: 49,
        width: 100,
        height: 100
      },
      {
        type: 'text',
        key: 'phone',
        x: 99,
        y: 492,
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
        x: 307,
        y: 528,
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
        x: 99,
        y: 533,
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
        x: 195,
        y: 533,
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
  }
];

export const getFramesByCategory = (category: string): Frame[] => {
  return frames.filter(frame => frame.category === category);
};

export const getFrameById = (id: string): Frame | undefined => {
  return frames.find(frame => frame.id === id);
};
