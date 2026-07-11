import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, of } from 'rxjs';

interface Product { id: number; name: string; category: string; description: string; price: number; rating: number; accent: string; imageUrl: string | null; }
interface StoreSettings { currencyCode: string; freeShippingThresholdCents: number | null; }
interface SyringeFilterType { name: string; tag: string; description: string; format: string; pack: string; color: string; }

@Component({ selector: 'app-root', standalone: true, imports: [CommonModule], templateUrl: './app.component.html', styleUrl: './app.component.scss' })
export class AppComponent implements OnInit {
  products: Product[] = []; loading = true; cartCount = 0; currencyCode = 'USD'; freeShippingThreshold: number | null = null;
  syringeFilters: SyringeFilterType[] = [
    {
      name: 'Nylon Syringe Filter',
      tag: 'General HPLC prep',
      description: 'A common choice for aqueous and mixed sample preparation workflows that need dependable filtration.',
      format: '25mm / 0.45um options',
      pack: 'Canister and bulk pack support',
      color: '#f0b21a'
    },
    {
      name: 'PTFE Syringe Filter',
      tag: 'Solvent-compatible',
      description: 'Used for stronger solvent workflows where chemical resistance and low extractables matter.',
      format: 'Hydrophobic and method-fit options',
      pack: 'Bulk canister pack availability',
      color: '#e92f38'
    },
    {
      name: 'PVDF Syringe Filter',
      tag: 'Low binding',
      description: 'A useful option for methods that benefit from low protein binding and consistent filtration.',
      format: '25mm / 0.45um options',
      pack: 'Routine laboratory pack sizes',
      color: '#4630a3'
    },
    {
      name: 'MCE Syringe Filter',
      tag: 'Clarification',
      description: 'Suited for general sample clarification and laboratory preparation workflows.',
      format: 'Single-piece and pack options',
      pack: 'Flexible ordering support',
      color: '#07945f'
    }
  ];
  constructor(private readonly http: HttpClient) {}
  ngOnInit(): void {
    forkJoin({
      settings: this.http.get<StoreSettings>('/api/settings').pipe(catchError(() => of({ currencyCode: 'USD', freeShippingThresholdCents: null }))),
      products: this.http.get<Product[]>('/api/products')
    }).subscribe({
      next: ({ settings, products }) => { this.currencyCode = settings.currencyCode; this.freeShippingThreshold = settings.freeShippingThresholdCents === null ? null : settings.freeShippingThresholdCents / 100; this.products = products; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
  addToCart(): void { this.cartCount++; }
}
