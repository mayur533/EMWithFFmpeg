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
        x: 0,
        y: 40,
        width: 80,
        height: 80
      },
      {
        type: 'text',
        key: 'companyName',
        x: 602,
        y: 39,
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
        x: 6,
        y: 439,
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
        x: 185,
        y: 448,
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
        x: 537,
        y: 445,
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
        x: 392,
        y: 447,
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
        x: 50,
        y: 30,
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
        x: 600,
        y: 20,
        width: 100,
        height: 100
      },
      {
        type: 'text',
        key: 'phone',
        x: 20,
        y: 420,
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
        x: 200,
        y: 420,
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
        x: 380,
        y: 420,
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
        x: 560,
        y: 420,
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
        x: 31,
        y: 44,
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
        x: 50,
        y: 423,
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
        x: 452,
        y: 418,
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
        x: 58,
        y: 453,
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
        x: 460,
        y: 447,
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
        x: 614,
        y: 38,
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
        x: 0,
        y: 27,
        width: 90,
        height: 90
      },
      {
        type: 'text',
        key: 'phone',
        x: 81,
        y: 427,
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
        x: 487,
        y: 427,
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
        x: 169,
        y: 447,
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
        x: 319,
        y: 445,
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
        x: 52,
        y: 36,
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
        x: 65,
        y: 437,
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
        x: 498,
        y: 439,
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
        x: 146,
        y: 450,
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
        x: 335,
        y: 447,
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
        x: 63,
        y: 50,
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
        x: 549,
        y: 59,
        width: 80,
        height: 80
      },
      {
        type: 'text',
        key: 'phone',
        x: 17,
        y: 442,
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
        x: 135,
        y: 444,
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
        x: 315,
        y: 442,
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
        x: 544,
        y: 444,
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
        x: 142,
        y: 63,
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
        x: 527,
        y: 33,
        width: 90,
        height: 90
      },
      {
        type: 'text',
        key: 'phone',
        x: 33,
        y: 434,
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
        x: 154,
        y: 432,
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
        x: 327,
        y: 432,
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
        x: 546,
        y: 436,
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
        x: 113,
        y: 34,
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
        x: 527,
        y: 8,
        width: 100,
        height: 100
      },
      {
        type: 'text',
        key: 'phone',
        x: 4,
        y: 445,
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
        x: 144,
        y: 440,
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
        x: 344,
        y: 444,
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
        x: 546,
        y: 442,
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
        type: 'image',
        key: 'logo',
        x: 504,
        y: 32,
        width: 85,
        height: 85
      },
      {
        type: 'text',
        key: 'companyName',
        x: 90,
        y: 45,
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
        x: 81,
        y: 398,
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
        x: 81,
        y: 418,
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
        x: 536,
        y: 415,
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
        x: 533,
        y: 443,
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      }
    ],
    category: 'event',
    description: 'Event frame 9'
  },
  {
    id: 'frame10',
    name: 'Frame 10',
    background: require('../assets/frames/frame10.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: 72,
        y: 37,
        width: 90,
        height: 90
      },
      {
        type: 'text',
        key: 'companyName',
        x: 581,
        y: 58,
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
        x: 90,
        y: 394,
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
        x: 90,
        y: 414,
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
        x: 542,
        y: 401,
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
        x: 540,
        y: 437,
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      }
    ],
    category: 'business',
    description: 'Elegant business frame 10'
  },
  {
    id: 'frame11',
    name: 'Frame 11',
    background: require('../assets/frames/frame11.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: 486,
        y: 32,
        width: 80,
        height: 80
      },
      {
        type: 'text',
        key: 'companyName',
        x: 108,
        y: 45,
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
        x: 34,
        y: 425,
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
        y: 455,
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
        x: 585,
        y: 426,
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
        x: 547,
        y: 463,
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      }
    ],
    category: 'personal',
    description: 'Personal frame 11'
  },
  {
    id: 'frame12',
    name: 'Frame 12',
    background: require('../assets/frames/frame12.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: 81,
        y: 41,
        width: 85,
        height: 85
      },
      {
        type: 'text',
        key: 'companyName',
        x: 592,
        y: 83,
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
        x: 31,
        y: 417,
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
        x: 97,
        y: 451,
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
        x: 571,
        y: 418,
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
        x: 517,
        y: 450,
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      }
    ],
    category: 'event',
    description: 'Event celebration frame 12'
  },
  {
    id: 'frame13',
    name: 'Frame 13',
    background: require('../assets/frames/frame13.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: 504,
        y: 28,
        width: 90,
        height: 90
      },
      {
        type: 'text',
        key: 'companyName',
        x: 40,
        y: 106,
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
        x: 34,
        y: 434,
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
        x: 40,
        y: 459,
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
        x: 520,
        y: 436,
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
        x: 517,
        y: 462,
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      }
    ],
    category: 'creative',
    description: 'Creative design frame 13'
  },
  {
    id: 'frame14',
    name: 'Frame 14',
    background: require('../assets/frames/frame14.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: 63,
        y: 37,
        width: 85,
        height: 85
      },
      {
        type: 'text',
        key: 'companyName',
        x: 599,
        y: 68,
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
        x: 59,
        y: 423,
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
        x: 59,
        y: 451,
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
        x: 581,
        y: 426,
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
        x: 545,
        y: 455,
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
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
        x: 522,
        y: 28,
        width: 88,
        height: 88
      },
      {
        type: 'text',
        key: 'companyName',
        x: 38,
        y: 50,
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
        x: 18,
        y: 394,
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
        x: 151,
        y: 453,
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
        x: 335,
        y: 456,
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
        x: 535,
        y: 456,
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      }
    ],
    category: 'personal',
    description: 'Personal greeting frame 15'
  },
  {
    id: 'frame16',
    name: 'Frame 16',
    background: require('../assets/frames/frame16.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: 54,
        y: 37,
        width: 82,
        height: 82
      },
      {
        type: 'text',
        key: 'companyName',
        x: 612,
        y: 49,
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
        x: 23,
        y: 428,
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
        x: 232,
        y: 431,
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
        x: 391,
        y: 429,
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
        x: 540,
        y: 410,
        fontSize: 12,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      }
    ],
    category: 'event',
    description: 'Festive event frame 16'
  }
];

export const getFramesByCategory = (category: string): Frame[] => {
  return frames.filter(frame => frame.category === category);
};

export const getFrameById = (id: string): Frame | undefined => {
  return frames.find(frame => frame.id === id);
};
