import { HeroSectionDto } from './dto/sections/hero-section.dto';
import { FilterTypesSectionDto } from './dto/sections/filter-types-section.dto';
import { BenefitsSectionDto } from './dto/sections/benefits-section.dto';
import { ImpactBannerSectionDto } from './dto/sections/impact-banner-section.dto';
import { SplitChecklistSectionDto } from './dto/sections/split-checklist-section.dto';
import { SplitStatsSectionDto } from './dto/sections/split-stats-section.dto';
import { ConsultIntroSectionDto } from './dto/sections/consult-intro-section.dto';
import { PlansSectionDto } from './dto/sections/plans-section.dto';
import { LocationSectionDto } from './dto/sections/location-section.dto';
import { CtaBannerSectionDto } from './dto/sections/cta-banner-section.dto';
import { FooterBrandSectionDto } from './dto/sections/footer-brand-section.dto';

export const SECTION_DTO_CLASSES = {
  hero: HeroSectionDto,
  filter_types: FilterTypesSectionDto,
  benefits: BenefitsSectionDto,
  impact_banner: ImpactBannerSectionDto,
  split_1: SplitChecklistSectionDto,
  split_2: SplitStatsSectionDto,
  consult_intro: ConsultIntroSectionDto,
  plans: PlansSectionDto,
  location: LocationSectionDto,
  cta_banner: CtaBannerSectionDto,
  footer_brand: FooterBrandSectionDto
} as const;

export type SectionKey = keyof typeof SECTION_DTO_CLASSES;

export const SECTION_KEYS = Object.keys(SECTION_DTO_CLASSES) as SectionKey[];

export function isSectionKey(value: string): value is SectionKey {
  return Object.prototype.hasOwnProperty.call(SECTION_DTO_CLASSES, value);
}
