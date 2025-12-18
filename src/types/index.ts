export interface CupSkin {
  id: string;
  colors: {
    straw: string;
    glass: string;
    liquid: string;
    lid: string;
  };
  liquidGradient?: {
    from: string;
    to: string;
  };
}

