import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface Product { id: number; name: string; category: string; price: number; rating: number; accent: string; }

@Component({ selector: 'app-root', standalone: true, imports: [CommonModule], templateUrl: './app.component.html', styleUrl: './app.component.scss' })
export class AppComponent implements OnInit {
  products: Product[] = []; loading = true; cartCount = 0;
  constructor(private readonly http: HttpClient) {}
  ngOnInit(): void { this.http.get<Product[]>('/api/products').subscribe({ next: p => { this.products = p; this.loading = false; }, error: () => { this.loading = false; } }); }
  addToCart(): void { this.cartCount++; }
}
