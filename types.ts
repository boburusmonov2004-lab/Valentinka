
export interface Memory {
  id: string;
  url: string;
  caption: string;
  date?: string;
}

export enum AppState {
  INTRO = 'INTRO',
  GALLERY = 'GALLERY',
  PROPOSAL = 'PROPOSAL',
  SUCCESS = 'SUCCESS'
}
