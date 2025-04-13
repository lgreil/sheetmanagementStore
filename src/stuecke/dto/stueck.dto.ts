export class FormattedStueck {
  stid: number;
  name: string;
  genre: string;
  jahr: number;
  schwierigkeit: string;
  isdigitalisiert: boolean;
  komponiert?: { pid: number; name: string; vorname: string }[];
  arrangiert?: { pid: number; name: string; vorname: string }[];
}

export class StueckWithRelations {
  stid: number;
  name: string;
  genre: string;
  jahr: number;
  schwierigkeit: string;
  isdigitalisiert: boolean;
  arrangiert?: {
    person: {
      pid: number;
      name: string;
      vorname: string;
    };
  }[];
  komponiert?: {
    person: {
      pid: number;
      name: string;
      vorname: string;
    };
  }[];
}

export class Stueck {
  stid: number;
  name: string;
  genre: string;
  jahr: number;
  schwierigkeit: string;
  isdigitalisiert: boolean;
}
