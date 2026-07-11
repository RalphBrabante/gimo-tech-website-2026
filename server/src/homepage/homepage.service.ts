import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { HomepageSectionEntity } from './entities/homepage-section.entity';
import { HomepageContent } from './models/homepage-content.model';
import { SECTION_DTO_CLASSES, SECTION_KEYS, isSectionKey } from './homepage-section-key';

@Injectable()
export class HomepageService {
  constructor(@InjectRepository(HomepageSectionEntity) private readonly sections: Repository<HomepageSectionEntity>) {}

  async getAll(): Promise<HomepageContent> {
    const rows = await this.sections.find();
    const byKey = new Map(rows.map((row) => [row.sectionKey, row.content]));
    const content: Record<string, unknown> = {};
    for (const key of SECTION_KEYS) {
      content[key] = byKey.get(key) ?? {};
    }
    return content as HomepageContent;
  }

  async updateSection(sectionKey: string, input: unknown, userId: number): Promise<unknown> {
    if (!isSectionKey(sectionKey)) throw new NotFoundException('Unknown homepage section.');

    const DtoClass = SECTION_DTO_CLASSES[sectionKey] as new () => object;
    const dto = plainToInstance(DtoClass, input);
    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });
    if (errors.length) {
      throw new BadRequestException(errors.flatMap((error) => Object.values(error.constraints ?? {})));
    }

    let section = await this.sections.findOneBy({ sectionKey });
    if (!section) section = this.sections.create({ sectionKey });
    section.content = dto as unknown as Record<string, unknown>;
    section.updatedByUserId = userId;
    const saved = await this.sections.save(section);
    return saved.content;
  }
}
