import { SECTION_DTO_CLASSES } from '../homepage-section-key';

export type HomepageContent = {
  [K in keyof typeof SECTION_DTO_CLASSES]: InstanceType<(typeof SECTION_DTO_CLASSES)[K]>;
};
