import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItemEntity, MenuLinkType, MenuLocation } from './entities/menu-item.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { ReorderMenuItemsDto } from './dto/reorder-menu-items.dto';
import { MenuItem, PublicMenuLink, PublicMenus } from './models/menu-item.model';

@Injectable()
export class MenusService {
  constructor(@InjectRepository(MenuItemEntity) private readonly menuItems: Repository<MenuItemEntity>) {}

  async findAllInternal(): Promise<MenuItem[]> {
    const items = await this.menuItems.find({ order: { location: 'ASC', sortOrder: 'ASC' } });
    return items.map((item) => this.toModel(item));
  }

  async getPublic(): Promise<PublicMenus> {
    const [header, products, services, purchasing] = await Promise.all([
      this.resolvePublicLinks('header'),
      this.resolvePublicLinks('footer_products'),
      this.resolvePublicLinks('footer_services'),
      this.resolvePublicLinks('footer_purchasing')
    ]);
    return { header, footer: { products, services, purchasing } };
  }

  async create(input: CreateMenuItemDto): Promise<MenuItem> {
    this.validateLinkShape(input.linkType, input.pageId, input.href);
    const sortOrder = await this.nextSortOrder(input.location);
    const item = this.menuItems.create({
      location: input.location,
      label: input.label.trim(),
      linkType: input.linkType,
      pageId: input.linkType === 'page' ? input.pageId ?? null : null,
      href: input.linkType === 'page' ? null : input.href ?? null,
      openInNewTab: input.openInNewTab ?? false,
      isActive: input.isActive ?? true,
      sortOrder
    });
    const saved = await this.menuItems.save(item);
    return this.toModel(saved);
  }

  async update(id: number, input: UpdateMenuItemDto): Promise<MenuItem> {
    const existing = await this.menuItems.findOneBy({ id });
    if (!existing) throw new NotFoundException('Menu item not found');

    if (input.location !== undefined) existing.location = input.location;
    if (input.label !== undefined) existing.label = input.label.trim();

    if (input.linkType !== undefined || input.pageId !== undefined || input.href !== undefined) {
      const linkType = input.linkType ?? existing.linkType;
      const pageId = input.linkType !== undefined ? input.pageId ?? null : input.pageId !== undefined ? input.pageId : existing.pageId;
      const href = input.linkType !== undefined ? input.href ?? null : input.href !== undefined ? input.href : existing.href;
      this.validateLinkShape(linkType, pageId ?? undefined, href ?? undefined);
      existing.linkType = linkType;
      existing.pageId = linkType === 'page' ? pageId : null;
      existing.href = linkType === 'page' ? null : href;
    }

    if (input.openInNewTab !== undefined) existing.openInNewTab = input.openInNewTab;
    if (input.isActive !== undefined) existing.isActive = input.isActive;

    const saved = await this.menuItems.save(existing);
    return this.toModel(saved);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.menuItems.findOneBy({ id });
    if (!existing) throw new NotFoundException('Menu item not found');
    await this.menuItems.remove(existing);
  }

  async reorder(input: ReorderMenuItemsDto): Promise<void> {
    await Promise.all(input.items.map((entry) => this.menuItems.update({ id: entry.id }, { sortOrder: entry.sortOrder })));
  }

  private validateLinkShape(linkType: MenuLinkType, pageId?: number, href?: string): void {
    if (linkType === 'page' && !pageId) throw new BadRequestException('A page link requires pageId.');
    if (linkType !== 'page' && !href) throw new BadRequestException('A url or anchor link requires href.');
  }

  private async nextSortOrder(location: MenuLocation): Promise<number> {
    const last = await this.menuItems.findOne({ where: { location }, order: { sortOrder: 'DESC' } });
    return last ? last.sortOrder + 1 : 0;
  }

  private async resolvePublicLinks(location: MenuLocation): Promise<PublicMenuLink[]> {
    const items = await this.menuItems.find({
      where: { location, isActive: true },
      relations: { page: true },
      order: { sortOrder: 'ASC' }
    });
    return items
      .map((item) => ({
        label: item.label,
        href: item.linkType === 'page' ? (item.page?.status === 'published' ? `/${item.page.slug}` : null) : item.href,
        openInNewTab: item.openInNewTab
      }))
      .filter((link): link is PublicMenuLink => Boolean(link.href));
  }

  private toModel(entity: MenuItemEntity): MenuItem {
    return {
      id: entity.id,
      location: entity.location,
      label: entity.label,
      linkType: entity.linkType,
      pageId: entity.pageId,
      href: entity.href,
      openInNewTab: entity.openInNewTab,
      sortOrder: entity.sortOrder,
      isActive: entity.isActive
    };
  }
}
