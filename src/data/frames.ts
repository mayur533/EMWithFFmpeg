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
  },
  {
    id: 'frame12',
    name: 'Frame 12',
    background: require('../assets/frames/frame12.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: 0,
        y: 43,
        width: 90,
        height: 90
      },
      {
        type: 'text',
        key: 'companyName',
        x: 586,
        y: 69,
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
        x: 50,
        y: 500,
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
        x: 50,
        y: 520,
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
        x: 250,
        y: 500,
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
        x: 250,
        y: 520,
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
        x: 280,
        y: 45,
        width: 90,
        height: 90
      },
      {
        type: 'text',
        key: 'companyName',
        x: 107,
        y: 60,
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
        x: 50,
        y: 500,
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
        x: 50,
        y: 520,
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
        x: 250,
        y: 500,
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
        x: 250,
        y: 520,
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
        x: 0,
        y: 63,
        width: 100,
        height: 100
      },
      {
        type: 'text',
        key: 'companyName',
        x: 550,
        y: 77,
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
        x: 74,
        y: 549,
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
        x: 245,
        y: 545,
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
        x: 448,
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
        key: 'address',
        x: 451,
        y: 545,
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
        x: 555,
        y: 50,
        width: 90,
        height: 90
      },
      {
        type: 'text',
        key: 'companyName',
        x: 43,
        y: 22,
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
        x: 327,
        y: 505,
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
        x: 331,
        y: 532,
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
        x: 510,
        y: 520,
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
        x: 519,
        y: 548,
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
        x: 519,
        y: 48,
        width: 90,
        height: 90
      },
      {
        type: 'text',
        key: 'companyName',
        x: 77,
        y: 43,
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
        x: 20,
        y: 530,
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
        x: 163,
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
        key: 'website',
        x: 334,
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
        key: 'address',
        x: 475,
        y: 517,
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
        x: 0,
        y: 32,
        width: 100,
        height: 100
      },
      {
        type: 'text',
        key: 'companyName',
        x: 549,
        y: 17,
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
        x: 12,
        y: 539,
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
        x: 182,
        y: 545,
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
        x: 355,
        y: 552,
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
        x: 506,
        y: 549,
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
        x: 25,
        y: 45,
        width: 90,
        height: 90
      },
      {
        type: 'text',
        key: 'companyName',
        x: 200,
        y: 60,
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
        x: 50,
        y: 500,
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
        x: 50,
        y: 520,
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
        x: 250,
        y: 500,
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
        x: 250,
        y: 520,
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
        x: 280,
        y: 45,
        width: 90,
        height: 90
      },
      {
        type: 'text',
        key: 'companyName',
        x: 50,
        y: 60,
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
        x: 50,
        y: 500,
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
        x: 50,
        y: 520,
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
        x: 250,
        y: 500,
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
        x: 250,
        y: 520,
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
        x: 530,
        y: 12,
        width: 100,
        height: 100
      },
      {
        type: 'text',
        key: 'companyName',
        x: 40,
        y: 19,
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
        x: 35,
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
        key: 'email',
        x: 41,
        y: 543,
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
        x: 499,
        y: 520,
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
        x: 493,
        y: 545,
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
        x: 0,
        y: 16,
        width: 90,
        height: 90
      },
      {
        type: 'text',
        key: 'companyName',
        x: 513,
        y: 6,
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
        x: 34,
        y: 506,
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
        x: 38,
        y: 539,
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
        x: 471,
        y: 537,
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
        x: 257,
        y: 535,
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
        x: 50,
        y: 50,
        width: 80,
        height: 80
      },
      {
        type: 'text',
        key: 'companyName',
        x: 343,
        y: 67,
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
        x: 18,
        y: 530,
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
        x: 44,
        y: 567,
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
        x: 313,
        y: 528,
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
        x: 300,
        y: 564,
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
        x: 280,
        y: 40,
        width: 85,
        height: 85
      },
      {
        type: 'text',
        key: 'companyName',
        x: 50,
        y: 55,
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
        x: 45,
        y: 490,
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
        x: 45,
        y: 515,
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
        x: 298,
        y: 511,
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
        x: 296,
        y: 545,
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
        x: 40,
        y: 45,
        width: 90,
        height: 90
      },
      {
        type: 'text',
        key: 'companyName',
        x: 323,
        y: 71,
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
        x: 50,
        y: 485,
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
        x: 50,
        y: 510,
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
        x: 301,
        y: 494,
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
        x: 300,
        y: 538,
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
        x: 270,
        y: 40,
        width: 80,
        height: 80
      },
      {
        type: 'text',
        key: 'companyName',
        x: 60,
        y: 55,
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
        x: 19,
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
        x: 25,
        y: 560,
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
        x: 325,
        y: 525,
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
        x: 304,
        y: 570,
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
        x: 45,
        y: 50,
        width: 85,
        height: 85
      },
      {
        type: 'text',
        key: 'companyName',
        x: 329,
        y: 102,
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
        x: 17,
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
        x: 54,
        y: 555,
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
        x: 317,
        y: 515,
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
        x: 287,
        y: 554,
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
        x: 280,
        y: 35,
        width: 90,
        height: 90
      },
      {
        type: 'text',
        key: 'companyName',
        x: 22,
        y: 131,
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
        x: 19,
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
        x: 22,
        y: 565,
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
        x: 289,
        y: 537,
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
        x: 287,
        y: 569,
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
        x: 35,
        y: 45,
        width: 85,
        height: 85
      },
      {
        type: 'text',
        key: 'companyName',
        x: 333,
        y: 84,
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
        x: 33,
        y: 521,
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
        x: 33,
        y: 555,
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
        x: 323,
        y: 525,
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
        x: 303,
        y: 560,
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
        x: 290,
        y: 35,
        width: 88,
        height: 88
      },
      {
        type: 'text',
        key: 'companyName',
        x: 21,
        y: 62,
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
        x: 10,
        y: 485,
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
        x: 84,
        y: 558,
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
        x: 186,
        y: 562,
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
        x: 297,
        y: 562,
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
        x: 30,
        y: 45,
        width: 82,
        height: 82
      },
      {
        type: 'text',
        key: 'companyName',
        x: 340,
        y: 60,
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
        x: 13,
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
        key: 'email',
        x: 129,
        y: 531,
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
        x: 217,
        y: 528,
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
        x: 300,
        y: 505,
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
        x: 280,
        y: 40,
        width: 86,
        height: 86
      },
      {
        type: 'text',
        key: 'companyName',
        x: 52,
        y: 58,
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
        x: 43,
        y: 480,
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
        x: 43,
        y: 505,
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
        x: 315,
        y: 480,
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
        x: 308,
        y: 505,
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
