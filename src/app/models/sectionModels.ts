export interface SectionDto {
  id: number;
  sentences: SentenceDto[];
}

export interface SentenceDto {
  id: number;
  text: string;
}
