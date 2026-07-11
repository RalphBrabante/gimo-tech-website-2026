import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PageEntity } from './entities/page.entity';
import { PageBlockEntity } from './entities/page-block.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageBlockDto } from './dto/page-block.dto';
import { Page } from './models/page.model';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(PageEntity) private readonly pages: Repository<PageEntity>,
    private readonly dataSource: DataSource
  ) {}

  async findAllInternal(): Promise<Page[]> {
    const pages = await this.pages.find({ relations: { blocks: true }, order: { createdAt: 'DESC', blocks: { sortOrder: 'ASC' } } });
    return pages.map((page) => this.toModel(page));
  }

  async findOneInternal(id: number): Promise<Page> {
    const page = await this.pages.findOne({ where: { id }, relations: { blocks: true }, order: { blocks: { sortOrder: 'ASC' } } });
    if (!page) throw new NotFoundException('Page not found');
    return this.toModel(page);
  }

  async findPublishedBySlug(slug: string): Promise<Page | null> {
    const page = await this.pages.findOne({
      where: { slug, status: 'published' },
      relations: { blocks: true },
      order: { blocks: { sortOrder: 'ASC' } }
    });
    return page ? this.toModel(page) : null;
  }

  async listPublishedSlugs(): Promise<string[]> {
    const pages = await this.pages.find({ where: { status: 'published' }, select: { slug: true } });
    return pages.map((page) => page.slug);
  }

  async create(input: CreatePageDto, userId: number): Promise<Page> {
    const existing = await this.pages.findOneBy({ slug: input.slug });
    if (existing) throw new ConflictException('A page with this slug already exists.');

    const created = await this.dataSource.transaction(async (manager) => {
      const page = manager.create(PageEntity, {
        title: input.title.trim(),
        slug: input.slug,
        metaDescription: input.metaDescription?.trim() ?? null,
        status: input.status ?? 'draft',
        ogImageUrl: input.ogImageUrl ?? null,
        createdByUserId: userId,
        updatedByUserId: userId
      });
      const savedPage = await manager.save(page);
      const blocks = input.blocks.map((block, index) =>
        manager.create(PageBlockEntity, { ...this.blockColumns(block), pageId: savedPage.id, sortOrder: index })
      );
      if (blocks.length) await manager.save(blocks);
      savedPage.blocks = blocks;
      return savedPage;
    });

    return this.toModel(created);
  }

  async update(id: number, input: UpdatePageDto, userId: number): Promise<Page> {
    const existing = await this.pages.findOne({ where: { id }, relations: { blocks: true } });
    if (!existing) throw new NotFoundException('Page not found');

    if (input.slug && input.slug !== existing.slug) {
      const conflict = await this.pages.findOneBy({ slug: input.slug });
      if (conflict) throw new ConflictException('A page with this slug already exists.');
      existing.slug = input.slug;
    }
    if (input.title !== undefined) existing.title = input.title.trim();
    if (input.metaDescription !== undefined) existing.metaDescription = input.metaDescription?.trim() ?? null;
    if (input.status !== undefined) existing.status = input.status;
    if (input.ogImageUrl !== undefined) existing.ogImageUrl = input.ogImageUrl ?? null;
    existing.updatedByUserId = userId;

    const updated = await this.dataSource.transaction(async (manager) => {
      const savedPage = await manager.save(existing);
      if (input.blocks) {
        await manager.delete(PageBlockEntity, { pageId: savedPage.id });
        const blocks = input.blocks.map((block, index) =>
          manager.create(PageBlockEntity, { ...this.blockColumns(block), pageId: savedPage.id, sortOrder: index })
        );
        if (blocks.length) await manager.save(blocks);
        savedPage.blocks = blocks;
      }
      return savedPage;
    });

    return this.toModel(updated);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.pages.findOneBy({ id });
    if (!existing) throw new NotFoundException('Page not found');
    await this.pages.remove(existing);
  }

  private blockColumns(block: PageBlockDto) {
    return {
      blockType: block.blockType,
      headingText: block.headingText ?? null,
      headingLevel: block.headingLevel ?? null,
      paragraphText: block.paragraphText ?? null,
      imageUrl: block.imageUrl ?? null,
      imageAlt: block.imageAlt ?? null,
      buttonLabel: block.buttonLabel ?? null,
      buttonHref: block.buttonHref ?? null
    };
  }

  private toModel(entity: PageEntity): Page {
    return {
      id: entity.id,
      slug: entity.slug,
      title: entity.title,
      metaDescription: entity.metaDescription,
      status: entity.status,
      ogImageUrl: entity.ogImageUrl,
      blocks: (entity.blocks ?? []).map((block) => ({
        id: block.id,
        blockType: block.blockType,
        sortOrder: block.sortOrder,
        headingText: block.headingText,
        headingLevel: block.headingLevel,
        paragraphText: block.paragraphText,
        imageUrl: block.imageUrl,
        imageAlt: block.imageAlt,
        buttonLabel: block.buttonLabel,
        buttonHref: block.buttonHref
      })),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }
}
