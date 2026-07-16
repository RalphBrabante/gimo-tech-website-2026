import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ProductEntity } from '../products/entities/product.entity';
import { CreateQuotationRequestDto } from './dto/create-quotation-request.dto';
import { CreateFormalQuotationDto } from './dto/create-formal-quotation.dto';
import { FormalQuotation, QuotationRequestEntity } from './entities/quotation-request.entity';

@Injectable()
export class QuotationsService {
  constructor(
    @InjectRepository(QuotationRequestEntity) private readonly requests: Repository<QuotationRequestEntity>,
    @InjectRepository(ProductEntity) private readonly products: Repository<ProductEntity>
  ) {}

  async create(input: CreateQuotationRequestDto): Promise<{ requestNumber: string }> {
    const quantities = new Map<number, number>();
    for (const item of input.items) quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
    const products = await this.products.find({ where: { id: In([...quantities.keys()]), isActive: true } });
    if (products.length !== quantities.size) throw new BadRequestException('One or more requested products are no longer available.');

    const entity = this.requests.create({
      requestNumber: null,
      customerName: input.name.trim(), companyName: input.company?.trim() || null,
      customerEmail: input.email.trim().toLowerCase(), phoneNumber: input.phone?.trim() || null,
      notes: input.notes?.trim() || null,
      items: products.map((product) => ({ productId: product.id, name: product.name, sku: product.sku, quantity: quantities.get(product.id)!, priceCents: product.priceCents })),
      status: 'pending', response: null, respondedByUserId: null, quotedAt: null
    });
    const saved = await this.requests.save(entity);
    const requestNumber = `GQ-${String(saved.id).padStart(6, '0')}`;
    await this.requests.update(saved.id, { requestNumber });
    return { requestNumber };
  }

  async findAll() { return this.requests.find({ order: { createdAt: 'DESC' } }); }

  async prepareFormalQuotation(id: number, input: CreateFormalQuotationDto, userId: number) {
    const request = await this.requests.findOneBy({ id });
    if (!request) throw new NotFoundException('Quotation request not found.');
    const response: FormalQuotation = { lines: input.lines.map((line) => ({ ...line })), notes: input.notes?.trim() || '', validUntil: input.validUntil ?? null };
    await this.requests.update(id, { response, status: 'quoted', respondedByUserId: userId, quotedAt: new Date() });
    const updated = await this.requests.findOneByOrFail({ id });
    return { request: updated, mailtoUrl: this.mailto(updated) };
  }

  private mailto(request: QuotationRequestEntity): string {
    const quote = request.response!;
    const lines = quote.lines.map((line) => `• ${line.name} (${line.sku}) — ${line.quantity} × ₱${(line.unitPriceCents / 100).toFixed(2)} = ₱${((line.quantity * line.unitPriceCents) / 100).toFixed(2)}`).join('\n');
    const total = quote.lines.reduce((sum, line) => sum + line.quantity * line.unitPriceCents, 0);
    const body = [`Dear ${request.customerName},`, '', `Thank you for your quotation request ${request.requestNumber}.`, '', `FORMAL QUOTATION ${request.requestNumber}`, lines, '', `Quoted total: ₱${(total / 100).toFixed(2)}`, quote.validUntil ? `Valid until: ${quote.validUntil}` : '', quote.notes ? `Notes: ${quote.notes}` : '', 'Please let us know if you would like to proceed.', '', 'Gimo Tech Supplies'].filter(Boolean).join('\n');
    return `mailto:${encodeURIComponent(request.customerEmail)}?subject=${encodeURIComponent(`Quotation ${request.requestNumber} | Gimo Tech Supplies`)}&body=${encodeURIComponent(body)}`;
  }
}
