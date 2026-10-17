export interface Option {
  id: string; // content book slug, e.g. "nl-in-gang"
  name: string;
}

export interface BootstrapData {
  book_options: Option[];
}
