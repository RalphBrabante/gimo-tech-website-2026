import { MenuLinkType, MenuLocation } from '../entities/menu-item.entity';

export interface MenuItem {
  id: number;
  location: MenuLocation;
  label: string;
  linkType: MenuLinkType;
  pageId: number | null;
  href: string | null;
  openInNewTab: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface PublicMenuLink {
  label: string;
  href: string;
  openInNewTab: boolean;
}

export interface PublicMenus {
  header: PublicMenuLink[];
  footer: {
    products: PublicMenuLink[];
    services: PublicMenuLink[];
    purchasing: PublicMenuLink[];
  };
}
