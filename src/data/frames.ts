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

// Frame font size constants (matching template text sizes)
export const FRAME_FONT_SIZES = {
  COMPANY_NAME: 24,
  CONTACT_FIELDS: 8, // phone, email, website, address
  DEFAULT: 16,
};

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
        fontSize: FRAME_FONT_SIZES.COMPANY_NAME,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.COMPANY_NAME,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.COMPANY_NAME,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.COMPANY_NAME,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.COMPANY_NAME,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.COMPANY_NAME,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.COMPANY_NAME,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.COMPANY_NAME,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.COMPANY_NAME,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.COMPANY_NAME,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.COMPANY_NAME,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.COMPANY_NAME,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.COMPANY_NAME,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.COMPANY_NAME,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.COMPANY_NAME,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.COMPANY_NAME,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      }
    ],
    category: 'event',
    description: 'Festive event frame 16'
  },
  {
    id: 'frame17',
    name: 'Frame 17',
    background: require('../assets/frames/frame17.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: 50,
        y: 35,
        width: 85,
        height: 85
      },
      {
        type: 'text',
        key: 'companyName',
        x: 67,
        y: 40,
        fontSize: FRAME_FONT_SIZES.COMPANY_NAME,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 300
      },
      {
        type: 'text',
        key: 'phone',
        x: 91,
        y: 441,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#000000',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: 202,
        y: 435,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#000000',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: 348,
        y: 439,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#000000',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: 477,
        y: 447,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#000000',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      }
    ],
    category: 'business',
    description: 'Professional business frame 17'
  },
  {
    id: 'frame18',
    name: 'Frame 18',
    background: require('../assets/frames/frame18.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: 520,
        y: 30,
        width: 90,
        height: 90
      },
      {
        type: 'text',
        key: 'companyName',
        x: 50,
        y: 45,
        fontSize: FRAME_FONT_SIZES.COMPANY_NAME,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'left',
        maxWidth: 280
      },
      {
        type: 'text',
        key: 'phone',
        x: 77,
        y: 450,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#000000',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: 204,
        y: 441,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#000000',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: 370,
        y: 442,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#000000',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: 529,
        y: 445,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#000000',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      }
    ],
    category: 'creative',
    description: 'Creative design frame 18'
  },
  {
    id: 'frame19',
    name: 'Frame 19',
    background: require('../assets/frames/frame19.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: 70,
        y: 40,
        width: 80,
        height: 80
      },
      {
        type: 'text',
        key: 'companyName',
        x: 600,
        y: 55,
        fontSize: FRAME_FONT_SIZES.COMPANY_NAME,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'right',
        maxWidth: 250
      },
      {
        type: 'text',
        key: 'phone',
        x: 25,
        y: 430,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#000000',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: 180,
        y: 430,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#000000',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: 360,
        y: 430,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#000000',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: 550,
        y: 430,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#000000',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      }
    ],
    category: 'event',
    description: 'Event celebration frame 19'
  },
  {
    id: 'frame20',
    name: 'Frame 20',
    background: require('../assets/frames/frame20.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: 500,
        y: 35,
        width: 88,
        height: 88
      },
      {
        type: 'text',
        key: 'companyName',
        x: 60,
        y: 50,
        fontSize: FRAME_FONT_SIZES.COMPANY_NAME,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'left',
        maxWidth: 270
      },
      {
        type: 'text',
        key: 'phone',
        x: 73,
        y: 434,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: 170,
        y: 448,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
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
        y: 448,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: 482,
        y: 434,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      }
    ],
    category: 'personal',
    description: 'Personal greeting frame 20'
  },
  {
    id: 'frame21',
    name: 'Frame 21',
    background: require('../assets/frames/frame21.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: 60,
        y: 38,
        width: 84,
        height: 84
      },
      {
        type: 'text',
        key: 'companyName',
        x: 350,
        y: 60,
        fontSize: FRAME_FONT_SIZES.COMPANY_NAME,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 280
      },
      {
        type: 'text',
        key: 'phone',
        x: 40,
        y: 435,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: 200,
        y: 435,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: 385,
        y: 435,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: 555,
        y: 435,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
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
        x: 515,
        y: 32,
        width: 86,
        height: 86
      },
      {
        type: 'text',
        key: 'companyName',
        x: 45,
        y: 48,
        fontSize: FRAME_FONT_SIZES.COMPANY_NAME,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'left',
        maxWidth: 275
      },
      {
        type: 'text',
        key: 'phone',
        x: 28,
        y: 422,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#000000',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: 195,
        y: 422,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#000000',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: 375,
        y: 422,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#000000',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: 548,
        y: 422,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#000000',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      }
    ],
    category: 'creative',
    description: 'Creative artistic frame 22'
  },
  {
    id: 'frame23',
    name: 'Frame 23',
    background: require('../assets/frames/frame23.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: 75,
        y: 42,
        width: 82,
        height: 82
      },
      {
        type: 'text',
        key: 'companyName',
        x: 590,
        y: 58,
        fontSize: FRAME_FONT_SIZES.COMPANY_NAME,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'right',
        maxWidth: 260
      },
      {
        type: 'text',
        key: 'phone',
        x: 60,
        y: 442,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#000000',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: 129,
        y: 466,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#000000',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: 333,
        y: 461,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#000000',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: 499,
        y: 444,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#000000',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      }
    ],
    category: 'event',
    description: 'Festive celebration frame 23'
  },
  {
    id: 'frame24',
    name: 'Frame 24',
    background: require('../assets/frames/frame24.png'),
    placeholders: [
      {
        type: 'image',
        key: 'logo',
        x: 510,
        y: 36,
        width: 87,
        height: 87
      },
      {
        type: 'text',
        key: 'companyName',
        x: 55,
        y: 52,
        fontSize: FRAME_FONT_SIZES.COMPANY_NAME,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'bold',
        textAlign: 'left',
        maxWidth: 268
      },
      {
        type: 'text',
        key: 'phone',
        x: 38,
        y: 418,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'email',
        x: 198,
        y: 418,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'website',
        x: 382,
        y: 418,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 150
      },
      {
        type: 'text',
        key: 'address',
        x: 552,
        y: 418,
        fontSize: FRAME_FONT_SIZES.CONTACT_FIELDS,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 150
      }
    ],
    category: 'personal',
    description: 'Personal modern frame 24'
  }
];

export const getFramesByCategory = (category: string): Frame[] => {
  return frames.filter(frame => frame.category === category);
};

export const getFrameById = (id: string): Frame | undefined => {
  return frames.find(frame => frame.id === id);
};
