export type CategoryType =
  | "Metinden Doğrulanan"
  | "Tasarım Yorumu"
  | "Belirsiz"
  | "Dış Araştırma";

export interface CategorizedField {
  text: string;
  category: CategoryType;
  details?: string;
}

export interface CharacterRelation {
  target: string;
  relation: string;
  category: CategoryType;
}

export interface CharacterItem {
  name: string;
  role: string;
  traits: string;
  functionInPlot: string;
  category: CategoryType;
  costumeGarment: string;
  costumeFabric: string;
  colors: string[];
  changeNote: string;
  relationships: CharacterRelation[];
  transformation: string;
}

export interface ActSceneItem {
  act: string;
  scene?: string;
  summary: string;
  location: string;
  charactersInvolved: string[];
}

export interface PlayAnalysis {
  title: string;
  author: string;
  genreAndPeriod: CategorizedField;
  timePeriod: CategorizedField;
  locations: CategorizedField[];
  shortSummary: CategorizedField;
  detailedPlot: CategorizedField;
  actsAndScenes: ActSceneItem[];
  coreConflict: CategorizedField;
  mainAndSubThemes: CategorizedField[];
  characters: CharacterItem[];
  keyOnstageActions: CategorizedField[];
  setRequirements: CategorizedField[];
  props: CategorizedField[];
  costumeRequirements: CategorizedField[];
  lightingAndAtmosphere: CategorizedField[];
  openInterpretationAreas: CategorizedField[];
  ambiguities: CategorizedField[];
}

export interface FileMetadata {
  fileName: string;
  fileType: string;
  fileSize: number;
  charCount: number;
  wordCount: number;
  estimatedPages: number;
  preview1000: string;
}

export type ProcessStatus =
  | "idle"
  | "validating"
  | "extracting"
  | "chunking"
  | "analyzing"
  | "synthesizing"
  | "completed"
  | "error";

export type DecorStyleType =
  | "minimalist"
  | "brechtian"
  | "symbolic"
  | "realist"
  | "postmodern"
  | "expressionist"
  | "industrial";

export type CostumeStyleType = "dönemsel" | "modern" | "stilize";

export interface SavedArchive {
  id: number;
  title: string;
  author: string;
  decorStyle: DecorStyleType;
  costumeStyle: CostumeStyleType;
  date: string;
  summary: string;
  analysis: PlayAnalysis;
  meta?: FileMetadata;
}
