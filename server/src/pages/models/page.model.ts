export interface PageBlock {
  id: number;
  blockType: 'heading' | 'paragraph' | 'image' | 'button';
  sortOrder: number;
  headingText: string | null;
  headingLevel: number | null;
  paragraphText: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  buttonLabel: string | null;
  buttonHref: string | null;
}

export interface Page {
  id: number;
  slug: string;
  title: string;
  metaDescription: string | null;
  status: 'draft' | 'published';
  ogImageUrl: string | null;
  blocks: PageBlock[];
  createdAt: Date;
  updatedAt: Date;
}
